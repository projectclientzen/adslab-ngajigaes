'use client';
import { useApp, BRAND_ID } from '@/context/AppContext';
import { useDashboardData } from '@/hooks/useSupabaseData';
import { MetricCard } from '@/components/ui/MetricCard';
import { calcKpiStatus, formatRupiah, formatROAS, formatNumber } from '@/lib/utils';
import type { NgajigaesMetrics } from '@/lib/types';

export function HeroCards() {
  const { dateRange } = useApp();
  const { metrics, trends, isLoading } = useDashboardData(BRAND_ID, dateRange);
  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 h-32 animate-pulse" />
      ))}
    </div>
  );
  const m = metrics as NgajigaesMetrics;
  const roasStatus = calcKpiStatus(m.roas, m.roasTarget);
  const cppStatus  = calcKpiStatus(m.costPerPurchase, m.costPerPurchaseTarget, true);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard label="ROAS" value={formatROAS(m.roas)} target={formatROAS(m.roasTarget)}
        targetRaw={m.roasTarget} actualRaw={m.roas} status={roasStatus} isLarge
        trend={m.roas >= m.roasTarget ? 2.1 : -6.7} sparklineData={trends?.primary} sparklineColor="#6366F1" />
      <MetricCard label="Cost per Purchase" value={formatRupiah(m.costPerPurchase)}
        target={formatRupiah(m.costPerPurchaseTarget)} targetRaw={m.costPerPurchaseTarget}
        actualRaw={m.costPerPurchase} status={cppStatus} isLarge inverse
        trend={m.costPerPurchase <= m.costPerPurchaseTarget ? -8.9 : 5.2} sparklineColor="#6366F1" />
      <MetricCard label="Profit Rate" value={`${m.profitRate.toFixed(1)}%`}
        subValue={`Conv. Value ${formatRupiah(m.convValue)}`} isLarge
        sparklineData={trends?.primary.map(v => v * 6.5)} sparklineColor="#A78BFA" />
      <MetricCard label="Total Spend" value={formatRupiah(m.totalSpend)}
        subValue={`${formatNumber(m.totalPurchases)} purchases`} isLarge
        sparklineData={trends?.spend} sparklineColor="#8B8FA8" />
    </div>
  );
}
