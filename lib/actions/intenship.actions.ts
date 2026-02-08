"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendReportSubmissionEmail } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

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
 * NEW: Server Action to fetch the complete workspace data for an intern.
 * Fetches application, supervisor, curriculum, logs, and tasks.
 */
export async function getInternshipWorkspaceData() {
  const supabase = await createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Get the latest accepted internship application
  const { data: application, error: appError } = await supabase
    .from("internship_applications")
    .select(`
      *,
      internships (
        *, 
        company_profiles (*)
      ),
      supervisor_profiles (*)
    `)
    .eq("student_id", user.id)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (appError || !application) {
    console.warn("No active internship found for user", user.id);
    return null;
  }

  // 2. Fetch associated curriculum
  const { data: curriculum } = await supabase
    .from("internship_curriculum")
    .select("*")
    .eq("internship_id", application.internship_id)
    .order("week_number", { ascending: true });

  // 3. Fetch internship logs (attendance and reports)
  const { data: logs } = await supabase
    .from("intern_logs")
    .select("*")
    .eq("student_id", user.id)
    .eq("internship_id", application.internship_id)
    .order("log_date", { ascending: false });

  // 4. Fetch assigned tasks - ONLY for this student
  const { data: tasks } = await supabase
    .from("internship_tasks")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  // 5. Fetch notes
  const { data: notes } = await supabase
    .from("intern_notes")
    .select("*")
    .eq("student_id", user.id)
    .eq("internship_id", application.internship_id)
    .order("updated_at", { ascending: false });

  // 6. Fetch Announcements (Global + Company) without joins to avoid PGRST200
  const companyId = application.internships?.company_id;

  let announcementQuery = supabase
    .from("announcements")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (companyId) {
    announcementQuery = announcementQuery.or(`company_id.is.null,company_id.eq.${companyId}`);
  } else {
    announcementQuery = announcementQuery.is("company_id", null);
  }

  const { data: rawAnnouncements } = await announcementQuery;

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

  // 7. Calculate unread announcements
  const { data: readRecords } = await supabaseAdmin
    .from("announcement_reads")
    .select("announcement_id")
    .eq("student_id", user.id);

  const readIds = new Set(readRecords?.map((r: any) => r.announcement_id) || []);
  const unreadCount = announcements.filter((a: any) => !readIds.has(a.id)).length;

  // 8. Fetch Fellow Interns - ULTRA ROBUST & SCOPED TO COMPANY
  const { data: companyInternships } = await supabaseAdmin
    .from("internships")
    .select("id")
    .eq("company_id", companyId);

  const companyInternshipIds = companyInternships?.map(i => i.id) || [];

  // Only look for applications within this company
  const { data: structApps } = await supabaseAdmin
    .from("internship_applications")
    .select("id, internship_id, student_id, domain")
    .eq("status", "accepted")
    .in("internship_id", companyInternshipIds); // Scoped to company

  let legacyApps: any[] = [];
  try {
    const { data: legacyData } = await supabaseAdmin
      .from("Applications")
      .select("id, internship_id, student_id, domain")
      .eq("status", "accepted")
      .in("internship_id", companyInternshipIds); // Scoped to company
    legacyApps = legacyData || [];
  } catch (e) {
    // Silently fail for legacy table if it doesn't exist
    legacyApps = [];
  }

  const allRawApps = [...(structApps || []), ...legacyApps];
  const allStudentUserIds = Array.from(new Set(allRawApps.map(app => app.student_id).filter(Boolean)));

  let allStudentProfiles: any[] = [];
  if (allStudentUserIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from("student_profiles")
      .select("user_id, full_name, avatar_url, username")
      .in("user_id", allStudentUserIds);
    allStudentProfiles = profiles || [];
  }

  const fellowInterns = allRawApps.map(app => {
    const profile = allStudentProfiles.find(p => p.user_id === app.student_id);
    return {
      ...app,
      isSameProgram: app.internship_id === application.internship_id,
      isSameDepartment: app.domain === application.domain, // New flag for department filtering
      student_profiles: profile || { full_name: "Member", avatar_url: "/default-avatar.svg", user_id: app.student_id }
    };
  }).filter(app => app.student_id !== user.id); // Exclude self

  // 9. Fetch Supervisors for the same company
  const { data: colleaguesSupervisors } = await supabaseAdmin
    .from("supervisor_profiles")
    .select("*")
    .eq("company_id", companyId);

  return {
    application,
    curriculum: curriculum || [],
    logs: logs || [],
    tasks: tasks || [],
    notes: notes || [],
    announcements: announcements || [],
    unreadCount,
    fellowInterns: fellowInterns || [],
    fellowSupervisors: colleaguesSupervisors || []
  };
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

  const { error } = await supabase
    .from("internship_applications")
    .update({ is_paid_acknowledgement: true })
    .eq("id", applicationId);

  if (error) {
    console.error("Error acknowledging paid internship:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/intern/workspace");
  return { success: true };
}

/**
 * Server Action to mark an internship task as read by the intern.
 */
export async function markTaskAsRead(taskId: string) {
  const supabase = await createServerActionClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabaseAdmin
    .from("internship_tasks")
    .update({ is_read: true })
    .eq("id", taskId)
    .eq("student_id", user.id);

  if (error) {
    console.error("Error marking task as read:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/intern/workspace");
  return { success: true };
}


