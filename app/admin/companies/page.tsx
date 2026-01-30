import { redirect } from "next/navigation";
import { getAuthenticatedCompanyProfile } from "@/lib/data/postings";
import { getAllCompaniesForManagement } from "@/lib/actions/company-verification.actions";
import CompanyManagementClient from "@/components/sections/admin/companies/CompanyManagementClient";

export default async function ManageCompaniesPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();

  if (!companyProfile) {
    return redirect("/sign-in");
  }

  // Only super admin can access this page
  if (!companyProfile.is_super_admin) {
    return redirect("/admin/dashboard");
  }

  const { data: companies } = await getAllCompaniesForManagement();

  return <CompanyManagementClient companies={companies || []} />;
}
