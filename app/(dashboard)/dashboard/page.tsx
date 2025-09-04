import { redirect } from "next/navigation";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { WelcomeCard } from "@/components/sections/dashboard/WelcomeCard";
import { InternshipListings } from "@/components/sections/dashboard/InternshipListings";

/**
 * The main dashboard page, now a Server Component that fetches initial user data
 * and defers all interactive logic to the InternshipListings client component.
 */
export default async function DashboardPage() {
  const userData = await getProfileInfo();
  if (!userData) {
    redirect("/sign-in");
  }

  // This Server Component no longer needs to fetch the internships itself.
  // The client component will handle both the initial fetch and subsequent searches.

  return (
    <div className="md:p-6 lg:p-8 space-y-8">
      <WelcomeCard user={userData} />

      {/* Render the interactive client component */}
      <InternshipListings />
    </div>
  );
}
