// FILE: app/admin/dashboard/page.tsx

import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  getAuthenticatedCompanyProfile,
  getDashboardAnalytics,
} from "@/lib/data/postings";
import { DashboardHeader } from "@/components/sections/admin/dashboard/DashboardHeader";
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
    <>
      <StatCardsGrid stats={dashboardData.stats} />

      {/* *** FIX IS HERE *** */}
      {/* The prop names now correctly match what ChartsSection expects */}
      <ChartsSection
        trendChartData={dashboardData.applicationsTrend}
        breakdownChartData={dashboardData.fieldBreakdown}
      />

      <RecentApplicationsTable
        applicationsData={dashboardData.recentApplications}
      />
    </>
  );
}

/**
 * The main page component that orchestrates the layout and Suspense boundary.
 */
export default async function AdminDashboardPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();
  if (!companyProfile) return redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent companyId={companyProfile.id} />
        </Suspense>
      </div>
    </div>
  );
}
