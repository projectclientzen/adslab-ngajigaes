'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { DateRange, UserRole } from '@/lib/types';
import { isSupabaseAvailable } from '@/lib/supabase';

// Single brand — no brand switcher needed
export const BRAND_ID    = 'ngajigaes' as const;
export const BRAND_NAME  = 'Ngajigaes.id';
export const BRAND_COLOR = '#6366F1';

interface AppContextType {
  dateRange:      DateRange;
  setDateRange:   (r: DateRange) => void;
  role:           UserRole;
  setRole:        (r: UserRole) => void;
  sidebarOpen:    boolean;
  setSidebarOpen: (v: boolean) => void;
  isLiveData:     boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange]     = useState<DateRange>('7d');
  const [role, setRole]               = useState<UserRole>('admin');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppContext.Provider value={{
      dateRange, setDateRange,
      role, setRole,
      sidebarOpen, setSidebarOpen,
      isLiveData: isSupabaseAvailable,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
