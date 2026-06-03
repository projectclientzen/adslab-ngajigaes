'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Globe, Search, Star, Archive,
  Settings, Zap, BarChart2, ChevronLeft, ChevronRight,
  Activity,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'Dashboard Ads',
    items: [
      { href: '/dashboard',  icon: LayoutDashboard, label: 'Monitor Iklan' },
      { href: '/archive',    icon: Archive,          label: 'Archive'       },
      { href: '/settings',   icon: Settings,         label: 'Settings'      },
    ],
  },
  {
    label: 'ADS LAB — Kompetitor',
    items: [
      { href: '/web-app',                icon: Globe,       label: 'Home'              },
      { href: '/web-app/domains',        icon: BarChart2,   label: 'Top Domains'       },
      { href: '/web-app/ad-intelligence',icon: Search,      label: 'Ad Intelligence'   },
      { href: '/web-app/competitor',     icon: Activity,    label: 'Competitor Analysis'},
      { href: '/web-app/watchlist',      icon: Star,        label: 'Watchlist'         },
    ],
  },
  {
    label: 'Phase 6 — Automation',
    items: [
      { href: '/automation', icon: Zap, label: 'Creative Ops' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <aside className={cn(
      'flex flex-col bg-surface border-r border-border transition-all duration-300 flex-shrink-0',
      sidebarOpen ? 'w-56' : 'w-0 sm:w-14',
      // On mobile: overlay when open
      sidebarOpen && 'fixed sm:relative z-50 h-full sm:h-auto shadow-2xl sm:shadow-none',
      !sidebarOpen && 'overflow-hidden',
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-border">
        {sidebarOpen && (
          <div className="min-w-0">
            <span className="font-bold text-sm text-gradient tracking-wide">ADS LAB</span>
            <p className="text-[10px] text-text-muted truncate">Ngajigaes.id</p>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-border transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6 px-2">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {sidebarOpen && (
              <p className="px-2 mb-1 text-[10px] uppercase tracking-widest text-text-muted font-semibold">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(item => {
                const active = pathname === item.href ||
                  (item.href !== '/web-app' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all',
                        active
                          ? 'bg-primary-dim text-primary'
                          : 'text-text-secondary hover:text-text-primary hover:bg-border',
                        !sidebarOpen && 'justify-center',
                      )}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <item.icon size={16} className="flex-shrink-0" />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className={cn(
          'flex items-center gap-2',
          !sidebarOpen && 'justify-center',
        )}>
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white">Z</span>
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">Zen</p>
              <p className="text-[10px] text-text-muted">Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
