import { redirect } from "next/navigation";
import { getSupervisorDashboardData } from "@/lib/actions/supervisor.actions";
import { SupervisorDashboardClient } from "@/components/sections/supervisor/SupervisorDashboardClient";
import Link from "next/link";

export const metadata = {
  title: "Supervisor Dashboard | Zigex",
  description: "Manage your assigned interns and review their progress.",
};

export const revalidate = 0; // Force dynamic rendering

export default async function SupervisorDashboardPage() {
  const data = await getSupervisorDashboardData();

  // If no supervisor profile found, they are likely not a tutor
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FF] p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-xl shadow-blue-500/5 border border-blue-50">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h1>
          <p className="text-slate-500 font-medium mb-8">
            This dashboard is only accessible to registered ZIGEX supervisors. If you believe this is an error, please contact the administrator.
          </p>

          <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100/50 text-[10px] text-slate-400 font-mono break-all text-left">
             <p className="font-bold mb-2 uppercase text-slate-500">Troubleshooting Hub</p>
             <p>1. Status: Profile search failed in DB</p>
             <p>2. Action: Verify your display name matches 'Engineer Gita'</p>
             <p>3. Action: Clear browser local storage & Refresh</p>
             <p className="mt-2 text-blue-500 font-bold italic">The system auto-repairs on refresh if it finds your email.</p>
          </div>
          <Link 
            href="/feed"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 text-center"
          >
            Return to Feed
          </Link>
        </div>
      </div>
    );
  }

  return <SupervisorDashboardClient data={data} />;
}
