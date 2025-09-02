"use server"; // This marks all functions in this file as server-side only.

import { createServerActionClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

/**
 * Server Action to fetch a list of all published internships.
 * This is used for the main public listing page.
 */
export async function getAllInternships() {
  const supabase = createServerActionClient();

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
          logo_color
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching internships:", error);
    // In a real app, you might want to handle this more gracefully
    return [];
  }

  return data;
}

/**
 * Server Action to fetch the complete details of a single internship by its ID.
 * This is used for the internship details page.
 */
export async function getInternshipById(id: string) {
  const supabase = createServerActionClient();

  const { data, error } = await supabase
    .from("internships")
    .select(`*, company_profiles (*)`) // Fetch all columns from both tables
    .eq("id", id)
    .single();

  if (error || !data) {
    // If no internship is found, trigger a 404 page.
    notFound();
  }

  return data;
}
