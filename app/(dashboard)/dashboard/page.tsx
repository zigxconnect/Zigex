import { redirect } from "next/navigation";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "@/components/sections/dashboard/WelcomeCard";
import { InternshipListings } from "@/components/sections/dashboard/InternshipListings";

/**
 * The main dashboard page, a Server Component that fetches initial user data
 * and renders the main interactive listings component.
//  * fixed
 */
export default async function DashboardPage() {
  const userData = await getProfileInfo();

  if (!userData) {
    redirect("/sign-in");
  }

  return (
    <div className="md:p-6 lg:p-8 space-y-8 w-full overflow-x-hidden">
      {/* @ts-ignore */}
      <WelcomeCard user={userData} />

      <InternshipListings />
    </div>
  );
}