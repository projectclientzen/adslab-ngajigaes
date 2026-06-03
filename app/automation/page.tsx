'use client';
import { useState } from 'react';
import { Zap, FileText, CheckCircle2, Clock, XCircle, Activity, RefreshCw, Sparkles, Copy, Check } from 'lucide-react';
import { AUTOMATION_LOGS, CREATIVE_ASSETS, COPY_ROWS, QUEUE_STATUS, BRANDS } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { TimeAgo } from '@/components/TimeAgo';
import type { AutomationLog, CreativeAsset, CopyRow } from '@/lib/types';

const ACTION_LABELS: Record<string, string> = {
  pause: 'Pause', activate: 'Activate', scale_budget: 'Scale Budget',
  upload_creative: 'Upload Creative', create_ad_draft: 'Create Draft', generate_copy: 'Generate Copy',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  done:       <CheckCircle2 size={13} className="text-success" />,
  queued:     <Clock size={13} className="text-warning" />,
  processing: <RefreshCw size={13} className="text-primary animate-spin" />,
  failed:     <XCircle size={13} className="text-danger" />,
  dry_run:    <Activity size={13} className="text-text-muted" />,
};

// 'AI Copy Generator' di-hold — provider API belum final
const TABS = ['Activity Feed', 'Creative Pool', 'Copy Management', 'Queue Status'] as const;
type Tab = typeof TABS[number];

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Activity Feed');
  const [dryRunMode, setDryRunMode] = useState(false);

  const filteredLogs = AUTOMATION_LOGS;

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap size={20} className="text-primary" />
          <div>
            <h1 className="text-lg font-bold text-text-primary">Creative Automation — Phase 6</h1>
            <p className="text-xs text-text-muted">Otomasi creative rotation, copy management, dan ads ops</p>
          </div>
        </div>
        <button
          onClick={() => setDryRunMode(!dryRunMode)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
            dryRunMode
              ? 'bg-warning-dim border-warning/30 text-warning'
              : 'bg-card border-border text-text-secondary hover:text-text-primary',
          )}
        >
          <Activity size={13} />
          {dryRunMode ? '🧪 Dry Run Mode ON' : 'Dry Run Mode'}
        </button>
      </div>

      {/* Queue Status Strip */}
      <div className="grid grid-cols-1 gap-3">
        {QUEUE_STATUS.map(q => {
          const brand = BRANDS.find(b => b.id === q.brand)!;
          return (
            <div key={q.brand} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-4">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: brand.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary">{brand.name}</p>
                {q.isProcessing ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: `${(q.processed / q.total) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-primary">{q.processed}/{q.total}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {q.total === 0 ? 'Idle' : `${q.processed}/${q.total} selesai`}
                  </p>
                )}
              </div>
              {q.isProcessing && <RefreshCw size={12} className="text-primary animate-spin flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
              activeTab === tab
                ? 'bg-border text-text-primary'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Activity Feed' && (
        <ActivityFeed logs={filteredLogs} />
      )}
      {activeTab === 'Creative Pool' && (
        <CreativePool assets={CREATIVE_ASSETS} />
      )}
      {activeTab === 'Copy Management' && (
        <CopyManagement rows={COPY_ROWS} />
      )}
      {activeTab === 'Queue Status' && (
        <div className="bg-card border border-border rounded-xl p-6 text-center text-text-muted text-sm">
          Queue detail — akan tersedia saat BE Phase 6 selesai
        </div>
      )}
    </div>
  );
}

// ─── Activity Feed ─────────────────────────────────────────────────────────────
function ActivityFeed({ logs }: { logs: AutomationLog[] }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="divide-y divide-border">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-4 px-4 py-3 hover:bg-surface/30 transition-colors">
            <div className="mt-0.5">{STATUS_ICON[log.status]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-text-muted font-mono uppercase">
                  {ACTION_LABELS[log.actionType]}
                </span>
                <span className="text-xs font-medium text-text-primary truncate">{log.targetName}</span>
              </div>
              <p className="text-[11px] text-text-secondary mt-0.5">{log.description}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded',
                log.status === 'done'       && 'text-success bg-success-dim',
                log.status === 'queued'     && 'text-warning bg-warning-dim',
                log.status === 'processing' && 'text-primary bg-primary-dim',
                log.status === 'failed'     && 'text-danger bg-danger-dim',
              )}>
                {log.status}
              </span>
              <TimeAgo timestamp={log.timestamp} className="text-[10px] text-text-muted mt-1 block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Creative Pool ─────────────────────────────────────────────────────────────
function CreativePool({ assets }: { assets: CreativeAsset[] }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs text-text-muted">
          File dari Google Drive. Pending = belum upload · Uploaded = sudah di Meta · Archived = tidak dipakai
        </p>
      </div>
      <div className="divide-y divide-border">
        {assets.map(a => (
          <div key={a.id} className="flex items-center gap-4 px-4 py-3 hover:bg-surface/30 transition-colors">
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg',
              a.fileType === 'video' ? 'bg-primary-dim' : 'bg-success-dim',
            )}>
              {a.fileType === 'video' ? '🎬' : '🖼️'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{a.fileName}</p>
              {a.adId && <p className="text-[10px] text-text-muted mt-0.5">Meta Ad ID: {a.adId}</p>}
            </div>
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded font-medium',
              a.status === 'pending'  && 'bg-warning-dim text-warning',
              a.status === 'uploaded' && 'bg-success-dim text-success',
              a.status === 'archived' && 'bg-border text-text-muted',
            )}>
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Copy Management ──────────────────────────────────────────────────────────
function CopyManagement({ rows }: { rows: CopyRow[] }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs text-text-muted">Copy dari Google Sheets. Baris status 'pending' akan diproses oleh sistem.</p>
      </div>
      <div className="divide-y divide-border">
        {rows.map(r => (
          <div key={r.id} className="px-4 py-3 hover:bg-surface/30 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded font-semibold uppercase',
                r.funnelStage === 'TOFU' && 'bg-primary-dim text-primary',
                r.funnelStage === 'MOFU' && 'bg-warning-dim text-warning',
                r.funnelStage === 'BOFU' && 'bg-success-dim text-success',
              )}>
                {r.funnelStage}
              </span>
              <span className="text-xs font-semibold text-text-primary truncate">{r.headline}</span>
              <span className={cn(
                'ml-auto text-[10px] px-2 py-0.5 rounded font-medium flex-shrink-0',
                r.status === 'pending'   && 'bg-warning-dim text-warning',
                r.status === 'published' && 'bg-success-dim text-success',
                r.status === 'rejected'  && 'bg-danger-dim text-danger',
              )}>
                {r.status}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary line-clamp-2">{r.primaryText}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-text-muted">CTA: {r.cta}</span>
              {r.adId && <span className="text-[10px] text-success">Ad: {r.adId}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

