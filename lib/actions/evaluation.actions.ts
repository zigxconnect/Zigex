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
    ]);

    const rawApps = [
        ...(structuredRes.data || []).map(a => ({ ...a, table: 'structured' })),
        ...(legacyRes.data || []).map(a => ({ ...a, table: 'legacy' }))
    ];

    if (rawApps.length === 0) return {};

    // 2. Build a robust Student Profile Map (ID -> UserID)
    // Legacy apps use profile id in student_id, structured use user_id
    const distinctStudentIds = [...new Set(rawApps.map(a => a.student_id))];
    const { data: studentProfiles } = await supabase
        .from("student_profiles")
        .select("id, user_id")
        .or(`id.in.(${distinctStudentIds.join(',')}),user_id.in.(${distinctStudentIds.join(',')})`);

    const applications = rawApps.map(app => {
        const profile = studentProfiles?.find(p => p.id === app.student_id || p.user_id === app.student_id);
        return {
            appId: app.id,
            uid: profile?.user_id || app.student_id, // Fallback to student_id if profile not found
            internshipId: app.internship_id
        };
    });

    const studentUids = [...new Set(applications.map(a => a.uid))];

    // 3. Get verified attendance records (using AUTH UIDs)
    const { data: attendance } = await supabase
        .from("intern_attendance")
        .select("student_id, internship_id, status")
        .in("student_id", studentUids)
        .eq("status", "present");

    // 4. Get summaries of evaluations (marks)
    const { data: evals } = await supabase
        .from("intern_evaluations")
        .select("student_id, internship_id, overall_rating, comments, evaluation_date")
        .in("student_id", studentUids)
        .order("evaluation_date", { ascending: false });

    const summary: Record<string, { attendanceCount: number; totalMarks: number; latestObservation: string }> = {};

    applications.forEach(app => {
        // Correctly filter by student AND internship to avoid cross-pollination
        // Relax matching to student_id if internship_id is missing for either application or record
        const studentAttendance = (attendance || []).filter(a =>
            a.student_id === app.uid &&
            (!app.internshipId || !a.internship_id || a.internship_id === app.internshipId)
        );
        const studentEvals = (evals || []).filter(e =>
            e.student_id === app.uid &&
            (!app.internshipId || !e.internship_id || e.internship_id === app.internshipId)
        );

        const totalMarks = studentEvals.reduce((acc, curr) => acc + curr.overall_rating, 0);

        summary[app.appId] = {
            attendanceCount: studentAttendance.length,
            totalMarks: totalMarks,
            latestObservation: studentEvals[0]?.comments || "Consistent performance tracked."
        };
    });

    return summary;
}
