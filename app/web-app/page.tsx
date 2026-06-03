'use client';
import { Search, TrendingUp, Clock, Globe } from 'lucide-react';
import { useState } from 'react';
import { DOMAIN_SUMMARIES, COMPETITOR_ADS } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

const STATS = [
  { label: 'Total Iklan',     value: '1,247', icon: TrendingUp },
  { label: 'Domain Tracked', value: '89',     icon: Globe },
  { label: 'Iklan Baru 7hr', value: '143',    icon: Clock },
];

const TRENDING_KEYWORDS = ['umroh 2026', 'ngaji online', 'belajar quran', 'umroh keluarga', 'ngaji pemula', 'paket umroh murah'];

export default function WebAppHome() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">ADS LAB — Kompetitor Research</h1>
          <p className="text-xs text-text-muted mt-0.5">Data hasil scraping Chrome Extension dari Meta Ads Library</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari domain, URL landing page, atau kata kunci..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-dim flex items-center justify-center flex-shrink-0">
              <s.icon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-secondary">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Trending Keywords */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-xs font-semibold text-text-primary mb-3 uppercase tracking-wide">Trending Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {TRENDING_KEYWORDS.map(kw => (
              <span key={kw} className="px-2.5 py-1 bg-primary-dim text-primary text-[11px] rounded-full border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Extractions */}
        <div className="col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wide">Recent Extractions</h2>
          </div>
          <div className="divide-y divide-border">
            {COMPETITOR_ADS.slice(0, 4).map(ad => (
              <div key={ad.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface/30 transition-colors cursor-pointer">
                <img src={ad.thumbnailUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-border flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{ad.advertiserName}</p>
                  <p className="text-[11px] text-text-muted truncate">{ad.adCopy.slice(0, 60)}…</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-border text-text-muted flex-shrink-0">{ad.domain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Domains preview */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wide">Top Domains</h2>
          <a href="/web-app/domains" className="text-[11px] text-primary hover:underline">Lihat semua →</a>
        </div>
        <div className="divide-y divide-border">
          {DOMAIN_SUMMARIES.map((d, i) => (
            <div key={d.domain} className="flex items-center gap-4 px-4 py-3 hover:bg-surface/30 transition-colors cursor-pointer">
              <span className="text-sm font-bold text-text-muted w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{d.domain}</p>
                <p className="text-[11px] text-text-muted">{d.activeAds} aktif dari {d.totalAds} total</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {Object.entries(d.funnelDistribution).map(([type, count]) => (
                  <div key={type} title={`${type}: ${count}`} className="h-1.5 rounded-full bg-primary/40" style={{ width: `${count}px`, maxWidth: '40px' }} />
                ))}
              </div>
              <span className="text-sm font-bold text-text-primary flex-shrink-0">{formatNumber(d.totalAds)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
