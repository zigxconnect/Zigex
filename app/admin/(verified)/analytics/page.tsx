import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getAuthenticatedCompanyProfile, getDetailedAnalytics } from "@/lib/data/postings";
import { AnalyticsHeader } from "@/components/sections/admin/analytics/AnalyticsHeader";
import { DetailedKPIs } from "@/components/sections/admin/analytics/DetailedKPIs";
import { AnalyticsCharts } from "@/components/sections/admin/analytics/AnalyticsCharts";
import { PostingPerformance } from "@/components/sections/admin/analytics/PostingPerformance";
import { DashboardSkeleton } from "@/components/sections/admin/dashboard/DashboardSkeleton";

async function AnalyticsContent({ companyId }: { companyId: string }) {
  const data = await getDetailedAnalytics(companyId);

  return (
    <div className="space-y-8 pb-12">
      <DetailedKPIs kpis={data.kpis} />
      <AnalyticsCharts 
        statusData={data.statusBreakdown} 
        categoryData={data.categoryPerformance}
        growthData={data.growthTrends}
      />
      <PostingPerformance postings={data.postingEfficiency} />
    </div>
  );
}

export default async function AnalyticsPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();
  if (!companyProfile) return redirect("/sign-in");

  return (
    <>
      <AnalyticsHeader />
      <Suspense fallback={<DashboardSkeleton />}>
        <AnalyticsContent companyId={companyProfile.id} />
      </Suspense>
    </>
  );
}
