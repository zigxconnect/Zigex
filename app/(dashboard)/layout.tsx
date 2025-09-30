// app/dashboard/layout.tsx (Server Component)
import { redirect } from "next/navigation";
// import { DashboardClientLayout } from "@/components/layout/dashboard/DashboardClientLayout";
import AIChatButton from "@/components/uiComponent/AIChatButton";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { DashboardClientLayout } from "@/components/sections/dashboard/DashboardClientLayout";

// This is now a server component
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user data on the server using the same function as your dashboard page
  const userData = await getProfileInfo();

  // Redirect to sign-in if no user data (same as your dashboard page)
  if (!userData) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Client Layout Component handles all the interactive state and includes header */}
      <DashboardClientLayout user={userData}>
        {children}
      </DashboardClientLayout>

      {/* Fixed AI Chat Button */}
      <AIChatButton />
    </div>
  );
}
