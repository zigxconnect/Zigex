// import { AdminHeader } from "@/app/_components/layout/admin/AdminHeader";
// import { AdminHeader } from "../_components/layout/admin/AdminHeader";
// import { AdminSidebar } from "../_components/layout/admin/AdminSiderbar";

// app/admin/layout.tsx

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin/AdminHeader";
import { AdminSidebar } from "@/components/layout/admin/AdminSiderbar";
import { ReactNode } from "react";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!companyProfile) {
    return redirect("/dashboard");
  }

  // --- START: DYNAMIC DATA FETCHING ---

  // 1. Get all internship IDs for the current company
  const { data: internships, error: internshipsError } = await supabase
    .from("internships")
    .select("id, deadline")
    .eq("company_id", companyProfile.id);

  if (internshipsError) {
    console.error("Error fetching internships for stats:", internshipsError);
    // Render with zeroed stats on error
    return <LayoutUI stats={{ total: 0, active: 0, applications: 0 }}>{children}</LayoutUI>;
  }

  const internshipIds = internships.map((i) => i.id);

  // 2. Fetch counts concurrently for performance
  const [totalApplications, activeCount] = await Promise.all([
    // Count all applications linked to this company's internships
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("internship_id", internshipIds),
    
    // Count "active" internships (deadline is in the future)
    Promise.resolve(internships.filter(i => new Date(i.deadline) >= new Date()).length)
  ]);

  const headerStats = {
    total: internships.length,
    active: activeCount,
    applications: totalApplications.count ?? 0,
  };

  // --- END: DYNAMIC DATA FETCHING ---

  return (
    <LayoutUI stats={headerStats}>
      {children}
    </LayoutUI>
  );
}

// Helper component to avoid repeating JSX
const LayoutUI = ({ children, stats }: { children: ReactNode, stats: any }) => (
  <div className="flex h-screen bg-slate-50 text-gray-800">
    <AdminSidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminHeader stats={stats} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  </div>
);