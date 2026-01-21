import React from "react";
import { getCompanySubmissionsAction } from "@/lib/actions/company.actions";
import CompanyInboxClient from "@/components/company/CompanyInboxClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbox | Company Dashboard",
  description: "View and manage incoming project pitches.",
};

export default async function InboxPage() {
  const { success, data, error } = await getCompanySubmissionsAction();

  if (!success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl shadow-xl border border-red-100">
           <h3 className="text-lg font-bold text-red-600 mb-2">Access Denied</h3>
           <p className="text-slate-500 mb-4">{error || "Ensure you are logged in as a Company Account."}</p>
        </div>
      </div>
    );
  }

  return <CompanyInboxClient submissions={data || []} />;
}
