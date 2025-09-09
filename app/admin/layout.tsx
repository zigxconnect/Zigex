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

  // THE CHANGE: We now select all columns ('*') instead of just 'id'.
  // This gives us the name, industry, description, etc., for the sidebar.
  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // This check remains the same and is still correct.
  if (!companyProfile) {
    return redirect("/dashboard");
  }

  // --- START: DYNAMIC DATA FETCHING ---
  // This section for header stats remains exactly the same.
  // It will correctly use `companyProfile.id` from the full object we just fetched.

  const { data: internships, error: internshipsError } = await supabase
    .from("internships")
    .select("id, deadline")
    .eq("company_id", companyProfile.id);

  if (internshipsError) {
    console.error("Error fetching internships for stats:", internshipsError);
    // Render with zeroed stats on error
    return (
      <LayoutUI
        companyProfile={companyProfile}
        stats={{ total: 0, active: 0, applications: 0 }}
      >
        {children}
      </LayoutUI>
    );
  }

  const internshipIds = internships.map((i) => i.id);

  const [totalApplications, activeCount] = await Promise.all([
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .in("internship_id", internshipIds),

    Promise.resolve(
      internships.filter((i) => new Date(i.deadline) >= new Date()).length
    ),
  ]);

  const headerStats = {
    total: internships.length,
    active: activeCount,
    applications: totalApplications.count ?? 0,
  };

  // --- END: DYNAMIC DATA FETCHING ---

  // THE CHANGE: Pass the full companyProfile object down to the UI helper.
  return (
    <LayoutUI companyProfile={companyProfile} stats={headerStats}>
      {children}
    </LayoutUI>
  );
}

// Helper component to avoid repeating JSX
// THE CHANGE: Accept the `companyProfile` prop.
const LayoutUI = ({
  children,
  stats,
  companyProfile,
}: {
  children: ReactNode;
  stats: any;
  companyProfile: any;
}) => (
  <div className="flex h-screen bg-slate-50 text-gray-800">
    {/* THE CHANGE: Pass the profile data to the AdminSidebar component. */}
    <AdminSidebar companyProfile={companyProfile} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminHeader stats={stats} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
        {children}
      </main>
    </div>
  </div>
);
