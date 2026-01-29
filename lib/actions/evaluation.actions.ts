"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEvaluation(data: {
    internship_id: string;
    student_id: string;
    supervisor_id: string;
    technical_skill: number;
    communication_skill: number;
    problem_solving: number;
    dependability: number;
    overall_rating: number;
    strengths: string;
    areas_for_improvement: string;
    comments: string;
    period_start?: string;
    period_end?: string;
}) {
    const supabase = await createServerActionClient();

    // Verify permissions (supervisor check)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Check if supervisor profile exists for this user
    const { data: supervisorProfile } = await supabase
        .from("supervisor_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

    if (!supervisorProfile || supervisorProfile.id !== data.supervisor_id) {
        return { success: false, error: "Unauthorized: Invalid Supervisor Profile" };
    }

    const { error } = await supabase
        .from("intern_evaluations")
        .insert({
            ...data,
            evaluation_date: new Date().toISOString().split('T')[0], // Today
        });

    if (error) {
        console.error("Error creating evaluation:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/supervisor/interns");
    revalidatePath("/admin/interns");
    return { success: true };
}

export async function getEvaluationsForIntern(studentId: string) {
    const supabase = await createServerActionClient();

    const { data, error } = await supabase
        .from("intern_evaluations")
        .select(`
      *,
      supervisor:supervisor_profiles(full_name, avatar_url)
    `)
        .eq("student_id", studentId)
        .order("evaluation_date", { ascending: false });

    if (error) {
        console.error("Error fetching evaluations:", error);
        return [];
    }

    return data;
}

export async function getEvaluationsByInternship(internshipId: string) {
    const supabase = await createServerActionClient();

    const { data, error } = await supabase
        .from("intern_evaluations")
        .select(`
      *,
      supervisor:supervisor_profiles(full_name, avatar_url)
    `)
        .eq("internship_id", internshipId)
        .order("evaluation_date", { ascending: false });

    if (error) {
        console.error("Error fetching evaluations:", error);
        return [];
    }

    return data;
}

export async function getInternLogsForAdmin(studentId: string, internshipId?: string) {
    const supabase = await createServerActionClient();

    let query = supabase
        .from("intern_logs")
        .select("*")
        .eq("student_id", studentId)
        .order("log_date", { ascending: false });

    if (internshipId) {
        query = query.eq("internship_id", internshipId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching intern logs:", error);
        return [];
    }

    return data;
}

export async function getCompanyInternsPerformanceSummary(companyId: string) {
    if (!companyId) return {}; // Existing null check for companyId
    const supabase = await createServerActionClient();

    console.log(`[PERF_SUMMARY] Fetching for company: ${companyId}`);

    // 1. Get all accepted internship applications for this company from BOTH tables
    const [structuredRes, legacyRes] = await Promise.all([
        supabase
            .from("internship_applications")
            .select("id, student_id, internship_id, internships!inner(company_id)")
            .eq("status", "accepted")
            .eq("internships.company_id", companyId),
        supabase
            .from("Applications")
            .select("id, student_id, internship_id")
            .eq("status", "accepted")
            .eq("company_id", companyId)
    ]);

    const rawApps = [
        ...(structuredRes.data || []).map(a => ({ ...a, table: 'structured' })),
        ...(legacyRes.data || []).map(a => ({ ...a, table: 'legacy' }))
    ];

    console.log(`[PERF_SUMMARY] Found raw applications: ${rawApps.length}`);
    if (rawApps.length === 0) return {};

    // 2. Build a robust Student Profile Map (ID -> UserID)
    const distinctStudentIds = [...new Set(rawApps.map(a => a.student_id))].filter(Boolean);

    // Improved profile lookup: Use separate queries for robustness
    const { data: profilesById } = await supabase
        .from("student_profiles")
        .select("id, user_id, full_name")
        .in("id", distinctStudentIds);

    const { data: profilesByUid } = await supabase
        .from("student_profiles")
        .select("id, user_id, full_name")
        .in("user_id", distinctStudentIds);

    const studentProfiles = [...(profilesById || []), ...(profilesByUid || [])];
    console.log(`[PERF_SUMMARY] Profile resolution map size: ${studentProfiles.length}`);

    const applications = rawApps.map(app => {
        const profile = studentProfiles.find(p => p.id === app.student_id || p.user_id === app.student_id);
        return {
            appId: app.id,
            uid: profile?.user_id || app.student_id,
            internshipId: app.internship_id,
            name: profile?.full_name || "Unknown"
        };
    });

    const studentUids = [...new Set(applications.map(a => a.uid))];
    console.log(`[PERF_SUMMARY] Unique student UIDs to check: ${studentUids.length} (${studentUids.join(', ')})`);

    // 3. Get verified attendance records
    const { data: attendance, error: attError } = await supabase
        .from("intern_attendance")
        .select("student_id, internship_id, status")
        .in("student_id", studentUids)
        .eq("status", "present");

    if (attError) console.error("[PERF_SUMMARY] Attendance fetch error:", attError);
    console.log(`[PERF_SUMMARY] Fetched attendance records: ${attendance?.length || 0}`);

    // 4. Get summaries of evaluations
    const { data: evals, error: evalError } = await supabase
        .from("intern_evaluations")
        .select("student_id, internship_id, overall_rating, comments, evaluation_date")
        .in("student_id", studentUids)
        .order("evaluation_date", { ascending: false });

    if (evalError) console.error("[PERF_SUMMARY] Evaluations fetch error:", evalError);

    const summary: Record<string, { attendanceCount: number; totalMarks: number; latestObservation: string }> = {};

    // Build a map of uid -> best stats (aggregate across all apps for same user)
    const uidStatsMap: Record<string, { attendanceCount: number; totalMarks: number; latestObservation: string }> = {};

    applications.forEach(app => {
        const studentAttendance = (attendance || []).filter(a =>
            a.student_id === app.uid &&
            (!app.internshipId || !a.internship_id || a.internship_id === app.internshipId)
        );
        const studentEvals = (evals || []).filter(e =>
            e.student_id === app.uid &&
            (!app.internshipId || !e.internship_id || e.internship_id === app.internshipId)
        );

        console.log(`[PERF_SUMMARY] Mapping student ${app.name} (${app.uid}): Attnd=${studentAttendance.length}, Evals=${studentEvals.length}`);

        const totalMarks = studentEvals.reduce((acc, curr) => acc + curr.overall_rating, 0);
        const stats = {
            attendanceCount: studentAttendance.length,
            totalMarks: totalMarks,
            latestObservation: studentEvals[0]?.comments || "Consistent performance tracked."
        };

        // Key by application ID (for direct lookup)
        summary[app.appId] = stats;

        // Also key by user ID (fallback lookup)
        // Keep the best stats if same user has multiple apps
        if (!uidStatsMap[app.uid] || stats.attendanceCount > uidStatsMap[app.uid].attendanceCount) {
            uidStatsMap[app.uid] = stats;
        }
    });

    // Merge uid-keyed entries into summary for fallback lookups
    Object.entries(uidStatsMap).forEach(([uid, stats]) => {
        summary[uid] = stats;
    });

    console.log(`[PERF_SUMMARY] Final summary keys count: ${Object.keys(summary).length}`);
    return summary;
}
