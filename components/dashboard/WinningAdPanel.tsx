'use client';
import { Trophy, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useApp, BRAND_ID } from '@/context/AppContext';
import { WINNING_ADS } from '@/lib/mockData';
import { FunnelBadge } from '@/components/ui/StatusBadge';
import { formatRupiah, formatROAS } from '@/lib/utils';
import type { FunnelType } from '@/lib/types';

export function WinningAdPanel() {
  
  const winners = WINNING_ADS[BRAND_ID] ?? [];

  if (winners.length === 0) return null;

  return (
    <div className="bg-card border border-warning/20 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-warning-dim">
        <Trophy size={14} className="text-warning" />
        <span className="text-sm font-semibold text-warning font-display">Winning Ads — Top 3</span>
        <span className="text-xs text-text-muted ml-auto hidden sm:block">Scale atau jadikan referensi konten baru</span>
        {/* Cross-link to Ad Intelligence */}
        <Link
          href="/web-app/ad-intelligence"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-warning/10 border border-warning/25 text-warning text-xs font-medium hover:bg-warning/20 transition-colors ml-2 flex-shrink-0"
        >
          <Search size={11} />
          Cari serupa
          <ArrowRight size={11} />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {winners.map(ad => (
          <WinningAdRow key={ad.adId} ad={ad} />
        ))}
      </div>
    </div>
  );
}

function WinningAdRow({ ad }: { ad: typeof WINNING_ADS['ngajigaes'][number] }) {
  // Build intelligence link — filter by funnel type
  const intelligenceHref = `/web-app/ad-intelligence?funnel=${encodeURIComponent(ad.funnelType)}`;

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-surface/30 transition-colors group">
      {/* Rank */}
      <div className="w-7 h-7 rounded-full bg-warning-dim border border-warning/30 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-warning">#{ad.rank}</span>
      </div>

      {/* Thumbnail */}
      <img
        src={ad.thumbnailUrl}
        alt={ad.adName}
        className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-text-primary truncate">{ad.adName}</p>
          <FunnelBadge type={ad.funnelType as FunnelType} />
        </div>
        <p className="text-[11px] text-text-muted mt-0.5 truncate">{ad.campaignName}</p>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-6 flex-shrink-0">
        {Object.entries(ad.metrics).map(([key, val]) => (
          <div key={key} className="text-right">
            <p className="text-[10px] text-text-muted uppercase tracking-wide">{key}</p>
            <p className="text-sm font-semibold text-text-primary">
              {key === 'roas' ? formatROAS(val as number)
               : typeof val === 'number' && val > 1000 ? formatRupiah(val as number)
               : String(val)}
            </p>
          </div>
        ))}
      </div>

      {/* Score */}
      <div className="w-12 h-12 rounded-xl bg-warning-dim border border-warning/30 flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-lg font-bold text-warning">{ad.score}</span>
        <span className="text-[9px] text-warning/70">score</span>
      </div>

      {/* Per-row: find similar in Ad Intelligence */}
      <Link
        href={intelligenceHref}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-border flex-shrink-0"
        title={`Cari iklan ${ad.funnelType} serupa di Ad Intelligence`}
      >
        <Search size={14} />
      </Link>
    </div>
  );
}
