'use client';
import { AlertTriangle, Info } from 'lucide-react';
import { useApp, BRAND_ID } from '@/context/AppContext';
import { useDashboardData } from '@/hooks/useSupabaseData';
import { cn } from '@/lib/utils';
import { TimeAgo } from '@/components/TimeAgo';

export function AlertBanner() {
  const { dateRange } = useApp();
  const { apiStatus } = useDashboardData(BRAND_ID, dateRange);

  if (!apiStatus || apiStatus.status === 'normal') return null;

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm',
      apiStatus.status === 'stale'      && 'bg-warning-dim border-warning/30 text-warning',
      apiStatus.status === 'stale_long' && 'bg-danger-dim border-danger/30 text-danger',
      apiStatus.status === 'revoked'    && 'bg-danger-dim border-danger/30 text-danger',
    )}>
      {apiStatus.status === 'stale' ? <AlertTriangle size={15} /> : <Info size={15} />}
      <span className="flex-1 text-xs">
        {apiStatus.status === 'stale' && (
          <>Menampilkan data terakhir — <TimeAgo timestamp={apiStatus.lastUpdated} />. Meta API lambat atau timeout.</>
        )}
        {apiStatus.status === 'stale_long' &&
          'Data mungkin tidak akurat — Meta API down > 6 jam. Cek langsung di Ads Manager.'}
        {apiStatus.status === 'revoked' &&
          'API access perlu direview — token mungkin dicabut. Hubungi admin.'}
      </span>
    </div>
  );
}
