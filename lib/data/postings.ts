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
  internship_image_url?: string;
  [key: string]: any;
};
type Program = {
  id: string;
  end_date: string;
  program_category: string;
  created_at: string;
  program_picture_url?: string;
  [key: string]: any;
};
type Event = {
  id: string;
  end_date: string;
  created_at: string;
  event_picture_url?: string;
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
  statusColor?: string;
};

// PUBLIC-FACING API FUNCTIONS

/** Fetches the company profile for the currently authenticated user. */
export async function getAuthenticatedCompanyProfile() {
  const supabase = await createSupabaseServerClient();
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
 * Fetches a single posting by its ID, adding a generic 'postingType' property.
 */
export async function getPostingById(id: string): Promise<Posting | null> {
  const supabase = await createSupabaseServerClient();
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
  const supabase = await createSupabaseServerClient();
  const { internships, programs, events } = await _fetchAllPostings(
    supabase,
    companyId
  );

  if (!internships.length && !programs.length && !events.length) {
    return { hasData: false, postings: [] };
  }

  const allPostings = _combineAndSortPostings(internships, programs, events);
  const countsMap = await _fetchApplicationCounts(supabase, companyId);
  const formattedPostings = _formatPostingsForClient(allPostings, countsMap);

  return { hasData: true, postings: formattedPostings };
}

/** Fetches and calculates the header stats for a company. */
export async function getHeaderStats(companyId: string) {
  const supabase = await createSupabaseServerClient();
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
    companyId
  );

  return {
    total: totalPostings,
    active: activePostings,
    applications: totalApplicationsCount,
  };
}

/**
 * Fetches and processes all analytical data for the main admin dashboard.
 */
export async function getDashboardAnalytics(companyId: string) {
  const supabase = await createSupabaseServerClient();
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

/**
 * Fetches all applications for a company with detailed profile info.
 * Used for the Kanban board.
 */
export async function getCompanyApplications(companyId: string) {
  const supabase = await createSupabaseServerClient();
  
  // Note: Adjust the select query based on your actual schema relationships
  const { data: applications, error } = await supabase
    .from("Applications")
    .select(`
      *,
      student_profiles (
        full_name,
        first_name,
        last_name,
        username,
        avatar_url,
        email,
        phone,
        university,
        degree,
        field_of_study,
        graduation_year,
        hard_skills,
        soft_skills,
        languages,
        location,
        about
      ),
      internships (
        title
      ),
      programs (
        title
      )
    `)
    .eq("company_id", companyId);

  if (error) {
    console.error("Error fetching company applications:", error);
    return [];
  }

  if (applications && applications.length > 0) {
    console.log("DEBUG: First application profile:", JSON.stringify(applications[0].student_profiles, null, 2));
  }

  return (applications || []).map((app: any) => {
    // Robust name resolution
    let displayName = "Unknown Candidate";
    if (app.student_profiles) {
      if (app.student_profiles.full_name) {
        displayName = app.student_profiles.full_name;
      } else if (app.student_profiles.first_name) {
        displayName = `${app.student_profiles.first_name} ${app.student_profiles.last_name || ''}`.trim();
      } else if (app.student_profiles.username) {
        displayName = app.student_profiles.username;
      }
    }

    return {
      id: app.id,
      name: displayName,
      avatarUrl: app.student_profiles?.avatar_url || "",
      status: app.status || "applied",
      appliedDate: app.created_at,
      internshipTitle: app.internships?.title || app.programs?.title || "General Application",
      email: app.student_profiles?.email || app.email,
      phone: app.student_profiles?.phone || app.phone,
      resumeUrl: app.resume_url,
      coverLetter: app.cover_letter,
      // Extended fields
      university: app.student_profiles?.university,
      degree: app.student_profiles?.degree,
      fieldOfStudy: app.student_profiles?.field_of_study,
      graduationYear: app.student_profiles?.graduation_year,
      hardSkills: app.student_profiles?.hard_skills,
      softSkills: app.student_profiles?.soft_skills,
      languages: app.student_profiles?.languages,
      location: app.student_profiles?.location,
      about: app.student_profiles?.about,
      // Application specific fields
      applicationType: app.application_type,
      duration: app.duration,
      department: app.department,
      workMode: app.work_mode,
      level: app.level,
      expectations: app.expectations,
      comments: app.comments,
      rsvpStatus: app.rsvp_status,
    };
  });
}

// --- PRIVATE HELPER FUNCTIONS ---

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
    .from("Applications")
    .select(
      "*, student_profiles(full_name), internships(title, category), programs(title, program_category)"
    )
    .eq("company_id", companyId);

  return {
    internships,
    programs,
    events,
    applications: (applications || []) as Application[],
  };
}

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

async function _fetchApplicationCounts(supabase: any, companyId: string) {
  const { data: apps } = await supabase
    .from("Applications")
    .select("internship_id, program_id")
    .eq("company_id", companyId);
  if (!apps) return {};
  return (apps as any[]).reduce(
    (acc: Record<string, number>, app: any) => {
      const id = app.internship_id || app.program_id;
      if (id) acc[id] = (acc[id] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

async function _fetchTotalApplicationCount(supabase: any, companyId: string) {
  const { count } = await supabase
    .from("Applications")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId);
  return count ?? 0;
}

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
      imageUrl:
        p.postingType === "Program"
          ? p.program_picture_url
          : p.postingType === "Event"
            ? p.event_picture_url
            : p.internship_image_url,
    };
  });
}

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

  // Group applications by day to get daily totals
  const dailyData = allApplications.reduce(
    (acc, app) => {
      // Get the date in a simple YYYY-MM-DD format for unique keys
      const dayKey = new Date(app.created_at).toISOString().split("T")[0];

      if (!acc[dayKey]) {
        // Store the full date for accurate sorting/filtering and a user-friendly label
        acc[dayKey] = {
          date: new Date(app.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          fullDate: new Date(app.created_at).toISOString(),
          applications: 0,
          interns: 0,
        };
      }
      acc[dayKey].applications += 1;
      acc[dayKey].interns += app.status === "accepted" ? 1 : 0;
      return acc;
    },
    {} as Record<
      string,
      { date: string; fullDate: string; applications: number; interns: number }
    >
  );

  // Sort the data chronologically
  const sortedData = Object.values(dailyData).sort(
    (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
  );

  return { hasData: true, data: sortedData };
}

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
  const fieldData = allApplications.reduce(
    (acc, app: any) => {
      const field =
        app.internships?.category ||
        app.programs?.program_category ||
        "Uncategorized";
      if (!acc[field]) acc[field] = { field, applications: 0, interns: 0 };
      acc[field].applications += 1;
      acc[field].interns += app.status === "accepted" ? 1 : 0;
      return acc;
    },
    {} as Record<string, FieldStat>
  );
  return { hasData: true, data: Object.values(fieldData) };
}

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
    .map((app: any) => ({
      id: app.id,
      name: app.student_profiles?.full_name || "N/A",
      field: app.internships?.title || app.programs?.title || "N/A",
      date: new Date(app.created_at).toISOString().split("T")[0],
      status: app.status,
    }));
  return { hasData: true, data: recentAppsData };
}
