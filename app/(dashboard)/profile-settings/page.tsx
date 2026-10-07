import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/lib/api/services/profile";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = { title: "Settings" };

/** Account settings. Profile details are edited at /dashboard/edit-profile. */
export default async function SettingsPage() {
  const p = (await getMyProfile().catch(() => null)) as Record<string, any> | null;
  if (!p) redirect("/sign-in?next=/profile-settings");
  const username = typeof p.username === "string" ? p.username.replace(/^@+/, "").trim() : "";
  const profileHref = username && /^[A-Za-z0-9._-]+$/.test(username) ? `/profile/${username}` : `/profile/${p.id}`;
  return <SettingsView email={String(p.email ?? "")} profileHref={profileHref} />;
}
