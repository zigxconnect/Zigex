"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAnnouncements() {
    const supabase = await createServerActionClient();

    // 1. Fetch announcements without any joins to avoid PGRST200
    const { data: announcements, error } = await supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }

    if (!announcements || announcements.length === 0) return [];

    // 2. Extract unique and non-null Author & Company IDs
    const authorIds = Array.from(new Set(announcements.map((a: any) => a.author_id).filter(Boolean)));
    const companyIds = Array.from(new Set(announcements.map((a: any) => a.company_id).filter(Boolean)));

    // 3. Parallel fetch profiles and companies using supabaseAdmin to ensure access
    const [adminProfilesRes, supervisorProfilesRes, companiesRes] = await Promise.all([
        supabaseAdmin.from("user_profiles").select("user_id, full_name, avatar_url, email").in("user_id", authorIds),
        supabaseAdmin.from("supervisor_profiles").select("user_id, full_name, avatar_url, email").in("user_id", authorIds),
        supabaseAdmin.from("company_profiles").select("id, company_name, logo_url").in("id", companyIds)
    ]);

    // 4. Create lookup maps
    const authorMap = new Map();
    adminProfilesRes.data?.forEach((p: any) => authorMap.set(p.user_id, p));
    supervisorProfilesRes.data?.forEach((p: any) => authorMap.set(p.user_id, p));

    const companyMap = new Map();
    companiesRes.data?.forEach((c: any) => companyMap.set(c.id, c));

    // 5. Build enriched objects
    const enrichedAnnouncements = announcements.map((ann: any) => {
        const author = authorMap.get(ann.author_id) || {
            full_name: "Zigex Admin",
            avatar_url: null,
            email: ""
        };
        const company = ann.company_id ? companyMap.get(ann.company_id) : null;

        return { ...ann, author, company };
    });

    return enrichedAnnouncements;
}

export async function createAnnouncement(payload: {
    title: string;
    content: string;
    is_pinned?: boolean;
    company_id?: string;
    image_url?: string;
}) {
    const supabase = await createServerActionClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized - No user session found" };

    const { data, error } = await supabase
        .from("announcements")
        .insert({
            title: payload.title,
            content: payload.content,
            is_pinned: payload.is_pinned || false,
            author_id: user.id,
            company_id: payload.company_id || null,
            image_url: payload.image_url || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating announcement [DB]:", error);
        return { success: false, error: `Database Error: ${error.message || JSON.stringify(error)}` };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/dashboard/announcements");
    return { success: true, data };
}

export async function deleteAnnouncement(id: string) {
    const supabase = await createServerActionClient();

    const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting announcement:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/dashboard/announcements");
    return { success: true };
}

export async function togglePinAnnouncement(id: string, currentStatus: boolean) {
    const supabase = await createServerActionClient();

    const { error } = await supabase
        .from("announcements")
        .update({ is_pinned: !currentStatus })
        .eq("id", id);

    if (error) {
        console.error("Error toggling pin:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/dashboard/announcements");
    return { success: true };
}

/**
 * Fetches announcements for a specific student, including global and company-specific ones.
 */
export async function getAnnouncementsForStudent(studentId: string) {
    // 1. Find the student's active accepted internship to get company_id
    const { data: activeApp } = await supabaseAdmin
        .from("internship_applications")
        .select("internship:internships(company_id)")
        .eq("student_id", studentId)
        .eq("status", "accepted")
        .maybeSingle();

    const companyId = (activeApp?.internship as any)?.company_id;

    // 2. Build query
    let query = supabaseAdmin
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

    if (companyId) {
        query = query.or(`company_id.is.null,company_id.eq.${companyId}`);
    } else {
        query = query.is("company_id", null);
    }

    const { data: rawAnnouncements, error } = await query;
    if (error) {
        console.error("Error fetching student announcements:", error);
        return [];
    }

    if (!rawAnnouncements || rawAnnouncements.length === 0) return [];

    // 3. Enrich manually to bypass join issues
    const authorIds = Array.from(new Set(rawAnnouncements.map((a: any) => a.author_id).filter(Boolean)));
    const companyIds = Array.from(new Set(rawAnnouncements.map((a: any) => a.company_id).filter(Boolean)));

    const [authorsRes, companiesRes] = await Promise.all([
        supabaseAdmin.from("user_profiles").select("user_id, full_name, avatar_url").in("user_id", authorIds),
        supabaseAdmin.from("company_profiles").select("id, company_name, logo_url").in("id", companyIds)
    ]);

    const authorMap = new Map();
    authorsRes.data?.forEach(p => authorMap.set(p.user_id, p));

    const companyMap = new Map();
    companiesRes.data?.forEach(c => companyMap.set(c.id, c));

    return rawAnnouncements.map((ann: any) => ({
        ...ann,
        author: authorMap.get(ann.author_id) || { full_name: "Zigex Admin" },
        company: ann.company_id ? companyMap.get(ann.company_id) : null
    }));
}

export async function getAllCompanies() {
    const { data, error } = await supabaseAdmin
        .from("company_profiles")
        .select("id, company_name, logo_url")
        .order("company_name", { ascending: true });

    if (error) {
        console.error("Error fetching companies:", error);
        return [];
    }

    return data;
}
