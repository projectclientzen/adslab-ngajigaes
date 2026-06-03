import { cn } from '@/lib/utils';
import type { KpiStatus, ItemStatus, FunnelType } from '@/lib/types';

export function KpiDot({ status }: { status: KpiStatus }) {
  return (
    <span className={cn(
      'inline-block w-2 h-2 rounded-full flex-shrink-0',
      status === 'green'  && 'bg-success',
      status === 'yellow' && 'bg-warning',
      status === 'red'    && 'bg-danger',
    )} />
  );
}

export function StatusPill({ status }: { status: ItemStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
      status === 'ACTIVE'   && 'bg-success-dim text-success',
      status === 'PAUSED'   && 'bg-warning-dim text-warning',
      status === 'ARCHIVED' && 'bg-border text-text-muted',
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'ACTIVE'   && 'bg-success',
        status === 'PAUSED'   && 'bg-warning',
        status === 'ARCHIVED' && 'bg-text-muted',
      )} />
      {status === 'ACTIVE' ? 'Aktif' : status === 'PAUSED' ? 'Paused' : 'Archive'}
    </span>
  );
}

export function FunnelBadge({ type }: { type: FunnelType }) {
  const styles: Record<FunnelType, string> = {
    'LP':           'bg-primary-dim text-primary border-primary/20',
    'CTWA':         'bg-success-dim text-success border-success/20',
    'Visit Profile':'bg-warning-dim text-warning border-warning/20',
    'Lead Form':    'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/20',
  };
  return (
    <span className={cn(
      'inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold border',
      styles[type],
    )}>
      {type}
    </span>
  );
}

export function WinningBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-dim text-warning border border-warning/20">
      ⭐ {score}
    </span>
  );
}
