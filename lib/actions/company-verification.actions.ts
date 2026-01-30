"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Fetches all companies for super admin management
 */
export async function getAllCompaniesForManagement() {
    const supabase = await createServerActionClient();

    // Check if the current user is a super admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated", data: [] };
    }

    const { data: currentCompany } = await supabase
        .from("company_profiles")
        .select("is_super_admin")
        .eq("user_id", user.id)
        .single();

    if (!currentCompany?.is_super_admin) {
        return { success: false, error: "Unauthorized - Super admin access required", data: [] };
    }

    // Fetch all companies with their user info
    const { data: companies, error } = await supabaseAdmin
        .from("company_profiles")
        .select(`
      id,
      company_name,
      industry,
      logo_url,
      user_id,
      is_verified,
      is_super_admin,
      created_at
    `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getAllCompanies] Error:", error);
        return { success: false, error: error.message, data: [] };
    }

    // Fetch user emails separately (auth.users is not directly joinable)
    const companiesWithEmails = await Promise.all(
        (companies || []).map(async (company) => {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(company.user_id);
            return {
                ...company,
                email: userData?.user?.email || "Unknown"
            };
        })
    );

    return { success: true, data: companiesWithEmails };
}

/**
 * Verifies a company (marks as verified)
 */
export async function verifyCompany(companyId: string) {
    const supabase = await createServerActionClient();

    // Check if the current user is a super admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: currentCompany } = await supabase
        .from("company_profiles")
        .select("is_super_admin")
        .eq("user_id", user.id)
        .single();

    if (!currentCompany?.is_super_admin) {
        return { success: false, error: "Unauthorized - Super admin access required" };
    }

    // Update the company to verified
    const { error } = await supabaseAdmin
        .from("company_profiles")
        .update({ is_verified: true })
        .eq("id", companyId);

    if (error) {
        console.error("[verifyCompany] Error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/companies");
    return { success: true };
}

/**
 * Revokes verification from a company
 */
export async function revokeCompanyVerification(companyId: string) {
    const supabase = await createServerActionClient();

    // Check if the current user is a super admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const { data: currentCompany } = await supabase
        .from("company_profiles")
        .select("is_super_admin")
        .eq("user_id", user.id)
        .single();

    if (!currentCompany?.is_super_admin) {
        return { success: false, error: "Unauthorized - Super admin access required" };
    }

    // Don't allow revoking from super admins
    const { data: targetCompany } = await supabaseAdmin
        .from("company_profiles")
        .select("is_super_admin")
        .eq("id", companyId)
        .single();

    if (targetCompany?.is_super_admin) {
        return { success: false, error: "Cannot revoke verification from super admin" };
    }

    // Update the company to unverified
    const { error } = await supabaseAdmin
        .from("company_profiles")
        .update({ is_verified: false })
        .eq("id", companyId);

    if (error) {
        console.error("[revokeCompanyVerification] Error:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/companies");
    return { success: true };
}
