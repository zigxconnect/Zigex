import React from "react";
import { supabaseAdmin, createServerActionClient } from "@/lib/supabase/server";
import { unslugifyUsername, slugifyUsername } from "@/lib/utils";
import { fetchAllUserProjects } from "@/lib/actions/getProjects.action";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentProfileClient from "@/components/sections/dashboard/StudentProfileClient";
import { getProfileConnections, getEarnedBadges } from "@/lib/actions/gamification.action";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const username = p.username;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
  const supabase = supabaseAdmin;
  let data;

  if (isUuid) {
    data = (await supabase.from("student_profiles").select("*").eq("id", username).maybeSingle()).data || 
           (await supabase.from("student_profiles").select("*").eq("user_id", username).maybeSingle()).data;
  } else {
    // 1. Try exact match on 'username' column
    const { data: byUsername } = await supabase.from("student_profiles").select("*").eq("username", username).maybeSingle();
    
    // 2. Try case-insensitive match on 'full_name' using unslugified string ( underscores -> spaces )
    // e.g. "amandong_blandine_njweng" -> "amandong blandine njweng" -> matches "Amandong Blandine Njweng"
    const unslugified = unslugifyUsername(username);
    const { data: byFullName } = !byUsername 
      ? await supabase.from("student_profiles").select("*").ilike("full_name", unslugified).maybeSingle()
      : { data: null };

    // 3. Fallback: Try case-insensitive match on 'username'
    const { data: byUsernameIlike } = (!byUsername && !byFullName)
      ? await supabase.from("student_profiles").select("*").ilike("username", username).maybeSingle()
      : { data: null };

    data = byUsername || byFullName || byUsernameIlike;
  }

  if (!data) return { title: "Student Not Found" };

  const title = `${data.full_name} | Zigex Student`;
  const description = data.about || `View ${data.full_name}'s professional profile and projects on Zigex.`;
  const image = data.cover_image || "https://i.ibb.co/9kLrm6KY/og-image-2x-100-1.jpg";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "profile" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function StudentDetailPage({ params }: Props) {
  const { username } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);

  // Force slugified URL if non-UUID and contains spaces
  if (!isUuid && username.includes(" ")) {
    redirect(`/dashboard/student/${slugifyUsername(username)}`);
  }

  const supabase = await createServerActionClient();
  let data;




  if (isUuid) {
    const { data: profileById } = await supabase.from("student_profiles").select("*").eq("id", username).maybeSingle();
    data = profileById || (await supabase.from("student_profiles").select("*").eq("user_id", username).maybeSingle()).data;
  } else {
    // Normalize the search term
    const unslugified = unslugifyUsername(username).trim().toLowerCase();
    
    // 1. Try exact match on 'username' column
    const { data: byUsername } = await supabase.from("student_profiles").select("*").eq("username", username).maybeSingle();
    
    // 2. Try case-insensitive exact match on 'full_name'
    const { data: byFullName } = !byUsername
      ? await supabase.from("student_profiles").select("*").ilike("full_name", unslugified).maybeSingle()
      : { data: null };

    // 3. Fallback: Pattern-based search on 'full_name' (handles name order variations)
    // Split the name into parts and search for all parts being present
    const nameParts = unslugified.split(' ').filter(p => p.length > 2);
    let byFullNamePattern: typeof byFullName = null;
    if (!byUsername && !byFullName && nameParts.length > 0) {
      // Search for profiles that contain ALL name parts (case-insensitive)
      let query = supabase.from("student_profiles").select("*");
      for (const part of nameParts) {
        query = query.ilike("full_name", `%${part}%`);
      }
      const { data: patternResult } = await query.limit(1).maybeSingle();
      byFullNamePattern = patternResult;
    }

    // 4. Fallback: Try case-insensitive match on 'username' column
    const { data: byUsernameIlike } = (!byUsername && !byFullName && !byFullNamePattern)
      ? await supabase.from("student_profiles").select("*").ilike("username", username).maybeSingle()
      : { data: null };

    // Debug logging
    // Debug logging

    data = byUsername || byFullName || byFullNamePattern || byUsernameIlike;
  }

  if (!data) {
    console.warn(`[StudentLookup] FAILED for username: ${username}`);
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Student not found</h2>
        <p className="text-muted-foreground mb-4">Could not find a profile for &quot;{username}&quot;</p>
        <p className="text-xs text-muted-foreground">Try searching by the exact full name or ID.</p>
      </div>
    );
  }

  // Fetch internship count, projects, stories and supervisor profile in parallel
  const [
    internResLegacy,
    internResModern,
    progRes,
    eventRes,
    projectsResult,
    storiesRes,
    supervisorProfileRes,
    connectionStats,
    badges
  ] = await Promise.all([
    supabaseAdmin.from("Applications").select("id", { count: "exact", head: true }).eq("student_id", data.id).eq("application_type", "internship").neq("status", "rejected"),
    supabaseAdmin.from("internship_applications").select("id", { count: "exact", head: true }).or(`student_id.eq.${data.user_id},student_id.eq.${data.id}`).eq("status", "accepted"),
    supabaseAdmin.from("Applications").select("id", { count: "exact", head: true }).eq("student_id", data.id).eq("application_type", "program").neq("status", "rejected"),
    supabaseAdmin.from("Applications").select("id", { count: "exact", head: true }).eq("student_id", data.id).eq("application_type", "event").neq("status", "rejected"),
    fetchAllUserProjects(data.id),
    supabaseAdmin.from("stories").select("*").eq("user_id", data.user_id).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }),
    supabaseAdmin.from("supervisor_profiles").select("*").or(`user_id.eq.${data.user_id},email.eq.${data.email}`).maybeSingle(),
    getProfileConnections(data.id, data.user_id),
    getEarnedBadges(data.id, data.user_id)
  ]);

  const stats = {
    internshipsApplied: Math.max(internResLegacy?.count || 0, internResModern?.count || 0),
    programsApplied: progRes?.count || 0,
    eventsApplied: eventRes?.count || 0,
  };
  const projects = projectsResult.success ? projectsResult.data : [];
  const activeStories = storiesRes?.data || [];
  const supervisorProfile = supervisorProfileRes?.data || null;

  let myProfile: any = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      myProfile = (await supabase.from("student_profiles").select("id, user_id").eq("user_id", user.id).maybeSingle()).data;
    }
  } catch (err) {}

  const { data: candidatesData } = await supabase.from("student_profiles").select("id, username, full_name, avatar_url, university, linkedin_url, phone, email, hard_skills, soft_skills").neq("id", data.id).limit(300);
  const candidates = (candidatesData || []) as Array<any>;
  const similarlyScored = candidates.map((c) => {
    const hard = (c.hard_skills || []).filter((s: string) => (data.hard_skills || []).includes(s)).length;
    const soft = (c.soft_skills || []).filter((s: string) => (data.soft_skills || []).includes(s)).length;
    return { ...c, score: hard + soft };
  }).sort((a, b) => b.score - a.score).slice(0, 6);

  /* Fetch detailed application status for the display list */
  const { data: appsData } = await supabaseAdmin
    .from("Applications")
    .select("id, application_type, status, program_id, event_id, programs(title), events(title)")
    .eq("student_id", data.id)
    .eq("status", "accepted");

  const applicationsList = appsData?.map((app: any) => ({
    type: app.application_type,
    status: app.status,
    title: app.programs?.title || app.events?.title || "Unknown Activity",
    id: app.program_id || app.event_id
  })) || [];

  // ========== ACTIVE INTERNSHIP DETECTION ==========
  let activeInternshipInfo: {
    internship: any;
    company: any;
    supervisor: any;
    logs: any[];
  } | null = null;

  // Build the query - handle cases where user_id might be null/undefined
  const studentIdFilters: string[] = [];
  if (data.user_id) studentIdFilters.push(`student_id.eq.${data.user_id}`);
  if (data.id) studentIdFilters.push(`student_id.eq.${data.id}`);

  console.log(`[VisitorProfile] Searching for active internship - user_id: ${data.user_id}, profile_id: ${data.id}`);
  console.log(`[VisitorProfile] Filters: ${studentIdFilters.join(' OR ')}`);

  let activeApp = null;
  if (studentIdFilters.length > 0) {
    const { data: appData, error: appError } = await supabaseAdmin
      .from("internship_applications")
      .select(`
        id,
        internship_id,
        student_id,
        domain,
        status,
        internships (
          id, title, type, location, description,
          company_profiles (
            id, company_name, logo_url, cover_image_url
          )
        )
      `)
      .or(studentIdFilters.join(','))
      .eq("status", "accepted")
      .maybeSingle();

    activeApp = appData;
    console.log(`[VisitorProfile] Query result:`, appData ? `Found! id=${appData.id}, status=${appData.status}` : 'No result');
    if (appError) console.error(`[VisitorProfile] Query error:`, appError);
  }

  if (activeApp?.internships) {
    // Parallelize active internship details (logs and supervisor)
    const [logsRes, supervisorRes] = await Promise.all([
      supabaseAdmin.from("intern_logs").select("id, log_date").eq("student_id", data.user_id).eq("internship_id", activeApp.internship_id),
      supabaseAdmin.from("supervisor_profiles").select("id, full_name, avatar_url, role, email").eq("domain", (activeApp as any).domain).maybeSingle()
    ]);

    activeInternshipInfo = {
      internship: activeApp.internships,
      company: (activeApp.internships as any)?.company_profiles || null,
      supervisor: supervisorRes.data || null,
      logs: logsRes.data || []
    };
    console.log(`[VisitorProfile] SUCCESS - activeInternshipInfo set with internship: ${(activeApp.internships as any)?.title}`);
  } else {
    console.log(`[VisitorProfile] No active internship found - activeInternshipInfo is null`);
  }
  // ========== END ACTIVE INTERNSHIP DETECTION ==========

  // Check if viewed user is a supervisor (calculate supervisees count if they are)
  let superviseesCount = 0;
  if (supervisorProfile) {
    const [legacyApps, modernApps] = await Promise.all([
      supabaseAdmin
        .from("Applications")
        .select("student_id", { count: "exact", head: true })
        .eq("supervisor_id", supervisorProfile.id)
        .eq("status", "accepted"),
      supabaseAdmin
        .from("internship_applications")
        .select("student_id", { count: "exact", head: true })
        .eq("supervisor_id", supervisorProfile.id)
        .eq("status", "accepted")
    ]);
    superviseesCount = (legacyApps?.count || 0) + (modernApps?.count || 0);
  }

  return (
    <StudentProfileClient
      data={data}
      stats={stats}
      projects={projects}
      activeStories={activeStories}
      similarStudents={similarlyScored}
      myProfile={myProfile}
      username={username}
      applicationsList={applicationsList}
      activeInternshipInfo={activeInternshipInfo}
      supervisorProfile={supervisorProfile}
      superviseesCount={superviseesCount}
      connectionStats={connectionStats}
      badges={badges}
    />
  );
}
