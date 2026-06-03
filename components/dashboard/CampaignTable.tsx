'use client';
import { useState, useEffect } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, Shield, Filter, RefreshCw, GripVertical } from 'lucide-react';
import { useApp, BRAND_ID } from '@/context/AppContext';
import { useDashboardData } from '@/hooks/useSupabaseData';
import { KpiDot, StatusPill, FunnelBadge, WinningBadge } from '@/components/ui/StatusBadge';
import { formatRupiah, formatPct, formatNumber, formatROAS, cn } from '@/lib/utils';
import type { Campaign, Adset, Ad } from '@/lib/types';

type FilterStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'ALL';

const ORDER_KEY = (brand: string) => `adslab_campaign_order_${brand}`;

export function CampaignTable() {
  const { dateRange } = useApp();
  const { campaigns, isLoading, isLive, refetch } = useDashboardData(BRAND_ID, dateRange);

  const [orderedIds, setOrderedIds]               = useState<string[]>([]);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [expandedAdsets, setExpandedAdsets]       = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus]           = useState<FilterStatus>('ACTIVE');

  // Load saved order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(ORDER_KEY(BRAND_ID));
    if (saved) {
      try { setOrderedIds(JSON.parse(saved)); } catch { /* ignore */ }
    } else {
      setOrderedIds(campaigns.map(c => c.id));
    }
  }, [BRAND_ID, campaigns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedIds(ids => {
      const oldIdx = ids.indexOf(active.id as string);
      const newIdx = ids.indexOf(over.id as string);
      const next = arrayMove(ids, oldIdx, newIdx);
      localStorage.setItem(ORDER_KEY(BRAND_ID), JSON.stringify(next));
      return next;
    });
  };

  // Sort campaigns by saved order
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const ai = orderedIds.indexOf(a.id);
    const bi = orderedIds.indexOf(b.id);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const filtered = filterStatus === 'ALL'
    ? sortedCampaigns
    : sortedCampaigns.filter(c => c.status === filterStatus);

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set); next.has(id) ? next.delete(id) : next.add(id); return next;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/60">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-text-primary font-display">Campaign Breakdown</h2>
          {isLive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-success-dim text-success border border-success/20 font-medium">Live</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} disabled={isLoading} className="p-1 rounded text-text-muted hover:text-text-primary transition-colors disabled:opacity-40" title="Refresh">
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <Filter size={12} className="text-text-muted" />
          {(['ALL', 'ACTIVE', 'PAUSED', 'ARCHIVED'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={cn('px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                filterStatus === s ? 'bg-border text-text-primary' : 'text-text-muted hover:text-text-secondary')}>
              {s === 'ALL' ? 'Semua' : s === 'ACTIVE' ? 'Aktif' : s === 'PAUSED' ? 'Paused' : 'Archive'}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="campaign-cols px-4 py-2 border-b border-border/60 bg-surface/30">
        <span /><span />
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Nama</span>
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold text-right">Spend</span>
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold text-right hidden md:block">Result</span>
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold text-right">KPI</span>
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold text-right hidden lg:block">Reach</span>
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold text-center hidden sm:block">Status</span>
      </div>

      <style>{`
        .campaign-cols {
          display: grid;
          grid-template-columns: 20px 18px 1fr 100px 80px 130px 90px 70px;
          gap: 8px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .campaign-cols { grid-template-columns: 20px 18px 1fr 100px 130px 70px; }
          .campaign-cols .hidden.lg\\:block { display: none; }
        }
        @media (max-width: 768px) {
          .campaign-cols { grid-template-columns: 20px 18px 1fr 90px 120px; }
          .campaign-cols .hidden.md\\:block,
          .campaign-cols .hidden.sm\\:block { display: none; }
        }
      `}</style>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-border/60">
            {isLoading && filtered.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 px-4 flex items-center">
                    <div className="h-3 bg-border rounded w-full animate-pulse" />
                  </div>
                ))
              : filtered.map(c => (
                  <SortableCampaignRow
                    key={c.id}
                    campaign={c}
                    expanded={expandedCampaigns.has(c.id)}
                    onToggle={() => setExpandedCampaigns(prev => toggle(prev, c.id))}
                    expandedAdsets={expandedAdsets}
                    onToggleAdset={id => setExpandedAdsets(prev => toggle(prev, id))}
                  />
                ))
            }
            {!isLoading && filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-text-muted text-sm">Tidak ada campaign dengan status ini</div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ─── Sortable wrapper ──────────────────────────────────────────────────────────
function SortableCampaignRow(props: React.ComponentProps<typeof CampaignRow>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: props.campaign.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex:  isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CampaignRow {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

// ─── KPI Progress Cell ─────────────────────────────────────────────────────────
function KpiCell({ kpiValue, kpiTarget, status, pct }: { kpiValue: string; kpiTarget: string; status: string; pct: number }) {
  const barColor  = status === 'green' ? 'bg-success' : status === 'yellow' ? 'bg-warning' : 'bg-danger';
  const textColor = status === 'green' ? 'text-success' : status === 'yellow' ? 'text-warning' : 'text-danger';
  return (
    <div className="text-right space-y-1">
      <div className="flex items-center justify-end gap-1.5">
        <KpiDot status={status as 'green' | 'yellow' | 'red'} />
        <span className={cn('text-sm font-semibold tabular-nums', textColor)}>{kpiValue}</span>
      </div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', barColor)} style={{ width: `${pct}%`, opacity: 0.7 }} />
      </div>
      <p className="text-[10px] text-text-muted">target {kpiTarget} · {pct}%</p>
    </div>
  );
}

// ─── Campaign Row ──────────────────────────────────────────────────────────────
function CampaignRow({
  campaign: c, expanded, onToggle, expandedAdsets, onToggleAdset, dragHandleProps,
}: {
  campaign: Campaign; expanded: boolean; onToggle: () => void;
  expandedAdsets: Set<string>; onToggleAdset: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const kpi = c.kpi;
  const kpiValue  = kpi.unit === 'roas' ? formatROAS(kpi.actual)  : formatRupiah(kpi.actual);
  const kpiTarget = kpi.unit === 'roas' ? formatROAS(kpi.target)  : formatRupiah(kpi.target);
  const rawPct    = kpi.unit === 'roas'
    ? Math.min(100, Math.round((kpi.actual / kpi.target) * 100))
    : Math.min(100, Math.round((kpi.target / Math.max(kpi.actual, 1)) * 100));

  return (
    <>
      <div className={cn('campaign-cols px-4 py-3 hover:bg-surface/50 transition-colors group', expanded && 'bg-surface/30')}>
        {/* Drag handle */}
        <button
          {...dragHandleProps}
          className="flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>

        {/* Expand */}
        <span className="text-text-muted cursor-pointer" onClick={onToggle}>
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>

        {/* Name */}
        <div className="flex items-center gap-2 min-w-0 cursor-pointer" onClick={onToggle}>
          <div className={cn('w-1 h-6 rounded-full flex-shrink-0',
            c.kpiStatus === 'green' ? 'bg-success/50' : c.kpiStatus === 'yellow' ? 'bg-warning/50' : 'bg-danger/50')} />
          {c.isProtected && <Shield size={11} className="text-warning flex-shrink-0" />}
          <span className="text-sm font-medium text-text-primary truncate">{c.name}</span>
          <span className="text-[10px] text-text-muted bg-border px-1.5 py-0.5 rounded flex-shrink-0">{c.adsets.length} adset</span>
        </div>

        <span className="text-sm text-text-primary text-right tabular-nums font-medium cursor-pointer" onClick={onToggle}>{formatRupiah(c.spend)}</span>
        <span className="text-sm text-text-secondary text-right tabular-nums cursor-pointer" onClick={onToggle}>{formatNumber(c.result)}</span>
        <div className="cursor-pointer" onClick={onToggle}><KpiCell kpiValue={kpiValue} kpiTarget={kpiTarget} status={c.kpiStatus} pct={rawPct} /></div>
        <span className="text-sm text-text-secondary text-right tabular-nums cursor-pointer" onClick={onToggle}>{formatNumber(c.reach)}</span>
        <div className="flex justify-center"><StatusPill status={c.status} /></div>
      </div>

      {expanded && c.adsets.map(adset => (
        <AdsetRow key={adset.id} adset={adset}
          expanded={expandedAdsets.has(adset.id)} onToggle={() => onToggleAdset(adset.id)} />
      ))}
    </>
  );
}

// ─── Adset Row ─────────────────────────────────────────────────────────────────
function AdsetRow({ adset, expanded, onToggle }: { adset: Adset; expanded: boolean; onToggle: () => void }) {
  const ctrPct = Math.min(100, Math.round((adset.ctr / 3) * 100));
  return (
    <>
      <div onClick={onToggle}
        className={cn('campaign-cols px-4 py-2.5 cursor-pointer hover:bg-surface/40 transition-colors border-l-2 border-primary/25 bg-surface/10', expanded && 'bg-surface/20')}>
        <span /><span className="text-text-muted pl-3">{expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
        <div className="flex items-center gap-2 pl-2 min-w-0">
          <span className="text-[10px] bg-primary/10 text-primary/70 px-1.5 py-0.5 rounded uppercase font-semibold tracking-wide">Adset</span>
          <span className="text-xs text-text-secondary truncate">{adset.name}</span>
        </div>
        <span className="text-xs text-text-secondary text-right tabular-nums">{formatRupiah(adset.spend)}</span>
        <span className="text-xs text-text-secondary text-right tabular-nums">{formatNumber(adset.result)}</span>
        <div className="text-right space-y-1">
          <div className="flex items-center justify-end gap-1.5">
            <KpiDot status={adset.kpiStatus} />
            <span className="text-xs text-text-secondary tabular-nums">CTR {formatPct(adset.ctr)}</span>
          </div>
          <div className="h-0.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary/50 rounded-full" style={{ width: `${ctrPct}%` }} />
          </div>
        </div>
        <span className="text-xs text-text-secondary text-right tabular-nums">{formatNumber(adset.reach)}</span>
        <div className="flex justify-center"><StatusPill status={adset.status} /></div>
      </div>
      {expanded && adset.ads.map(ad => <AdRow key={ad.id} ad={ad} />)}
    </>
  );
}

// ─── Ad Row ────────────────────────────────────────────────────────────────────
function AdRow({ ad }: { ad: Ad }) {
  return (
    <div className="campaign-cols px-4 py-2 border-l-4 border-success/15 bg-surface/5 hover:bg-surface/20 transition-colors">
      <span /><span />
      <div className="flex items-center gap-3 pl-6 min-w-0">
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-surface">
          <img src={ad.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-text-primary truncate">{ad.name}</span>
            {ad.isWinning && <WinningBadge score={ad.score} />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <FunnelBadge type={ad.funnelType} />
            <span className="text-[10px] text-text-muted capitalize">{ad.creativeType}</span>
          </div>
        </div>
      </div>
      <span className="text-xs text-text-secondary text-right tabular-nums">{formatRupiah(ad.spend)}</span>
      <span className="text-xs text-text-secondary text-right tabular-nums">{formatNumber(ad.result)}</span>
      <div className="text-right">
        <span className="text-[11px] text-text-muted block">CTR {formatPct(ad.ctr)}</span>
        <span className="text-[11px] text-text-muted block">CPM {formatRupiah(ad.cpm)}</span>
      </div>
      <span className="text-xs text-text-secondary text-right tabular-nums">{formatNumber(ad.reach)}</span>
      <div className="flex justify-center"><StatusPill status={ad.status} /></div>
    </div>
  );
}
