import { redirect } from "next/navigation";
import { getAcceptedInternships } from "@/lib/actions/intenship.actions";
import { InternWorkspaceSelection } from "@/components/sections/intern/InternWorkspaceSelection";

export const metadata = {
  title: "Student Workspace Selection | Zigex",
  description: "Select your active placement to enter your workspace.",
};

export default async function StudentWorkspaceSelectionPage(props: {
  searchParams: Promise<{ appId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const acceptedInternships = await getAcceptedInternships();

  const appId = searchParams.appId;
  const placement = appId ? 
    acceptedInternships.find((a: any) => a.id === appId) : 
    (acceptedInternships.length === 1 ? acceptedInternships[0] : null);

  if (placement) {
    const type = (placement.application_type || "internship").toLowerCase();
    const opportunity = type === "program" 
      ? placement.programs 
      : type === "event" 
        ? placement.event 
        : placement.internships;
        
    const title = opportunity?.title || "mission";
    const slug = title.toLowerCase().replace(/ /g, "-");
    
    // Build parameters for redirection to the sub-page
    const targetUrl = `/student/workspace/${type}/${slug}?appId=${placement.id}`;
    console.log(`[WorkspaceSelection] Redirecting to ${targetUrl}`);
    redirect(targetUrl);
  }

  if (acceptedInternships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8FF] p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-xl shadow-blue-500/5 border border-blue-50">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">No Active Placement</h1>
          <p className="text-slate-500 font-medium mb-8">
            We couldn&apos;t find an active workspace for you. This normally happens if your application hasn&apos;t been accepted yet or if you haven&apos;t started the onboarding process.
          </p>
          <a
            href="/feed"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 text-center"
          >
            Return to Feed
          </a>
        </div>
      </div>
    );
  }

  return <InternWorkspaceSelection internships={acceptedInternships} />;
}
