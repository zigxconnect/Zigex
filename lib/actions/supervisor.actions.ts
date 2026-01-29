"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail, sendSupervisorWelcomeEmail, sendSupervisorAssignmentEmail } from "@/lib/email";

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
        const studentUserIds = rawApps.map(app => app.student_id || app.user_id).filter(Boolean);
        let studentProfiles: any[] = [];

        if (studentUserIds.length > 0) {
            const { data: profiles } = await supabaseAdmin
                .from("student_profiles")
                .select("id, user_id, full_name, avatar_url")
                .in("user_id", studentUserIds);
            studentProfiles = profiles || [];
        }

        // Map them together
        const interns = rawApps.map(app => {
            const student = studentProfiles.find(p => p.user_id === (app.student_id || app.user_id));
            return {
                ...app,
                // Ensure internship info is present even if join failed
                internship: app.internship || { id: app.internship_id, title: "Internship Program" },
                student: student || {
                    full_name: app.full_name || "New Intern",
                    user_id: app.student_id || app.user_id,
                    avatar_url: "/default-avatar.svg"
                }
            };
        });

        const internUserIds = studentUserIds as string[];

        // Get recent logs for these interns
        let recentLogs: any[] = [];
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
            }
        }

        // Fetch Tasks (Linked by Internship ID)
        const internshipIds = rawApps.map(i => i.internship_id).filter(Boolean);
        const { data: tasks } = await supabaseAdmin
            .from("internship_tasks")
            .select("*")
            .in("internship_id", internshipIds)
            .order("created_at", { ascending: false });

        // Fetch Today's Attendance
        const today = new Date().toISOString().split("T")[0];
        const [attendanceRes, evaluationsRes] = await Promise.all([
            supabaseAdmin
                .from("intern_attendance")
                .select("*")
                .eq("attendance_date", today)
                .eq("supervisor_id", profile.id),

            // Fetch recent evaluations
            supabaseAdmin
                .from("intern_evaluations")
                .select("*")
                .eq("supervisor_id", profile.id)
                .order("created_at", { ascending: false })
        ]);

        const attendance = attendanceRes.data || [];
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
import { sendTaskAssignmentEmail } from "../mail";

export async function assignInternshipTask(taskData: {
    internship_id: string; // can be "all" or specific application ID
    title: string;
    description: string;
    due_date?: string;
    priority?: string;
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
            supervisor_id: profile.id
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
                    .select("id, internship_id, student_id")
                    .eq("supervisor_id", profile.id)
                    .eq("status", "accepted")
            ]);

            const allApps = [...(structRes.data || []), ...(legacyRes.data || [])];
            console.log(`[SUPERVISOR_ACTIONS] Found ${allApps.length} total applications`);

            if (allApps.length === 0) {
                console.warn("[SUPERVISOR_ACTIONS] No active interns found for supervisor", profile.id);
                return { success: false, error: "No active interns found." };
            }

            // 3. Manual Join for Student Profiles
            const studentIds = allApps.map(i => i.student_id).filter(Boolean);
            let studentProfiles: any[] = [];
            if (studentIds.length > 0) {
                const { data: profiles } = await supabaseAdmin
                    .from("student_profiles")
                    .select("user_id, full_name, email")
                    .in("user_id", studentIds);
                studentProfiles = profiles || [];
            }

            // 4. Map Applications to Students & Deduplicate
            const uniqueTasksMap = new Map();
            const uniqueRecipientsMap = new Map();

            allApps.forEach(app => {
                const student = studentProfiles.find(p => p.user_id === app.student_id);
                if (student) {
                    // Task deduplication by student_id
                    if (!uniqueTasksMap.has(app.student_id)) {
                        uniqueTasksMap.set(app.student_id, {
                            internship_id: app.internship_id,
                            student_id: app.student_id,
                            ...taskPayload
                        });
                    }
                    // Email deduplication
                    if (student.email && !uniqueRecipientsMap.has(student.email)) {
                        uniqueRecipientsMap.set(student.email, student);
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

            // Try legacy if not found
            if (!app) {
                const { data: legacyApp } = await supabaseAdmin
                    .from("Applications")
                    .select("id, internship_id, student_id")
                    .eq("id", taskData.internship_id)
                    .maybeSingle();
                app = legacyApp;
            }

            if (!app) {
                console.error("[SUPERVISOR_ACTIONS] Application not found:", taskData.internship_id);
                return { success: false, error: "Target intern record not found." };
            }

            // Fetch student profile manually
            const { data: student } = await supabaseAdmin
                .from("student_profiles")
                .select("user_id, full_name, email")
                .eq("user_id", app.student_id)
                .maybeSingle();

            tasksToCreate = [{
                internship_id: app.internship_id,
                student_id: app.student_id,
                ...taskPayload
            }];

            if (student) recipients.push(student);
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

        console.log("[SUPERVISOR_ACTIONS] Tasks created successfully. Sending emails...");

        // Fire and forget email sending with individual catch
        Promise.all(recipients.map(recipient => {
            if (!recipient.email) return Promise.resolve();
            return sendTaskAssignmentEmail({
                email: recipient.email,
                name: recipient.full_name,
                taskTitle: taskData.title,
                taskDescription: taskData.description,
                dueDate: taskData.due_date,
                priority: taskData.priority,
                supervisorName: profile.full_name || "Supervisor"
            }).catch(e => console.error(`[SUPERVISOR_ACTIONS] Email failed for ${recipient.email}`, e));
        }));

        revalidatePath("/supervisor");
        revalidatePath("/intern/workspace");

        return { success: true, count: data?.length || 0 };
    } catch (err: any) {
        console.error("[SUPERVISOR_ACTIONS] Unexpected error in assignInternshipTask:", err);
        return { success: false, error: err.message || "An internal server error occurred." };
    }
}

/**
 * Server Action to delete a task.
 */
export async function deleteInternshipTask(taskId: string) {
    const supabase = await createServerActionClient();
    const { error } = await supabase
        .from("internship_tasks")
        .delete()
        .eq("id", taskId);

    if (error) {
        console.error("Error deleting task:", error);
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

    const { data, error } = await supabase
        .from("intern_attendance")
        .upsert({
            student_id: studentId,
            internship_id: internshipId,
            supervisor_id: profile.id,
            attendance_date: today,
            status,
            confirmed_at: now.toISOString()
        })
        .select()
        .single();

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

    const attendanceData = records.map(r => ({
        student_id: r.studentId,
        internship_id: r.internshipId,
        supervisor_id: profile.id,
        attendance_date: today,
        status: r.status,
        confirmed_at: now.toISOString()
    }));

    const { data, error } = await supabase
        .from("intern_attendance")
        .upsert(attendanceData, { onConflict: 'student_id,attendance_date' })
        .select();

    if (error) {
        console.error("Error submitting batch attendance:", JSON.stringify(error, null, 2));
        return { success: false, error: error.message || "Unknown error occurred" };
    }

    revalidatePath("/supervisor");
    revalidatePath("/admin/interns");
    return { success: true, count: data?.length || 0 };
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
        return { success: true, data: result.data };
    } catch (err: any) {
        console.error("Critical error in submitWeeklyEvaluation:", err);
        return { success: false, error: err.message };
    }
}
