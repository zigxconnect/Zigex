import { redirect } from "next/navigation";
import { 
  getInternshipWorkspaceData 
} from "@/lib/actions/intenship.actions";
import { InternWorkspaceClient } from "@/components/sections/intern/InternWorkspaceClient";

export const metadata = {
  title: "Workspace | Zigex",
  description: "Manage your internship, curriculum, and tasks in one place.",
};

export default async function StudentWorkspacePage(props: {
  params: Promise<{ type: string; title: string }>;
  searchParams: Promise<{ appId?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const selectedAppId = searchParams.appId;

  if (!selectedAppId) {
    // If no appId in searchParams, we navigate back to the selection page 
    // which handles finding the correct one (or just finding the single one)
    redirect("/student/workspace");
  }

  // Fetch specific workspace data
  const data = await getInternshipWorkspaceData(selectedAppId);

  if (!data) {
    // If data is null (e.g., student_id mismatch or not found), try going back to selection
    redirect("/student/workspace");
  }

  return <InternWorkspaceClient data={data} />;
}
