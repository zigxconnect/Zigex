"use server";

import { createServerActionClient, supabaseAdmin } from "@/lib/supabase/server";
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
    const { data: evaluation, error } = await supabase
        .from("intern_evaluations")
        .insert([data])
        .select()
        .single();

    if (error) {
        console.error("Error creating evaluation:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/interns");
    revalidatePath("/supervisor");
    return { success: true, data: evaluation };
}

export async function getEvaluationsForIntern(studentId: string) {

    // Resolve all possible IDs for this student for broad matching
    // We use supabaseAdmin to avoid potential RLS issues in the Admin view
    const { data: profiles } = await supabaseAdmin
        .from("student_profiles")
        .select("id, user_id")
        .or(`id.eq.${studentId},user_id.eq.${studentId}`);

    const ids = [studentId];
    if (profiles) {
        profiles.forEach(p => {
            if (p.id) ids.push(p.id);
            if (p.user_id) ids.push(p.user_id);
        });
    }

    const uniqueIds = [...new Set(ids.filter(id => id && id.length > 10))];

    // Use supabaseAdmin to bypass potential RLS issues for Admin dashboard
    const { data, error } = await supabaseAdmin
        .from("intern_evaluations")
        .select(`
            *,
            supervisor:supervisor_profiles(full_name, avatar_url)
        `)
        .in("student_id", uniqueIds)
        .order("evaluation_date", { ascending: false });

    if (error) {
        console.error("Error fetching evaluations:", error);
        return [];
    }

    return data || [];
}

export async function getEvaluationsByInternship(internshipId: string) {
    const { data, error } = await supabaseAdmin
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

    // Resolve all possible IDs for this student
    const { data: profiles } = await supabaseAdmin
        .from("student_profiles")
        .select("id, user_id")
        .or(`id.eq.${studentId},user_id.eq.${studentId}`);

    const ids = [studentId];
    if (profiles) {
        profiles.forEach(p => {
            if (p.id) ids.push(p.id);
            if (p.user_id) ids.push(p.user_id);
        });
    }
    const uniqueIds = [...new Set(ids.filter(id => id && id.length > 10))];

    // Use supabaseAdmin to ensure consistency in Admin modal
    let query = supabaseAdmin
        .from("intern_logs")
        .select("*")
        .in("student_id", uniqueIds)
        .order("log_date", { ascending: false });

    if (internshipId) {
        query = query.eq("internship_id", internshipId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching intern logs:", error);
        return [];
    }

    return data || [];
}

export async function getCompanyInternsPerformanceSummary(companyId: string, studentIds?: string[]) {
    if (!companyId) return {};
    const supabase = await createServerActionClient();

    try {
        const { data, error } = await supabase.rpc('get_company_intern_performance_summary', {
            p_company_id: companyId
        });

        if (error) {
            console.error("RPC Error fetching performance summary:", error);
            return {};
        }

        const summaries = data || {};

        if (studentIds && studentIds.length > 0) {
            const validIds = studentIds.filter(id => id && id.length > 10);
            if (validIds.length > 0) {
                const { data: v2Attendance } = await supabaseAdmin
                    .from("intern_attendance_v2")
                    .select("student_id, attendance_logs")
                    .in("student_id", validIds);

                if (v2Attendance) {
                    v2Attendance.forEach(att => {
                        const count = att.attendance_logs ? Object.keys(att.attendance_logs).length : 0;
                        if (summaries[att.student_id]) {
                            summaries[att.student_id].attendanceCount = count;
                        } else {
                            summaries[att.student_id] = { attendanceCount: count, totalMarks: 0, latestObservation: "" };
                        }
                    });
                }
            }
        }

        return summaries;

    } catch (err) {
        console.error("Unexpected error in performance summary RPC:", err);
        return {};
    }
}
