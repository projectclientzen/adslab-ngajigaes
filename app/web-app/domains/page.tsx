'use client';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { DOMAIN_SUMMARIES } from '@/lib/mockData';

export default function DomainsPage() {
  return (
    <div className="space-y-5 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-lg font-bold text-text-primary">Top Domains</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wide">Domain</th>
                <th className="text-right px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wide">Total Ads</th>
                <th className="text-right px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wide">Aktif</th>
                <th className="text-right px-4 py-3 text-xs text-text-muted font-medium uppercase tracking-wide">Last Seen</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DOMAIN_SUMMARIES.map((d, i) => (
                <tr key={d.domain} className="hover:bg-surface/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-text-muted font-mono">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{d.domain}</td>
                  <td className="px-4 py-3 text-right font-bold text-text-primary">{d.totalAds}</td>
                  <td className="px-4 py-3 text-right text-success">{d.activeAds}</td>
                  <td className="px-4 py-3 text-right text-text-muted text-xs">{d.lastSeen}</td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={14} className="text-text-muted ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
