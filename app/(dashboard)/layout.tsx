import { redirect } from "next/navigation";
import { createServerActionClient } from "@/lib/supabase/server";
import { DashboardClientLayout } from "./DashboardClientLayout.tsx/page";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerActionClient();

  // 1. Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  // 2. Fetch the user's profile from the database
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    // This is a safeguard if the profile wasn't created, ensuring onboarding is complete.
    redirect("/create-profile");
  }

  // 3. Prepare a clean user data object to pass to client components
  const userData = {
    name: profile.full_name || "New User",
    university: profile.university || "University not specified",
    initials:
      `${profile.first_name?.[0] || ""}${
        profile.last_name?.[0] || ""
      }`.toUpperCase() || "FU",
    skills: profile.hard_skills || [],
  };

  // 4. Render the Client Layout and pass the user data and children to it
  return (
    <DashboardClientLayout user={userData}>{children}</DashboardClientLayout>
  );
}
