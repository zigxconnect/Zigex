// import { AdminHeader } from "@/app/_components/layout/admin/AdminHeader";
// import { AdminHeader } from "../_components/layout/admin/AdminHeader";
// import { AdminSidebar } from "../_components/layout/admin/AdminSiderbar";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/admin/AdminHeader";
import { AdminSidebar } from "@/components/layout/admin/AdminSiderbar";

// --- AUTHENTICATION & AUTHORIZATION LOGIC ---

// The layout component must be converted to an `async` function
// to allow for server-side data fetching and authentication checks.
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Create a Supabase client for server-side operations
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

  // 2. Check for an active user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. If no user is logged in, redirect them to the sign-in page
  if (!user) {
    return redirect("/sign-in");
  }

  // 4. CRITICAL: Verify the logged-in user has a company profile.
  // This prevents non-company users (like students) from accessing the admin panel.
  const { data: companyProfile, error } = await supabase
    .from("company_profiles")
    .select("id") // We only need to confirm that a profile exists
    .eq("user_id", user.id) // IMPORTANT: Make sure 'user_id' is the correct column name in your table
    .single();

  // 5. If no company profile is found, redirect them away from the admin area.
  if (error || !companyProfile) {
    console.error("Access denied: User does not have a company profile.", error?.message);
    // Redirect to a general dashboard or an 'unauthorized' page
    return redirect("/dashboard"); 
  }

  // --- DATA FETCHING FOR THE LAYOUT ---
  // If all checks pass, we can now fetch data for the layout.
  // TODO: Replace this hardcoded data with a real database query.
  // For example:
  // const { count } = await supabase.from('internships').select('*', { count: 'exact', head: true }).eq('company_id', companyProfile.id);
  const headerStats = {
    total: 6,
    active: 4,
    applications: 110,
  };


  // --- RENDER THE PROTECTED LAYOUT ---
  // Only users who pass all the checks above will see this UI.
  return (
    <div className="flex h-screen bg-slate-50 text-gray-800">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader stats={headerStats} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}