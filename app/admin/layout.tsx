import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AdminHeader } from "@/components/layout/admin/AdminHeader";
import { AdminSidebar } from "@/components/layout/admin/AdminSidebar";
import { AdminLayoutProvider } from "@/components/layout/admin/AdminLayoutProvider";
import {
  getAuthenticatedCompanyProfile,
  getHeaderStats,
} from "@/lib/data/postings";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const companyProfile = await getAuthenticatedCompanyProfile();

  if (!companyProfile) {
    return redirect("/sign-in");
  }

  const headerStats = await getHeaderStats(companyProfile.id);

  return (
    <AdminLayoutProvider>
      {/* Header is fixed and always visible */}
      <AdminHeader stats={headerStats} />

      <div className="flex">
        {/* Sidebar is an off-canvas menu on mobile, and fixed on desktop */}
        <AdminSidebar companyProfile={companyProfile} />

        {/* Main content area that adapts its margin based on screen size */}
        <main
          className="flex-1 w-full transition-all duration-300 ease-in-out
            pt-20
            lg:ml-72 
          "
        >
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminLayoutProvider>
  );
}
