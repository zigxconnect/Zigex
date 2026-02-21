import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  getInternshipWorkspaceData, 
  getAcceptedInternships 
} from "@/lib/actions/intenship.actions";
import { InternWorkspaceClient } from "@/components/sections/intern/InternWorkspaceClient";
import { InternWorkspaceSelection } from "@/components/sections/intern/InternWorkspaceSelection";

export const metadata = {
  title: "Intern Workspace | Zigex",
  description: "Manage your internship, curriculum, and tasks in one place.",
};

export default async function InternWorkspacePage({
  searchParams,
}: {
  searchParams: { appId?: string };
}) {
  // 1. Fetch all accepted internships to check for multiple placements
  const acceptedInternships = await getAcceptedInternships();

  // If no internships at all, show the empty state
  if (acceptedInternships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FF] p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-xl shadow-blue-500/5 border border-blue-50">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">No Active Internship</h1>
          <p className="text-slate-500 font-medium mb-8">
            We couldn&apos;t find an active internship workspace for you. This normally happens if your application hasn&apos;t been accepted yet or if you haven&apos;t started the onboarding process.
          </p>
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

  // 2. Selection Logic
  const selectedAppId = searchParams.appId;

  // If multiple internships exist and none is selected via URL, show selection screen
  if (acceptedInternships.length > 1 && !selectedAppId) {
    return <InternWorkspaceSelection internships={acceptedInternships} />;
  }

  // 3. Fetch specific workspace data (either the selected one or the only one)
  const data = await getInternshipWorkspaceData(selectedAppId);

  if (!data) {
    // This shouldn't happen if acceptedInternships exists, but handle as fallback
    redirect("/intern/workspace");
  }

  return <InternWorkspaceClient data={data} />;
}
