import { redirect } from "next/navigation";
import { getProfileInfo, getRawProfileInfo } from "@/lib/actions/profile.actions";
import { DashboardClientLayout } from "@/components/sections/dashboard/DashboardClientLayout";

// This is now a server component
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user data on the server using the same function as your dashboard page
  const userData = await getProfileInfo();

  // Determine whether current user matches the admin email from env — compute server-side only
  const rawProfile = await getRawProfileInfo();
  const showUploadLive = !!(rawProfile && rawProfile.email && process.env.ADMIN_EMAIL && rawProfile.email === process.env.ADMIN_EMAIL);

  // Redirect to sign-in if no user data (same as your dashboard page)
  if (!userData) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Client Layout Component handles all the interactive state and includes header */}
      <DashboardClientLayout user={userData} showUploadLive={showUploadLive}>
        {children}
      </DashboardClientLayout>

      {/* Fixed AI Chat Button */}
      {/* <AIChatButton /> */}
    </div>
  );
}
