import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { KpiStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('id-ID');
}

export function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatROAS(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function getKpiColor(status: KpiStatus): string {
  return {
    green: 'text-success',
    yellow: 'text-warning',
    red: 'text-danger',
  }[status];
}

export function getKpiBg(status: KpiStatus): string {
  return {
    green: 'bg-success-dim border-success/20',
    yellow: 'bg-warning-dim border-warning/20',
    red: 'bg-danger-dim border-danger/20',
  }[status];
}

export function getKpiDot(status: KpiStatus): string {
  return {
    green: 'bg-success',
    yellow: 'bg-warning',
    red: 'bg-danger',
  }[status];
}

export function calcKpiStatus(actual: number, target: number, inverse = false): KpiStatus {
  const ratio = actual / target;
  if (inverse) {
    // lower is better (CPL, Cost/Purchase)
    if (ratio <= 0.95) return 'green';
    if (ratio <= 1.1) return 'yellow';
    return 'red';
  } else {
    // higher is better (ROAS)
    if (ratio >= 1.0) return 'green';
    if (ratio >= 0.85) return 'yellow';
    return 'red';
  }
}

export function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}
