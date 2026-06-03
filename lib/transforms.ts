import { calcKpiStatus } from './utils';
import type {
  BrandId, Campaign, Adset, Ad, ApiStatusInfo, ApiStatus,
  NgajigaesMetrics, CPLMetrics, CompetitorAd, Alert, FunnelType,
} from './types';
import type { SnapshotRow, FetchStatusRow, AdsDetailRow, KpiTargetRow, AlertLogRow } from './queries';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sum = (nums: (number | null | undefined)[]) =>
  nums.reduce<number>((acc, v) => acc + (v ?? 0), 0);

const wavg = (values: number[], weights: number[]) => {
  const totalW = sum(weights);
  if (totalW === 0) return 0;
  return values.reduce((acc, v, i) => acc + v * (weights[i] ?? 0), 0) / totalW;
};

function domainFromUrl(url: string | null): string {
  if (!url) return 'unknown';
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

// ─── fetch_status → ApiStatusInfo ────────────────────────────────────────────

export function toApiStatus(row: FetchStatusRow): ApiStatusInfo {
  const lastUpdated = row.last_fetched_at ?? row.updated_at;
  const ageMs = Date.now() - new Date(lastUpdated).getTime();
  const ageHours = ageMs / 3_600_000;

  let status: ApiStatus;
  if (row.status === 'error') {
    status = 'revoked';
  } else if (ageHours > 6) {
    status = 'stale_long';
  } else if (ageHours > 1) {
    status = 'stale';
  } else {
    status = 'normal';
  }

  return { status, lastUpdated, brandId: row.brand };
}

// ─── campaign_snapshots → brand-level metrics ─────────────────────────────────

export function toBrandMetrics(
  brand: BrandId,
  rows: SnapshotRow[],
): NgajigaesMetrics | CPLMetrics | null {
  const campaignRows = rows.filter(r => r.level === 'campaign');
  if (campaignRows.length === 0) return null;

  const totalSpend       = sum(campaignRows.map(r => r.spend));
  const totalReach       = Math.max(...campaignRows.map(r => r.reach ?? 0));
  const totalImpressions = sum(campaignRows.map(r => r.impressions));
  const totalClicks      = sum(campaignRows.map(r => r.clicks));
  const cpm  = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const ctr  = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const freq = wavg(campaignRows.map(r => r.frequency ?? 0), campaignRows.map(r => r.reach ?? 1));

  if (brand === 'ngajigaes') {
    const totalPurchases = sum(campaignRows.map(r => r.purchases));
    const convValue      = sum(campaignRows.map(r => r.purchase_value));
    const roas           = totalSpend > 0 ? convValue / totalSpend : 0;
    const cpp            = totalPurchases > 0 ? totalSpend / totalPurchases : 0;
    const profitRate     = convValue > 0 ? ((convValue - totalSpend) / convValue) * 100 : 0;

    return {
      roas,
      roasTarget: 3.0,
      costPerPurchase: cpp,
      costPerPurchaseTarget: 45_000,
      profitRate,
      totalSpend,
      convValue,
      totalPurchases,
      cpm,
      ctr,
      frequency: freq,
      reach: totalReach,
    } satisfies NgajigaesMetrics;
  } else {
    const totalLeads = sum(campaignRows.map(r => r.leads));
    const cpl        = totalLeads > 0 ? totalSpend / totalLeads : 0;

    return {
      cpl,
      cplTarget: 80_000,
      totalLeads,
      reach: totalReach,
      totalSpend,
      cpm,
      ctr,
      frequency: freq,
    } satisfies CPLMetrics;
  }
}

// ─── campaign_snapshots → Campaign hierarchy ──────────────────────────────────

const DEFAULT_THUMBNAIL = 'https://picsum.photos/seed/default/120/120';

function buildAds(
  adsetId: string,
  rows: SnapshotRow[],
  brandKpiType: 'roas' | 'cpl',
): Ad[] {
  const adRows = rows.filter(r => r.level === 'ad' && r.adset_id === adsetId);
  return adRows.map(r => {
    const result = brandKpiType === 'roas' ? (r.purchases ?? 0) : (r.leads ?? 0);
    const kpiActual = brandKpiType === 'roas' ? (r.roas ?? 0) : (r.cpl ?? 0);
    return {
      id:            r.ad_id,
      name:          r.ad_name ?? r.ad_id,
      status:        (r.status as 'ACTIVE' | 'PAUSED' | 'ARCHIVED') ?? 'ACTIVE',
      thumbnailUrl:  `https://picsum.photos/seed/${r.ad_id}/120/120`,
      spend:         r.spend ?? 0,
      result,
      cpm:           r.cpm ?? 0,
      ctr:           r.ctr ?? 0,
      frequency:     r.frequency ?? 0,
      reach:         r.reach ?? 0,
      funnelType:    'LP' as FunnelType,
      score:         Math.round(Math.min(99, Math.max(1, (kpiActual / (brandKpiType === 'roas' ? 3 : 80_000)) * 80))),
      isWinning:     false,
      creativeType:  'video' as const,
      dateActive:    r.date_start,
    };
  });
}

function buildAdsets(
  campaignId: string,
  rows: SnapshotRow[],
  brandKpiType: 'roas' | 'cpl',
  kpiTargetMap: Record<string, number>,
): Adset[] {
  const adsetRows = rows.filter(r => r.level === 'adset' && r.campaign_id === campaignId);

  return adsetRows.map(r => {
    const kpiActual = brandKpiType === 'roas' ? (r.roas ?? 0) : (r.cpl ?? 0);
    const kpiTarget = kpiTargetMap[r.adset_id ?? ''] ?? (brandKpiType === 'roas' ? 3.0 : 80_000);
    return {
      id:         r.adset_id,
      name:       r.adset_name ?? r.adset_id,
      status:     (r.status as 'ACTIVE' | 'PAUSED' | 'ARCHIVED') ?? 'ACTIVE',
      spend:      r.spend ?? 0,
      result:     brandKpiType === 'roas' ? (r.purchases ?? 0) : (r.leads ?? 0),
      cpm:        r.cpm ?? 0,
      ctr:        r.ctr ?? 0,
      frequency:  r.frequency ?? 0,
      reach:      r.reach ?? 0,
      kpiStatus:  calcKpiStatus(kpiActual, kpiTarget, brandKpiType === 'cpl'),
      ads:        buildAds(r.adset_id, rows, brandKpiType),
    };
  });
}

export function toCampaignHierarchy(
  brand: BrandId,
  rows: SnapshotRow[],
  kpiTargets: KpiTargetRow[],
): Campaign[] {
  const brandKpiType = brand === 'ngajigaes' ? 'roas' : 'cpl';
  const targetMap = Object.fromEntries(
    kpiTargets.map(t => [t.campaign_id, t.target_value]),
  );
  const defaultTarget = brandKpiType === 'roas' ? 3.0 : 80_000;

  const campaignRows = rows.filter(r => r.level === 'campaign');

  return campaignRows.map((r, idx) => {
    const kpiActual = brandKpiType === 'roas' ? (r.roas ?? 0) : (r.cpl ?? 0);
    const kpiTarget = targetMap[r.campaign_id] ?? defaultTarget;

    return {
      id:          r.campaign_id,
      name:        r.campaign_name,
      status:      (r.status as 'ACTIVE' | 'PAUSED' | 'ARCHIVED') ?? 'ACTIVE',
      spend:       r.spend ?? 0,
      result:      brandKpiType === 'roas' ? (r.purchases ?? 0) : (r.leads ?? 0),
      kpi: {
        metric:  brandKpiType === 'roas' ? 'ROAS' : 'CPL',
        target:  kpiTarget,
        actual:  kpiActual,
        unit:    brandKpiType as 'roas' | 'idr',
      },
      kpiStatus:   calcKpiStatus(kpiActual, kpiTarget, brandKpiType === 'cpl'),
      reach:       r.reach ?? 0,
      priority:    idx + 1,
      isProtected: idx === 0,
      adsets:      buildAdsets(r.campaign_id, rows, brandKpiType, targetMap),
    };
  });
}

// ─── ads_detail → CompetitorAd[] ─────────────────────────────────────────────

export function toCompetitorAds(rows: AdsDetailRow[]): CompetitorAd[] {
  return rows.map(r => ({
    id:             r.id,
    libraryId:      r.library_id,
    advertiserName: r.advertiser_name ?? 'Unknown',
    adCopy:         r.ad_copy ?? '',
    creativeType:   (r.creative_type ?? 'image') as 'image' | 'video' | 'carousel',
    ctaButton:      r.cta_button ?? 'Learn More',
    destinationUrl: r.destination_url ?? '',
    dateActive:     r.date_active ? r.date_active.slice(0, 10) : '',
    funnelType:     (r.funnel_type ?? 'LP') as FunnelType,
    funnelOverride: (r.funnel_override ?? null) as FunnelType | null,
    thumbnailUrl:   `https://picsum.photos/seed/${r.library_id}/400/400`,
    domain:         domainFromUrl(r.destination_url),
  }));
}

// ─── alert_log → Alert[] ──────────────────────────────────────────────────────

export function toAlerts(rows: AlertLogRow[]): Alert[] {
  return rows.map(r => ({
    id:            r.id,
    type:          r.type as Alert['type'],
    brand:         r.brand,
    condition:     r.message_text,
    diagnosis:     (r.payload_json?.diagnosis as string) ?? '',
    suggestAction: (r.payload_json?.suggest_action as string) ?? '',
    severity:      (r.payload_json?.severity as Alert['severity']) ?? 'warning',
    timestamp:     r.sent_at,
    isRead:        false,
  }));
}

// ─── 7-day trend arrays from campaign snapshots ────────────────────────────────

export interface LiveTrends {
  primary: number[];  // ROAS or CPL
  spend:   number[];
  reach:   number[];
  result:  number[];  // purchases or leads
}

export function toTrends(brand: BrandId, rows: SnapshotRow[]): LiveTrends | null {
  const campaignRows = rows.filter(r => r.level === 'campaign');
  if (campaignRows.length < 2) return null;

  const byDate = new Map<string, SnapshotRow[]>();
  for (const r of campaignRows) {
    const d = r.date_start;
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(r);
  }

  const sorted = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0])).slice(-7);
  if (sorted.length < 2) return null;

  const brandKpiType = brand === 'ngajigaes' ? 'roas' : 'cpl';

  return {
    primary: sorted.map(([, rs]) => {
      if (brandKpiType === 'roas') {
        const s = sum(rs.map(r => r.spend));
        const v = sum(rs.map(r => r.purchase_value));
        return s > 0 ? v / s : 0;
      } else {
        const s = sum(rs.map(r => r.spend));
        const l = sum(rs.map(r => r.leads));
        return l > 0 ? s / l : 0;
      }
    }),
    spend:  sorted.map(([, rs]) => sum(rs.map(r => r.spend))),
    reach:  sorted.map(([, rs]) => Math.max(...rs.map(r => r.reach ?? 0))),
    result: sorted.map(([, rs]) =>
      brandKpiType === 'roas'
        ? sum(rs.map(r => r.purchases))
        : sum(rs.map(r => r.leads)),
    ),
  };
}
