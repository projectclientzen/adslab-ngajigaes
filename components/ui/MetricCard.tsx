import { cn } from '@/lib/utils';
import type { KpiStatus } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Sparkline } from './Sparkline';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  target?: string;
  targetRaw?: number;
  actualRaw?: number;
  status?: KpiStatus;
  trend?: number;
  isLarge?: boolean;
  icon?: React.ReactNode;
  sparklineData?: number[];
  sparklineColor?: string;
  inverse?: boolean;
}

const STATUS_COLORS: Record<KpiStatus, { border: string; dot: string; glow: string; bar: string; text: string }> = {
  green:  { border: 'border-success/20',  dot: 'bg-success',  glow: 'card-glow-green',  bar: 'bg-success',  text: 'text-success'  },
  yellow: { border: 'border-warning/20',  dot: 'bg-warning',  glow: 'card-glow-yellow', bar: 'bg-warning',  text: 'text-warning'  },
  red:    { border: 'border-danger/20',   dot: 'bg-danger',   glow: 'card-glow-red',    bar: 'bg-danger',   text: 'text-danger'   },
};

export function MetricCard({
  label, value, subValue, target, targetRaw, actualRaw, status,
  trend, isLarge, icon, sparklineData, sparklineColor = '#6366F1', inverse,
}: MetricCardProps) {
  const sc = status ? STATUS_COLORS[status] : null;

  let progressPct: number | null = null;
  if (targetRaw !== undefined && actualRaw !== undefined && targetRaw > 0) {
    if (inverse) {
      progressPct = Math.min(100, Math.max(0, Math.round((targetRaw / actualRaw) * 100)));
    } else {
      progressPct = Math.min(100, Math.max(0, Math.round((actualRaw / targetRaw) * 100)));
    }
  }

  return (
    <div className={cn(
      'bg-card border rounded-xl p-4 flex flex-col gap-2.5 transition-all duration-200',
      'hover:border-border-light hover:-translate-y-0.5',
      sc ? sc.border : 'border-border',
      sc && sc.glow,
    )}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-text-muted">{icon}</span>}
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {sparklineData && (
            <Sparkline
              data={sparklineData}
              width={56}
              height={22}
              color={sc ? ({ green: '#22C55E', yellow: '#F59E0B', red: '#EF4444' }[status!]) : sparklineColor}
            />
          )}
          {sc && (
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', sc.dot)} />
          )}
        </div>
      </div>

      {/* Value */}
      <div>
        <p className={cn(
          'font-display font-bold text-text-primary leading-tight',
          isLarge ? 'text-[1.9rem]' : 'text-xl',
        )}>
          {value}
        </p>
        {subValue && <p className="text-xs text-text-secondary mt-0.5">{subValue}</p>}
      </div>

      {/* KPI progress bar */}
      {progressPct !== null && sc && (
        <div className="space-y-1">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', sc.bar)}
              style={{ width: `${progressPct}%`, opacity: 0.75 }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      {(target || trend !== undefined) && (
        <div className="flex items-center justify-between">
          {target && (
            <span className="text-[11px] text-text-muted">
              Target <span className={cn('font-medium', sc ? sc.text : 'text-text-secondary')}>{target}</span>
              {progressPct !== null && (
                <span className="ml-1 text-text-muted">({progressPct}%)</span>
              )}
            </span>
          )}
          {trend !== undefined && (
            <span className={cn(
              'flex items-center gap-0.5 text-[11px] font-semibold',
              trend >= 0 ? 'text-success' : 'text-danger',
            )}>
              {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
