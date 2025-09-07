// FILE: lib/data/postings.ts

import { createSupabaseServerClient } from "../supabase/server";

// Define a normalized type for any posting
export type Posting = {
  id: string;
  type: "Internship" | "Program" | "Event";
  title: string;
  description: string;
  created_at: string;
  [key: string]: any;
};

/**
 * Fetches the company profile for the currently authenticated user.
 */
export async function getAuthenticatedCompanyProfile() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return companyProfile;
}

/**
 * Fetches a single posting by its ID, searching across all relevant tables.
 */
export async function getPostingById(id: string): Promise<Posting | null> {
  const supabase = createSupabaseServerClient();
  const tables: Array<{
    name: "internships" | "programs";
    type: Posting["type"];
  }> = [
    { name: "internships", type: "Internship" },
    { name: "programs", type: "Program" },
  ];

  for (const table of tables) {
    const { data } = await supabase
      .from(table.name)
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      return { ...data, type: table.type };
    }
  }
  return null;
}

/**
 * Fetches and formats all postings for a given company.
 */
export async function getAllCompanyPostings(companyId: string) {
  const supabase = createSupabaseServerClient();
  const [internshipsResult, programsResult] = await Promise.all([
    supabase.from("internships").select(`*`).eq("company_id", companyId),
    supabase.from("programs").select(`*`).eq("company_id", companyId),
  ]);

  const internships = internshipsResult.data || [];
  const programs = programsResult.data || [];

  const allPostings = [
    ...internships.map((item) => ({ ...item, type: "Internship" as const })),
    ...programs.map((item) => ({ ...item, type: "Program" as const })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const internshipIds = internships.map((p) => p.id);
  const programIds = programs.map((p) => p.id);
  const orConditions = [];
  if (internshipIds.length > 0)
    orConditions.push(`internship_id.in.(${internshipIds.join(",")})`);
  if (programIds.length > 0)
    orConditions.push(`program_id.in.(${programIds.join(",")})`);

  let countsMap: Record<string, number> = {};
  if (orConditions.length > 0) {
    const { data: apps } = await supabase
      .from("applications")
      .select("internship_id, program_id")
      .or(orConditions.join(","));
    if (apps) {
      countsMap = apps.reduce((acc, app) => {
        const id = app.internship_id || app.program_id;
        if (id) acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }
  }

  return allPostings.map((p) => {
    const isExpired =
      p.type === "Internship"
        ? new Date(p.deadline) < new Date()
        : new Date(p.end_date) < new Date();
    return {
      id: p.id,
      title: p.title,
      type: p.type,
      createdAt: new Date(p.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: isExpired ? "Expired" : "Active",
      applicantCount: countsMap[p.id] || 0,
    };
  });
}

/**
 * Fetches and calculates the header stats for a company.
 */
export async function getHeaderStats(companyId: string) {
  const supabase = createSupabaseServerClient();
  const [internshipsResult, programsResult] = await Promise.all([
    supabase
      .from("internships")
      .select("id, deadline")
      .eq("company_id", companyId),
    supabase
      .from("programs")
      .select("id, end_date")
      .eq("company_id", companyId),
  ]);

  const internships = internshipsResult.data || [];
  const programs = programsResult.data || [];

  const totalPostings = internships.length + programs.length;
  const activeInternships = internships.filter(
    (i) => new Date(i.deadline) >= new Date()
  ).length;
  const activePrograms = programs.filter(
    (p) => new Date(p.end_date) >= new Date()
  ).length;

  const internshipIds = internships.map((p) => p.id);
  const programIds = programs.map((p) => p.id);
  const orConditions = [];
  if (internshipIds.length > 0)
    orConditions.push(`internship_id.in.(${internshipIds.join(",")})`);
  if (programIds.length > 0)
    orConditions.push(`program_id.in.(${programIds.join(",")})`);

  let totalApplicationsCount = 0;
  if (orConditions.length > 0) {
    const { count } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .or(orConditions.join(","));
    totalApplicationsCount = count ?? 0;
  }

  return {
    total: totalPostings,
    active: activeInternships + activePrograms,
    applications: totalApplicationsCount,
  };
}

//================================================================================
// CORRECTED DASHBOARD ANALYTICS FUNCTION
//================================================================================
/**
 * Fetches and processes all analytical data needed for the main admin dashboard.
 */
export async function getDashboardAnalytics(companyId: string) {
  const supabase = createSupabaseServerClient();

  // 1. Fetch raw data. Instead of views, we'll fetch from the base tables.
  const [internshipsResult, programsResult, applicationsResult] =
    await Promise.all([
      supabase.from("internships").select("*").eq("company_id", companyId),
      supabase.from("programs").select("*").eq("company_id", companyId),
      // Fetch applications and join the related posting title for context
      supabase
        .from("applications")
        .select("*, profiles(full_name), internships(title), programs(title)")
        .eq("company_id", companyId),
    ]);

  const internships = internshipsResult.data || [];
  const programs = programsResult.data || [];
  const allPostings = [...internships, ...programs];
  const allApplications = applicationsResult.data || [];

  // --- 2. Calculate Key Performance Indicators (KPIs) ---

  // *** FIX IS HERE: Define totalPostings before using it ***
  const totalPostings = allPostings.length;

  const totalApplications = allApplications.length;
  const activePostings =
    internships.filter((p) => new Date(p.deadline) >= new Date()).length +
    programs.filter((p) => new Date(p.end_date) >= new Date()).length;
  const totalHired = allApplications.filter(
    (a) => a.status === "accepted"
  ).length;

  const expiredPostings =
    internships.filter((p) => new Date(p.deadline) < new Date()).length +
    programs.filter((p) => new Date(p.end_date) < new Date()).length;

  const completionRate =
    totalPostings > 0
      ? ((expiredPostings / totalPostings) * 100).toFixed(0)
      : 0;

  const stats = {
    totalHired,
    totalApplications,
    activePostings,
    completionRate: `${completionRate}%`,
  };

  // --- 3. Process data for the "Applications Trend" chart ---
  const monthlyApplications = allApplications.reduce((acc, app) => {
    const month = new Date(app.created_at).toLocaleString("en-US", {
      month: "short",
    });
    const hired = app.status === "accepted" ? 1 : 0;
    if (!acc[month]) {
      acc[month] = { month, applications: 0, interns: 0 };
    }
    acc[month].applications += 1;
    acc[month].interns += hired;
    return acc;
  }, {} as Record<string, { month: string; applications: number; interns: number }>);

  const applicationsTrend = Object.values(monthlyApplications);

  // --- 4. Process data for the "Field Statistics" breakdown ---
  const fieldStatsMap = allApplications.reduce((acc, app) => {
    // Determine category from the joined posting data
    const field =
      app.internships?.category ||
      app.programs?.program_category ||
      "Uncategorized";
    const isHired = app.status === "accepted" ? 1 : 0;

    if (!acc[field]) {
      acc[field] = { field, applications: 0, interns: 0 };
    }
    acc[field].applications += 1;
    acc[field].interns += isHired;
    return acc;
  }, {} as Record<string, { field: string; applications: number; interns: number }>);

  const fieldBreakdown = Object.values(fieldStatsMap);

  // --- 5. Get the 5 most recent applications ---
  const recentApplications = allApplications
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5)
    .map((app) => ({
      id: app.id,
      name: app.profiles?.full_name || "N/A", // Get name from joined profiles table
      field: app.internships?.title || app.programs?.title || "N/A", // Get title from joined data
      date: new Date(app.created_at).toISOString().split("T")[0],
      status: app.status,
    }));

  return {
    stats,
    applicationsTrend,
    fieldBreakdown,
    recentApplications,
  };
}
