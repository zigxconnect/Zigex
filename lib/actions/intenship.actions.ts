"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

/**
 * Server Action to fetch a list of all published internships for the dashboard.
 * It joins with company profiles and "flattens" the data for easy use in components.
 */
export async function getDashboardInternships() {
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
    company: internship.company_profiles?.company_name || "Confidential",
    logoColor: "#1E3A8A",

    cover_image_url:
      internship.company_profiles?.cover_image_url || "/placeholder-cover.jpg",
  }));

  return flattenedData;
}

/**
 * NEW: Server Action to fetch the complete details of a single internship by its ID.
 * This is used for the internship details page.
 */
export async function getInternshipById(id: string) {
  const supabase = createServerActionClient();

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
