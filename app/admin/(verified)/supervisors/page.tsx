import { getSupervisorsWithStats } from "@/lib/actions/supervisor.actions";
import { SupervisorManagementClient } from "@/components/sections/admin/supervisors/SupervisorManagementClient";
import { getAuthenticatedCompanyProfile } from "@/lib/data/postings";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Supervisor Management | Zigex Admin",
  description: "Manage supervisors and mentors for your internship programs.",
};

export default async function SupervisorsPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();
  
  if (!companyProfile) {
    return redirect("/sign-in");
  }

  const supervisors = await getSupervisorsWithStats(companyProfile.id);

  return <SupervisorManagementClient supervisors={supervisors} companyId={companyProfile.id} />;
}
