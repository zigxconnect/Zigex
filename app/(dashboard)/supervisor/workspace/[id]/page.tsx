import { redirect } from "next/navigation";
import { getSupervisorWorkspaceData } from "@/lib/actions/supervisor.actions";
import { SupervisorDashboardClient } from "@/components/sections/supervisor/SupervisorDashboardClient";
import Link from "next/link";

export const metadata = {
  title: "Supervisor Workspace | Zigex",
  description: "Manage your assigned interns in this workspace.",
};

export const revalidate = 0;

export default async function SupervisorWorkspacePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const workspaceId = params.id;

  if (!workspaceId) {
    redirect("/supervisor");
  }

  const data = await getSupervisorWorkspaceData(workspaceId);

  // Security: if null, supervisor has no access to this workspace
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-xl flex items-center justify-center mx-auto mb-5 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m14.5 9l-5 5"></path><path d="m9.5 9l5 5"></path></svg>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
            You don't have permission to access this workspace. This could be because the assignment was removed or the workspace ID is invalid.
          </p>
          <Link 
            href="/supervisor"
            className="block w-full bg-[#155DFC] hover:bg-[#1A3CB9] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/10 text-center text-sm"
          >
            Back to Workspace Selection
          </Link>
        </div>
      </div>
    );
  }

  return <SupervisorDashboardClient data={data} />;
}
