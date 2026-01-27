"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail, sendSupervisorWelcomeEmail } from "@/lib/email";

/**
 * Fetches all supervisors. 
 * This version is ULTRA-RESILIENT: It fetches everything and filters in JS if needed
 * to avoid any Postgres column errors (like missing company_id).
 */
export async function getSupervisors(companyId?: string) {
    try {
        console.log(`[SERVER_ACTION] getSupervisors called. CompanyId: ${companyId}`);

        // 1. Fetch EVERYTHING first - this avoids any "column missing" errors in the query itself
        // unless the basic table is missing.
        const { data, error } = await supabaseAdmin
            .from("supervisor_profiles")
            .select("*");

        if (error) {
            console.error("[SERVER_ACTION] Error fetching all supervisors:", error);
            return [];
        }

        if (!data || data.length === 0) {
            console.log("[SERVER_ACTION] No supervisors found in database.");
            return [];
        }

        console.log(`[SERVER_ACTION] Found ${data.length} total supervisors.`);

        // 2. Filter in Javascript if company_id is provided AND if it exists in the data
        if (companyId && companyId !== "" && companyId !== "undefined") {
            // Check if ANY record has company_id
            const hasCompanyColumn = data.some(s => s.hasOwnProperty('company_id'));

            if (hasCompanyColumn) {
                const filtered = data.filter(s => String(s.company_id) === String(companyId));
                console.log(`[SERVER_ACTION] Filtered to ${filtered.length} supervisors for company ${companyId}`);
                // If we found specific ones for the company, return them.
                // Otherwise, return ALL as a fallback to ensure the list is never empty during setup.
                return filtered.length > 0 ? filtered : data;
            }
        }

        return data;
    } catch (err) {
        console.error("[SERVER_ACTION] Critical error in getSupervisors:", err);
        return [];
    }
}

/**
 * Assigns a supervisor to an internship application and sends a notification email.
 */
export async function assignSupervisor(applicationId: string, supervisorId: string) {
    try {
        // 1. Fetch application details to get company and program info
        const { data: appData } = await supabaseAdmin
            .from("internship_applications")
            .select(`
                id,
                internships (
                    title,
                    company_profiles (company_name)
                ),
                student:student_profiles(full_name)
            `)
            .eq("id", applicationId)
            .single();

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
            const internship = (appData.internships as any);
            const companyName = internship?.company_profiles?.company_name || "Zigex Partner";
            const programTitle = internship?.title || "Internship Program";
            const studentName = (appData.student as any)?.full_name || "a newer learner";

            try {
                await sendEmail({
                    to: supervisor.email,
                    subject: `📋 New Student Assignment: ${studentName}`,
                    heading: `Hello ${supervisor.full_name.split(' ')[0]}!`,
                    message: `You have been assigned as the official supervisor for **${studentName}** in the "**${programTitle}**" program by **${companyName}** on the Zigex platform.\n\nYou can now track their progress, review their daily logs, and provide guidance throughout their journey.`,
                    ctaText: "View My Students",
                    ctaLink: "https://zigexconnect.com/supervisor",
                    statusBadge: "New Assignment",
                    statusColor: "#10B981",
                    opportunityTitle: programTitle,
                    companyName: companyName
                });
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

        // 1. Try finding by User ID
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

        console.log(`[SUPERVISOR_HUB] Access granted to ${profile.full_name}`);

        // Get assigned interns (accepted applications)
        const { data: interns } = await supabaseAdmin
            .from("internship_applications")
            .select(`
          id,
          status,
          created_at,
          internship:internships(id, title),
          student:student_profiles(id, user_id, full_name, avatar_url)
        `)
            .eq("supervisor_id", profile.id)
            .eq("status", "accepted");

        // Get recent logs for these interns
        const internUserIds = interns?.map(i => {
            const student = Array.isArray(i.student) ? i.student[0] : i.student;
            return student?.user_id;
        }).filter(Boolean) as string[] || [];

        let recentLogs = [];
        if (internUserIds.length > 0) {
            const { data } = await supabaseAdmin
                .from("intern_logs")
                .select(`
              *,
              student:student_profiles(full_name, avatar_url)
            `)
                .in("student_id", internUserIds)
                .order("log_date", { ascending: false })
                .limit(20);
            recentLogs = data || [];
        }

        return {
            profile,
            interns: interns || [],
            recentLogs: recentLogs
        };
    } catch (err) {
        console.error("[SUPERVISOR_HUB] Unexpected runtime error:", err);
        return null;
    }
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
 */
export async function updateSupervisorProfile(
    supervisorId: string,
    updates: {
        full_name?: string;
        bio?: string;
        field_expertise?: string[];
        whatsapp?: string;
    }
) {
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

    revalidatePath("/admin/supervisors");
    revalidatePath("/admin/interns");
    revalidatePath("/admin/applicants");
    revalidatePath("/intern/workspace");

    return { success: true, data };
}

/**
 * Remove supervisor status.
 */
export async function removeSupervisor(supervisorId: string) {
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
 */
export async function promoteToSupervisor(userData: any) {
    try {
        console.log(`[PROMOTE] Attempting to promote ${userData.email} to supervisor...`);

        // Use a safe approach: Check if company_id should being included
        const { company_id, ...baseData } = userData;

        // Try with company_id first
        const { data, error } = await supabaseAdmin
            .from("supervisor_profiles")
            .insert([userData])
            .select()
            .single();

        if (error) {
            // Fallback: If company_id col is missing, insert without it
            if (error.code === '42703' || error.code === 'PGRST204' || error.message.includes('company_id')) {
                console.warn("[PROMOTE] company_id column missing. Retrying without it.");
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

        // Fetch Company Name for context
        let companyName = "Zigex Partner";
        if (userData.company_id) {
            const { data: company } = await supabaseAdmin
                .from("company_profiles")
                .select("company_name")
                .eq("id", userData.company_id)
                .single();
            if (company?.company_name) {
                companyName = company.company_name;
            }
        }

        // Send Premium Welcome Email
        try {
            await sendSupervisorWelcomeEmail({
                email: userData.email,
                name: userData.full_name,
                companyName: companyName,
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
