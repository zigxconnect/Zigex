import { redirect } from "next/navigation";
import { getSupervisorAssignments } from "@/lib/actions/supervisor.actions";
import { SupervisorWorkspaceSelection } from "@/components/sections/supervisor/SupervisorWorkspaceSelection";
import Link from "next/link";

export const metadata = {
  title: "Supervisor Workspaces | Zigex",
  description: "Select a workspace to manage your assigned interns.",
};

export const revalidate = 0;

export default async function SupervisorDashboardPage() {
  const result = await getSupervisorAssignments();

  // If no supervisor profile found, show access restricted
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-center justify-center mx-auto mb-5 text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Access Restricted</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
            This dashboard is only accessible to registered ZIGEX supervisors. If you believe this is an error, please contact the administrator.
          </p>

          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 font-mono break-all text-left">
             <p className="font-bold mb-2 uppercase text-slate-500">Troubleshooting</p>
             <p>1. Profile search failed in DB</p>
             <p>2. Verify your display name matches records</p>
             <p>3. Clear browser local storage & Refresh</p>
             <p className="mt-2 text-blue-500 font-bold italic">System auto-repairs on refresh if your email is found.</p>
          </div>
          <Link 
            href="/feed"
            className="block w-full bg-[#155DFC] hover:bg-[#1A3CB9] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/10 text-center text-sm"
          >
            Return to Feed
          </Link>
        </div>
      </div>
    );
  }

  const { profile, workspaces } = result;

  // Auto-redirect if there's only ONE workspace — no selection needed
  if (workspaces.length === 1) {
    redirect(`/supervisor/workspace/${workspaces[0].id}`);
  }

  // If ZERO workspaces, show empty state
  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-10 text-center shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center mx-auto mb-5 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">No Interns Assigned</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">
            You don't have any interns assigned to you yet. Once an admin assigns students to your supervision, your workspaces will appear here.
          </p>
          <Link 
            href="/feed"
            className="block w-full bg-[#155DFC] hover:bg-[#1A3CB9] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/10 text-center text-sm"
          >
            Return to Feed
          </Link>
        </div>
      </div>
    );
  }

  // Multiple workspaces — show selection screen
  return (
    <SupervisorWorkspaceSelection
      workspaces={workspaces}
      supervisorName={profile.full_name || "Supervisor"}
    />
  );
}
