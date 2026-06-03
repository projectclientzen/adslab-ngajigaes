'use client';
import { Settings, Lock, Save, Check, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp, BRAND_ID, BRAND_NAME, BRAND_COLOR } from '@/context/AppContext';
import { upsertKpiTarget } from '@/lib/queries';
import { isSupabaseAvailable } from '@/lib/supabase';
import { cn } from '@/lib/utils';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const WEIGHTS_KEY     = 'adslab_scoring_weights';
const THRESH_KEY      = 'adslab_alert_thresholds';
const KPI_TARGETS_KEY = `adslab_kpi_targets_${BRAND_ID}`;

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_WEIGHTS = [
  { metric: 'ROAS',              weight: 40 },
  { metric: 'Cost per Purchase', weight: 30 },
  { metric: 'CTR',               weight: 30 },
];

const DEFAULT_THRESHOLDS = [
  { key: 'cpl_anomaly', label: 'CPP Anomaly threshold', value: 20, unit: '%'      },
  { key: 'no_delivery', label: 'No Delivery X jam',     value: 4,  unit: 'jam'    },
  { key: 'failed_test', label: 'Failed Test threshold', value: 50, unit: 'rb Rp'  },
  { key: 'roas_drop',   label: 'ROAS Drop threshold',   value: 20, unit: '%'      },
  { key: 'ad_fatigue',  label: 'Ad Fatigue frequency',  value: 3,  unit: 'x / 7d' },
  { key: 'budget_warn', label: 'Budget Warning sisa',   value: 20, unit: '%'      },
];

const DEFAULT_KPI_TARGETS = [
  { metric: 'ROAS Target',       target: 3.0,   unit: 'x'  },
  { metric: 'Max Cost/Purchase', target: 45000, unit: 'Rp' },
];

function loadJson<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; }
  catch { return fallback; }
}

export default function SettingsPage() {
  const { role } = useApp();
  const [saved, setSaved]           = useState(false);
  const [weights, setWeights]       = useState(DEFAULT_WEIGHTS);
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
  const [kpiTargets, setKpiTargets] = useState(DEFAULT_KPI_TARGETS);

  useEffect(() => {
    setWeights(loadJson(WEIGHTS_KEY, DEFAULT_WEIGHTS));
    setThresholds(loadJson(THRESH_KEY, DEFAULT_THRESHOLDS));
    setKpiTargets(loadJson(KPI_TARGETS_KEY, DEFAULT_KPI_TARGETS));
  }, []);

  const handleSave = async () => {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
    localStorage.setItem(THRESH_KEY, JSON.stringify(thresholds));
    localStorage.setItem(KPI_TARGETS_KEY, JSON.stringify(kpiTargets));
    if (isSupabaseAvailable) {
      for (const t of kpiTargets) {
        const kpiType = t.metric.toLowerCase().replace(/\s+/g, '_').replace('max_', '');
        await upsertKpiTarget(BRAND_ID, `brand_default_${BRAND_ID}`, kpiType, t.target);
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setWeights(DEFAULT_WEIGHTS);
    setThresholds(DEFAULT_THRESHOLDS);
    setKpiTargets(DEFAULT_KPI_TARGETS);
  };

  const updateWeight    = (idx: number, val: number) => setWeights(p => p.map((w, i) => i === idx ? { ...w, weight: val } : w));
  const updateThreshold = (idx: number, val: number) => setThresholds(p => p.map((t, i) => i === idx ? { ...t, value: val } : t));
  const updateKpiTarget = (idx: number, val: number) => setKpiTargets(p => p.map((t, i) => i === idx ? { ...t, target: val } : t));

  const isReadOnly = role !== 'admin';
  const totalWeight = weights.reduce((s, w) => s + w.weight, 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-text-muted" />
          <h1 className="text-lg font-bold text-text-primary font-display">Settings</h1>
          {isReadOnly && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-border text-text-muted text-xs">
              <Lock size={11} /> Read-only
            </div>
          )}
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary border border-border hover:border-border-light transition-colors">
              <RotateCcw size={12} /> Reset
            </button>
            <button onClick={handleSave} className={cn('flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all', saved ? 'bg-success text-white' : 'bg-primary hover:bg-primary/90 text-white')}>
              {saved ? <><Check size={14} /> Tersimpan!</> : <><Save size={14} /> Simpan</>}
            </button>
          </div>
        )}
      </div>

      {/* Brand badge */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRAND_COLOR }} />
        <span className="text-sm font-semibold text-text-primary">{BRAND_NAME}</span>
        <span className="text-xs text-text-muted ml-auto">KPI: ROAS</span>
      </div>

      {/* KPI Targets */}
      <section className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">KPI Targets</h2>
          <p className="text-xs text-text-muted mt-0.5">Target untuk status indicator hijau/kuning/merah di dashboard</p>
        </div>
        <div className="p-4 space-y-2">
          {kpiTargets.map((t, idx) => (
            <div key={t.metric} className="flex items-center gap-3">
              <span className="text-xs text-text-secondary flex-1">{t.metric}</span>
              <div className="flex items-center gap-1.5">
                <input type="number" value={t.target} disabled={isReadOnly}
                  onChange={e => updateKpiTarget(idx, Number(e.target.value))}
                  className={cn('w-24 px-2 py-1 text-xs border rounded text-text-primary text-right focus:outline-none focus:border-primary', isReadOnly ? 'bg-card border-border/50 opacity-60 cursor-not-allowed' : 'bg-surface border-border')} />
                <span className="text-xs text-text-muted w-8">{t.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring Weights */}
      <section className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Winning Ad Scoring — Bobot Metrik</h2>
            <p className="text-xs text-text-muted mt-0.5">Total bobot harus = 100%</p>
          </div>
          <span className={cn('text-xs font-mono', totalWeight === 100 ? 'text-success' : 'text-danger')}>{totalWeight}%</span>
        </div>
        <div className="p-4 space-y-2">
          {weights.map((w, idx) => (
            <div key={w.metric} className="flex items-center gap-4">
              <span className="text-xs text-text-secondary w-36">{w.metric}</span>
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${w.weight}%`, backgroundColor: BRAND_COLOR }} />
              </div>
              <div className="flex items-center gap-1.5">
                <input type="number" min={0} max={100} value={w.weight} disabled={isReadOnly}
                  onChange={e => updateWeight(idx, Number(e.target.value))}
                  className={cn('w-16 px-2 py-1 text-xs border rounded text-text-primary text-right focus:outline-none focus:border-primary', isReadOnly ? 'bg-card border-border/50 opacity-60 cursor-not-allowed' : 'bg-surface border-border')} />
                <span className="text-xs text-text-muted">%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alert Thresholds */}
      <section className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Alert Thresholds</h2>
          <p className="text-xs text-text-muted mt-0.5">Ambang batas pemicu rule-based alerts</p>
        </div>
        <div className="p-4 space-y-3">
          {thresholds.map((item, idx) => (
            <div key={item.key} className="flex items-center gap-4">
              <span className="text-xs text-text-secondary flex-1">{item.label}</span>
              <div className="flex items-center gap-2">
                <input type="number" value={item.value} disabled={isReadOnly}
                  onChange={e => updateThreshold(idx, Number(e.target.value))}
                  className={cn('w-20 px-2 py-1 text-xs border rounded text-text-primary text-right focus:outline-none focus:border-primary', isReadOnly ? 'bg-card border-border/50 opacity-60 cursor-not-allowed' : 'bg-surface border-border')} />
                <span className="text-xs text-text-muted w-12">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[10px] text-text-muted text-center">
        {isSupabaseAvailable ? 'Settings disimpan ke localStorage + Supabase' : 'Settings disimpan ke localStorage. Sambungkan Supabase untuk sync lintas device.'}
      </p>
    </div>
  );
}
