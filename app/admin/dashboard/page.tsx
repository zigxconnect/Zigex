import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  getAuthenticatedCompanyProfile,
  getDashboardAnalytics,
} from "@/lib/data/postings";
import { StatCardsGrid } from "@/components/sections/admin/dashboard/StatCardsGrid";
import { ChartsSection } from "@/components/sections/admin/dashboard/ChartsSection";
import { RecentApplicationsTable } from "@/components/sections/admin/dashboard/RecentApplicationsTable";
import { DashboardSkeleton } from "@/components/sections/admin/dashboard/DashboardSkeleton";

/**
 * An async component that handles the actual data fetching and rendering.
 */
async function DashboardContent({ companyId }: { companyId: string }) {
  const dashboardData = await getDashboardAnalytics(companyId);

  return (
    <div className="space-y-6">
      <StatCardsGrid stats={dashboardData.stats} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
           <ChartsSection
            trendChartData={dashboardData.applicationsTrend}
            breakdownChartData={dashboardData.fieldBreakdown}
          />
        </div>
        <div className="xl:col-span-1">
          <RecentApplicationsTable
            applicationsData={dashboardData.recentApplications}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The main page component that orchestrates the layout and Suspense boundary.
 */
export default async function AdminDashboardPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();
  if (!companyProfile) return redirect("/sign-in");

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent companyId={companyProfile.id} />
    </Suspense>
  );
}
