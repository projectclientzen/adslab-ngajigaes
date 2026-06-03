import type {
  Brand, Campaign, Alert, ApiStatusInfo, WinningAd,
  NgajigaesMetrics, CompetitorAd, DomainSummary,
  AutomationLog, CreativeAsset, CopyRow, QueueStatus,
} from './types';
import { calcKpiStatus } from './utils';

// ─── Brand (single) ───────────────────────────────────────────────────────────
export const BRANDS: Brand[] = [
  { id: 'ngajigaes', name: 'Ngajigaes.id', kpiType: 'roas', color: '#6366F1' },
];

// ─── Dashboard Metrics ────────────────────────────────────────────────────────
export const NGAJIGAES_METRICS: NgajigaesMetrics = {
  roas: 2.8, roasTarget: 3.0,
  costPerPurchase: 41_000, costPerPurchaseTarget: 45_000,
  profitRate: 18.4,
  totalSpend: 12_500_000,
  convValue: 35_000_000,
  totalPurchases: 304,
  cpm: 28_500, ctr: 2.14, frequency: 2.7, reach: 438_200,
};

// ─── Trend Data (7-day sparklines) ───────────────────────────────────────────
export const TRENDS = {
  ngajigaes: {
    roas:  [2.4, 2.6, 2.5, 2.7, 2.9, 2.7, 2.8],
    cpp:   [46_000, 44_500, 45_200, 43_800, 42_000, 41_500, 41_000],
    spend: [1_400_000, 1_550_000, 1_800_000, 1_700_000, 1_950_000, 2_100_000, 2_000_000],
    reach: [52_000, 58_000, 61_000, 59_000, 65_000, 70_000, 73_000],
  },
};

// ─── Campaigns ────────────────────────────────────────────────────────────────
const makeCampaign = (
  id: string, name: string, spend: number, result: number, targetRoas: number,
  actualRoas: number, reach: number, priority: number,
): Campaign => ({
  id, name, status: 'ACTIVE', spend, result,
  kpi: { metric: 'ROAS', target: targetRoas, actual: actualRoas, unit: 'roas' },
  kpiStatus: calcKpiStatus(actualRoas, targetRoas),
  reach, priority, isProtected: priority === 1,
  adsets: [
    {
      id: `${id}-as1`, name: `${name} — Broad`, status: 'ACTIVE',
      spend: spend * 0.6, result: Math.round(result * 0.65),
      cpm: 27_000, ctr: 2.3, frequency: 2.4, reach: Math.round(reach * 0.6),
      kpiStatus: calcKpiStatus(actualRoas * 1.1, targetRoas),
      ads: [
        {
          id: `${id}-as1-ad1`, name: 'Hook — Sibuk Kerja',
          status: 'ACTIVE', thumbnailUrl: 'https://picsum.photos/seed/ad1/120/120',
          spend: spend * 0.35, result: Math.round(result * 0.4),
          cpm: 25_000, ctr: 2.6, frequency: 2.1, reach: Math.round(reach * 0.38),
          funnelType: 'LP', score: 87, isWinning: true,
          creativeType: 'video', dateActive: '2026-04-15',
        },
        {
          id: `${id}-as1-ad2`, name: 'Hook — Tips Ngaji Sibuk',
          status: 'ACTIVE', thumbnailUrl: 'https://picsum.photos/seed/ad2/120/120',
          spend: spend * 0.25, result: Math.round(result * 0.25),
          cpm: 30_000, ctr: 1.9, frequency: 2.8, reach: Math.round(reach * 0.22),
          funnelType: 'LP', score: 62, isWinning: false,
          creativeType: 'image', dateActive: '2026-04-20',
        },
      ],
    },
    {
      id: `${id}-as2`, name: `${name} — Retargeting`, status: 'ACTIVE',
      spend: spend * 0.4, result: Math.round(result * 0.35),
      cpm: 31_000, ctr: 1.8, frequency: 3.2, reach: Math.round(reach * 0.4),
      kpiStatus: calcKpiStatus(actualRoas * 0.85, targetRoas),
      ads: [
        {
          id: `${id}-as2-ad1`, name: 'Retarget — Daftar Sekarang',
          status: 'ACTIVE', thumbnailUrl: 'https://picsum.photos/seed/ad3/120/120',
          spend: spend * 0.4, result: Math.round(result * 0.35),
          cpm: 31_000, ctr: 1.8, frequency: 3.2, reach: Math.round(reach * 0.4),
          funnelType: 'LP', score: 54, isWinning: false,
          creativeType: 'video', dateActive: '2026-04-22',
        },
      ],
    },
  ],
});

export const NGAJIGAES_CAMPAIGNS: Campaign[] = [
  makeCampaign('ng-1', 'Campaign Ramadan 2026',       7_500_000, 183, 3.0, 2.8, 260_000, 1),
  makeCampaign('ng-2', 'Campaign Evergreen — Pemula', 3_200_000,  78, 3.0, 3.4, 124_000, 2),
  makeCampaign('ng-3', 'Campaign Testing Hook Q2',    1_800_000,  43, 3.0, 2.1,  54_200, 3),
];

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1', type: 'roas_drop', brand: 'ngajigaes', severity: 'critical',
    condition: 'ROAS turun di bawah target (2.8x vs target 3.0x) selama 2 hari berturut',
    diagnosis: 'Winning ad "Hook — Sibuk Kerja" frequency sudah 2.1x — belum fatigue, tapi budget adset retargeting tidak optimal',
    suggestAction: 'Konsolidasi budget ke adset Broad. Scale winning ad "Hook — Sibuk Kerja" 20%.',
    timestamp: new Date(Date.now() - 25 * 60_000).toISOString(), isRead: false,
  },
  {
    id: 'a2', type: 'ad_fatigue', brand: 'ngajigaes', severity: 'warning',
    condition: 'Adset "Campaign Ramadan — Retargeting": Frequency 3.2x dalam 7 hari',
    diagnosis: 'Audience fatigue terdeteksi di adset retargeting',
    suggestAction: 'Pause adset. Rotate creative baru atau expand lookalike 3-5%.',
    timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(), isRead: false,
  },
  {
    id: 'a3', type: 'winning_ad', brand: 'ngajigaes', severity: 'info',
    condition: 'Winning ad terdeteksi: "Hook — Sibuk Kerja" score 87/100',
    diagnosis: 'Top performer dengan ROAS 3.6x (target 3.0x), CTR 2.6%',
    suggestAction: 'Scale budget adset Broad 20%. Gunakan sebagai referensi brief creative baru.',
    timestamp: new Date(Date.now() - 4 * 3600_000).toISOString(), isRead: true,
  },
];

// ─── API Status ───────────────────────────────────────────────────────────────
export const API_STATUS: ApiStatusInfo[] = [
  { brandId: 'ngajigaes', status: 'normal', lastUpdated: new Date(Date.now() - 43 * 60_000).toISOString() },
];

// ─── Winning Ads ──────────────────────────────────────────────────────────────
export const WINNING_ADS: Record<string, WinningAd[]> = {
  ngajigaes: [
    { adId: 'ng-1-as1-ad1', adName: 'Hook — Sibuk Kerja', campaignName: 'Campaign Ramadan 2026',
      score: 87, rank: 1, thumbnailUrl: 'https://picsum.photos/seed/w1/80/80',
      funnelType: 'LP', metrics: { roas: 3.6, costPerPurchase: 32_000, ctr: 2.6 } },
    { adId: 'ng-2-as1-ad1', adName: 'Evergreen — Pemula v3', campaignName: 'Campaign Evergreen',
      score: 79, rank: 2, thumbnailUrl: 'https://picsum.photos/seed/w2/80/80',
      funnelType: 'LP', metrics: { roas: 3.4, costPerPurchase: 35_000, ctr: 2.3 } },
    { adId: 'ng-1-as1-ad3', adName: 'Testimoni — 3 Bulan Progress', campaignName: 'Campaign Ramadan 2026',
      score: 71, rank: 3, thumbnailUrl: 'https://picsum.photos/seed/w3/80/80',
      funnelType: 'LP', metrics: { roas: 3.1, costPerPurchase: 38_000, ctr: 2.1 } },
  ],
};

// ─── Competitor Ads (niche: ngaji & quran online) ─────────────────────────────
export const COMPETITOR_ADS: CompetitorAd[] = [
  {
    id: 'c1', libraryId: 'META_LIB_001', advertiserName: 'NgujiBareng Academy',
    adCopy: 'Tahukah kamu belajar ngaji 15 menit sehari bisa buat kamu khatam Al-Quran dalam 6 bulan?',
    creativeType: 'video', ctaButton: 'Watch More',
    destinationUrl: '', dateActive: '2026-04-15',
    funnelType: 'Visit Profile', funnelOverride: null,
    thumbnailUrl: 'https://picsum.photos/seed/c3/200/200', domain: 'ngujibareng.id',
  },
  {
    id: 'c2', libraryId: 'META_LIB_002', advertiserName: 'QuranPath ID',
    adCopy: 'Kenapa memilih metode kami? 10.000+ alumni, metode terstandarisasi, bisa mulai dari 0.',
    creativeType: 'carousel', ctaButton: 'Send Message',
    destinationUrl: 'https://wa.me/6289876543210', dateActive: '2026-04-25',
    funnelType: 'CTWA', funnelOverride: null,
    thumbnailUrl: 'https://picsum.photos/seed/c5/200/200', domain: 'quranpath.id',
  },
  {
    id: 'c3', libraryId: 'META_LIB_003', advertiserName: 'Belajar Ngaji Online',
    adCopy: 'Sudah 5 tahun niat ngaji tapi belum mulai? Sekarang saatnya. Kelas pertama GRATIS.',
    creativeType: 'image', ctaButton: 'Learn More',
    destinationUrl: 'https://belajarnajionline.id/gratis', dateActive: '2026-04-18',
    funnelType: 'LP', funnelOverride: null,
    thumbnailUrl: 'https://picsum.photos/seed/c6/200/200', domain: 'belajarngajionline.id',
  },
  {
    id: 'c4', libraryId: 'META_LIB_004', advertiserName: 'Rumah Quran Digital',
    adCopy: 'Belajar tartil Al-Quran dari ustadz bersertifikat. Jadwal fleksibel, bisa pagi/malam.',
    creativeType: 'video', ctaButton: 'Sign Up',
    destinationUrl: 'https://rumahquran.id/daftar', dateActive: '2026-05-01',
    funnelType: 'Lead Form', funnelOverride: null,
    thumbnailUrl: 'https://picsum.photos/seed/c7/200/200', domain: 'rumahquran.id',
  },
  {
    id: 'c5', libraryId: 'META_LIB_005', advertiserName: 'Ngaji Express',
    adCopy: 'Dalam 30 hari, kamu akan bisa membaca Al-Quran dengan lancar. Atau uang kembali.',
    creativeType: 'image', ctaButton: 'Learn More',
    destinationUrl: 'https://ngajiexpress.com/30hari', dateActive: '2026-05-03',
    funnelType: 'LP', funnelOverride: null,
    thumbnailUrl: 'https://picsum.photos/seed/c8/200/200', domain: 'ngajiexpress.com',
  },
];

export const DOMAIN_SUMMARIES: DomainSummary[] = [
  { domain: 'ngujibareng.id', totalAds: 34, activeAds: 11, lastSeen: '2026-05-07',
    funnelDistribution: { 'LP': 10, 'CTWA': 8, 'Lead Form': 3, 'Visit Profile': 13 } },
  { domain: 'quranpath.id', totalAds: 28, activeAds: 11, lastSeen: '2026-05-07',
    funnelDistribution: { 'LP': 12, 'CTWA': 10, 'Lead Form': 5, 'Visit Profile': 1 } },
  { domain: 'belajarngajionline.id', totalAds: 21, activeAds: 7, lastSeen: '2026-05-06',
    funnelDistribution: { 'LP': 14, 'CTWA': 4, 'Lead Form': 3, 'Visit Profile': 0 } },
  { domain: 'rumahquran.id', totalAds: 15, activeAds: 5, lastSeen: '2026-05-05',
    funnelDistribution: { 'LP': 4, 'CTWA': 3, 'Lead Form': 7, 'Visit Profile': 1 } },
  { domain: 'ngajiexpress.com', totalAds: 12, activeAds: 4, lastSeen: '2026-05-04',
    funnelDistribution: { 'LP': 9, 'CTWA': 2, 'Lead Form': 1, 'Visit Profile': 0 } },
];

// ─── Phase 6 — Automation ─────────────────────────────────────────────────────
export const AUTOMATION_LOGS: AutomationLog[] = [
  {
    id: 'log1', brand: 'ngajigaes', actionType: 'pause', status: 'done',
    targetName: 'Campaign Ramadan — Retargeting',
    description: 'Adset di-pause otomatis: Frequency 3.2x > threshold 3x dalam 7 hari',
    timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'log2', brand: 'ngajigaes', actionType: 'upload_creative', status: 'done',
    targetName: 'hook-ramadan-v3.mp4',
    description: 'Creative baru di-upload dari GDrive /pending ke Meta Ad Account',
    timestamp: new Date(Date.now() - 1.5 * 3600_000).toISOString(),
    meta: { adId: 'META_AD_XYZ' },
  },
  {
    id: 'log3', brand: 'ngajigaes', actionType: 'create_ad_draft', status: 'done',
    targetName: 'Ad Draft: Hook Ramadan v3 — Broad',
    description: 'Draft ad dibuat dengan creative baru. Status: PAUSED (pending review)',
    timestamp: new Date(Date.now() - 1 * 3600_000).toISOString(),
    meta: { adId: 'META_DRAFT_123' },
  },
  {
    id: 'log4', brand: 'ngajigaes', actionType: 'generate_copy', status: 'done',
    targetName: 'AI Copy Variation × 3',
    description: '3 variasi copy digenerate dari winning ad. Menunggu review admin di Google Sheets.',
    timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
  {
    id: 'log5', brand: 'ngajigaes', actionType: 'scale_budget', status: 'queued',
    targetName: 'Adset Broad — Evergreen',
    description: 'Scale budget 20% dijadwalkan (ROAS 3.4x > target). Menunggu giliran queue.',
    timestamp: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
];

export const CREATIVE_ASSETS: CreativeAsset[] = [
  { id: 'ca1', brand: 'ngajigaes', fileName: 'hook-ramadan-v3.mp4', fileType: 'video',
    status: 'uploaded', driveUrl: '#', adId: 'META_AD_XYZ', uploadedAt: '2026-05-07T08:30:00Z' },
  { id: 'ca2', brand: 'ngajigaes', fileName: 'testimonial-3bulan.jpg', fileType: 'image',
    status: 'pending', driveUrl: '#' },
  { id: 'ca3', brand: 'ngajigaes', fileName: 'hook-tips-ngaji-v2.mp4', fileType: 'video',
    status: 'pending', driveUrl: '#' },
  { id: 'ca4', brand: 'ngajigaes', fileName: 'evergreen-pemula-banner.jpg', fileType: 'image',
    status: 'archived', driveUrl: '#', adId: 'META_OLD_AD', uploadedAt: '2026-04-10T10:00:00Z' },
];

export const COPY_ROWS: CopyRow[] = [
  { id: 'cr1', brand: 'ngajigaes',
    primaryText: 'Mau ngaji tapi sibuk kerja? Coba 15 menit sehari dulu.',
    headline: 'Mulai Ngaji Hari Ini', cta: 'Learn More',
    destinationUrl: 'https://ngajigaes.id/mulai', funnelStage: 'TOFU', status: 'published', adId: 'META_AD_XYZ' },
  { id: 'cr2', brand: 'ngajigaes',
    primaryText: 'Kenapa 10.000+ orang pilih Ngajigaes? Metode terstruktur, mulai dari 0.',
    headline: 'Metode Terbukti, Hasil Nyata', cta: 'Learn More',
    destinationUrl: 'https://ngajigaes.id/tentang', funnelStage: 'MOFU', status: 'pending' },
  { id: 'cr3', brand: 'ngajigaes',
    primaryText: 'Promo Hari Ini: Daftar sekarang, hemat Rp 150rb. Tersisa 20 slot!',
    headline: 'Daftar Sekarang, Hemat Rp 150rb', cta: 'Shop Now',
    destinationUrl: 'https://ngajigaes.id/daftar', funnelStage: 'BOFU', status: 'pending' },
];

export const QUEUE_STATUS: QueueStatus[] = [
  { brand: 'ngajigaes', total: 3, processed: 3, failed: 0, isProcessing: false },
];
