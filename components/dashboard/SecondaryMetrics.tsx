'use client';
import { useApp, BRAND_ID } from '@/context/AppContext';
import { useDashboardData } from '@/hooks/useSupabaseData';
import { formatRupiah, formatPct, formatNumber } from '@/lib/utils';
import type { NgajigaesMetrics } from '@/lib/types';

export function SecondaryMetrics() {
  const { dateRange } = useApp();
  const { metrics } = useDashboardData(BRAND_ID, dateRange);
  const m = metrics as NgajigaesMetrics;

  const items = [
    { label: 'CPM',       value: formatRupiah(m.cpm) },
    { label: 'CTR',       value: formatPct(m.ctr) },
    { label: 'Frequency', value: m.frequency.toFixed(2) },
    { label: 'Reach',     value: formatNumber(m.reach) },
  ];

  return (
    <div className="flex items-center gap-6 px-4 py-3 bg-card border border-border rounded-xl">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-6">
          <div>
            <p className="text-[11px] text-text-secondary uppercase tracking-wide">{item.label}</p>
            <p className="text-sm font-semibold text-text-primary">{item.value}</p>
          </div>
          {i < items.length - 1 && <div className="w-px h-6 bg-border" />}
        </div>
      ))}
    </div>
  );
}
