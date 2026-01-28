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
        // Note: In legacy, some might be programs, but we filter for internships later or just count all if they have evaluations
    ]);

    const applications = [
        ...(structuredRes.data || []),
        ...(legacyRes.data || [])
    ];

    if (applications.length === 0) return {};

    const studentIds = [...new Set(applications.map(a => a.student_id))];
    const internshipIds = [...new Set(applications.map(a => a.internship_id).filter(Boolean))];

    // 2. Get verified attendance records
    const { data: attendance } = await supabase
        .from("intern_attendance")
        .select("student_id, internship_id, status")
        .in("student_id", studentIds)
        .eq("status", "present"); // Filter for present status

    // 3. Get summaries of evaluations (marks)
    const { data: evals } = await supabase
        .from("intern_evaluations")
        .select("student_id, internship_id, overall_rating, comments, evaluation_date")
        .in("student_id", studentIds)
        .order("evaluation_date", { ascending: false });

    const summary: Record<string, { attendanceCount: number; totalMarks: number; latestObservation: string }> = {};

    applications.forEach(app => {
        // Correctly filter by student AND internship to avoid cross-pollination
        // Relax matching to student_id if internship_id is missing for either application or record
        const studentAttendance = (attendance || []).filter(a =>
            a.student_id === app.student_id &&
            (!app.internship_id || !a.internship_id || a.internship_id === app.internship_id)
        );
        const studentEvals = (evals || []).filter(e =>
            e.student_id === app.student_id &&
            (!app.internship_id || !e.internship_id || e.internship_id === app.internship_id)
        );

        const totalMarks = studentEvals.reduce((acc, curr) => acc + curr.overall_rating, 0);

        summary[app.id] = {
            attendanceCount: studentAttendance.length,
            totalMarks: totalMarks,
            latestObservation: studentEvals[0]?.comments || "Consistent performance tracked."
        };
    });

    return summary;
}
