"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAnnouncements(companyId?: string) {
    const supabase = await createServerActionClient();

    // 1. Fetch announcements
    let query = supabase
        .from("announcements")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

    // If companyId is provided (supervisor view), restrict to that company OR global (optional)
    // Actually, user said "i am not suppose to see other companies", so only their company.
    // However, they might still need to see global ones? User says "i am just suppose to submit announcement as the company i am sign in as".
    // For FETCHING, let's keep it restricted if companyId is present.
    if (companyId) {
        query = query.eq("company_id", companyId);
    }

    const { data: announcements, error } = await query;

    if (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }

    if (!announcements || announcements.length === 0) return [];

    // 2. Extract unique and non-null Author & Company IDs
    const authorIds = Array.from(new Set(announcements.map((a: any) => a.author_id).filter(Boolean)));
    const companyIds = Array.from(new Set(announcements.map((a: any) => a.company_id).filter(Boolean)));

    // 3. Parallel fetch profiles and companies using supabaseAdmin to ensure access
    const [adminProfilesRes, supervisorProfilesRes, companiesRes, studentsRes] = await Promise.all([
        supabaseAdmin.from("user_profiles").select("user_id, full_name, avatar_url, email").in("user_id", authorIds),
        supabaseAdmin.from("supervisor_profiles").select("user_id, full_name, avatar_url, email").in("user_id", authorIds),
        supabaseAdmin.from("company_profiles").select("id, company_name, logo_url").in("id", companyIds),
        supabaseAdmin.from("student_profiles").select("user_id, full_name, avatar_url").in("user_id", announcements.map((a: any) => a.tagged_student_id).filter(Boolean))
    ]);

    // 4. Create lookup maps
    const authorMap = new Map();
    adminProfilesRes.data?.forEach((p: any) => authorMap.set(p.user_id, p));
    supervisorProfilesRes.data?.forEach((p: any) => authorMap.set(p.user_id, p));

    const companyMap = new Map();
    companiesRes.data?.forEach((c: any) => companyMap.set(c.id, c));

    const studentMap = new Map();
    studentsRes.data?.forEach((s: any) => studentMap.set(s.user_id, s));

    // 5. Build enriched objects
    const enrichedAnnouncements = announcements.map((ann: any) => {
        const author = authorMap.get(ann.author_id) || {
            full_name: "Zigex Admin",
            avatar_url: null,
            email: ""
        };
        const company = ann.company_id ? companyMap.get(ann.company_id) : null;
        const tagged_student = ann.tagged_student_id ? studentMap.get(ann.tagged_student_id) : null;

        return { ...ann, author, company, tagged_student };
    });

    return enrichedAnnouncements;
}

export async function getAnnouncementById(id: string) {
    const supabase = await createServerActionClient();

    // 1. Fetch the announcement
    const { data: announcement, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !announcement) {
        console.error("Error fetching announcement:", error);
        return null;
    }

    // 2. Parallel fetch related profiles
    const [authorRes, companyRes, studentRes] = await Promise.all([
        supabaseAdmin.from("user_profiles").select("user_id, full_name, avatar_url, email").eq("user_id", announcement.author_id).maybeSingle(),
        announcement.company_id ? supabaseAdmin.from("company_profiles").select("id, company_name, logo_url").eq("id", announcement.company_id).maybeSingle() : { data: null },
        announcement.tagged_student_id ? supabaseAdmin.from("student_profiles").select("user_id, full_name, avatar_url").eq("user_id", announcement.tagged_student_id).maybeSingle() : { data: null }
    ]);

    // 3. Construct enriched object
    const enrichedAnnouncement = {
        ...announcement,
        author: authorRes.data || { full_name: "Zigex Admin", avatar_url: null, email: "" },
        company: companyRes.data || null,
        tagged_student: studentRes.data || null
    };

    return enrichedAnnouncement;
}

export async function createAnnouncement(payload: {
    title: string;
    content: string;
    is_pinned?: boolean;
    company_id?: string;
    image_url?: string;
    tagged_student_id?: string;
}) {
    const supabase = await createServerActionClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized - No user session found" };

    // SECURITY: Determine the user's authorized company
    // Check company_profiles (company admin) and supervisor_profiles (supervisor)
    const [{ data: companyProfile }, { data: supervisor }] = await Promise.all([
        supabaseAdmin.from("company_profiles").select("id").eq("user_id", user.id).maybeSingle(),
        supabaseAdmin.from("supervisor_profiles").select("company_id").eq("user_id", user.id).maybeSingle(),
    ]);

    // The user's authorized company is their own company OR their assigned company as a supervisor
    const authorizedCompanyId = companyProfile?.id || supervisor?.company_id;

    // SECURITY: If user belongs to a company, FORCE that company_id
    // This prevents any attempt to post as a different company via client manipulation
    let finalCompanyId: string | null = null;
    if (authorizedCompanyId) {
        // User is bound to a company - they MUST post as that company
        finalCompanyId = authorizedCompanyId;

        // Block if client tried to submit a different company_id
        if (payload.company_id && payload.company_id !== authorizedCompanyId) {
            console.warn(`[SECURITY] User ${user.id} tried to post as company ${payload.company_id} but belongs to ${authorizedCompanyId}`);
            // Silently use their real company instead of blocking (to prevent information leakage)
        }
    }
    // If user has no company, they cannot post (platform admins might be an exception in future)
    if (!finalCompanyId) {
        return { success: false, error: "You must be associated with a company to post announcements." };
    }

    // Title is plain text — sanitize it. Content is rich HTML from TipTap editor — store as-is.
    const sanitizeTitle = (str: string) => str
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");

    const { data, error } = await supabase
        .from("announcements")
        .insert({
            title: sanitizeTitle(payload.title.trim()),
            content: payload.content,
            is_pinned: payload.is_pinned || false,
            author_id: user.id,
            company_id: finalCompanyId,
            image_url: payload.image_url || null,
            tagged_student_id: payload.tagged_student_id || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating announcement [DB]:", error);
        return { success: false, error: `Database Error: ${error.message || JSON.stringify(error)}` };
    }

    // Dispatch broadcast notification to all subscribed students
    try {
        const { dispatchBroadcastNotification } = await import("@/lib/notifications");
        await dispatchBroadcastNotification({
            title: payload.title,
            message: payload.content.substring(0, 100) + (payload.content.length > 100 ? '...' : ''),
            type: "announcement" as any, 
            referenceId: data.id,
            link: "/dashboard/announcements"
        });
    } catch (notifErr) {
        console.error("Failed to dispatch broadcast:", notifErr);
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/dashboard/announcements");
    return { success: true, data };
}

export async function deleteAnnouncement(id: string) {
    const supabase = await createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // SECURITY: Get the user's authorized company
    const [{ data: companyProfile }, { data: supervisor }] = await Promise.all([
        supabaseAdmin.from("company_profiles").select("id").eq("user_id", user.id).maybeSingle(),
        supabaseAdmin.from("supervisor_profiles").select("company_id").eq("user_id", user.id).maybeSingle(),
    ]);
    const authorizedCompanyId = companyProfile?.id || supervisor?.company_id;

    // SECURITY: Verify the announcement belongs to the user's company
    const { data: announcement } = await supabaseAdmin
        .from("announcements")
        .select("company_id")
        .eq("id", id)
        .single();

    if (!announcement) {
        return { success: false, error: "Announcement not found" };
    }

    // Block deletion if announcement belongs to a different company
    if (announcement.company_id !== authorizedCompanyId) {
        console.warn(`[SECURITY] User ${user.id} attempted to delete announcement ${id} belonging to company ${announcement.company_id}`);
        return { success: false, error: "You can only delete announcements from your own company." };
    }

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // SECURITY: Get the user's authorized company
    const [{ data: companyProfile }, { data: supervisor }] = await Promise.all([
        supabaseAdmin.from("company_profiles").select("id").eq("user_id", user.id).maybeSingle(),
        supabaseAdmin.from("supervisor_profiles").select("company_id").eq("user_id", user.id).maybeSingle(),
    ]);
    const authorizedCompanyId = companyProfile?.id || supervisor?.company_id;

    // SECURITY: Verify the announcement belongs to the user's company
    const { data: announcement } = await supabaseAdmin
        .from("announcements")
        .select("company_id")
        .eq("id", id)
        .single();

    if (!announcement) {
        return { success: false, error: "Announcement not found" };
    }

    if (announcement.company_id !== authorizedCompanyId) {
        console.warn(`[SECURITY] User ${user.id} attempted to modify announcement ${id} belonging to company ${announcement.company_id}`);
        return { success: false, error: "You can only modify announcements from your own company." };
    }

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

    const [authorsRes, companiesRes, studentsRes] = await Promise.all([
        supabaseAdmin.from("user_profiles").select("user_id, full_name, avatar_url").in("user_id", authorIds),
        supabaseAdmin.from("company_profiles").select("id, company_name, logo_url").in("id", companyIds),
        supabaseAdmin.from("student_profiles").select("user_id, full_name, avatar_url").in("user_id", rawAnnouncements.map((a: any) => a.tagged_student_id).filter(Boolean))
    ]);

    const authorMap = new Map();
    authorsRes.data?.forEach(p => authorMap.set(p.user_id, p));

    const companyMap = new Map();
    companiesRes.data?.forEach(c => companyMap.set(c.id, c));

    const studentMap = new Map();
    studentsRes.data?.forEach(s => studentMap.set(s.user_id, s));

    return rawAnnouncements.map((ann: any) => ({
        ...ann,
        author: authorMap.get(ann.author_id) || { full_name: "Zigex Admin" },
        company: ann.company_id ? companyMap.get(ann.company_id) : null,
        tagged_student: ann.tagged_student_id ? studentMap.get(ann.tagged_student_id) : null
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

export async function getAllStudents() {
    const { data, error } = await supabaseAdmin
        .from("student_profiles")
        .select("user_id, full_name, avatar_url, email")
        .order("full_name", { ascending: true });

    if (error) {
        console.error("Error fetching students:", error);
        return [];
    }

    return data;
}

export async function getCompany(id: string) {
    const { data, error } = await supabaseAdmin
        .from("company_profiles")
        .select("id, company_name, logo_url")
        .eq("id", id)
        .single();

    if (error) return null;
    return data;
}

export async function getStudentsForCompany(companyId: string) {
    const { data, error } = await supabaseAdmin
        .from("internship_applications")
        .select(`
            student:student_profiles(user_id, full_name, avatar_url, email)
        `)
        .eq("status", "accepted")
        .eq("internship.company_id", companyId);

    if (error) {
        console.error("Error fetching students for company:", error);
        return [];
    }

    const students = data.map((d: any) => d.student).filter(Boolean);
    const uniqueStudents = Array.from(new Map(students.map((s: any) => [s.user_id, s])).values());

    return uniqueStudents;
}

export async function markAnnouncementsAsRead(studentId: string, announcementIds: string[]) {
    const { error } = await supabaseAdmin
        .from("announcement_reads")
        .upsert(
            announcementIds.map(id => ({
                announcement_id: id,
                student_id: studentId
            })),
            { onConflict: 'announcement_id,student_id' }
        );

    if (error) {
        console.error("Error marking announcements as read:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/intern/workspace");
    return { success: true };
}

export async function getUnreadAnnouncementsCount(studentId: string) {
    // 1. Get total announcements applicable to student
    const announcements = await getAnnouncementsForStudent(studentId);
    if (announcements.length === 0) return 0;

    const announcementIds = announcements.map(a => a.id);

    // 2. Get read announcements
    const { data: readRecords } = await supabaseAdmin
        .from("announcement_reads")
        .select("announcement_id")
        .eq("student_id", studentId)
        .in("announcement_id", announcementIds);

    const readIds = new Set(readRecords?.map(r => r.announcement_id) || []);

    return announcementIds.filter(id => !readIds.has(id)).length;
}
