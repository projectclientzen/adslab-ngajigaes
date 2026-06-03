import { supabase } from './supabase';
import type { BrandId, DateRange } from './types';

// ─── Raw row types matching DB schema ─────────────────────────────────────────

export interface SnapshotRow {
  id: string;
  brand: BrandId;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string | null;
  ad_id: string;
  ad_name: string | null;
  level: 'campaign' | 'adset' | 'ad';
  date_start: string;
  date_stop: string;
  spend: number;
  reach: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  frequency: number;
  purchases: number | null;
  purchase_value: number | null;
  leads: number | null;
  roas: number | null;
  cpl: number | null;
  cpp: number | null;
  status: string | null;
  fetched_at: string;
}

export interface FetchStatusRow {
  brand: BrandId;
  last_fetched_at: string | null;
  status: 'success' | 'error' | null;
  error_message: string | null;
  updated_at: string;
}

export interface AdsDetailRow {
  id: string;
  library_id: string;
  advertiser_name: string | null;
  ad_copy: string | null;
  creative_type: 'image' | 'video' | 'carousel' | null;
  cta_button: string | null;
  destination_url: string | null;
  date_active: string | null;
  funnel_type: string | null;
  funnel_override: string | null;
  campaign_stage: string | null;
  created_at: string;
}

export interface KpiTargetRow {
  brand: BrandId;
  campaign_id: string;
  kpi_type: string;
  target_value: number;
}

export interface AlertLogRow {
  id: string;
  alert_key: string;
  brand: BrandId;
  type: string;
  campaign_id: string | null;
  message_text: string;
  payload_json: Record<string, unknown>;
  sent_at: string;
}

// ─── Query helpers ────────────────────────────────────────────────────────────

function dateRangeDays(range: DateRange): number {
  return range === '30d' ? 30 : 7;
}

export async function fetchSnapshots(
  brand: BrandId,
  dateRange: DateRange,
): Promise<SnapshotRow[]> {
  if (!supabase) return [];
  const days = dateRangeDays(dateRange);
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('campaign_snapshots')
    .select('*')
    .eq('brand', brand)
    .gte('date_start', since)
    .order('fetched_at', { ascending: false });

  if (error) { console.error('[fetchSnapshots]', error.message); return []; }
  return (data ?? []) as SnapshotRow[];
}

export async function fetchFetchStatus(): Promise<FetchStatusRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('fetch_status').select('*');
  if (error) { console.error('[fetchFetchStatus]', error.message); return []; }
  return (data ?? []) as FetchStatusRow[];
}

export async function fetchAdsDetail(funnelType?: string): Promise<AdsDetailRow[]> {
  if (!supabase) return [];
  let q = supabase
    .from('ads_detail')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (funnelType && funnelType !== 'ALL') {
    q = q.eq('funnel_type', funnelType);
  }
  const { data, error } = await q;
  if (error) { console.error('[fetchAdsDetail]', error.message); return []; }
  return (data ?? []) as AdsDetailRow[];
}

export async function fetchKpiTargets(brand: BrandId): Promise<KpiTargetRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('campaign_kpi_targets')
    .select('*')
    .eq('brand', brand);
  if (error) { console.error('[fetchKpiTargets]', error.message); return []; }
  return (data ?? []) as KpiTargetRow[];
}

export async function fetchRecentAlerts(brand: BrandId, limit = 20): Promise<AlertLogRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('alert_log')
    .select('*')
    .eq('brand', brand)
    .order('sent_at', { ascending: false })
    .limit(limit);
  if (error) { console.error('[fetchRecentAlerts]', error.message); return []; }
  return (data ?? []) as AlertLogRow[];
}

export async function upsertKpiTarget(
  brand: BrandId,
  campaignId: string,
  kpiType: string,
  value: number,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('campaign_kpi_targets').upsert(
    { brand, campaign_id: campaignId, kpi_type: kpiType, target_value: value },
    { onConflict: 'campaign_id,kpi_type' },
  );
  if (error) console.error('[upsertKpiTarget]', error.message);
}

export async function triggerMetaFetch(brand?: BrandId): Promise<void> {
  const base = process.env.NEXT_PUBLIC_NETLIFY_URL;
  if (!base) return;
  const url = `${base}/.netlify/functions/meta-fetch${brand ? `?brand=${brand}` : ''}`;
  await fetch(url, { method: 'POST' }).catch(e => console.error('[triggerMetaFetch]', e));
}
