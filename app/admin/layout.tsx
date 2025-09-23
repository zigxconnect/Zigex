// FILE: app/admin/layout.tsx

import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin/AdminHeader";
import { AdminSidebar } from "@/components/layout/admin/AdminSiderbar";
import { ReactNode } from "react";
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
    // This could happen if auth succeeds but profile doesn't exist.
    // Or if getAuthenticatedCompanyProfile returns null because there's no user.
    return redirect("/sign-in");
  }

  const headerStats = await getHeaderStats(companyProfile.id);

  return (
    <div className="flex h-screen bg-slate-50 text-gray-800">
      <AdminSidebar companyProfile={companyProfile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader stats={headerStats} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
