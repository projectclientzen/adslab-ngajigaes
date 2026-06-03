import { HeroCards }       from '@/components/dashboard/HeroCards';
import { SecondaryMetrics } from '@/components/dashboard/SecondaryMetrics';
import { CampaignTable }   from '@/components/dashboard/CampaignTable';
import { AlertBanner }     from '@/components/dashboard/AlertBanner';
import { WinningAdPanel }  from '@/components/dashboard/WinningAdPanel';

export default function DashboardPage() {
  return (
    <div className="space-y-5 max-w-[1400px] mx-auto animate-fade-in">

      {/* API Status Banner */}
      <AlertBanner />

      {/* Hero KPI Cards */}
      <HeroCards />

      {/* Secondary Metrics Bar */}
      <SecondaryMetrics />

      {/* Winning Ads */}
      <WinningAdPanel />

      {/* Campaign Breakdown Table */}
      <CampaignTable />

    </div>
  );
}
