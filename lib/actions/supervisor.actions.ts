"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail, sendSupervisorWelcomeEmail, sendSupervisorAssignmentEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { sendPushNotification } from "@/lib/push";

// ═══════════════════════════════════════════════════════════════
// ISOLATED WORKSPACE FUNCTIONS  — Data is scoped per internship
// ═══════════════════════════════════════════════════════════════

/**
 * Helper: Resolve the supervisor profile for the current authenticated user.
 * Includes email-fallback & auto-repair logic.
 */
async function resolveSupervisorProfile() {
    const supabase = await createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Try by user_id
    let { data: profile } = await supabaseAdmin
        .from("supervisor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    // 2. Fallback by email
    if (!profile && user.email) {
        const { data: emailProfile } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("*")
            .ilike("email", user.email)
            .maybeSingle();

        if (emailProfile) {
            profile = emailProfile;
            // Auto-repair link
            await supabaseAdmin
                .from("supervisor_profiles")
                .update({ user_id: user.id })
                .eq("id", profile.id);
        }
    }

    return profile;
}

/**
 * Fetches all distinct internships/programs this supervisor is assigned to.
 * Used for the workspace selection screen.
 * Returns grouped assignments with intern count per slot.
 */
export async function getSupervisorAssignments() {
    try {
        const profile = await resolveSupervisorProfile();
        if (!profile) return null;

        // 1. Fetch from internship_applications (structured table)
        const { data: structApps } = await supabaseAdmin
            .from("internship_applications")
            .select(`
                id, 
                internship_id, 
                student_id,
                internship:internships(
                    id, title, location, company_id, cover_image_url, start_date, end_date,
                    company_profiles(id, company_name, logo_url)
                )
            `)
            .eq("supervisor_id", profile.id)
            .eq("status", "accepted");

        // 2. Fetch from Applications (unified table — supports programs & events)
        let unifiedApps: any[] = [];
        try {
            const { data: uApps } = await supabaseAdmin
                .from("Applications")
                .select(`
                    id,
                    internship_id,
                    program_id,
                    event_id,
                    application_type,
                    student_id,
                    internships(id, title, location, company_id, cover_image_url, start_date, end_date, company_profiles(id, company_name, logo_url)),
                    programs(id, title, location, company_id, program_picture_url, start_date, end_date, company_profiles(id, company_name, logo_url))
                `)
                .eq("supervisor_id", profile.id)
                .eq("status", "accepted");
            unifiedApps = uApps || [];
        } catch (e) {
            console.warn("[SUPERVISOR_ASSIGNMENTS] Unified Applications table not accessible");
        }

        // 3. Group by internship_id/program_id → create workspace slots
        const workspaceMap = new Map<string, {
            id: string;
            type: "internship" | "program";
            title: string;
            location: string | null;
            company: { id: string; name: string; logo: string | null } | null;
            coverImage: string | null;
            startDate: string | null;
            endDate: string | null;
            internCount: number;
        }>();

        // Process structured internship_applications
        (structApps || []).forEach(app => {
            const internship = Array.isArray(app.internship) ? app.internship[0] : app.internship;
            if (!internship?.id) return;

            const key = internship.id;
            if (workspaceMap.has(key)) {
                workspaceMap.get(key)!.internCount++;
            } else {
                const company = Array.isArray(internship.company_profiles) ? internship.company_profiles[0] : internship.company_profiles;
                workspaceMap.set(key, {
                    id: internship.id,
                    type: "internship",
                    title: internship.title || "Internship Program",
                    location: internship.location,
                    company: company ? { id: company.id, name: company.company_name, logo: company.logo_url } : null,
                    coverImage: internship.cover_image_url,
                    startDate: internship.start_date,
                    endDate: internship.end_date,
                    internCount: 1
                });
            }
        });

        // Process unified Applications
        unifiedApps.forEach(app => {
            const appType = (app.application_type || "internship").toLowerCase();
            let refId: string | null = null;
            let opportunity: any = null;

            if (appType === "program" && app.program_id) {
                refId = app.program_id;
                opportunity = Array.isArray(app.programs) ? app.programs[0] : app.programs;
            } else if (app.internship_id) {
                refId = app.internship_id;
                opportunity = Array.isArray(app.internships) ? app.internships[0] : app.internships;
            }

            if (!refId || !opportunity) return;

            if (workspaceMap.has(refId)) {
                workspaceMap.get(refId)!.internCount++;
            } else {
                const company = Array.isArray(opportunity.company_profiles) ? opportunity.company_profiles[0] : opportunity.company_profiles;
                workspaceMap.set(refId, {
                    id: refId,
                    type: appType === "program" ? "program" : "internship",
                    title: opportunity.title || "Program",
                    location: opportunity.location,
                    company: company ? { id: company.id, name: company.company_name, logo: company.logo_url } : null,
                    coverImage: opportunity.cover_image_url || opportunity.program_picture_url,
                    startDate: opportunity.start_date,
                    endDate: opportunity.end_date,
                    internCount: 1
                });
            }
        });

        // Company info fallback
        let companyInfo = null;
        if (profile.company_id) {
            const { data: company } = await supabaseAdmin
                .from("company_profiles")
                .select("id, company_name, logo_url")
                .eq("id", profile.company_id)
                .single();
            companyInfo = company;
        }

        return {
            profile: { ...profile, company: companyInfo },
            workspaces: Array.from(workspaceMap.values())
        };
    } catch (err) {
        console.error("[SUPERVISOR_ASSIGNMENTS] Unexpected error:", err);
        return null;
    }
}

/**
 * Fetches ISOLATED data for a supervisor workspace, scoped to a single internship/program.
 * SECURITY: Verifies the supervisor is actually assigned to this internship.
 */
export async function getSupervisorWorkspaceData(workspaceId: string) {
    try {
        const profile = await resolveSupervisorProfile();
        if (!profile) {
            console.error("[SUPERVISOR_WORKSPACE] No supervisor profile found");
            return null;
        }

        // Manual Company Join
        let companyInfo = null;
        if (profile.company_id) {
            const { data: company } = await supabaseAdmin
                .from("company_profiles")
                .select("id, company_name, logo_url")
                .eq("id", profile.company_id)
                .single();
            companyInfo = company;
        }

        // 1. Get ONLY applications for THIS workspace assigned to THIS supervisor
        const { data: structApps } = await supabaseAdmin
            .from("internship_applications")
            .select(`
                *,
                internship:internships(
                    id, title, location, company_id, cover_image_url, start_date, end_date,
                    company_profiles(id, company_name, logo_url)
                )
            `)
            .eq("supervisor_id", profile.id)
            .eq("internship_id", workspaceId)
            .eq("status", "accepted");

        let legacyApps: any[] = [];
        try {
            const { data: lApps } = await supabaseAdmin
                .from("Applications")
                .select(`
                    *,
                    internship:internships(
                        id, title, location, company_id, cover_image_url, start_date, end_date,
                        company_profiles(id, company_name, logo_url)
                    ),
                    programs(id, title, location, company_id, company_profiles(id, company_name, logo_url))
                `)
                .eq("supervisor_id", profile.id)
                .or(`internship_id.eq.${workspaceId},program_id.eq.${workspaceId}`)
                .eq("status", "accepted");
            if (lApps) legacyApps = lApps;
        } catch (e) {
            console.warn("[SUPERVISOR_WORKSPACE] Legacy Applications table not accessible");
        }

        const rawApps = [...(structApps || []), ...legacyApps];

        // SECURITY: If no apps found for this workspace, the supervisor has no access
        if (rawApps.length === 0) {
            console.warn(`[SECURITY] Supervisor ${profile.id} has no assignments for workspace ${workspaceId}`);
            return null;
        }

        // Resolve workspace metadata from first app
        const firstInternship = rawApps[0]?.internship;
        const firstProgram = rawApps[0]?.programs;
        const workspaceMeta = firstInternship 
            ? {
                id: workspaceId,
                type: "internship" as const,
                title: (Array.isArray(firstInternship) ? firstInternship[0] : firstInternship)?.title || "Internship",
                company: (Array.isArray(firstInternship) ? firstInternship[0] : firstInternship)?.company_profiles
            }
            : {
                id: workspaceId,
                type: "program" as const,
                title: (Array.isArray(firstProgram) ? firstProgram[0] : firstProgram)?.title || "Program",
                company: (Array.isArray(firstProgram) ? firstProgram[0] : firstProgram)?.company_profiles
            };

        // Robust student profile resolution
        const allPossibleStudentIds = [
            ...new Set([
                ...rawApps.map(app => app.student_id),
                ...rawApps.map((app: any) => app.user_id)
            ])
        ].filter(Boolean) as string[];

        let studentProfiles: any[] = [];
        if (allPossibleStudentIds.length > 0) {
            const { data: profiles } = await supabaseAdmin
                .from("student_profiles")
                .select("id, user_id, full_name, avatar_url")
                .or(`id.in.(${allPossibleStudentIds.map(id => `"${id}"`).join(",")}),user_id.in.(${allPossibleStudentIds.map(id => `"${id}"`).join(",")})`);
            studentProfiles = profiles || [];
        }

        // Map apps → interns
        const interns = rawApps.map(app => {
            const student = studentProfiles.find(p => 
                p.id === app.student_id || p.user_id === app.student_id || 
                p.id === (app as any).user_id || p.user_id === (app as any).user_id
            );
            return {
                ...app,
                internship: app.internship || { id: app.internship_id, title: workspaceMeta.title },
                student: student || {
                    full_name: app.full_name || "New Intern",
                    user_id: app.student_id || (app as any).user_id,
                    avatar_url: "/default-avatar.svg"
                }
            };
        });

        const internUserIds = allPossibleStudentIds;

        // 2. ISOLATED queries — all filtered by workspaceId (internship_id)
        const today = new Date().toISOString().split("T")[0];

        const [logsRes, tasksRes, attendanceRes, evaluationsRes] = await Promise.all([
            // Logs — only for interns in THIS workspace
            internUserIds.length > 0
                ? supabaseAdmin
                    .from("intern_logs")
                    .select("*")
                    .in("student_id", internUserIds)
                    .eq("internship_id", workspaceId)
                    .order("log_date", { ascending: false })
                    .limit(30)
                : Promise.resolve({ data: [] as any[], error: null }),

            // Tasks — only for THIS workspace
            supabaseAdmin
                .from("internship_tasks")
                .select("*")
                .eq("internship_id", workspaceId)
                .eq("supervisor_id", profile.id)
                .order("created_at", { ascending: false }),

            // Attendance — only for THIS workspace, mapping from v2 JSONB
            supabaseAdmin
                .from("intern_attendance_v2")
                .select("*")
                .eq("internship_id", workspaceId),

            // Evaluations — only for THIS workspace
            supabaseAdmin
                .from("intern_evaluations")
                .select("*")
                .eq("supervisor_id", profile.id)
                .eq("internship_id", workspaceId)
                .order("created_at", { ascending: false })
        ]);

        const recentLogs = (logsRes.data || []).map(log => ({
            ...log,
            student: studentProfiles.find(p => p.user_id === log.student_id) || { full_name: "Intern" }
        }));

        const unreadLogsCount = (logsRes.data || []).filter(log => !log.read_at).length;

        const evaluations = (evaluationsRes.data || []).map(evalItem => ({
            ...evalItem,
            student: studentProfiles.find(p => p.user_id === evalItem.student_id) || { full_name: "Intern" }
        }));

        // Fallback company info
        if (!companyInfo && interns.length > 0) {
            const firstIntern = interns[0];
            if (firstIntern?.internship?.company_profiles) {
                companyInfo = firstIntern.internship.company_profiles;
            }
        }

        // Extract today's attendance from the v2 JSONB format
        const todayAttendance = (attendanceRes.data || []).map(record => {
            const todayLog = record.attendance_logs ? record.attendance_logs[today] : null;
            if (!todayLog) return null;
            return {
                id: record.id,
                student_id: record.student_id,
                internship_id: record.internship_id,
                supervisor_id: todayLog.supervisor_id,
                attendance_date: today,
                status: todayLog.status,
                confirmed_at: todayLog.confirmed_at
            };
        }).filter(Boolean);

        return {
            profile: { ...profile, company: companyInfo },
            workspace: workspaceMeta,
            interns: interns || [],
            recentLogs,
            unreadLogsCount,
            tasks: tasksRes.data || [],
            attendance: todayAttendance,
            evaluations
        };
    } catch (err) {
        console.error("[SUPERVISOR_WORKSPACE] Unexpected runtime error:", err);
        return null;
    }
}

/**
 * Fetches all supervisors. 
 * This version is ULTRA-RESILIENT: It fetches everything and filters in JS if needed
 * to avoid any Postgres column errors (like missing company_id).
 */
export async function getSupervisors(companyId?: string) {
    try {
        console.log(`[SERVER_ACTION] getSupervisors called. CompanyId: ${companyId}`);

        // If no companyId is provided, we should probably return nothing or only global ones.
        // For the admin dashboard, we expect a companyId.
        if (!companyId || companyId === "undefined" || companyId === "") {
            console.warn("[SERVER_ACTION] No companyId provided to getSupervisors. Returning empty list for security.");
            return [];
        }

        const { data, error } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("*")
            .eq("company_id", companyId);

        if (error) {
            console.error("[SERVER_ACTION] Error fetching supervisors:", error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error("[SERVER_ACTION] Critical error in getSupervisors:", err);
        return [];
    }
}

/**
 * Assigns a supervisor to an internship application and sends a notification email.
 * SECURITY: Verifies both the supervisor and application belong to the caller's company.
 */
export async function assignSupervisor(applicationId: string, supervisorId: string) {
    try {
        // SECURITY: Get the caller's company
        const supabase = await createServerActionClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { data: companyProfile } = await supabaseAdmin
            .from("company_profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!companyProfile) {
            return { success: false, error: "Only company administrators can assign supervisors." };
        }

        // SECURITY: Verify the supervisor belongs to the caller's company
        const { data: supervisorCheck } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("company_id")
            .eq("id", supervisorId)
            .single();

        if (!supervisorCheck || supervisorCheck.company_id !== companyProfile.id) {
            console.warn(`[SECURITY] User ${user.id} attempted to assign supervisor ${supervisorId} from company ${supervisorCheck?.company_id}`);
            return { success: false, error: "You can only assign supervisors from your own company." };
        }

        // 1. Fetch application details to get company and program info
        const { data: appData } = await supabaseAdmin
            .from("internship_applications")
            .select(`
                id,
                internships (
                    title,
                    company_id,
                    company_profiles (company_name)
                ),
                student:student_profiles(full_name)
            `)
            .eq("id", applicationId)
            .single();

        // SECURITY: Verify the application belongs to the caller's company
        if (appData) {
            const internshipsData = Array.isArray(appData.internships) ? appData.internships[0] : appData.internships;
            if ((internshipsData as any)?.company_id !== companyProfile.id) {
                console.warn(`[SECURITY] User ${user.id} attempted to assign to application from different company`);
                return { success: false, error: "You can only manage applications for your own company." };
            }
        }

        // 2. Fetch supervisor email
        const { data: supervisor } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("email, full_name")
            .eq("id", supervisorId)
            .single();

        // 3. Perform the assignment - Attempt both tables for maximum resilience
        let success = false;
        let updateError = null;

        let assignmentResult = null;


        // Try new table first
        const { data: newData, error: newError } = await supabaseAdmin
            .from("internship_applications")
            .update({ supervisor_id: supervisorId })
            .eq("id", applicationId)
            .select();

        if (!newError && newData && newData.length > 0) {
            success = true;
            assignmentResult = newData;
        } else {
            updateError = newError;
            // Try legacy table
            const { data: legacyData, error: legacyError } = await supabaseAdmin
                .from("Applications")
                .update({ supervisor_id: supervisorId })
                .eq("id", applicationId)
                .select();

            if (!legacyError && legacyData && legacyData.length > 0) {
                success = true;
                assignmentResult = legacyData;
            } else {
                updateError = legacyError || updateError;
            }
        }

        if (!success) {
            console.error("Error assigning supervisor:", updateError);
            return { success: false, error: updateError?.message || "Application not found in any table" };
        }

        // 4. Send Notification Email
        if (supervisor && appData) {
            // Handle array or object from join
            const internshipsData = Array.isArray(appData.internships) ? appData.internships[0] : appData.internships;
            const studentData = Array.isArray(appData.student) ? appData.student[0] : appData.student;

            const companyName = (internshipsData as any)?.company_profiles?.company_name || "Zigex Partner";
            const programTitle = (internshipsData as any)?.title || "Internship Program";
            const studentName = (studentData as any)?.full_name || "a newer learner";

            try {
                await sendSupervisorAssignmentEmail({
                    email: supervisor.email,
                    name: supervisor.full_name,
                    studentName: studentName,
                    programTitle: programTitle,
                    companyName: companyName,
                    dashboardLink: "https://zigexconnect.com/supervisor"
                });

                // Add Real-time Notification for Student
                const studentUserId = (appData as any).student?.user_id || (appData as any).student_id;
                if (studentUserId) {
                    await createNotification({
                        userId: studentUserId,
                        title: "Supervisor Assigned 👨‍🏫",
                        message: `${supervisor.full_name} has been assigned as your supervisor for your ${programTitle} internship.`,
                        type: "supervisor_assigned",
                        referenceId: applicationId
                    });
                }
            } catch (emailErr) {
                console.error("Assignment email failed:", emailErr);
            }
        }

        // Comprehensive revalidation
        revalidatePath("/admin/applicants");
        revalidatePath("/admin/interns");
        revalidatePath("/admin/accepted");
        revalidatePath("/intern/workspace");
        revalidatePath("/supervisor");

        return { success: true, data: assignmentResult };
    } catch (err: any) {
        console.error("Critical error in assignSupervisor:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Creates a supervisor profile.
 */
export async function createSupervisorProfile(profileData: any) {
    const { data, error } = await supabaseAdmin
        .from("supervisor_profiles")
        .insert([profileData])
        .select()
        .single();

    if (error) {
        console.error("Error creating supervisor profile:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/supervisors");
    return { success: true, data };
}

/**
 * Fetches data for the supervisor dashboard.
 * Optimized for maximum resilience and automatic linkage repair.
 */
export async function getSupervisorDashboardData() {
    try {
        const supabase = await createServerActionClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("[SUPERVISOR_HUB] No authenticated user found.");
            return null;
        }

        console.log(`[SUPERVISOR_HUB] Loading dashboard for: ${user.email} (ID: ${user.id})`);

        // 1. Try finding by User ID - Robust query without join first to avoid failures if company_id is missing
        let { data: profile } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        // 2. Fallback: Try finding by Email (Crucial for account migrations/upgrades)
        if (!profile && user.email) {
            console.log(`[SUPERVISOR_HUB] ID mismatch for ${user.id}, trying email lookup: ${user.email}`);
            const { data: emailProfile } = await supabaseAdmin
                .from("supervisor_profiles")
                .select("*")
                .ilike("email", user.email) // Case insensitive lookup
                .maybeSingle();

            if (emailProfile) {
                profile = emailProfile;
                console.log(`[SUPERVISOR_HUB] Found profile via email fallback. Repairing user_id link.`);

                // Repair the link silently so the dashboard works next time without fallback
                await supabaseAdmin
                    .from("supervisor_profiles")
                    .update({ user_id: user.id })
                    .eq("id", profile.id);
            } else {
                console.warn(`[SUPERVISOR_HUB] Email lookup also failed for ${user.email}`);
            }
        }

        if (!profile) {
            console.error(`[SUPERVISOR_HUB] Access Denied: No supervisor profile exists for email ${user.email} or ID ${user.id}`);
            return null;
        }

        // 3. Manual Company Join (Resilient to missing company_id column)
        let companyInfo = null;
        if (profile.company_id) {
            const { data: company } = await supabaseAdmin
                .from("company_profiles")
                .select("id, company_name, logo_url")
                .eq("id", profile.company_id)
                .single();
            companyInfo = company;
        }

        // Attach company info to profile object
        (profile as any).company = companyInfo;

        console.log(`[SUPERVISOR_HUB] Access granted to ${profile.full_name}`);

        // Get assigned interns from BOTH tables for maximum coverage
        // 1. Structured Applications
        const { data: structApps, error: structError } = await supabaseAdmin
            .from("internship_applications")
            .select(`
                *,
                internship:internships(
                    id, 
                    title, 
                    company_id,
                    company_profiles(id, company_name, logo_url)
                )
            `)
            .eq("supervisor_id", profile.id)
            .eq("status", "accepted");

        // 2. Legacy Applications
        let legacyApps: any[] = [];
        try {
            const { data: lApps, error: lError } = await supabaseAdmin
                .from("Applications")
                .select(`
                    *,
                    internship:internships(
                        id, 
                        title, 
                        company_id,
                        company_profiles(id, company_name, logo_url)
                    )
                `)
                .eq("supervisor_id", profile.id)
                .eq("status", "accepted");

            if (!lError && lApps) legacyApps = lApps;
        } catch (e) {
            console.warn("[SUPERVISOR_HUB] Legacy Applications table not accessible");
        }

        // Combine all accepted applications
        const rawApps = [...(structApps || []), ...legacyApps];
        console.log(`[SUPERVISOR_HUB] Found ${rawApps.length} total accepted apps for supervisor ${profile.id}`);

        // Robust Manual Join for Student Profiles
        const allPossibleStudentIds = [
            ...new Set([
                ...rawApps.map(app => app.student_id),
                ...rawApps.map((app: any) => app.user_id)
            ])
        ].filter(Boolean) as string[];

        let studentProfiles: any[] = [];
        if (allPossibleStudentIds.length > 0) {
            const { data: profiles } = await supabaseAdmin
                .from("student_profiles")
                .select("id, user_id, full_name, avatar_url")
                .or(`id.in.(${allPossibleStudentIds.map(id => `"${id}"`).join(",")}),user_id.in.(${allPossibleStudentIds.map(id => `"${id}"`).join(",")})`);
            studentProfiles = profiles || [];
        }

        // Map them together
        const interns = rawApps.map(app => {
            const student = studentProfiles.find(p => p.id === app.student_id || p.user_id === app.student_id || p.id === (app as any).user_id || p.user_id === (app as any).user_id);
            return {
                ...app,
                // Ensure internship info is present even if join failed
                internship: app.internship || { id: app.internship_id, title: "Internship Program" },
                student: student || {
                    full_name: app.full_name || "New Intern",
                    user_id: app.student_id || (app as any).user_id,
                    avatar_url: "/default-avatar.svg"
                }
            };
        });

        const internUserIds = allPossibleStudentIds;

        // Get recent logs for these interns
        let recentLogs: any[] = [];
        let unreadLogsCount = 0;
        if (internUserIds.length > 0) {
            const { data: logs, error: logsError } = await supabaseAdmin
                .from("intern_logs")
                .select("*")
                .in("student_id", internUserIds)
                .order("log_date", { ascending: false })
                .limit(20);

            if (logs) {
                // Enrich logs with student profiles manually
                recentLogs = logs.map(log => ({
                    ...log,
                    student: studentProfiles.find(p => p.user_id === log.student_id) || { full_name: "Intern" }
                }));

                // Calculate unread logs (those without read_at timestamp)
                unreadLogsCount = logs.filter(log => !log.read_at).length;
            }
        }

        // Fetch Tasks (Linked by Internship ID, isolated by supervisor_id)
        const internshipIds = rawApps.map(i => i.internship_id).filter(Boolean);
        const { data: tasks } = await supabaseAdmin
            .from("internship_tasks")
            .select("*")
            .in("internship_id", internshipIds)
            .eq("supervisor_id", profile.id)
            .order("created_at", { ascending: false });

        // Fetch Today's Attendance
        const today = new Date().toISOString().split("T")[0];
        const [attendanceRes, evaluationsRes] = await Promise.all([
            supabaseAdmin
                .from("intern_attendance_v2")
                .select("*"),

            // Fetch recent evaluations
            supabaseAdmin
                .from("intern_evaluations")
                .select("*")
                .eq("supervisor_id", profile.id)
                .order("created_at", { ascending: false })
        ]);

        // Map v2 JSONB to expected array format
        const attendance = (attendanceRes.data || []).map(record => {
            const todayLog = record.attendance_logs ? record.attendance_logs[today] : null;
            // Only include logs supervised by this supervisor (or all for this workspace)
            if (!todayLog || todayLog.supervisor_id !== profile.id) return null;
            return {
                id: record.id,
                student_id: record.student_id,
                internship_id: record.internship_id,
                supervisor_id: todayLog.supervisor_id,
                attendance_date: today,
                status: todayLog.status,
                confirmed_at: todayLog.confirmed_at
            };
        }).filter(Boolean);
        const evaluations = (evaluationsRes.data || []).map(evalItem => ({
            ...evalItem,
            student: studentProfiles.find(p => p.user_id === evalItem.student_id) || { full_name: "Intern" }
        }));

        // 4. Final Company Name Fallback (Check interns if profile company is missing)
        if (!companyInfo && interns.length > 0) {
            // Try to find company from first intern's internship
            const firstIntern = interns[0];
            if (firstIntern?.internship?.company_profiles) {
                companyInfo = firstIntern.internship.company_profiles;
                (profile as any).company = companyInfo;
            }
        }

        return {
            profile,
            interns: interns || [],
            recentLogs: recentLogs,
            unreadLogsCount,
            tasks: tasks || [],
            attendance: attendance || [],
            evaluations: evaluations || []
        };
    } catch (err) {
        console.error("[SUPERVISOR_HUB] Unexpected runtime error:", err);
        return null;
    }
}

/**
 * Server Action to assign a task to an internship.
 */
import { sendTaskAssignmentEmail } from "@/lib/email";

export async function assignInternshipTask(taskData: {
    internship_id: string; // can be "all" or specific application ID
    title: string;
    description: string;
    due_date?: string;
    priority?: string;
    resource_links?: { title: string; url: string }[];
    attachments?: { name: string; url: string; size: number; type: string }[];
    output_image_url?: string;
}) {
    try {
        console.log("[SUPERVISOR_ACTIONS] assignInternshipTask called", taskData);
        const supabase = await createServerActionClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.error("[SUPERVISOR_ACTIONS] No user found in auth session");
            return { success: false, error: "Unauthorized" };
        }

        // 1. Get supervisor profile (with robust fallback like in Dashboard)
        let { data: profile } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("id, full_name") // company_id does not exist on this table
            .eq("user_id", user.id)
            .maybeSingle();

        if (!profile && user.email) {
            console.log(`[SUPERVISOR_ACTIONS] ID lookup failed for ${user.id}, trying email: ${user.email}`);
            const { data: emailProfile } = await supabaseAdmin
                .from("supervisor_profiles")
                .select("id, full_name")
                .ilike("email", user.email)
                .maybeSingle();
            profile = emailProfile;
        }

        if (!profile) {
            console.error("[SUPERVISOR_ACTIONS] No supervisor profile found for user", user.id);
            return { success: false, error: "Supervisor profile not found. Please refresh." };
        }

        let tasksToCreate: any[] = [];
        let recipients: any[] = [];

        // Common payload
        const taskPayload = {
            title: taskData.title,
            description: taskData.description,
            due_date: taskData.due_date || null,
            priority: taskData.priority || "medium",
            status: "pending",
            supervisor_id: profile.id,
            resource_links: taskData.resource_links || [],
            attachments: taskData.attachments || [],
            output_image_url: taskData.output_image_url || null
        };

        if (taskData.internship_id === "all") {
            console.log("[SUPERVISOR_ACTIONS] Bulk assignment selected");

            // 2. Fetch applications separately (Resilient to join errors)
            const [structRes, legacyRes] = await Promise.all([
                supabaseAdmin
                    .from("internship_applications")
                    .select("id, internship_id, student_id")
                    .eq("supervisor_id", profile.id)
                    .eq("status", "accepted"),
                supabaseAdmin
                    .from("Applications")
                    .select("id, internship_id, program_id, student_id")
                    .eq("supervisor_id", profile.id)
                    .eq("status", "accepted")
            ]);

            const allApps = [...(structRes.data || []), ...(legacyRes.data || [])];
            console.log(`[SUPERVISOR_ACTIONS] Found ${allApps.length} total applications`);

            if (allApps.length === 0) {
                console.warn("[SUPERVISOR_ACTIONS] No active interns found for supervisor", profile.id);
                return { success: false, error: "No active interns found." };
            }

            // 3. Ultra-Robust Student Profile Resolution (Handles both Profile UUID and Auth ID)
            const inputStudentIds = allApps.map(i => i.student_id).filter(Boolean);
            let resolvedProfiles: any[] = [];
            if (inputStudentIds.length > 0) {
                const { data: profiles } = await supabaseAdmin
                    .from("student_profiles")
                    .select("id, user_id, full_name, email")
                    .or(`id.in.(${inputStudentIds.join(',')}),user_id.in.(${inputStudentIds.join(',')})`);
                resolvedProfiles = profiles || [];
            }

            // 4. Map Applications to Students & Deduplicate
            const uniqueTasksMap = new Map();
            const uniqueRecipientsMap = new Map();

            allApps.forEach(app => {
                // Find profile by matching either ID or User ID
                const profile = resolvedProfiles.find(p => p.id === app.student_id || p.user_id === app.student_id);
                
                if (profile) {
                    // ALWAYS use the Profile UUID (profile.id) for the task table to ensure visibility in student workspace
                    if (!uniqueTasksMap.has(profile.id)) {
                        uniqueTasksMap.set(profile.id, {
                            internship_id: app.internship_id || app.program_id,
                            student_id: profile.id,
                            ...taskPayload
                        });
                    }
                    // Email deduplication
                    if (profile.email && !uniqueRecipientsMap.has(profile.email)) {
                        uniqueRecipientsMap.set(profile.email, profile);
                    }
                }
            });

            tasksToCreate = Array.from(uniqueTasksMap.values());
            recipients = Array.from(uniqueRecipientsMap.values());

        } else {
            console.log("[SUPERVISOR_ACTIONS] Single assignment to app ID:", taskData.internship_id);

            // Try structured first
            let { data: app } = await supabaseAdmin
                .from("internship_applications")
                .select("id, internship_id, student_id")
                .eq("id", taskData.internship_id)
                .maybeSingle();

            if (!app) {
                const { data: legacyApp } = await supabaseAdmin
                    .from("Applications")
                    .select("id, internship_id, program_id, student_id")
                    .eq("id", taskData.internship_id)
                    .maybeSingle();
                app = legacyApp;
            }

            if (!app) {
                console.error("[SUPERVISOR_ACTIONS] Application not found:", taskData.internship_id);
                return { success: false, error: "Target intern record not found." };
            }

            // IMPORTANT: The student workspace fetches tasks by profile.id (student_profiles table UUID).
            // Legacy internship_applications stores AUTH_ID, while unified Applications stores PROFILE_ID.
            // We must resolve to PROFILE_ID regardless.
            let studentProfileId = app.student_id;
            const { data: profileCheck } = await supabaseAdmin
                .from("student_profiles")
                .select("id, user_id, full_name, email")
                .or(`id.eq.${app.student_id},user_id.eq.${app.student_id}`)
                .maybeSingle();
            
            if (profileCheck) {
                studentProfileId = profileCheck.id;
            }

            tasksToCreate = [{
                internship_id: app.internship_id || app.program_id,
                student_id: studentProfileId,
                ...taskPayload
            }];

            if (profileCheck) recipients.push(profileCheck);
        }

        console.log(`[SUPERVISOR_ACTIONS] Attempting to insert ${tasksToCreate.length} tasks`);
        const { data, error } = await supabaseAdmin
            .from("internship_tasks")
            .insert(tasksToCreate)
            .select();

        if (error) {
            console.error("[SUPERVISOR_ACTIONS] Database error creating task:", error);
            return { success: false, error: error.message };
        }

        console.log("[SUPERVISOR_ACTIONS] Tasks created successfully. Sending notifications...");

        // Send email, in-app notification, and push notification INDEPENDENTLY per recipient.
        // Each channel runs in its own try/catch so one failure doesn't block the others.
        await Promise.allSettled(recipients.map(async (recipient: any) => {
            let targetEmail = recipient.email;

            // Fallback: If email is missing in profile, fetch from Auth
            if (!targetEmail && recipient.user_id) {
                try {
                    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(recipient.user_id);
                    if (authUser?.user?.email) {
                        targetEmail = authUser.user.email;
                    }
                } catch (authErr) {
                    console.warn(`[SUPERVISOR_ACTIONS] Auth lookup failed for ${recipient.user_id}:`, authErr);
                }
            }

            console.log(`[SUPERVISOR_ACTIONS] Processing recipient: ${recipient.full_name} | email=${targetEmail || "NONE"} | user_id=${recipient.user_id}`);

            // 1. Gmail Notification (independent)
            if (targetEmail) {
                try {
                    await sendTaskAssignmentEmail({
                        email: targetEmail,
                        name: recipient.full_name,
                        taskTitle: taskData.title,
                        taskDescription: taskData.description,
                        dueDate: taskData.due_date,
                        priority: taskData.priority,
                        supervisorName: profile.full_name || "Supervisor"
                    });
                    console.log(`[SUPERVISOR_ACTIONS] ✅ Email sent to ${targetEmail}`);
                } catch (emailErr) {
                    console.error(`[SUPERVISOR_ACTIONS] ❌ Email FAILED for ${targetEmail}:`, emailErr);
                }
            } else {
                console.warn(`[SUPERVISOR_ACTIONS] ⚠️ No email found for ${recipient.full_name} (${recipient.user_id}), skipping email.`);
            }

            // 2. In-App Real-time Notification (independent)
            if (recipient.user_id) {
                try {
                    await createNotification({
                        userId: recipient.user_id,
                        title: "New Milestone Assigned 🚀",
                        message: `A new task "${taskData.title}" has been assigned to you by ${profile.full_name}.`,
                        type: "task_assigned",
                        referenceId: taskData.internship_id === "all" ? undefined : taskData.internship_id
                    });
                    console.log(`[SUPERVISOR_ACTIONS] ✅ In-app notification created for ${recipient.user_id}`);
                } catch (notifyErr) {
                    console.error(`[SUPERVISOR_ACTIONS] ❌ In-app notification FAILED for ${recipient.user_id}:`, notifyErr);
                }
            }

            // 3. Push Notification (independent)
            if (recipient.user_id) {
                try {
                    await sendPushNotification(recipient.user_id, {
                        title: "New Milestone Assigned 🚀",
                        body: `A new task "${taskData.title}" has been assigned to you by ${profile.full_name}.`,
                        url: "/student/workspace"
                    });
                    console.log(`[SUPERVISOR_ACTIONS] ✅ Push notification sent for ${recipient.user_id}`);
                } catch (pushErr) {
                    console.error(`[SUPERVISOR_ACTIONS] ❌ Push notification FAILED for ${recipient.user_id}:`, pushErr);
                }
            }
        }));
        console.log("[SUPERVISOR_ACTIONS] All notification channels processed.");

        revalidatePath("/supervisor");
        revalidatePath("/student/workspace");
        revalidatePath("/intern/workspace");

        return { success: true, count: data?.length || 0 };
    } catch (err: any) {
        console.error("[SUPERVISOR_ACTIONS] Unexpected error in assignInternshipTask:", err);
        return { success: false, error: err.message || "An internal server error occurred." };
    }
}

/**
 * Server Action to delete a task (supports bulk deletion for broadcast groups).
 */
export async function deleteInternshipTask(taskId: string, deleteAllGroup: boolean = false) {
    if (deleteAllGroup) {
        // Fetch the task first to get the fingerprint
        const { data: task } = await supabaseAdmin
            .from("internship_tasks")
            .select("*")
            .eq("id", taskId)
            .single();

        if (task) {
            // Use supabaseAdmin to ensure deletion bypasses RLS issues for supervisor
            const { error } = await supabaseAdmin
                .from("internship_tasks")
                .delete()
                .eq("title", task.title)
                .eq("description", task.description)
                .eq("supervisor_id", task.supervisor_id);

            if (error) {
                console.error("Error deleting task group:", error);
                return { success: false, error: error.message };
            }
        }
    } else {
        const { error } = await supabaseAdmin
            .from("internship_tasks")
            .delete()
            .eq("id", taskId);

        if (error) {
            console.error("Error deleting task:", error);
            return { success: false, error: error.message };
        }
    }

    revalidatePath("/supervisor");
    revalidatePath("/intern/workspace");
    return { success: true };
}

/**
 * Server Action to update a task.
 */
export async function updateInternshipTask(taskId: string, updates: Partial<{
    title: string;
    description: string;
    due_date: string;
    priority: string;
    status: string;
}>) {
    const supabase = await createServerActionClient();
    const { error } = await supabase
        .from("internship_tasks")
        .update(updates)
        .eq("id", taskId);

    if (error) {
        console.error("Error updating task:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/supervisor");
    return { success: true };
}

/**
 * Server Action to mark intern attendance.
 * Validates the time window (3pm to 12am).
 */
export async function markInternAttendance(studentId: string, internshipId: string, status: string = "present") {
    const now = new Date();
    const hour = now.getHours();

    // Check time window: 15:00 - 00:00 (3pm - 12am)
    if (hour < 15 && hour >= 0) {
        // Technically 12am to 3pm is restricted
        return { success: false, error: "Attendance can only be confirmed between 3:00 PM and Midnight." };
    }

    const supabase = await createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get supervisor profile
    const { data: profile } = await supabase
        .from("supervisor_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

    if (!profile) return { success: false, error: "Supervisor profile not found." };

    const today = now.toISOString().split("T")[0];

    const newLogEntry = {
        status,
        confirmed_at: now.toISOString(),
        supervisor_id: profile.id
    };

    // Try to get the existing record
    const { data: existingRecord } = await supabaseAdmin
        .from("intern_attendance_v2")
        .select("id, attendance_logs")
        .eq("student_id", studentId)
        .eq("internship_id", internshipId)
        .maybeSingle();

    let data, error;
    if (existingRecord) {
        // Append to existing logs
        const updatedLogs = { ...(existingRecord.attendance_logs as any), [today]: newLogEntry };
        const res = await supabaseAdmin
            .from("intern_attendance_v2")
            .update({ attendance_logs: updatedLogs })
            .eq("id", existingRecord.id)
            .select()
            .single();
        data = res.data;
        error = res.error;
    } else {
        // Create new row for this intern
        const res = await supabaseAdmin
            .from("intern_attendance_v2")
            .insert({
                student_id: studentId,
                internship_id: internshipId,
                supervisor_id: profile.id,
                attendance_logs: { [today]: newLogEntry }
            })
            .select()
            .single();
        data = res.data;
        error = res.error;
    }

    if (error) {
        console.error("Error marking attendance:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/supervisor");
    return { success: true, data };
}

/**
 * Server Action to submit attendance for multiple interns at once.
 */
export async function submitBatchAttendance(records: { studentId: string, internshipId: string, status: string }[]) {
    const now = new Date();
    const hour = now.getHours();

    // Check time window: 15:00 - 00:00 (3pm - 12am)
    if (hour < 15 && hour >= 0) {
        return { success: false, error: "Attendance can only be confirmed between 3:00 PM and Midnight." };
    }

    const supabase = await createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get supervisor profile
    const { data: profile } = await supabase
        .from("supervisor_profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

    if (!profile) return { success: false, error: "Supervisor profile not found." };

    const today = now.toISOString().split("T")[0];

    // Fetch all existing v2 records for these students in this internship
    const studentIds = records.map(r => r.studentId);
    const internshipId = records[0]?.internshipId; // assuming batch is same internship
    
    if (!internshipId) return { success: false, error: "No internship ID found in batch" };

    const { data: existingRecords } = await supabaseAdmin
        .from("intern_attendance_v2")
        .select("id, student_id, attendance_logs")
        .in("student_id", studentIds)
        .eq("internship_id", internshipId);

    const existingMap = new Map((existingRecords || []).map(r => [r.student_id, r]));
    let successCount = 0;

    for (const record of records) {
        const newLogEntry = {
            status: record.status,
            confirmed_at: now.toISOString(),
            supervisor_id: profile.id
        };

        const existing = existingMap.get(record.studentId);
        if (existing) {
            const updatedLogs = { ...(existing.attendance_logs as any), [today]: newLogEntry };
            const { error } = await supabaseAdmin
                .from("intern_attendance_v2")
                .update({ attendance_logs: updatedLogs })
                .eq("id", existing.id);
            if (!error) successCount++;
        } else {
            const { error } = await supabaseAdmin
                .from("intern_attendance_v2")
                .insert({
                    student_id: record.studentId,
                    internship_id: record.internshipId,
                    supervisor_id: profile.id,
                    attendance_logs: { [today]: newLogEntry }
                });
            if (!error) successCount++;
        }
    }

    return { success: true, count: successCount };
}

/**
 * Server Action for supervisors to review and update logs.
 */
export async function reviewInternshipLog(logId: string, status: "approved" | "rejected", feedback?: string) {
    const { data, error } = await supabaseAdmin
        .from("intern_logs")
        .update({
            status,
            supervisor_feedback: feedback
        })
        .eq("id", logId)
        .select();

    if (error) {
        console.error("Error reviewing log:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/supervisor");
    revalidatePath("/intern/workspace");

    // Add Real-time Notification for Student
    try {
        const { data: logData } = await supabaseAdmin
            .from("intern_logs")
            .select("student_id, log_date")
            .eq("id", logId)
            .single();

        if (logData) {
            await createNotification({
                userId: logData.student_id,
                title: status === "approved" ? "Report Approved ✅" : "Report Rejected ❌",
                message: `Your report for ${logData.log_date} has been ${status}. ${feedback ? `Feedback: ${feedback}` : ""}`,
                type: "log_reviewed",
                referenceId: logId
            });

            await sendPushNotification(logData.student_id, {
                title: status === "approved" ? "Report Approved ✅" : "Report Rejected ❌",
                body: `Your report for ${logData.log_date} has been ${status}. ${feedback ? `Feedback: ${feedback}` : ""}`,
                url: "/student/workspace"
            });
        }
    } catch (notifyErr) {
        console.error("Failed to skip notify student about log review:", notifyErr);
    }

    return { success: true, data };
}

/**
 * Server Action to mark an internship log as read by the supervisor.
 */
export async function markLogAsRead(logId: string) {
    const { data, error } = await supabaseAdmin
        .from("intern_logs")
        .update({ read_at: new Date().toISOString() })
        .eq("id", logId)
        .is("read_at", null) // Only update if not already read
        .select();

    if (error) {
        console.error("Error marking log as read:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/supervisor");
    return { success: true, data };
}

/**
 * Search for users.
 */
export async function searchEligibleUsers(searchTerm: string) {
    const { data, error } = await supabaseAdmin
        .from("student_profiles")
        .select("user_id, full_name, email, avatar_url")
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(15);

    if (error) {
        console.error("Error searching users:", error);
        return [];
    }

    // Mark existing supervisors
    const { data: supervisors } = await supabaseAdmin
        .from("supervisor_profiles")
        .select("user_id");

    const supervisorIds = new Set(supervisors?.map(s => s.user_id) || []);

    return data.filter(u => !supervisorIds.has(u.user_id)) || [];
}

/**
 * Get all supervisors with stats. Optimized for resiliency.
 */
export async function getSupervisorsWithStats(companyId?: string) {
    const supervisors = await getSupervisors(companyId);

    if (!supervisors || supervisors.length === 0) return [];

    // Fetch counts manually to be ultra-safe against complex joins
    const { data: counts } = await supabaseAdmin
        .from("internship_applications")
        .select("supervisor_id");

    const statsMap = (counts || []).reduce((acc: any, curr) => {
        if (curr.supervisor_id) {
            acc[curr.supervisor_id] = (acc[curr.supervisor_id] || 0) + 1;
        }
        return acc;
    }, {});

    return supervisors.map(s => ({
        ...s,
        assigned_interns: [{ count: statsMap[s.id] || 0 }]
    }));
}

/**
 * Update supervisor profile.
 * SECURITY: Verifies caller owns the company before allowing updates.
 */
export async function updateSupervisorProfile(
    supervisorId: string,
    updates: {
        full_name?: string;
        bio?: string;
        field_expertise?: string[];
        whatsapp?: string;
        department?: string;
    }
) {
    // SECURITY: Get the caller's company
    const supabase = await createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: companyProfile } = await supabaseAdmin
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!companyProfile) {
        return { success: false, error: "Only company administrators can update supervisors." };
    }

    // SECURITY: Verify the supervisor belongs to the caller's company
    const { data: supervisor } = await supabaseAdmin
        .from("supervisor_profiles")
        .select("company_id")
        .eq("id", supervisorId)
        .single();

    if (!supervisor || supervisor.company_id !== companyProfile.id) {
        console.warn(`[SECURITY] User ${user.id} attempted to update supervisor ${supervisorId} from company ${supervisor?.company_id}`);
        return { success: false, error: "You can only update supervisors from your own company." };
    }

    const { data, error } = await supabaseAdmin
        .from("supervisor_profiles")
        .update(updates)
        .eq("id", supervisorId)
        .select()
        .single();

    if (error) {
        console.error("Error updating supervisor:", error);
        return { success: false, error: error.message };
    }

    // --- BULK ASSIGNMENT BY DEPARTMENT ---
    // If department was updated, automatically assign existing interns in that domain
    if (updates.department && updates.department !== "none") {
        console.log(`[BULK_ASSIGN] Re-linking interns in domain "${updates.department}" to supervisor ${supervisorId}`);

        // 1. Fetch internship IDs for this company to filter internship_applications
        const { data: internships } = await supabaseAdmin
            .from("internships")
            .select("id")
            .eq("company_id", companyProfile.id);

        const internshipIds = internships?.map(i => i.id) || [];

        if (internshipIds.length > 0) {
            const { error: bulkError } = await supabaseAdmin
                .from("internship_applications")
                .update({ supervisor_id: supervisorId })
                .in("internship_id", internshipIds)
                .filter("domain", "ilike", updates.department)
                .eq("status", "accepted");

            if (bulkError) console.error("[BULK_ASSIGN] Error during internship_applications update:", bulkError);
        }

        // 2. Legacy table update (Uses company_id and department column)
        try {
            await supabaseAdmin
                .from("Applications")
                .update({ supervisor_id: supervisorId })
                .eq("company_id", companyProfile.id)
                .filter("department", "ilike", updates.department)
                .eq("status", "accepted");
        } catch (e) {
            // Legacy table might not support this or not exist
        }
    }

    revalidatePath("/admin/supervisors");
    revalidatePath("/admin/interns");
    revalidatePath("/admin/applicants");
    revalidatePath("/intern/workspace");

    return { success: true, data };
}

/**
 * Remove supervisor status.
 * SECURITY: Verifies caller owns the company before allowing deletion.
 */
export async function removeSupervisor(supervisorId: string) {
    // SECURITY: Get the caller's company
    const supabase = await createServerActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: companyProfile } = await supabaseAdmin
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!companyProfile) {
        return { success: false, error: "Only company administrators can remove supervisors." };
    }

    // SECURITY: Verify the supervisor belongs to the caller's company
    const { data: supervisor } = await supabaseAdmin
        .from("supervisor_profiles")
        .select("company_id")
        .eq("id", supervisorId)
        .single();

    if (!supervisor || supervisor.company_id !== companyProfile.id) {
        console.warn(`[SECURITY] User ${user.id} attempted to remove supervisor ${supervisorId} from company ${supervisor?.company_id}`);
        return { success: false, error: "You can only remove supervisors from your own company." };
    }

    // Unassign supervisor from all applications
    await supabaseAdmin
        .from("internship_applications")
        .update({ supervisor_id: null })
        .eq("supervisor_id", supervisorId);

    const { error } = await supabaseAdmin
        .from("supervisor_profiles")
        .delete()
        .eq("id", supervisorId);

    if (error) {
        console.error("Error removing supervisor:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/supervisors");
    revalidatePath("/admin/interns");
    revalidatePath("/admin/applicants");

    return { success: true };
}

/**
 * Promote a user to supervisor.
 * SECURITY: Verifies caller is authorized for the target company.
 */
export async function promoteToSupervisor(userData: any) {
    try {
        // Robustness: If email is missing, fetch from Auth
        let targetEmail = userData.email;
        if (!targetEmail && userData.user_id) {
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userData.user_id);
            if (authUser?.user?.email) {
                targetEmail = authUser.user.email;
            }
        }

        console.log(`[PROMOTE] Attempting to promote ${targetEmail || "unknown"} (ID: ${userData.user_id}) to supervisor...`);

        // SECURITY: Get the caller's company
        const supabase = await createServerActionClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { data: companyProfile } = await supabaseAdmin
            .from("company_profiles")
            .select("id, company_name")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!companyProfile) {
            return { success: false, error: "Only company administrators can add supervisors." };
        }

        // SECURITY: Force the company_id to be the caller's company
        // This prevents any attempt to add a supervisor to another company
        if (userData.company_id && userData.company_id !== companyProfile.id) {
            console.warn(`[SECURITY] User ${user.id} tried to add supervisor to company ${userData.company_id} but owns ${companyProfile.id}`);
        }

        const secureUserData = {
            ...userData,
            email: targetEmail, // Use the resolved email
            company_id: companyProfile.id // Force to caller's company
        };

        // Insert the supervisor
        const { data, error } = await supabaseAdmin
            .from("supervisor_profiles")
            .insert([secureUserData])
            .select()
            .single();

        if (error) {
            // Fallback: If company_id col is missing, insert without it
            if (error.code === '42703' || error.code === 'PGRST204' || error.message.includes('company_id')) {
                console.warn("[PROMOTE] company_id column missing. Retrying without it.");
                const { company_id, ...baseData } = secureUserData;
                const { data: retryData, error: retryError } = await supabaseAdmin
                    .from("supervisor_profiles")
                    .insert([baseData])
                    .select()
                    .single();

                if (retryError) return { success: false, error: retryError.message };
                return { success: true, data: retryData };
            }
            return { success: false, error: error.message };
        }

        // --- BULK ASSIGNMENT BY DEPARTMENT (Initial Creation) ---
        if (secureUserData.department && secureUserData.department !== "none") {
            console.log(`[BULK_ASSIGN] Initial linking for new supervisor ${data.id} in domain "${secureUserData.department}"`);

            // 1. Fetch internship IDs for this company
            const { data: internships } = await supabaseAdmin
                .from("internships")
                .select("id")
                .eq("company_id", companyProfile.id);

            const internshipIds = internships?.map(i => i.id) || [];

            if (internshipIds.length > 0) {
                await supabaseAdmin
                    .from("internship_applications")
                    .update({ supervisor_id: data.id })
                    .in("internship_id", internshipIds)
                    .filter("domain", "ilike", secureUserData.department)
                    .eq("status", "accepted");
            }

            // 2. Legacy legacy fallback (Uses company_id and department)
            try {
                await supabaseAdmin
                    .from("Applications")
                    .update({ supervisor_id: data.id })
                    .eq("company_id", companyProfile.id)
                    .filter("department", "ilike", secureUserData.department)
                    .eq("status", "accepted");
            } catch (e) { }
        }

        // Send Premium Welcome Email
        try {
            await sendSupervisorWelcomeEmail({
                email: userData.email,
                name: userData.full_name,
                companyName: companyProfile.company_name || "Zigex Partner",
                dashboardLink: "https://zigexconnect.com/supervisor"
            });
            console.log(`[EMAIL] Premium Supervisor welcome sent to ${userData.email}`);
        } catch (emailErr) {
            console.error("Welcome email failed:", emailErr);
        }

        revalidatePath("/admin/supervisors");
        revalidatePath("/admin/interns");
        revalidatePath("/admin/applicants");

        return { success: true, data };
    } catch (err: any) {
        console.error("Promotion failed:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Server Action to submit a weekly evaluation for an intern.
 */
export async function submitWeeklyEvaluation(evaluationData: {
    id?: string;
    internship_id: string;
    student_id: string;
    rating: number;
    feedback: string;
}) {
    try {
        const supabase = await createServerActionClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: "Unauthorized" };

        // Get supervisor profile
        const { data: profile } = await supabase
            .from("supervisor_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!profile) return { success: false, error: "Supervisor profile not found." };

        // Word count check (at least 8 words)
        const wordCount = evaluationData.feedback.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < 8) {
            return { success: false, error: `Feedback must be at least 8 words. You have ${wordCount} words.` };
        }

        // 1. Strict Weekly Throttling Check
        // We find the LATEST evaluation for this student/supervisor pair
        const { data: latestEvals } = await supabase
            .from("intern_evaluations")
            .select("*")
            .eq("student_id", evaluationData.student_id)
            .eq("supervisor_id", profile.id)
            .order("evaluation_date", { ascending: false })
            .limit(1);

        const lastEval = latestEvals?.[0];
        const now = new Date();

        if (lastEval) {
            const lastDate = new Date(lastEval.evaluation_date);
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If a record exists and it's within the 7-day window, 
            // the user MUST provide an ID to update, otherwise they are blocked from creating a new one.
            if (diffDays <= 7 && !evaluationData.id) {
                return {
                    success: false,
                    error: "WEEKLY_LIMIT_REACHED",
                    existingEval: lastEval,
                    message: `Weekly limit reached. You posted on ${lastEval.evaluation_date}. You can edit that feedback, but you can only create a new weekly record once every 7 days.`
                };
            }
        }

        let result;
        if (evaluationData.id) {
            // UPDATING existing feedback
            // We DON'T update the evaluation_date to keep the 7-day window relative to the original post
            result = await supabase
                .from("intern_evaluations")
                .update({
                    overall_rating: evaluationData.rating,
                    comments: evaluationData.feedback
                })
                .eq("id", evaluationData.id)
                .select()
                .single();
        } else {
            // CREATING new feedback
            result = await supabase
                .from("intern_evaluations")
                .insert([{
                    internship_id: evaluationData.internship_id,
                    student_id: evaluationData.student_id,
                    supervisor_id: profile.id,
                    overall_rating: evaluationData.rating,
                    comments: evaluationData.feedback,
                    evaluation_date: now.toISOString().split('T')[0]
                }])
                .select()
                .single();
        }

        if (result.error) {
            console.error("Error submitting evaluation:", result.error);
            return { success: false, error: result.error.message };
        }

        revalidatePath("/supervisor");
        revalidatePath("/intern/workspace");

        // Add Real-time Notification for Student
        try {
            await createNotification({
                userId: evaluationData.student_id,
                title: evaluationData.id ? "Evaluation Updated 📈" : "New Weekly Evaluation 📈",
                message: `Your supervisor has ${evaluationData.id ? "updated your" : "submitted a new"} weekly evaluation. Overall Rating: ${evaluationData.rating}/5.`,
                type: "evaluation_submitted",
                referenceId: evaluationData.internship_id
            });
        } catch (notifyErr) {
            console.error("Failed to notify student about evaluation:", notifyErr);
        }

        return { success: true, data: result.data };
    } catch (err: any) {
        console.error("Critical error in submitWeeklyEvaluation:", err);
        return { success: false, error: err.message };
    }
}
