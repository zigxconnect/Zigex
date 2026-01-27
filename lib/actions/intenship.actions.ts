"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

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

  // 4. Fetch assigned tasks
  const { data: tasks } = await supabase
    .from("internship_tasks")
    .select("*")
    .eq("internship_id", application.internship_id)
    .order("created_at", { ascending: false });

  // 5. Fetch notes
  const { data: notes } = await supabase
    .from("intern_notes")
    .select("*")
    .eq("student_id", user.id)
    .eq("internship_id", application.internship_id)
    .order("updated_at", { ascending: false });

  return {
    application,
    curriculum: curriculum || [],
    logs: logs || [],
    tasks: tasks || [],
    notes: notes || []
  };
}

/**
 * Server Action to submit a daily internship log/report.
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

  if (!user) throw new Error("Unauthorized");

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

  return { success: true, data };
}


