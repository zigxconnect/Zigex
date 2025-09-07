import { redirect } from "next/navigation";
import {
  getAuthenticatedCompanyProfile,
  getDashboardAnalytics,
} from "@/lib/data/postings";
import { DashboardClient } from "@/components/sections/admin/DashboardClient";

export default async function AdminDashboardPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();

  if (!companyProfile) {
    return redirect("/sign-in");
  }

  // Fetch all dashboard data with a single, clean function call
  const dashboardData = await getDashboardAnalytics(companyProfile.id);

  return <DashboardClient initialData={dashboardData} />;
}
