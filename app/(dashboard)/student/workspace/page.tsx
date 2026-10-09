import { redirect } from "next/navigation";
import { getAcceptedInternships } from "@/lib/actions/intenship.actions";
import { InternWorkspaceSelection } from "@/components/sections/intern/InternWorkspaceSelection";
import { NoPlacement } from "@/components/workspace/NoPlacement";

export const metadata = {
  title: "Workspace",
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
    redirect(targetUrl);
  }

  if (acceptedInternships.length === 0) return <NoPlacement />;

  return <InternWorkspaceSelection internships={acceptedInternships} />;
}
