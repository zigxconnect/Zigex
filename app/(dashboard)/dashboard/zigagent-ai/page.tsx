import { redirect } from "next/navigation";

/**
 * The chat isn't live yet (every message only opened a waiting list), so the
 * chat screen redirects to the Zila page. ZigAgentInterface is kept for when
 * the assistant launches.
 */
export default function ZigAgentPage() {
  redirect("/dashboard/zigagent-ai/docs");
}
