import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header }  from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'ADS LAB — Ngajigaes.id',
  description: 'Dashboard monitoring performa Meta Ads dan riset kompetitor untuk Ngajigaes.id',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <AppProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-3 sm:p-6">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
