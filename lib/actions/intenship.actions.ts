"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendReportSubmissionEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { sendPushNotification } from "@/lib/push";

/**
 * Server Action to fetch a list of all published internships for the dashboard.
 * It joins with company profiles and "flattens" the data for easy use in components.
 */
export async function getDashboardInternships() {
  const supabase = await createServerActionClient();

  const { data, error } = await supabase
    .from("internships")
    .select(
      `
        id,
        title,
        location,
        type,
        category,
        company_profiles (
          company_name,
          logo_url,
          cover_image_url 
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching internships:", error);
    return [];
  }

  const flattenedData = data.map((internship) => ({
    id: internship.id,
    title: internship.title,
    location: internship.location,
    type: internship.type,
    category: internship.category,
    company: (internship.company_profiles as any)?.company_name || "Confidential",
    logoColor: "#1E3A8A",

    cover_image_url:
      (internship.company_profiles as any)?.cover_image_url || "/placeholder-cover.jpg",
  }));

  return flattenedData;
}

/**
 * NEW: Server Action to fetch the complete details of a single internship by its ID.
 * This is used for the internship details page.
 */
export async function getInternshipById(id: string) {
  const supabase = await createServerActionClient();

  const { data, error } = await supabase
    .from("internships")
    .select(`*, company_profiles (*)`)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(`Error fetching internship ID ${id}:`, error);
    notFound();
  }

  return data;
}

/**
 * NEW: Server Action to fetch all accepted internships for the student.
 * Used for the selection screen when multiple internships are active.
 */
export async function getAcceptedInternships() {
  const supabase = await createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // First get the student profile
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    console.warn(`[getAcceptedInternships] No student profile found for user ${user.id}`);
    return [];
  }

  // Try fetching from Applications (which supports internship, program, event)
  const { data: appData, error: appError } = await supabase
    .from("Applications")
    .select(`
      id,
      internship_id,
      program_id,
      event_id,
      application_type,
      status,
      internships (
        id, title, location, company_id, company_profiles ( id, company_name, logo_url )
      ),
      programs (
        id, title, location, company_id, company_profiles ( id, company_name, logo_url )
      ),
      event (
        id, title, location, company_id, company_profiles ( id, company_name, logo_url )
      )
    `)
    .eq("student_id", profile.id)
    .in("status", ["accepted", "rsvp_confirmed"])
    .order("created_at", { ascending: false });

  if (appError) {
    console.error("[getAcceptedInternships] Applications query failed:", appError.message);
  }

  let allAccepted: any[] = [];
  if (appData && appData.length > 0) {
    allAccepted = [...appData];
  }

  // Also fetch from legacy internship_applications
  // NOTE: internship_applications uses auth user.id as student_id (NOT student_profiles.id)
  const { data: legacyData, error: legacyError } = await supabase
    .from("internship_applications")
    .select(`
      id,
      internship_id,
      domain,
      status,
      created_at,
      internships (
        id, title, location, company_id, company_profiles ( id, company_name, logo_url )
      )
    `)
    .eq("student_id", user.id)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (legacyData && legacyData.length > 0) {
    // map legacy to standard format
    const legacyMapped = legacyData.map((leg: any) => ({
      ...leg,
      application_type: "internship"
    }));
    // Remove duplicates based on internship_id if any (unlikely but safe)
    const existingInternshipIds = new Set(allAccepted.map(a => a.internship_id).filter(Boolean));
    for (const leg of legacyMapped) {
      if (leg.internship_id && !existingInternshipIds.has(leg.internship_id)) {
        allAccepted.push(leg);
      }
    }
  }

  // Ensure application_type is consistent (lowercase) and handles missing programs/events
  const finalData = allAccepted.map(app => {
    const type = (app.application_type || "internship").toLowerCase();
    return {
      ...app,
      application_type: type
    };
  });

  console.log(`[getAcceptedInternships] Found ${finalData.length} placements for user ${user.id}`);
  return finalData;
}

/**
 * NEW: Server Action to fetch the complete workspace data for an intern.
 * Fetches application, supervisor, curriculum, logs, and tasks.
 */
export async function getInternshipWorkspaceData(applicationId?: string) {
  const supabase = await createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get the student profile
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("id, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return null;

  // 1. Get the internship application
  let application = null;
  let appError = null;

  // First try the unified Applications table
  let query = supabase
    .from("Applications")
    .select(`
      *,
      internships (*, company_profiles (*)),
      programs (*, company_profiles (*)),
      event (*, company_profiles (*)),
      supervisor_profiles (*)
    `)
    .eq("student_id", profile.id)
    .in("status", ["accepted", "rsvp_confirmed"]);

  if (applicationId) {
    query = query.eq("id", applicationId);
  } else {
    query = query.order("created_at", { ascending: false }).limit(1);
  }

  const { data: appData, error: appErr1 } = await query.maybeSingle();

  if (appData) {
    application = appData;
  } else {
    // Fallback to legacy table if not found
    // NOTE: internship_applications uses auth user.id as student_id (NOT student_profiles.id)
    let legacyQuery = supabase
      .from("internship_applications")
      .select(`
        *,
        internships (*, company_profiles (*)),
        supervisor_profiles (*)
      `)
      .eq("student_id", user.id)
      .eq("status", "accepted");

    if (applicationId) {
      legacyQuery = legacyQuery.eq("id", applicationId);
    } else {
      legacyQuery = legacyQuery.order("created_at", { ascending: false }).limit(1);
    }

    const { data: legacyData, error: legacyErr } = await legacyQuery.single();
    if (legacyData) {
      application = { ...legacyData, application_type: "internship" };
    } else {
      appError = legacyErr;
    }
  }

  if (!application) {
    console.warn(`[Workspace] No active application found for user ${user.id} with ID ${applicationId || 'latest'}`);
    return null;
  }

  // Normalize application_type
  application.application_type = (application.application_type || "internship").toLowerCase();

  // Get the normalized parent ref depending on type
  let referenceId = application.internship_id;
  if (application.application_type === "program") referenceId = application.program_id;
  if (application.application_type === "event") referenceId = application.event_id;

  if (!referenceId) {
    console.warn(`[Workspace] Application ${application.id} has no reference ID for type ${application.application_type}`);
    // If it's a legacy application, it might be solely linked via internship_id
    referenceId = application.internship_id;
  }

  // Derive companyId early so announcement query can run in parallel
  let companyId = application.internships?.company_id;
  if (!companyId && application.programs?.company_id) companyId = application.programs.company_id;
  if (!companyId && application.event?.company_id) companyId = application.event.company_id;

  // Build announcement query (needs companyId)
  let announcementQuery = supabase
    .from("announcements")
    .select("id, title, content, author_id, company_id, is_pinned, created_at, updated_at")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (companyId) {
    announcementQuery = announcementQuery.or(`company_id.is.null,company_id.eq.${companyId}`);
  } else {
    announcementQuery = announcementQuery.is("company_id", null);
  }

  // PERF: Run all independent queries in parallel (was sequential — ~5 round trips → ~1)
  const [
    { data: curriculum },
    { data: logs },
    { data: tasks },
    { data: notes },
    { data: rawAnnouncements },
    { data: readRecords },
  ] = await Promise.all([
    // 2. Curriculum
    supabase
      .from("internship_curriculum")
      .select("*")
      .eq("internship_id", referenceId)
      .order("week_number", { ascending: true }),
    // 3. Logs
    supabase
      .from("intern_logs")
      .select("*")
      .eq("student_id", user.id)
      .eq("internship_id", referenceId)
      .order("log_date", { ascending: false }),
    // 4. Tasks (isolated by internship_id to prevent cross-workspace leakage)
    supabase
      .from("internship_tasks")
      .select("*")
      .eq("student_id", profile.id)
      .eq("internship_id", referenceId)
      .order("created_at", { ascending: false }),
    // 5. Notes
    supabase
      .from("intern_notes")
      .select("*")
      .eq("student_id", user.id)
      .eq("internship_id", referenceId)
      .order("updated_at", { ascending: false }),
    // 6. Announcements
    announcementQuery,
    // 7. Read records
    supabaseAdmin
      .from("announcement_reads")
      .select("announcement_id")
      .eq("student_id", profile.id),
  ]);

  // Enrich announcements manually
  let announcements: any[] = [];
  if (rawAnnouncements && rawAnnouncements.length > 0) {
    const authorIds = Array.from(new Set(rawAnnouncements.map((a: any) => a.author_id).filter(Boolean)));
    const companyIds = Array.from(new Set(rawAnnouncements.map((a: any) => a.company_id).filter(Boolean)));

    const [authorsRes, companiesRes] = await Promise.all([
      supabaseAdmin.from("user_profiles").select("user_id, full_name, avatar_url, email").in("user_id", authorIds),
      supabaseAdmin.from("company_profiles").select("id, company_name, logo_url").in("id", companyIds)
    ]);

    const authorMap = new Map();
    authorsRes.data?.forEach((p: any) => authorMap.set(p.user_id, p));

    const companyMap = new Map();
    companiesRes.data?.forEach((c: any) => companyMap.set(c.id, c));

    announcements = rawAnnouncements.map((ann: any) => ({
      ...ann,
      author: authorMap.get(ann.author_id) || { full_name: "Zigex Admin" },
      company: ann.company_id ? companyMap.get(ann.company_id) : null
    }));
  }

  // Calculate unread announcements (readRecords already fetched in parallel above)
  const readIds = new Set(readRecords?.map((r: any) => r.announcement_id) || []);
  const unreadCount = announcements.filter((a: any) => !readIds.has(a.id)).length;

  // 8. Fetch Fellow Interns - ULTRA ROBUST
  // internship_applications uses auth user.id as student_id
  const { data: structApps } = await supabaseAdmin
    .from("internship_applications")
    .select("id, internship_id, student_id, domain")
    .eq("status", "accepted");

  // Applications uses student_profiles.id as student_id
  let unifiedApps: any[] = [];
  try {
    const { data: unifiedData } = await supabaseAdmin
      .from("Applications")
      .select("id, internship_id, program_id, student_id, domain")
      .eq("status", "accepted");
    unifiedApps = unifiedData || [];
  } catch (e) {
    unifiedApps = [];
  }

  // Collect auth user_ids from internship_applications (these ARE user_ids)
  const legacyUserIds = (structApps || []).map(app => app.student_id).filter(Boolean);
  // Collect student_profiles.ids from Applications (these are profile IDs, need to resolve to user_ids)
  const unifiedProfileIds = unifiedApps.map(app => app.student_id).filter(Boolean);

  // Resolve unified profile IDs to user_ids AND store full profile data
  let profileToUserMap = new Map<string, string>();
  let profileIdToDataMap = new Map<string, any>();
  if (unifiedProfileIds.length > 0) {
    const { data: profileMappings } = await supabaseAdmin
      .from("student_profiles")
      .select("id, user_id, full_name, avatar_url, username")
      .in("id", unifiedProfileIds);
    (profileMappings || []).forEach((p: any) => {
      profileToUserMap.set(p.id, p.user_id);
      profileIdToDataMap.set(p.id, p);
    });
  }

  // Also fetch profiles for legacy user_ids
  let userIdToProfileMap = new Map<string, any>();
  if (legacyUserIds.length > 0) {
    const { data: legacyProfiles } = await supabaseAdmin
      .from("student_profiles")
      .select("user_id, full_name, avatar_url, username")
      .in("user_id", legacyUserIds);
    (legacyProfiles || []).forEach((p: any) => userIdToProfileMap.set(p.user_id, p));
  }

  // Build fellow interns from legacy apps (student_id = auth user.id)
  const fellowFromLegacy = (structApps || []).map(app => {
    const prof = userIdToProfileMap.get(app.student_id);
    return {
      ...app,
      auth_user_id: app.student_id,
      isSameProgram: app.internship_id === referenceId,
      student_profiles: prof || { full_name: "Member", avatar_url: "/default-avatar.svg", user_id: app.student_id }
    };
  });

  // Build fellow interns from unified apps (student_id = student_profiles.id)
  const fellowFromUnified = unifiedApps.map(app => {
    const authUserId = profileToUserMap.get(app.student_id);
    const profData = profileIdToDataMap.get(app.student_id);
    return {
      ...app,
      auth_user_id: authUserId || app.student_id,
      isSameProgram: (app.internship_id === referenceId) || (app.program_id === referenceId),
      student_profiles: profData 
        ? { full_name: profData.full_name, avatar_url: profData.avatar_url, username: profData.username, user_id: authUserId }
        : { full_name: "Member", avatar_url: "/default-avatar.svg", user_id: authUserId || app.student_id }
    };
  });

  // Merge and deduplicate, then exclude self
  const allFellows = [...fellowFromLegacy, ...fellowFromUnified];
  const fellowInterns = allFellows.filter(app => 
    app.auth_user_id !== user.id && app.student_id !== user.id && app.student_id !== profile.id
  );

  // 9. Fetch Supervisors for the same company
  const { data: colleaguesSupervisors } = await supabaseAdmin
    .from("supervisor_profiles")
    .select("*")
    .eq("company_id", companyId);

  const userWorkspaces = await getUserWorkspaces();

  return {
    application,
    curriculum: curriculum || [],
    logs: logs || [],
    tasks: tasks || [],
    notes: notes || [],
    announcements: announcements || [],
    unreadCount,
    fellowInterns: fellowInterns || [],
    fellowSupervisors: colleaguesSupervisors || [],
    userWorkspaces,
    studentProfile: profile
  };
}

export async function getUserWorkspaces() {
  const supabase = await createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return [];

  const { data: allUnifiedApps } = await supabase
    .from("Applications")
    .select(`
      id,
      application_type,
      status,
      internships (title, company_profiles(company_name, logo_url)),
      programs (title, company_profiles(company_name, logo_url)),
      event (title, company_profiles(company_name, logo_url))
    `)
    .eq("student_id", profile.id)
    .in("status", ["accepted", "rsvp_confirmed"]);

  const { data: allLegacyApps } = await supabase
    .from("internship_applications")
    .select(`
      id,
      status,
      internships (title, company_profiles(company_name, logo_url))
    `)
    .eq("student_id", user.id)
    .eq("status", "accepted");

  return [
    ...(allUnifiedApps || []).map(app => ({
      id: app.id,
      title: app.application_type === 'program' ? app.programs?.title : 
             app.application_type === 'event' ? app.event?.title : 
             app.internships?.title,
      company_name: app.application_type === 'program' ? app.programs?.company_profiles?.company_name : 
                    app.application_type === 'event' ? app.event?.company_profiles?.company_name : 
                    app.internships?.company_profiles?.company_name,
      logo_url: app.application_type === 'program' ? app.programs?.company_profiles?.logo_url : 
                app.application_type === 'event' ? app.event?.company_profiles?.logo_url : 
                app.internships?.company_profiles?.logo_url,
      type: app.application_type || 'internship',
    })),
    ...(allLegacyApps || []).map(app => ({
      id: app.id,
      title: app.internships?.title,
      company_name: app.internships?.company_profiles?.company_name,
      logo_url: app.internships?.company_profiles?.logo_url,
      type: 'internship',
    }))
  ];
}

/**
 * Server Action to submit a daily internship log/report.
 * Ensures that a student can only submit one log per day per internship.
 */
export async function submitInternshipLog(formData: {
  internship_id: string;
  log_date: string;
  learning_log: string;
  tasks_completed: string[];
  experience_rating: number;
}) {
  const supabase = await createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // 1. Check if a log already exists for this date
  const { data: existingLog } = await supabase
    .from("intern_logs")
    .select("id")
    .eq("student_id", user.id)
    .eq("internship_id", formData.internship_id)
    .eq("log_date", formData.log_date)
    .single();

  if (existingLog) {
    return { success: false, error: "You have already submitted a log for today." };
  }

  // 2. Insert new log
  const { data, error } = await supabase
    .from("intern_logs")
    .insert({
      student_id: user.id,
      internship_id: formData.internship_id,
      log_date: formData.log_date,
      learning_log: formData.learning_log,
      tasks_completed: formData.tasks_completed,
      experience_rating: formData.experience_rating,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    console.error("Error submitting log:", error);
    return { success: false, error: error.message };
  }

  // 3. Notify Supervisor
  try {
    // Fetch application to find assigned supervisor
    const { data: application } = await supabaseAdmin
      .from("internship_applications")
      .select("supervisor_id")
      .eq("student_id", user.id)
      .eq("internship_id", formData.internship_id)
      .single();

    if (application?.supervisor_id) {
      // Fetch student name and supervisor profile in parallel for reliability
      const [studentRes, supervisorRes] = await Promise.all([
        supabaseAdmin.from("student_profiles").select("full_name").eq("user_id", user.id).single(),
        supabaseAdmin.from("supervisor_profiles").select("full_name, email, user_id").eq("id", application.supervisor_id).single()
      ]);

      const studentName = studentRes.data?.full_name || "An Intern";
      const supervisor = supervisorRes.data;

      if (supervisor) {
        let targetEmail = supervisor.email;

        // Fallback if email is missing (Auth Admin lookup)
        if (!targetEmail && supervisor.user_id) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(supervisor.user_id);
          if (authUser?.user?.email) {
            targetEmail = authUser.user.email;
          }
        }

        if (targetEmail) {
          await sendReportSubmissionEmail({
            email: targetEmail,
            supervisorName: supervisor.full_name,
            studentName: studentName,
            reportDate: formData.log_date,
            reportSummary: formData.learning_log
          });
          console.log(`[LOG_SUBMIT] Notification sent to supervisor ${targetEmail}`);

          // Add Real-time Notification for Supervisor
          if (supervisor.user_id) {
            await createNotification({
              userId: supervisor.user_id,
              title: "New Report Submitted 📜",
              message: `${studentName} has submitted a new learning log for ${formData.log_date}.`,
              type: "new_log_submitted",
              referenceId: data.id
            });
            await sendPushNotification(supervisor.user_id, {
              title: "New Report Submitted 📜",
              body: `${studentName} has submitted a new learning log for ${formData.log_date}.`,
              url: "/supervisor"
            });
          }
        }
      }
    }
  } catch (notifyErr) {
    console.error("[LOG_SUBMIT] Failed to notify supervisor:", notifyErr);
  }

  return { success: true, data };
}

/**
 * Server Action to acknowledge payment terms for a paid internship.
 */
export async function acknowledgePaidInternship(applicationId: string) {
  const supabase = await createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Try updating building Applications first
  const { error: appError, data: appData } = await supabase
    .from("Applications")
    .update({ is_paid_acknowledgement: true })
    .eq("id", applicationId)
    .select("id");

  if (appError || !appData || appData.length === 0) {
    // Try legacy table
    const { error: legacyError } = await supabase
      .from("internship_applications")
      .update({ is_paid_acknowledgement: true })
      .eq("id", applicationId);

    if (legacyError) {
      console.error("Error acknowledging paid internship:", legacyError);
      return { success: false, error: legacyError.message };
    }
  }

  revalidatePath("/student/workspace");
  return { success: true };
}

/**
 * Server Action to mark an internship task as read by the intern.
 */
export async function markTaskAsRead(taskId: string) {
  const supabase = await createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Get the student profile
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) return { success: false, error: "Profile not found" };

  const { error } = await supabaseAdmin
    .from("internship_tasks")
    .update({ is_read: true })
    .eq("id", taskId)
    .eq("student_id", profile.id);

  if (error) {
    console.error("Error marking task as read:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/student/workspace");
  return { success: true };
}


