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
      <div className="min-h-screen bg-gray-50/50">
        {/* Decorative background elements */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl" />
        </div>

        {/* Sidebar is fixed */}
        <AdminSidebar companyProfile={companyProfile} />

        {/* Main content wrapper */}
        <div className="relative z-10 flex flex-col min-h-screen lg:pl-72 transition-all duration-300 ease-in-out">
          <AdminHeader stats={headerStats} />
          
          <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 pt-24 lg:pt-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminLayoutProvider>
  );
}
