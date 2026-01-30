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

  // Check if company is verified - if not, show pending verification page
  // But allow access to the pending-verification page itself
  if (!companyProfile.is_verified && !companyProfile.is_super_admin) {
    return redirect("/admin/pending-verification");
  }

  const headerStats = await getHeaderStats(companyProfile.id);

  return (
    <AdminLayoutProvider>
      {/* Header is fixed and always visible */}
      <AdminHeader stats={headerStats} companyProfile={companyProfile} />

      <div className="flex min-h-screen bg-[#F6F8FF] overflow-x-hidden">
        {/* Sidebar is an off-canvas menu on mobile, and fixed on desktop */}
        <AdminSidebar companyProfile={companyProfile} />

        {/* Main content area that adapts its margin based on screen size */}
        <main
          className="flex-1 w-full transition-all duration-500 ease-in-out relative
            pt-20
            lg:ml-72
          "
        >
          {/* Subtle background mesh gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(at_top_right,_#E0EAFF_0%,_transparent_50%),_radial-gradient(at_bottom_left,_#E0EAFF_0%,_transparent_50%)] opacity-40 pointer-events-none" />
          
          <div className="relative z-10 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)]">
            {children}
          </div>
        </main>
      </div>
    </AdminLayoutProvider>
  );
}

