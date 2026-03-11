import { SettingsForm } from "@/components/sections/profile-settings/SettingsForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile Settings | Zigex",
  description: "Manage your profile settings and preferences.",
};

export default async function ProfileSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information, privacy, and account preferences.
          </p>
        </div>

        <SettingsForm initialUserId={user.id} />
      </div>
    </div>
  );
}
