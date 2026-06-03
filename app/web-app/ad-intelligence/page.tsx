'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Edit3, ExternalLink, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useCompetitorAds } from '@/hooks/useSupabaseData';
import { FunnelBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';
import type { FunnelType, CompetitorAd } from '@/lib/types';

const FUNNEL_FILTERS: (FunnelType | 'ALL')[] = ['ALL', 'LP', 'CTWA', 'Visit Profile', 'Lead Form'];

const FUNNEL_COLORS: Record<FunnelType, string> = {
  'LP':           '#6366F1',
  'CTWA':         '#10B981',
  'Visit Profile':'#F59E0B',
  'Lead Form':    '#EC4899',
};

export default function AdIntelligencePage() {
  return <Suspense><AdIntelligenceContent /></Suspense>;
}

function AdIntelligenceContent() {
  const searchParams = useSearchParams();
  const initialFunnel = (searchParams.get('funnel') as FunnelType | null) ?? 'ALL';
  const [funnelFilter, setFunnelFilter]     = useState<FunnelType | 'ALL'>(
    FUNNEL_FILTERS.includes(initialFunnel as FunnelType) ? initialFunnel : 'ALL',
  );

  // Sync when navigated from Winning Ad cross-link
  useEffect(() => {
    const f = searchParams.get('funnel') as FunnelType | null;
    if (f && FUNNEL_FILTERS.includes(f)) setFunnelFilter(f);
  }, [searchParams]);
  const [overrideTarget, setOverrideTarget] = useState<string | null>(null);
  const [previewAd, setPreviewAd]           = useState<CompetitorAd | null>(null);
  const [expandedCopy, setExpandedCopy]     = useState<Set<string>>(new Set());

  const { ads, isLoading, isLive, refetch } = useCompetitorAds(funnelFilter !== 'ALL' ? funnelFilter : undefined);

  const filtered = funnelFilter === 'ALL' ? ads : ads.filter(ad => ad.funnelType === funnelFilter);

  const toggleCopy = (id: string) => {
    setExpandedCopy(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary font-display">Ad Intelligence</h1>
          <p className="text-xs text-text-muted mt-0.5">Browse & filter iklan kompetitor dari Meta Ads Library</p>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-success-dim text-success border border-success/20 font-medium">
              Live · Supabase
            </span>
          )}
          <span className="text-xs text-text-muted bg-card border border-border px-2.5 py-1 rounded-full">
            {filtered.length} iklan
          </span>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-border transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Funnel Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-0.5 bg-card border border-border rounded-lg p-1">
          {FUNNEL_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFunnelFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                funnelFilter === f ? 'text-white shadow-sm' : 'text-text-secondary hover:text-text-primary',
              )}
              style={funnelFilter === f ? { backgroundColor: f === 'ALL' ? '#6366F1' : FUNNEL_COLORS[f as FunnelType] } : {}}
            >
              {f === 'ALL' ? 'Semua' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && filtered.length === 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-border" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-border rounded w-3/4" />
                <div className="h-2 bg-border rounded w-full" />
                <div className="h-2 bg-border rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ad Grid */}
      {!isLoading || filtered.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(ad => (
            <AdCard
              key={ad.id}
              ad={ad}
              expanded={expandedCopy.has(ad.id)}
              overriding={overrideTarget === ad.id}
              onToggleCopy={() => toggleCopy(ad.id)}
              onToggleOverride={() => setOverrideTarget(overrideTarget === ad.id ? null : ad.id)}
              onPreview={() => setPreviewAd(ad)}
            />
          ))}
        </div>
      ) : null}

      {/* Preview Slide-over */}
      {previewAd && <PreviewPanel ad={previewAd} onClose={() => setPreviewAd(null)} />}
    </div>
  );
}

// ─── Ad Card ──────────────────────────────────────────────────────────────────
function AdCard({ ad, expanded, overriding, onToggleCopy, onToggleOverride, onPreview }: {
  ad: CompetitorAd; expanded: boolean; overriding: boolean;
  onToggleCopy: () => void; onToggleOverride: () => void; onPreview: () => void;
}) {
  const funnelColor = FUNNEL_COLORS[ad.funnelType];
  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:border-border-light hover:-translate-y-0.5 hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface cursor-pointer" onClick={onPreview}>
        <img src={ad.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <FunnelBadge type={ad.funnelType} />
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded capitalize font-medium">{ad.creativeType}</span>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded truncate max-w-[60%]">{ad.domain}</span>
          <span className="text-[10px] text-white/70">{ad.dateActive}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: funnelColor, opacity: 0.6 }} />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-text-primary truncate">{ad.advertiserName}</p>
          {ad.funnelOverride && (
            <span className="text-[9px] text-warning bg-warning/10 px-1.5 py-0.5 rounded flex-shrink-0">Override</span>
          )}
        </div>
        <div>
          <p className={cn('text-[11px] text-text-secondary leading-relaxed', !expanded && 'line-clamp-2')}>
            {ad.adCopy}
          </p>
          {ad.adCopy.length > 80 && (
            <button onClick={onToggleCopy} className="flex items-center gap-0.5 text-[10px] text-primary mt-1 hover:text-primary/80 transition-colors">
              {expanded ? <><ChevronUp size={10} /> Lebih sedikit</> : <><ChevronDown size={10} /> Selengkapnya</>}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] px-2 py-0.5 rounded bg-border text-text-muted font-medium">{ad.ctaButton}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={onPreview} className="p-1 rounded text-text-muted hover:text-text-primary transition-colors" title="Preview">
              <ExternalLink size={11} />
            </button>
            <button
              onClick={onToggleOverride}
              className={cn('p-1 rounded transition-colors', overriding ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary')}
              title="Override funnel"
            >
              <Edit3 size={11} />
            </button>
          </div>
        </div>
        {overriding && (
          <div className="animate-slide-down space-y-1.5 pt-1 border-t border-border">
            <p className="text-[10px] text-text-muted">Override funnel:</p>
            <select className="w-full bg-surface border border-primary/30 rounded-md px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-primary">
              {(['LP', 'CTWA', 'Visit Profile', 'Lead Form'] as FunnelType[]).map(f => (
                <option key={f} value={f} selected={f === ad.funnelType}>{f}</option>
              ))}
            </select>
            <button className="w-full py-1 bg-primary/20 text-primary text-xs rounded-md hover:bg-primary/30 transition-colors font-medium">
              Simpan Override
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────
function PreviewPanel({ ad, onClose }: { ad: CompetitorAd; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface border-l border-border z-50 flex flex-col overflow-y-auto animate-slide-down">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <div>
            <p className="text-sm font-semibold text-text-primary font-display">{ad.advertiserName}</p>
            <p className="text-[11px] text-text-muted">{ad.domain}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-border transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="aspect-video relative bg-card">
          <img src={ad.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <FunnelBadge type={ad.funnelType} />
            <span className="px-2 py-0.5 bg-black/60 text-white text-[11px] rounded capitalize">{ad.creativeType}</span>
          </div>
        </div>
        <div className="p-5 space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Funnel Type', value: ad.funnelType },
              { label: 'Creative',   value: ad.creativeType },
              { label: 'CTA Button', value: ad.ctaButton },
              { label: 'Active Since', value: ad.dateActive },
            ].map(row => (
              <div key={row.label} className="bg-card border border-border rounded-lg p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{row.label}</p>
                <p className="text-xs font-semibold text-text-primary capitalize">{row.value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Ad Copy</p>
            <p className="text-sm text-text-secondary leading-relaxed bg-card border border-border rounded-lg p-3">{ad.adCopy}</p>
          </div>
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2">Destination URL</p>
            <a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:underline bg-card border border-border rounded-lg px-3 py-2 break-all">
              <ExternalLink size={11} className="flex-shrink-0" />
              {ad.destinationUrl || ad.domain}
            </a>
          </div>
          <div className="text-[10px] text-text-muted font-mono">Library ID: {ad.libraryId}</div>
        </div>
      </div>
    </>
  );
}
