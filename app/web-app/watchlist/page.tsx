'use client';
import { Star, Plus } from 'lucide-react';

const WATCHLIST = [
  { id: 'w1', type: 'domain',  value: 'travelumrohpro.com', addedAt: '2026-04-15', newAds: 3 },
  { id: 'w2', type: 'keyword', value: 'umroh 2026',          addedAt: '2026-04-20', newAds: 11 },
  { id: 'w3', type: 'domain',  value: 'quranpath.id',        addedAt: '2026-05-01', newAds: 0 },
];

export default function WatchlistPage() {
  return (
    <div className="space-y-5 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-text-primary">Watchlist</h1>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-medium hover:bg-primary/30 transition-colors">
          <Plus size={13} /> Tambah
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {WATCHLIST.map(item => (
            <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface/30 transition-colors">
              <Star size={14} className="text-warning flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-medium ${item.type === 'domain' ? 'bg-primary-dim text-primary' : 'bg-success-dim text-success'}`}>
                    {item.type}
                  </span>
                  <p className="text-sm font-medium text-text-primary">{item.value}</p>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">Ditambah: {item.addedAt}</p>
              </div>
              {item.newAds > 0 ? (
                <span className="px-2 py-0.5 bg-danger/20 text-danger text-xs rounded-full font-medium">
                  +{item.newAds} baru
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-border text-text-muted text-xs rounded-full">
                  Tidak ada baru
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
