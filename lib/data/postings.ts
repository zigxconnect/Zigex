import { createSupabaseServerClient } from "../supabase/server";

// TYPE DEFINITIONS

export type Posting = {
  id: string;
  postingType: "Internship" | "Program" | "Event";
  title: string;
  description: string;
  created_at: string;
  type?: "onsite" | "remote" | "hybrid";
  [key: string]: any;
};

type Internship = {
  id: string;
  deadline: string;
  category: string;
  created_at: string;
  [key: string]: any;
};
type Program = {
  id: string;
  end_date: string;
  program_category: string;
  created_at: string;
  [key: string]: any;
};
type Event = {
  id: string;
  end_date: string;
  created_at: string;
  [key: string]: any;
};
type Application = {
  id: string;
  created_at: string;
  status: string;
  internship_id?: string;
  program_id?: string;
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

// PUBLIC-FACING API FUNCTIONS

/** Fetches the company profile for the currently authenticated user. */
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
 * Fetches a single posting by its ID, adding a generic 'postingType' property
 * while preserving the original 'type' field from the database.
 */
export async function getPostingById(id: string): Promise<Posting | null> {
  const supabase = createSupabaseServerClient();
  const tables: Array<{
    name: "internships" | "programs" | "event";
    type: Posting["postingType"];
  }> = [
    { name: "internships", type: "Internship" },
    { name: "programs", type: "Program" },
    { name: "event", type: "Event" },
  ];
  for (const table of tables) {
    const { data } = await supabase
      .from(table.name)
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      return { ...data, postingType: table.type };
    }
  }
  return null;
}

/** Fetches and formats all postings for a given company. */
export async function getAllCompanyPostings(companyId: string) {
  const supabase = createSupabaseServerClient();
  const { internships, programs, events } = await _fetchAllPostings(
    supabase,
    companyId
  );

  if (
    internships.length === 0 &&
    programs.length === 0 &&
    events.length === 0
  ) {
    return { hasData: false, postings: [] };
  }

  const allPostings = _combineAndSortPostings(internships, programs, events);
  const countsMap = await _fetchApplicationCounts(
    supabase,
    internships.map((p) => p.id),
    programs.map((p) => p.id)
  );
  const formattedPostings = _formatPostingsForClient(allPostings, countsMap);

  return { hasData: true, postings: formattedPostings };
}

/** Fetches and calculates the header stats for a company. */
export async function getHeaderStats(companyId: string) {
  const supabase = createSupabaseServerClient();
  const { internships, programs, events } = await _fetchAllPostings(
    supabase,
    companyId,
    {
      internshipCols: "id, deadline",
      programCols: "id, end_date",
      eventCols: "id, end_date",
    }
  );

  const totalPostings = internships.length + programs.length + events.length;
  const now = new Date();
  const activePostings =
    internships.filter((p) => new Date(p.deadline) >= now).length +
    programs.filter((p) => new Date(p.end_date) >= now).length +
    events.filter((p) => new Date(p.end_date) >= now).length;

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

/** Fetches and processes all analytical data for the main admin dashboard. */
export async function getDashboardAnalytics(companyId: string) {
  const supabase = createSupabaseServerClient();
  const { internships, programs, events, applications } =
    await _fetchAllAnalyticsData(supabase, companyId);
  const allPostings: (Internship | Program | Event)[] = [
    ...internships,
    ...programs,
    ...events,
  ];

  return {
    stats: _calculateKPIs(allPostings, applications),
    applicationsTrend: _processTrendData(applications),
    fieldBreakdown: _processFieldBreakdown(applications),
    recentApplications: _processRecentApplications(applications),
  };
}

// PRIVATE HELPER FUNCTIONS

/** A single, reusable function to fetch all types of postings. */
async function _fetchAllPostings(
  supabase: any,
  companyId: string,
  cols: {
    internshipCols?: string;
    programCols?: string;
    eventCols?: string;
  } = {}
) {
  const { internshipCols = "*", programCols = "*", eventCols = "*" } = cols;
  const [internshipsResult, programsResult, eventsResult] = await Promise.all([
    supabase
      .from("internships")
      .select(internshipCols)
      .eq("company_id", companyId),
    supabase.from("programs").select(programCols).eq("company_id", companyId),
    supabase.from("event").select(eventCols).eq("company_id", companyId),
  ]);
  return {
    internships: (internshipsResult.data || []) as Internship[],
    programs: (programsResult.data || []) as Program[],
    events: (eventsResult.data || []) as Event[],
  };
}

/** Fetches all data required for the main dashboard analytics. */
async function _fetchAllAnalyticsData(supabase: any, companyId: string) {
  const { internships, programs, events } = await _fetchAllPostings(
    supabase,
    companyId,
    {
      internshipCols: "id, deadline, category, created_at, title",
      programCols: "id, end_date, program_category, created_at, title",
      eventCols: "id, end_date, created_at, title",
    }
  );

  const { data: applications } = await supabase
    .from("applications")
    .select(
      "*, profiles(full_name), internships(title, category), programs(title, program_category)"
    )
    .eq("company_id", companyId);

  return {
    internships,
    programs,
    events,
    applications: (applications || []) as Application[],
  };
}

/** Combines separate posting arrays into one, adding a `postingType` property and sorting. */
function _combineAndSortPostings(
  internships: Internship[],
  programs: Program[],
  events: Event[]
) {
  const allPostings = [
    ...internships.map((item) => ({
      ...item,
      postingType: "Internship" as const,
    })),
    ...programs.map((item) => ({ ...item, postingType: "Program" as const })),
    ...events.map((item) => ({ ...item, postingType: "Event" as const })),
  ];
  return allPostings.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/** Fetches application counts for postings that can have applicants. */
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

/** Fetches the total application count. */
async function _fetchTotalApplicationCount(
  supabase: any,
  internshipIds: string[],
  programIds: string[]
) {
  if (internshipIds.length === 0 && programIds.length === 0) return 0;

  const orConditions = [];
  if (internshipIds.length > 0)
    orConditions.push(`internship_id.in.(${internshipIds.join(",")})`);
  if (programIds.length > 0)
    orConditions.push(`program_id.in.(${programIds.join(",")})`);

  const { count } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .or(orConditions.join(","));
  return count ?? 0;
}

/** Formats the combined posting data for the client-side list view. */
function _formatPostingsForClient(
  allPostings: any[],
  countsMap: Record<string, number>
) {
  return allPostings.map((p) => {
    const endDate = new Date(p.deadline || p.end_date);
    const isExpired = endDate < new Date();
    return {
      id: p.id,
      title: p.title,
      type: p.postingType,
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

/** Calculates the high-level KPI stats for the dashboard cards. */
function _calculateKPIs(
  allPostings: (Internship | Program | Event)[],
  allApplications: Application[]
) {
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

/** Processes application data for the monthly trend chart. */
function _processTrendData(allApplications: Application[]) {
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

/** Processes application data for the field breakdown pie chart. */
function _processFieldBreakdown(allApplications: Application[]) {
  if (allApplications.length === 0) {
    return {
      hasData: false,
      emptyState: {
        title: "No Field Data Available",
        message: "This chart will show a breakdown by application category.",
      },
    };
  }
  const fieldData = allApplications.reduce((acc, app: any) => {
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

/** Processes application data for the recent applications table. */
function _processRecentApplications(allApplications: Application[]) {
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
      (app: any): RecentApplication => ({
        id: app.id,
        name: app.profiles?.full_name || "N/A",
        field: app.internships?.title || app.programs?.title || "N/A",
        date: new Date(app.created_at).toISOString().split("T")[0],
        status: app.status,
      })
    );
  return { hasData: true, data: recentAppsData };
}
