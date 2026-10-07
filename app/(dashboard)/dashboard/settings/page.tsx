import { redirect } from "next/navigation";

/** Old address of Settings. */
export default function LegacySettingsPage() {
  redirect("/profile-settings");
}
