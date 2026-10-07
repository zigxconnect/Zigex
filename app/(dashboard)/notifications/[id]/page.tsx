import { redirect } from "next/navigation";

/**
 * Old links to /notifications/<opportunity id> showed placeholder data.
 * The opportunity page resolves any internship, program or event id, so go there.
 */
export default async function NotificationTarget({ params }: { params: Promise<{ id: string }> }) {
  redirect(`/feed/${encodeURIComponent((await params).id)}`);
}
