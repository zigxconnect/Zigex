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

    // Resolve all possible IDs for this student
    const { data: profile } = await supabase
        .from("student_profiles")
        .select("id, user_id")
        .or(`id.eq.${studentId},user_id.eq.${studentId}`)
        .single();

    const ids = [studentId];
    if (profile) {
        if (profile.id) ids.push(profile.id);
        if (profile.user_id) ids.push(profile.user_id);
    }
    const uniqueIds = [...new Set(ids)];

    const { data, error } = await supabase
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

    // Resolve all possible IDs for this student
    const { data: profile } = await supabase
        .from("student_profiles")
        .select("id, user_id")
        .or(`id.eq.${studentId},user_id.eq.${studentId}`)
        .single();

    const ids = [studentId];
    if (profile) {
        if (profile.id) ids.push(profile.id);
        if (profile.user_id) ids.push(profile.user_id);
    }
    const uniqueIds = [...new Set(ids)];

    let query = supabase
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

    return data;
}

export async function getCompanyInternsPerformanceSummary(companyId: string) {
    if (!companyId) return {};
    const supabase = await createServerActionClient();

    try {
        const { data, error } = await supabase.rpc('get_company_intern_performance_summary', {
            p_company_id: companyId
        });

        if (error) {
            console.error("RPC Error fetching performance summary:", error);
            // Fallback to empty object or throw
            return {};
        }

        console.log(`[PERF_SUMMARY_RPC] Fetched summary for ${Object.keys(data || {}).length} keys`);
        return data || {};

    } catch (err) {
        console.error("Unexpected error in performance summary RPC:", err);
        return {};
    }
}
