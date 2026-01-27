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
    const supabase = createServerActionClient();

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
    const supabase = createServerActionClient();

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
    const supabase = createServerActionClient();

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
