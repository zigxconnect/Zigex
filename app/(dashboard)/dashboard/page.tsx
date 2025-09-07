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
  // console.log("Here is the users data: ", userData)
  if (!userData) {
    redirect("/sign-in");
  }

  return (
    <div className="md:p-6 lg:p-8 space-y-8 w-full overflow-x-hidden">
      {/* ts-ignore */}
      <WelcomeCard user={userData} />

      <InternshipListings />
    </div>
  );
}
