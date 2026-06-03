'use client';
import { Archive, ChevronRight } from 'lucide-react';

const ARCHIVED = [
  { id: 'ng-arch-1', brand: 'Ngajigaes.id', name: 'Campaign Q1 2026 — Januari', spend: 18_500_000, result: '3.1x ROAS', endDate: '2026-01-31' },
  { id: 'ng-arch-2', brand: 'Ngajigaes.id', name: 'Campaign Tahun Baru',        spend: 6_200_000,  result: '2.9x ROAS', endDate: '2026-01-05' },
  { id: 'lb-arch-1', brand: 'Labbaika',     name: 'Campaign Umroh Q1',          spend: 11_000_000, result: 'CPL Rp 72rb', endDate: '2026-03-31' },
];

export default function ArchivePage() {
  return (
    <div className="space-y-5 max-w-[1100px] mx-auto animate-fade-in">
      <div className="flex items-center gap-3">
        <Archive size={20} className="text-text-muted" />
        <h1 className="text-lg font-bold text-text-primary">Campaign Archive</h1>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-text-muted">Campaign yang telah selesai. Klik untuk lihat detail performa.</p>
        </div>
        <div className="divide-y divide-border">
          {ARCHIVED.map(c => (
            <div key={c.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface/40 cursor-pointer transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-border text-text-muted">{c.brand}</span>
                  <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">Selesai: {c.endDate}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-text-primary">Rp {(c.spend / 1_000_000).toFixed(1)}jt</p>
                <p className="text-xs text-success">{c.result}</p>
              </div>
              <ChevronRight size={15} className="text-text-muted flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
