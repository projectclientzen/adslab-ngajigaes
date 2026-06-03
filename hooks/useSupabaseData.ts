'use client';
import { useState, useEffect, useCallback } from 'react';
import { isSupabaseAvailable } from '@/lib/supabase';
import {
  fetchSnapshots, fetchFetchStatus, fetchAdsDetail,
  fetchKpiTargets, fetchRecentAlerts,
} from '@/lib/queries';
import {
  toBrandMetrics, toCampaignHierarchy, toApiStatus,
  toCompetitorAds, toAlerts, toTrends,
  type LiveTrends,
} from '@/lib/transforms';
import {
  NGAJIGAES_METRICS, NGAJIGAES_CAMPAIGNS,
  API_STATUS, MOCK_ALERTS, COMPETITOR_ADS, TRENDS,
} from '@/lib/mockData';
import { BRAND_ID } from '@/context/AppContext';
import type {
  DateRange, Campaign, ApiStatusInfo, Alert,
  NgajigaesMetrics, CompetitorAd,
} from '@/lib/types';

// ─── Dashboard data hook ───────────────────────────────────────────────────────

export interface DashboardData {
  metrics:    NgajigaesMetrics;
  campaigns:  Campaign[];
  apiStatus:  ApiStatusInfo;
  alerts:     Alert[];
  trends:     LiveTrends | null;
  isLoading:  boolean;
  isLive:     boolean;
  refetch:    () => void;
}

export function useDashboardData(_brand: string, dateRange: DateRange): DashboardData {
  const [isLoading, setIsLoading]         = useState(false);
  const [liveMetrics, setLiveMetrics]     = useState<NgajigaesMetrics | null>(null);
  const [liveCampaigns, setLiveCampaigns] = useState<Campaign[] | null>(null);
  const [liveApiStatus, setLiveApiStatus] = useState<ApiStatusInfo | null>(null);
  const [liveAlerts, setLiveAlerts]       = useState<Alert[] | null>(null);
  const [liveTrends, setLiveTrends]       = useState<LiveTrends | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseAvailable) return;
    setIsLoading(true);
    try {
      const [snapshots, fetchStatuses, kpiTargets, alertRows] = await Promise.all([
        fetchSnapshots(BRAND_ID, dateRange),
        fetchFetchStatus(),
        fetchKpiTargets(BRAND_ID),
        fetchRecentAlerts(BRAND_ID, 10),
      ]);
      if (snapshots.length > 0) {
        setLiveMetrics(toBrandMetrics(BRAND_ID, snapshots) as NgajigaesMetrics);
        setLiveCampaigns(toCampaignHierarchy(BRAND_ID, snapshots, kpiTargets));
        setLiveTrends(toTrends(BRAND_ID, snapshots));
      }
      const brandStatus = fetchStatuses.find(s => s.brand === BRAND_ID);
      if (brandStatus) setLiveApiStatus(toApiStatus(brandStatus));
      if (alertRows.length > 0) setLiveAlerts(toAlerts(alertRows));
    } catch (e) {
      console.error('[useDashboardData]', e);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { void load(); }, [load]);

  const ng = TRENDS.ngajigaes;
  const isLive = isSupabaseAvailable && (liveMetrics !== null || liveCampaigns !== null);

  return {
    metrics:   liveMetrics   ?? NGAJIGAES_METRICS,
    campaigns: liveCampaigns ?? NGAJIGAES_CAMPAIGNS,
    apiStatus: liveApiStatus ?? API_STATUS[0]!,
    alerts:    liveAlerts    ?? MOCK_ALERTS,
    trends:    liveTrends    ?? {
      primary: ng.roas,
      spend:   ng.spend,
      reach:   ng.reach,
      result:  ng.roas.map(v => Math.round(v * 100)),
    },
    isLoading,
    isLive,
    refetch: load,
  };
}

// ─── Competitor ads hook ───────────────────────────────────────────────────────

export interface CompetitorAdsData {
  ads:       CompetitorAd[];
  isLoading: boolean;
  isLive:    boolean;
  refetch:   () => void;
}

export function useCompetitorAds(funnelFilter?: string): CompetitorAdsData {
  const [isLoading, setIsLoading] = useState(false);
  const [liveAds, setLiveAds]     = useState<CompetitorAd[] | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseAvailable) return;
    setIsLoading(true);
    try {
      const rows = await fetchAdsDetail(funnelFilter);
      if (rows.length > 0) setLiveAds(toCompetitorAds(rows));
    } catch (e) {
      console.error('[useCompetitorAds]', e);
    } finally {
      setIsLoading(false);
    }
  }, [funnelFilter]);

  useEffect(() => { void load(); }, [load]);

  return {
    ads:      liveAds ?? COMPETITOR_ADS,
    isLoading,
    isLive:   isSupabaseAvailable && liveAds !== null,
    refetch:  load,
  };
}

// ─── All fetch statuses ───────────────────────────────────────────────────────

export function useAllFetchStatuses(): ApiStatusInfo[] {
  const [statuses, setStatuses] = useState<ApiStatusInfo[]>([]);
  useEffect(() => {
    if (!isSupabaseAvailable) return;
    fetchFetchStatus().then(rows => {
      if (rows.length > 0) setStatuses(rows.map(toApiStatus));
    });
  }, []);
  return statuses.length > 0 ? statuses : API_STATUS;
}
