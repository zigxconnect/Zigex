import { MultiStepForm } from "@/components/sections/create-profile/MultiStepForm";
import type { Metadata } from "next";
import { getSession } from "@/lib/api/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create Your Profile",
};

/**
 * This is the code for the Create Profile page.
 * It fetches the user session on the server to prevent client-side redirect loops.
 */
export default async function CreateProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      <MultiStepForm initialUserId={session.userId} />
    </div>
  );
}
