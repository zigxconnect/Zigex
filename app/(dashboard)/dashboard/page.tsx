import { redirect } from "next/navigation";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "@/components/sections/dashboard/WelcomeCard";
import { DashboardContent } from "@/components/sections/dashboard/DashboardContent";

/**
 * The main dashboard page, a Server Component that fetches initial user data
 * and renders the main interactive listings component.
 */
export default async function DashboardPage() {
  const userData = await getProfileInfo();
  console.log("User Data:", userData);

  if (!userData) {
    redirect("/sign-in");
  }

  return (
    <div className="md:p-6 lg:p-8 space-y-8 w-full overflow-x-hidden">
      {/* @ts-ignore */}
      <WelcomeCard user={userData} />

      {/* Client component that handles search state */}
      <DashboardContent />
    </div>
  );
}