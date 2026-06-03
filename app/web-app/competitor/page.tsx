'use client';
import dynamic from 'next/dynamic';
import { DOMAIN_SUMMARIES } from '@/lib/mockData';

// ssr: false → prevents Recharts clip-id hydration mismatch
const CompetitorCharts = dynamic(
  () => import('@/components/web-app/CompetitorCharts').then(m => m.CompetitorCharts),
  { ssr: false, loading: () => <div className="h-72 bg-card border border-border rounded-xl animate-pulse" /> },
);

export default function CompetitorPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-lg font-bold text-text-primary">Competitor Analysis</h1>
        <p className="text-xs text-text-muted mt-0.5">Volume iklan & distribusi funnel per domain kompetitor</p>
      </div>

      {/* Charts — dynamic, no SSR */}
      <CompetitorCharts />

      {/* Domain Detail Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-xs font-semibold text-text-primary uppercase tracking-wide">Detail per Domain</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-2.5 text-text-muted font-medium">Domain</th>
                <th className="text-right px-4 py-2.5 text-text-muted font-medium">Total Ads</th>
                <th className="text-right px-4 py-2.5 text-text-muted font-medium">Aktif</th>
                <th className="px-4 py-2.5 text-text-muted font-medium text-center">Funnel Distribution</th>
                <th className="text-right px-4 py-2.5 text-text-muted font-medium">Last Seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DOMAIN_SUMMARIES.map(d => (
                <tr key={d.domain} className="hover:bg-surface/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">{d.domain}</td>
                  <td className="px-4 py-3 text-right text-text-primary font-semibold">{d.totalAds}</td>
                  <td className="px-4 py-3 text-right text-success font-medium">{d.activeAds}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-center">
                      {Object.entries(d.funnelDistribution).map(([type, count]) => (
                        <div key={type} className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{
                            backgroundColor: { 'LP':'#6366F1','CTWA':'#10B981','Lead Form':'#EC4899','Visit Profile':'#F59E0B' }[type]
                          }} />
                          <span className="text-text-muted">{count}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-text-muted">{d.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
