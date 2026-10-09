import { redirect } from "next/navigation";
import { getAcceptedInternships } from "@/lib/actions/intenship.actions";
import { InternWorkspaceSelection } from "@/components/sections/intern/InternWorkspaceSelection";
import { NoPlacement } from "@/components/workspace/NoPlacement";
import { pickWorkspace, workspaceHref } from "@/lib/workspace/routing";

export const metadata = { title: "Workspace" };

/** Opens the right workspace directly; lists them only when several run at once. */
export default async function WorkspaceEntryPage(props: { searchParams: Promise<{ appId?: string; all?: string }> }) {
  const { appId, all } = await props.searchParams;
  const placements = await getAcceptedInternships();
  if (placements.length === 0) return <NoPlacement />;

  const chosen = all ? null : pickWorkspace(placements, appId);
  if (chosen) redirect(workspaceHref(chosen, "/student/workspace"));

  return <InternWorkspaceSelection internships={placements} />;
}
