"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api/server-client";
import { ApiClientError } from "@/lib/api/errors";
import {
  checkIn,
  checkOut,
  isBackendError,
  listLogs,
  listNotes,
  logDay,
  logsToAttendance,
} from "@/lib/api/services/attendance";
import {
  acknowledgePayment,
  getAnnouncements,
  getInternshipCurriculum,
  getInternshipTasks,
  getInternshipTeam,
  listPlacements,
  markAnnouncementsRead,
  markTaskRead,
  placementOpportunity,
  placementTargetId,
  type Placement,
} from "@/lib/api/services/workspace";

/** Runs a backend read, returning `fallback` (and logging) if it fails. */
async function orEmpty<T>(label: string, read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.error(`[Workspace] ${label} failed:`, error);
    return fallback;
  }
}

/**
 * Server Action to fetch all accepted internships for the student.
 * Used for the selection screen when multiple internships are active.
 */
export async function getAcceptedInternships() {
  return orEmpty("getAcceptedInternships", listPlacements, [] as Placement[]);
}

/**
 * Server Action to fetch the complete workspace data for an intern.
 * Fetches the placement, its logs (= attendance) and notes from the backend.
 */
export async function getInternshipWorkspaceData(applicationId?: string) {
  const placements = await getAcceptedInternships();
  const application = applicationId ? placements.find((p) => p.id === applicationId) : placements[0];

  if (!application) {
    console.warn(`[Workspace] No active application found with ID ${applicationId || "latest"}`);
    return null;
  }

  const referenceId = placementTargetId(application);
  const opportunity = placementOpportunity(application);

  const isProgram = application.application_type === "program";
  const internshipId = !isProgram ? referenceId : null;

  const [logs, notes, studentProfile, userWorkspaces, tasks, curriculum, announcements, team] = await Promise.all([
    referenceId ? orEmpty("logs", () => listLogs(referenceId), []) : [],
    referenceId ? orEmpty("notes", () => listNotes(referenceId), []) : [],
    orEmpty(
      "students/me",
      async () => {
        const me = (await serverApi.get<Record<string, any>>("/students/me")).data;
        return { id: me.id, avatar_url: me.avatar_url ?? me.avatarUrl ?? null };
      },
      null
    ),
    toWorkspaceList(placements),
    internshipId ? orEmpty("tasks", () => getInternshipTasks(internshipId), []) : [],
    internshipId ? orEmpty("curriculum", () => getInternshipCurriculum(internshipId), null) : null,
    referenceId
      ? orEmpty("announcements", () => getAnnouncements(isProgram ? { programId: referenceId } : { internshipId: referenceId }), [])
      : [],
    internshipId
      ? orEmpty("team", () => getInternshipTeam(internshipId), { fellowInterns: [], fellowSupervisors: [] })
      : { fellowInterns: [], fellowSupervisors: [] },
  ]);

  return {
    application,
    // GET /internships/{id}/curriculum; until deployed, the curriculum embedded in the internship detail.
    curriculum: curriculum ?? opportunity?.curriculum ?? opportunity?.internship_curriculum ?? [],
    logs,
    tasks,
    notes,
    announcements,
    unreadCount: announcements.filter((a) => a.is_read === false).length,
    fellowInterns: team.fellowInterns,
    fellowSupervisors: team.fellowSupervisors,
    userWorkspaces,
    studentProfile,
    // Check-ins live on the daily logs now; derived for the attendance tracker.
    attendance: logsToAttendance(logs),
  };
}

function toWorkspaceList(placements: Placement[]) {
  return placements.map((app) => {
    const opportunity = placementOpportunity(app);
    return {
      id: app.id,
      title: opportunity?.title,
      company_name: opportunity?.company_profiles?.company_name,
      logo_url: opportunity?.company_profiles?.logo_url,
      type: app.application_type,
    };
  });
}

export async function getUserWorkspaces() {
  return toWorkspaceList(await getAcceptedInternships());
}

/**
 * Server Action to submit a daily internship log/report.
 *
 * On the backend a day's log is opened by check-in and closed by check-out
 * (which carries the report), so: reuse today's log if the student already
 * checked in (e.g. by QR scan), otherwise check in first, then check out.
 * The backend notifies the supervisor.
 */
export async function submitInternshipLog(formData: {
  internship_id: string;
  log_date: string;
  learning_log: string;
  tasks_completed: string[];
  experience_rating: number;
}) {
  try {
    const logs = await listLogs(formData.internship_id);
    let todaysLog = logs.find((log) => logDay(log) === formData.log_date);

    if (todaysLog?.learning_log) {
      return { success: false, error: "You have already submitted a log for today." };
    }

    if (!todaysLog) {
      const created = await checkIn(formData.internship_id);
      todaysLog = created?.id
        ? created
        : (await listLogs(formData.internship_id)).find((log) => logDay(log) === formData.log_date);
    }
    if (!todaysLog?.id) {
      return { success: false, error: "Could not start today's log. Please try again." };
    }

    const data = await checkOut(todaysLog.id, {
      learningLog: formData.learning_log,
      tasksCompleted: formData.tasks_completed,
      experienceRating: formData.experience_rating,
    });

    revalidatePath("/intern/workspace");
    revalidatePath("/student/workspace");
    return { success: true, data };
  } catch (error) {
    if (isBackendError(error, 400)) {
      return { success: false, error: "You have already submitted a log for today." };
    }
    console.error("Error submitting log:", error);
    return {
      success: false,
      error: error instanceof ApiClientError ? error.message : "Failed to submit your daily log.",
    };
  }
}

/**
 * Server Action to acknowledge payment terms for a paid internship
 * (POST /applications/{id}/payment-acknowledgement).
 */
export async function acknowledgePaidInternship(applicationId: string) {
  try {
    const result = await acknowledgePayment(applicationId);
    if (result.pending) {
      return { success: false, error: "Payment acknowledgement is coming soon. Please contact your supervisor." };
    }
    revalidatePath("/intern/workspace");
    revalidatePath("/student/workspace");
    return { success: true };
  } catch (error) {
    console.error("Error acknowledging payment:", error);
    return { success: false, error: "Failed to save your acknowledgement. Please try again." };
  }
}

/** Server Action to mark an internship task as read (PATCH /tasks/{id}/read). */
export async function markTaskAsRead(taskId: string) {
  try {
    const result = await markTaskRead(taskId);
    return result.pending ? { success: false, error: "Tasks are coming soon." } : { success: true };
  } catch (error) {
    console.error("Error marking task as read:", error);
    return { success: false, error: "Failed to update the task." };
  }
}

/** Server Action to mark workspace announcements as read (POST /announcements/read). */
export async function markWorkspaceAnnouncementsRead(announcementIds: string[]) {
  if (announcementIds.length === 0) return { success: true };
  try {
    const result = await markAnnouncementsRead(announcementIds);
    return { success: result.success };
  } catch (error) {
    console.error("Error marking announcements as read:", error);
    return { success: false };
  }
}
