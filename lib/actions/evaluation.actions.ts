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
    const supabase = await createServerActionClient();

    // 1. Get all accepted internship applications for this company
    const { data: applications, error: appError } = await supabase
        .from("internship_applications")
        .select("id, student_id, internship_id")
        .eq("status", "accepted");

    if (appError || !applications) return {};

    const studentIds = applications.map(a => a.student_id);

    // 2. Get summaries of logs (attendance)
    const { data: logs, error: logsError } = await supabase
        .from("intern_logs")
        .select("student_id, id")
        .in("student_id", studentIds);

    // 3. Get summaries of evaluations (marks)
    const { data: evals, error: evalsError } = await supabase
        .from("intern_evaluations")
        .select("student_id, overall_rating")
        .in("student_id", studentIds);

    const summary: Record<string, { attendanceCount: number; totalMarks: number; latestObservation: string }> = {};

    applications.forEach(app => {
        const studentLogs = (logs || []).filter(l => l.student_id === app.student_id);
        const studentEvals = (evals || []).filter(e => e.student_id === app.student_id);

        const totalMarks = studentEvals.reduce((acc, curr) => acc + curr.overall_rating, 0);

        summary[app.id] = {
            attendanceCount: studentLogs.length,
            totalMarks: totalMarks,
            latestObservation: "" // We could fetch this too but let's keep it simple for now or fetch it if needed
        };
    });

    return summary;
}
