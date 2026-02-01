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
    if (!companyId) return {};
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
        ...(structuredRes.data || []).map(a => ({ ...a, table: 'structured' as const })),
        ...(legacyRes.data || []).map(a => ({ ...a, table: 'legacy' as const }))
    ];

    console.log(`[PERF_SUMMARY] Found raw applications: ${rawApps.length}`);
    if (rawApps.length === 0) return {};

    // 2. Resolve basic IDs from applications
    const initialStudentIds = [
        ...new Set([
            ...rawApps.map(a => a.student_id)
        ])
    ].filter(Boolean) as string[];

    if (initialStudentIds.length === 0) return {};

    // 3. Resolve student profiles first to get all unified IDs (id and user_id)
    const { data: studentProfiles } = await supabase
        .from("student_profiles")
        .select("id, user_id, full_name")
        .or(`id.in.(${initialStudentIds.map(id => `"${id}"`).join(",")}),user_id.in.(${initialStudentIds.map(id => `"${id}"`).join(",")})`);

    const profiles = studentProfiles || [];

    // 4. Collect ALL associated IDs (both id and user_id) for accurate querying of attendance/evals
    const allUnifiedIds = [
        ...new Set([
            ...profiles.map(p => p.id),
            ...profiles.map(p => p.user_id)
        ])
    ].filter(Boolean) as string[];

    // 5. Fetch attendance and evaluations using ALL unified IDs in parallel
    const [attendanceRes, evaluationsRes] = await Promise.all([
        supabase
            .from("intern_attendance")
            .select("student_id, status")
            .in("student_id", allUnifiedIds)
            .eq("status", "present"),
        supabase
            .from("intern_evaluations")
            .select("student_id, overall_rating, comments, evaluation_date")
            .in("student_id", allUnifiedIds)
            .order("evaluation_date", { ascending: false })
    ]);

    const attendance = attendanceRes.data || [];
    const evaluations = evaluationsRes.data || [];

    // 6. Create a unified mapping and summary object
    // We use a shared object reference for both profile.id and profile.user_id pointers
    const perfSummaries: Record<string, { attendanceCount: number, totalMarks: number, name: string, latestObservation: string }> = {};

    profiles.forEach(p => {
        const summaryObj = { attendanceCount: 0, totalMarks: 0, name: p.full_name, latestObservation: "" };

        if (p.id) perfSummaries[p.id] = summaryObj;
        if (p.user_id) perfSummaries[p.user_id] = summaryObj;
    });

    // 7. Aggregate Attendance (using unified summaries)
    attendance.forEach(record => {
        const s = perfSummaries[record.student_id];
        if (s) s.attendanceCount++;
    });

    // 8. Aggregate Evaluations (using unified summaries)
    evaluations.forEach(record => {
        const s = perfSummaries[record.student_id];
        if (s) {
            s.totalMarks += (record.overall_rating || 0);
            if (!s.latestObservation) {
                s.latestObservation = record.comments || "";
            }
        }
    });

    // 9. Format final result keyed by application ID and also by student IDs for UI robustnes
    const result: Record<string, { attendanceCount: number; totalMarks: number; latestObservation: string }> = {};

    rawApps.forEach(app => {
        const s = perfSummaries[app.student_id];
        if (s) {
            result[app.id] = {
                attendanceCount: s.attendanceCount,
                totalMarks: s.totalMarks,
                latestObservation: s.latestObservation || ""
            };
        }
    });

    // Add profile ID and user ID as keys for fallback
    profiles.forEach(p => {
        const s = perfSummaries[p.id] || perfSummaries[p.user_id];
        if (s) {
            const data = {
                attendanceCount: s.attendanceCount,
                totalMarks: s.totalMarks,
                latestObservation: s.latestObservation || ""
            };
            if (p.id) result[p.id] = data;
            if (p.user_id) result[p.user_id] = data;
        }
    });

    return result;
}
