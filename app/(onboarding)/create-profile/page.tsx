import { MultiStepForm } from "@/components/sections/create-profile/MultiStepForm";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Your Profile",
};

/**
 * This is the code for the Create Profile page.
 * It fetches the user session on the server to prevent client-side redirect loops.
 */
export default async function CreateProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div>
      <MultiStepForm initialUserId={user.id} />
    </div>
  );
}
