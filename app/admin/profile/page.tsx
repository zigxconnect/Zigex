import { redirect } from "next/navigation";
import { createServerActionClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export default async function EditProfilePage() {
  const supabase = await createServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: companyProfile, error } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !companyProfile) {
    return (
      <div className="p-20 text-center">
        <p className="text-red-500 font-bold">Could not load your company profile.</p>
      </div>
    );
  }

  return <SettingsClient initialData={companyProfile} />;
}
