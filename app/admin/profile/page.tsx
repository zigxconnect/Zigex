import { redirect } from "next/navigation";
import Image from "next/image";
import { createServerActionClient } from "@/lib/supabase/server";
import { EditCompanyProfileForm } from "@/components/sections/admin/EditCompanyProfileForm";

/**
 * This is the Server Component for the "Edit Company Profile" page.
 * It is responsible for:
 * 1. Securely fetching the logged-in company's profile data on the server.
 * 2. Rendering the non-interactive parts of the page (header, images).
 * 3. Passing the initial data as a prop to the interactive EditCompanyProfileForm client component.
 */
export default async function EditProfilePage() {
  const supabase = createServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Safeguard: Although middleware protects this, it's good practice to check again.
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch the company profile linked to the authenticated user.
  const { data: companyProfile, error } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !companyProfile) {
    console.error("Error fetching profile for edit page:", error?.message);
    // You could render a more user-friendly error component here.
    return (
      <p className="p-8 text-center text-red-500">
        Could not load your company profile. Please try again later.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header section with cover and profile images */}
      <div className="relative mb-16">
        <div className="w-full h-48 bg-slate-200 rounded-xl overflow-hidden">
          {companyProfile.cover_image_url ? (
            <Image
              src={companyProfile.cover_image_url}
              alt="Company Cover Image"
              width={1024}
              height={192}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-100 to-slate-200"></div>
          )}
        </div>

        <div className="absolute -bottom-12 left-8 w-24 h-24 bg-slate-300 rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
          {companyProfile.logo_url ? (
            <Image
              src={companyProfile.logo_url}
              alt="Company Logo"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-slate-500 text-sm font-semibold">
              {companyProfile.company_name?.substring(0, 2).toUpperCase() ||
                "CP"}
            </span>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">Company Profile</h1>
      <p className="text-gray-500 mb-8">
        Update your company&apos;s information below.
      </p>

      {/* The interactive form, pre-populated with data from the server */}
      <EditCompanyProfileForm initialData={companyProfile} />
    </div>
  );
}
