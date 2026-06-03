'use client';
import { Bell, RefreshCw, Database } from 'lucide-react';
import { useApp, BRAND_ID, BRAND_NAME, BRAND_COLOR } from '@/context/AppContext';
import { useDashboardData, useAllFetchStatuses } from '@/hooks/useSupabaseData';
import { triggerMetaFetch } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { TimeAgo } from '@/components/TimeAgo';
import type { DateRange } from '@/lib/types';
import { useState } from 'react';

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: '7d',     label: '7 Hari'  },
  { value: '30d',    label: '30 Hari' },
  { value: 'custom', label: 'Custom'  },
];

export function Header() {
  const { dateRange, setDateRange, role, setRole, isLiveData } = useApp();
  const { refetch, isLoading, alerts } = useDashboardData(BRAND_ID, dateRange);
  const allStatuses = useAllFetchStatuses();
  const [showAlerts, setShowAlerts] = useState(false);
  const [fetching, setFetching] = useState(false);

  const brandStatus = allStatuses.find(s => s.brandId === BRAND_ID);
  const unreadAlerts = alerts.filter(a => !a.isRead);

  const handleForceRefetch = async () => {
    setFetching(true);
    await triggerMetaFetch(BRAND_ID);
    setTimeout(() => { refetch(); setFetching(false); }, 3000);
  };

  return (
    <header className="min-h-14 border-b border-border bg-surface flex items-center flex-wrap px-3 sm:px-4 gap-2 sm:gap-4 flex-shrink-0 py-2">

      {/* Brand badge (fixed) */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex-shrink-0"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
        {BRAND_NAME}
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
        {DATE_RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setDateRange(r.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              dateRange === r.value ? 'bg-border text-text-primary' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* API Status */}
      {brandStatus && (
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border',
          brandStatus.status === 'normal'     && 'bg-success-dim border-success/20 text-success',
          brandStatus.status === 'stale'      && 'bg-warning-dim border-warning/20 text-warning',
          brandStatus.status === 'stale_long' && 'bg-danger-dim  border-danger/20  text-danger',
          brandStatus.status === 'revoked'    && 'bg-danger-dim  border-danger/20  text-danger',
        )}>
          <RefreshCw size={11} />
          <TimeAgo
            timestamp={brandStatus.lastUpdated}
            prefix={brandStatus.status === 'normal' ? 'Live ' : 'Stale · '}
          />
        </div>
      )}

      {isLiveData && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] border bg-success-dim border-success/20 text-success">
          <Database size={10} /> Supabase
        </div>
      )}

      <div className="flex-1" />

      {isLiveData && role === 'admin' && (
        <button
          onClick={handleForceRefetch}
          disabled={fetching || isLoading}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all',
            fetching ? 'bg-primary-dim border-primary/30 text-primary' : 'bg-card border-border text-text-secondary hover:text-text-primary',
          )}
        >
          <RefreshCw size={11} className={fetching ? 'animate-spin' : ''} />
          {fetching ? 'Fetching...' : 'Sync Meta'}
        </button>
      )}

      <button
        onClick={() => setRole(role === 'admin' ? 'tim' : 'admin')}
        className={cn(
          'px-2.5 py-1 rounded-md text-xs border transition-all',
          role === 'admin' ? 'bg-primary-dim border-primary/30 text-primary' : 'bg-border border-border-light text-text-secondary',
        )}
      >
        {role === 'admin' ? 'Admin' : 'Tim'}
      </button>

      {/* Alerts Bell */}
      <div className="relative">
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
        >
          <Bell size={16} />
          {unreadAlerts.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {unreadAlerts.length}
            </span>
          )}
        </button>
        {showAlerts && (
          <div className="absolute right-0 top-10 w-96 bg-card border border-border rounded-xl shadow-2xl z-50 animate-slide-down">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">Alert Aktif</span>
              <span className="text-xs text-text-muted">{unreadAlerts.length} belum dibaca</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {alerts.map(alert => (
                <div key={alert.id} className={cn('p-3 border-b border-border last:border-0 hover:bg-border/40 transition-colors', !alert.isRead && 'bg-surface')}>
                  <div className="flex items-start gap-2">
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      alert.severity === 'critical' && 'bg-danger',
                      alert.severity === 'warning'  && 'bg-warning',
                      alert.severity === 'info'     && 'bg-primary')} />
                    <div className="min-w-0">
                      <p className="text-xs text-text-primary font-medium">{alert.condition}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">{alert.diagnosis}</p>
                      {alert.suggestAction && <p className="text-[11px] text-primary mt-1">→ {alert.suggestAction}</p>}
                      <TimeAgo timestamp={alert.timestamp} className="text-[10px] text-text-muted mt-1 block" />
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && <p className="p-4 text-center text-xs text-text-muted">Tidak ada alert aktif</p>}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
