'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DOMAIN_SUMMARIES } from '@/lib/mockData';

const FUNNEL_COLORS: Record<string, string> = {
  'LP': '#6366F1', 'CTWA': '#10B981', 'Lead Form': '#EC4899', 'Visit Profile': '#F59E0B',
};

const barData = DOMAIN_SUMMARIES.map(d => ({
  domain: d.domain.replace('.com', '').replace('.id', ''),
  'LP':           d.funnelDistribution['LP'],
  'CTWA':         d.funnelDistribution['CTWA'],
  'Lead Form':    d.funnelDistribution['Lead Form'],
  'Visit Profile':d.funnelDistribution['Visit Profile'],
}));

const pieData = Object.entries(
  DOMAIN_SUMMARIES.flatMap(d => Object.entries(d.funnelDistribution))
    .reduce<Record<string, number>>((acc, [type, count]) => {
      acc[type] = (acc[type] ?? 0) + count;
      return acc;
    }, {})
).map(([type, count]) => ({ type, count }));

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#15151F', border: '1px solid #1E1E2E', borderRadius: 8, fontSize: 11 },
  labelStyle: { color: '#F1F5F9', fontWeight: 600 },
};

export function CompetitorCharts() {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Bar — volume per domain */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-xs font-semibold text-text-primary mb-4 uppercase tracking-wide">
          Volume Iklan per Domain
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10, fill: '#8B8FA8' }} />
            <YAxis type="category" dataKey="domain" tick={{ fontSize: 10, fill: '#8B8FA8' }} width={80} />
            <Tooltip {...TOOLTIP_STYLE} />
            {Object.keys(FUNNEL_COLORS).map(key => (
              <Bar key={key} dataKey={key} stackId="a" fill={FUNNEL_COLORS[key]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie — funnel distribution */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h2 className="text-xs font-semibold text-text-primary mb-4 uppercase tracking-wide">
          Distribusi Funnel Type (All)
        </h2>
        <div className="flex justify-center">
          <PieChart width={300} height={260}>
            <Pie
              data={pieData} dataKey="count" nameKey="type"
              cx="50%" cy="45%" outerRadius={90} innerRadius={55} paddingAngle={3}
            >
              {pieData.map(entry => (
                <Cell key={entry.type} fill={FUNNEL_COLORS[entry.type] ?? '#555'} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE.contentStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#8B8FA8' }} />
          </PieChart>
        </div>
      </div>
    </div>
  );
}
