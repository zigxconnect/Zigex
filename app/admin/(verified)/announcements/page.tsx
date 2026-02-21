import { AnnouncementBoardClient } from "@/components/sections/admin/announcements/AnnouncementBoardClient";
import { 
    getAnnouncements, 
    getCompany, 
    getStudentsForCompany,
} from "@/lib/actions/announcement.actions";
import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Announcements | Zigex Admin",
  description: "Manage platform and company announcements",
};

/**
 * SECURITY: This page enforces strict multi-tenant isolation.
 * 
 * 1. Company Admins can ONLY see and create announcements for their own company.
 * 2. Supervisors can ONLY see and create announcements for their assigned company.
 * 3. Platform Admins (role="admin") MAY have broader access (currently disabled for safety).
 * 4. NO user should ever see a list of other companies or be able to post as them.
 */
export default async function AnnouncementsPage() {
  const supabase = await createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/sign-in");

  // Step 1: Determine the user's organizational context
  // We check BOTH company_profiles (for company admins) AND supervisor_profiles (for supervisors)
  const [
    { data: companyProfile },
    { data: supervisor },
  ] = await Promise.all([
    supabaseAdmin.from("company_profiles").select("id, company_name, logo_url").eq("user_id", user.id).maybeSingle(),
    supabaseAdmin.from("supervisor_profiles").select("id, company_id").eq("user_id", user.id).maybeSingle(),
  ]);

  // The "effective" company is their own company (if admin) OR their assigned company (if supervisor)
  const effectiveCompanyId = companyProfile?.id || supervisor?.company_id;

  // SECURITY GATE: If user is not associated with any company, deny access immediately.
  // This prevents unauthorized users from accessing the announcement system.
  if (!effectiveCompanyId) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You must be a company administrator or an assigned supervisor to access this page.
        </p>
        <p className="text-xs text-slate-400 mt-4">
          If you believe this is an error, please contact platform support.
        </p>
      </div>
    );
  }

  // Step 2: Fetch ONLY data belonging to the user's company
  // This ensures strict data isolation between tenants.
  const [announcements, companyData, students] = await Promise.all([
    getAnnouncements(effectiveCompanyId),       // Only this company's announcements
    getCompany(effectiveCompanyId),              // Only this company's profile
    getStudentsForCompany(effectiveCompanyId),   // Only interns assigned to this company
  ]);

  // Prepare companies array - ONLY contains the user's own company
  const companies = companyData ? [companyData] : [];

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">Announcement Center</h1>
        {companyData && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {companyData.company_name}
          </span>
        )}
      </div>
      <p className="text-muted-foreground mb-8">
        Post updates, news, and important information for your interns and supervisors.
      </p>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 shadow-sm">
        {/* 
          SECURITY: We pass isCompanyUser=true to hide the company selector entirely.
          The defaultCompanyId ensures all posts are attributed to their company.
          The companies array only contains their own company (never other companies).
        */}
        <AnnouncementBoardClient 
            announcements={announcements} 
            companies={companies} 
            students={students}
            isCompanyUser={true}
            defaultCompanyId={effectiveCompanyId}
        />
      </div>
    </div>
  );
}
