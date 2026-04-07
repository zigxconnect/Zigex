import { redirect } from "next/navigation";
import { 
  getInternshipWorkspaceData 
} from "@/lib/actions/intenship.actions";
import { InternWorkspaceClient } from "@/components/sections/intern/InternWorkspaceClient";

export const metadata = {
  title: "Intern Workspace | Zigex",
  description: "Manage your internship, curriculum, and tasks in one place.",
};

export default async function InternWorkspacePage(props: {
  params: Promise<{ type: string; title: string }>;
  searchParams: Promise<{ appId?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const selectedAppId = searchParams.appId;

  if (!selectedAppId) {
    redirect("/intern/workspace");
  }

  // Fetch specific workspace data
  const data = await getInternshipWorkspaceData(selectedAppId);

  if (!data) {
    redirect("/intern/workspace");
  }

  return <InternWorkspaceClient data={data} />;
}
