import { createSupabaseServerClient } from "../supabase/server";

export type Posting = {
  id: string;
  type: "Internship" | "Program" | "Event";
  title: string;
  description: string;
  created_at: string;
  [key: string]: any;
};

type MonthlyData = { month: string; applications: number; interns: number };
type FieldStat = { field: string; applications: number; interns: number };
type RecentApplication = {
  id: string;
  name: string;
  field: string;
  date: string;
  status: string;
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
    if (data) return { ...data, type: table.type };
  }
  return null;
}

/**
 * Fetches and formats all postings for a given company, including applicant counts.
 */
export async function getAllCompanyPostings(companyId: string) {
  const supabase = createSupabaseServerClient();
  const [internships, programs] = await _fetchAllPostings(supabase, companyId);

  if (internships.length === 0 && programs.length === 0) {
    return { hasData: false, postings: [] };
  }

  const allPostings = _combineAndSortPostings(internships, programs);
  const countsMap = await _fetchApplicationCounts(
    supabase,
    internships.map((p) => p.id),
    programs.map((p) => p.id)
  );
  const formattedPostings = _formatPostingsForClient(allPostings, countsMap);

  return { hasData: true, postings: formattedPostings };
}

/**
 * Fetches and calculates the header stats (total, active, applications) for a company.
 */
export async function getHeaderStats(companyId: string) {
  const supabase = createSupabaseServerClient();
  const [internships, programs] = await _fetchAllPostings(
    supabase,
    companyId,
    "id, deadline",
    "id, end_date"
  );

  const totalPostings = internships.length + programs.length;
  const now = new Date();
  const activePostings =
    internships.filter((p) => new Date(p.deadline) >= now).length +
    programs.filter((p) => new Date(p.end_date) >= now).length;

  const totalApplicationsCount = await _fetchTotalApplicationCount(
    supabase,
    internships.map((p) => p.id),
    programs.map((p) => p.id)
  );

  return {
    total: totalPostings,
    active: activePostings,
    applications: totalApplicationsCount,
  };
}

/**
 * Fetches and processes all analytical data needed for the main admin dashboard.
 */
export async function getDashboardAnalytics(companyId: string) {
  const supabase = createSupabaseServerClient();
  const [internships, programs, allApplications] = await _fetchAllAnalyticsData(
    supabase,
    companyId
  );
  const allPostings = [...internships, ...programs];

  const stats = _calculateKPIs(allPostings, allApplications);
  const applicationsTrend = _processTrendData(allApplications);
  const fieldBreakdown = _processFieldBreakdown(allApplications);
  const recentApplications = _processRecentApplications(allApplications);

  return { stats, applicationsTrend, fieldBreakdown, recentApplications };
}

async function _fetchAllPostings(
  supabase: any,
  companyId: string,
  internshipCols = "*",
  programCols = "*"
) {
  const [internshipsResult, programsResult] = await Promise.all([
    supabase
      .from("internships")
      .select(internshipCols)
      .eq("company_id", companyId),
    supabase.from("programs").select(programCols).eq("company_id", companyId),
  ]);
  return [internshipsResult.data || [], programsResult.data || []];
}

async function _fetchAllAnalyticsData(supabase: any, companyId: string) {
  const [internshipsResult, programsResult, applicationsResult] =
    await Promise.all([
      supabase
        .from("internships")
        .select("id, deadline, category")
        .eq("company_id", companyId),
      supabase
        .from("programs")
        .select("id, end_date, program_category")
        .eq("company_id", companyId),
      supabase
        .from("applications")
        .select(
          "*, profiles(full_name), internships(title, category), programs(title, program_category)"
        )
        .eq("company_id", companyId),
    ]);
  return [
    internshipsResult.data || [],
    programsResult.data || [],
    applicationsResult.data || [],
  ];
}

function _combineAndSortPostings(internships: any[], programs: any[]) {
  return [
    ...internships.map((item) => ({ ...item, type: "Internship" as const })),
    ...programs.map((item) => ({ ...item, type: "Program" as const })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

async function _fetchApplicationCounts(
  supabase: any,
  internshipIds: string[],
  programIds: string[]
) {
  const orConditions = [];
  if (internshipIds.length > 0)
    orConditions.push(`internship_id.in.(${internshipIds.join(",")})`);
  if (programIds.length > 0)
    orConditions.push(`program_id.in.(${programIds.join(",")})`);
  if (orConditions.length === 0) return {};

  const { data: apps } = await supabase
    .from("applications")
    .select("internship_id, program_id")
    .or(orConditions.join(","));
  if (!apps) return {};

  return apps.reduce((acc, app) => {
    const id = app.internship_id || app.program_id;
    if (id) acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

async function _fetchTotalApplicationCount(
  supabase: any,
  internshipIds: string[],
  programIds: string[]
) {
  const orConditions = [];
  if (internshipIds.length > 0)
    orConditions.push(`internship_id.in.(${internshipIds.join(",")})`);
  if (programIds.length > 0)
    orConditions.push(`program_id.in.(${programIds.join(",")})`);
  if (orConditions.length === 0) return 0;

  const { count } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .or(orConditions.join(","));
  return count ?? 0;
}

function _formatPostingsForClient(
  allPostings: any[],
  countsMap: Record<string, number>
) {
  return allPostings.map((p) => {
    const isExpired = new Date(p.deadline || p.end_date) < new Date();
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

function _calculateKPIs(allPostings: any[], allApplications: any[]) {
  const totalPostings = allPostings.length;
  const totalApplications = allApplications.length;
  const totalHired = allApplications.filter(
    (a) => a.status === "accepted"
  ).length;
  const now = new Date();
  const activePostings = allPostings.filter(
    (p) => new Date(p.deadline || p.end_date) >= now
  ).length;
  const expiredPostings = totalPostings - activePostings;
  const completionRate =
    totalPostings > 0
      ? ((expiredPostings / totalPostings) * 100).toFixed(0)
      : 0;

  return {
    totalHired,
    totalApplications,
    activePostings,
    completionRate: `${completionRate}%`,
  };
}

function _processTrendData(allApplications: any[]) {
  if (allApplications.length === 0) {
    return {
      hasData: false,
      emptyState: {
        title: "No Application Data Yet",
        message: "As you receive applications, a trend graph will appear here.",
      },
    };
  }
  const monthlyData = allApplications.reduce((acc, app) => {
    const month = new Date(app.created_at).toLocaleString("en-US", {
      month: "short",
    });
    if (!acc[month]) acc[month] = { month, applications: 0, interns: 0 };
    acc[month].applications += 1;
    acc[month].interns += app.status === "accepted" ? 1 : 0;
    return acc;
  }, {} as Record<string, MonthlyData>);
  return { hasData: true, data: Object.values(monthlyData) };
}

function _processFieldBreakdown(allApplications: any[]) {
  if (allApplications.length === 0) {
    return {
      hasData: false,
      emptyState: {
        title: "No Field Data Available",
        message: "This chart will show a breakdown by application category.",
      },
    };
  }
  const fieldData = allApplications.reduce((acc, app) => {
    const field =
      app.internships?.category ||
      app.programs?.program_category ||
      "Uncategorized";
    if (!acc[field]) acc[field] = { field, applications: 0, interns: 0 };
    acc[field].applications += 1;
    acc[field].interns += app.status === "accepted" ? 1 : 0;
    return acc;
  }, {} as Record<string, FieldStat>);
  return { hasData: true, data: Object.values(fieldData) };
}

function _processRecentApplications(allApplications: any[]) {
  if (allApplications.length === 0) {
    return {
      hasData: false,
      emptyState: {
        title: "No Recent Applications",
        message: "New submissions from candidates will be listed here.",
      },
    };
  }
  const recentAppsData = allApplications
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5)
    .map(
      (app): RecentApplication => ({
        id: app.id,
        name: app.profiles?.full_name || "N/A",
        field: app.internships?.title || app.programs?.title || "N/A",
        date: new Date(app.created_at).toISOString().split("T")[0],
        status: app.status,
      })
    );
  return { hasData: true, data: recentAppsData };
}
