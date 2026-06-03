// ─── Brand (single: Ngajigaes.id) ────────────────────────────────────────────
export type BrandId = 'ngajigaes';
export type BrandKpiType = 'roas';
export type DateRange = '7d' | '30d' | 'custom';
export type UserRole = 'admin' | 'tim';

export interface Brand {
  id: BrandId;
  name: string;
  kpiType: BrandKpiType;
  color: string;
}

// ─── KPI Metrics ──────────────────────────────────────────────────────────────
export interface NgajigaesMetrics {
  roas: number;
  roasTarget: number;
  costPerPurchase: number;
  costPerPurchaseTarget: number;
  profitRate: number;
  totalSpend: number;
  cpm: number;
  ctr: number;
  frequency: number;
  reach: number;
  totalPurchases: number;
  convValue: number;
}

export interface CPLMetrics {
  cpl: number;
  cplTarget: number;
  totalLeads: number;
  reach: number;
  totalSpend: number;
  cpm: number;
  ctr: number;
  frequency: number;
}

// ─── Campaign Hierarchy ───────────────────────────────────────────────────────
export type ItemStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type FunnelType = 'LP' | 'CTWA' | 'Visit Profile' | 'Lead Form';
export type KpiStatus = 'green' | 'yellow' | 'red';

export interface KpiConfig {
  metric: string;
  target: number;
  actual: number;
  unit: 'roas' | 'idr' | 'pct';
}

export interface Ad {
  id: string;
  name: string;
  status: ItemStatus;
  thumbnailUrl: string;
  spend: number;
  result: number;
  cpm: number;
  ctr: number;
  frequency: number;
  reach: number;
  funnelType: FunnelType;
  score: number;
  isWinning: boolean;
  creativeType: 'image' | 'video' | 'carousel';
  dateActive: string;
}

export interface Adset {
  id: string;
  name: string;
  status: ItemStatus;
  spend: number;
  result: number;
  cpm: number;
  ctr: number;
  frequency: number;
  reach: number;
  kpiStatus: KpiStatus;
  ads: Ad[];
}

export interface Campaign {
  id: string;
  name: string;
  status: ItemStatus;
  spend: number;
  result: number;
  kpi: KpiConfig;
  kpiStatus: KpiStatus;
  reach: number;
  priority: number;
  isProtected: boolean;
  adsets: Adset[];
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export type AlertType =
  | 'budget_warning'
  | 'cpl_anomaly'
  | 'roas_drop'
  | 'no_delivery'
  | 'ad_fatigue'
  | 'failed_test'
  | 'winning_ad';

export interface Alert {
  id: string;
  type: AlertType;
  brand: BrandId;
  condition: string;
  diagnosis: string;
  suggestAction: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  isRead: boolean;
}

// ─── API Status ───────────────────────────────────────────────────────────────
export type ApiStatus = 'normal' | 'stale' | 'stale_long' | 'revoked';

export interface ApiStatusInfo {
  status: ApiStatus;
  lastUpdated: string;
  brandId: BrandId;
}

// ─── Winning Ads ──────────────────────────────────────────────────────────────
export interface ScoringWeight {
  metric: string;
  weight: number;
}

export interface WinningAd {
  adId: string;
  adName: string;
  campaignName: string;
  score: number;
  rank: number;
  metrics: Record<string, number>;
  thumbnailUrl: string;
  funnelType: FunnelType;
}

// ─── Web App / ADS LAB ────────────────────────────────────────────────────────
export type CampaignStage = 'TOFU' | 'MOFU' | 'BOFU';

export interface CompetitorAd {
  id: string;
  libraryId: string;
  advertiserName: string;
  adCopy: string;
  creativeType: 'image' | 'video' | 'carousel';
  ctaButton: string;
  destinationUrl: string;
  dateActive: string;
  funnelType: FunnelType;
  funnelOverride: FunnelType | null;
  thumbnailUrl: string;
  domain: string;
}

export interface DomainSummary {
  domain: string;
  totalAds: number;
  activeAds: number;
  funnelDistribution: Record<FunnelType, number>;
  lastSeen: string;
}

// ─── Phase 6 — Automation ─────────────────────────────────────────────────────
export type AutomationActionType =
  | 'pause'
  | 'activate'
  | 'scale_budget'
  | 'upload_creative'
  | 'create_ad_draft'
  | 'generate_copy';

export type AutomationStatus = 'queued' | 'processing' | 'done' | 'failed' | 'dry_run';

export interface AutomationLog {
  id: string;
  brand: BrandId;
  actionType: AutomationActionType;
  status: AutomationStatus;
  targetName: string;
  description: string;
  timestamp: string;
  meta?: Record<string, string | number>;
}

export interface CreativeAsset {
  id: string;
  brand: BrandId;
  fileName: string;
  fileType: 'image' | 'video';
  status: 'pending' | 'uploaded' | 'archived';
  driveUrl: string;
  adId?: string;
  uploadedAt?: string;
}

export interface CopyRow {
  id: string;
  brand: BrandId;
  primaryText: string;
  headline: string;
  cta: string;
  destinationUrl: string;
  funnelStage: CampaignStage;
  status: 'pending' | 'published' | 'rejected';
  adId?: string;
  notes?: string;
}

export interface QueueStatus {
  brand: BrandId;
  total: number;
  processed: number;
  failed: number;
  isProcessing: boolean;
}
