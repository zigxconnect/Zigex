// app/admin/profile/page.tsx

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Image from "next/image";
import { EditCompanyProfileForm } from "@/components/sections/admin/EditCompanyProfileForm";

export default async function EditProfilePage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    // --- START OF THE FIX ---

    // 1. First, get the currently authenticated user.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Although the layout should prevent this, it's a good safety check.
    if (!user) {
        return <p>You must be logged in to edit a profile.</p>;
    }

    // 2. Now, use the user's ID to fetch THEIR specific company profile.
    // This is the same robust logic we use in the layout.
    const { data: companyProfile, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", user.id) // This line explicitly filters for the logged-in user
        .single();
    
    // --- END OF THE FIX ---

    if (error || !companyProfile) {
        console.error("Error fetching profile for edit page:", error?.message);
        return <p>Could not load company profile for editing. Please try again.</p>;
    }

    // The rest of the page remains the same, as it correctly displays the data once fetched.
    return (
        <div className="max-w-4xl mx-auto">
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
                         <span className="text-slate-500 text-xs">No Logo</span>
                    )}
                </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Company Profile</h1>
            <p className="text-gray-500 mb-8">Update your company's information below.</p>
            
            <EditCompanyProfileForm initialData={companyProfile} />
        </div>
    );
}