import { Suspense } from "react";
import { getAuthenticatedCompanyProfile, getCompanyApplications } from "@/lib/data/postings";
import { redirect } from "next/navigation";
import { ApplicationsInbox } from "@/components/sections/admin/applications/ApplicationsInbox";
import { updateApplicationStatus } from "@/lib/actions/application/application.action";

async function ApplicationsContent({ companyId }: { companyId: string }) {
  const applications = await getCompanyApplications(companyId);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talent Inbox</h1>
          <p className="text-gray-500">Review and manage incoming applications.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
         <ApplicationsInbox 
           initialData={applications} 
           onStatusChange={updateApplicationStatus}
         />
      </div>
    </div>
  );
}

export default async function ApplicationsPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();
  if (!companyProfile) return redirect("/sign-in");

  return (
    <Suspense fallback={<div className="p-8">Loading pipeline...</div>}>
      <ApplicationsContent companyId={companyProfile.id} />
    </Suspense>
  );
}
