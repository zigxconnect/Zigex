import React from "react";
import { supabaseAdmin, createServerActionClient } from "@/lib/supabase/server";
import { unslugifyUsername, slugifyUsername } from "@/lib/utils";
import { fetchAllUserProjects } from "@/lib/actions/getProjects.action";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import StudentProfileClient from "@/components/sections/dashboard/StudentProfileClient";

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
    const unslugified = unslugifyUsername(username);
    data = (await supabase.from("student_profiles").select("*").eq("username", username).maybeSingle()).data ||
           (await supabase.from("student_profiles").select("*").eq("username", unslugified).maybeSingle()).data;
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
    const unslugified = unslugifyUsername(username);
    const { data: profileByUsername } = await supabase.from("student_profiles").select("*").eq("username", username).maybeSingle();
    data = profileByUsername || (await supabase.from("student_profiles").select("*").eq("username", unslugified).maybeSingle()).data;
  }

  if (!data) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <h2 className="text-xl font-semibold">Student not found</h2>
      </div>
    );
  }

  const [internRes, progRes, eventRes, projectsResult, storiesRes] = await Promise.all([
    supabaseAdmin.from("Applications").select("id", { count: "exact", head: true }).eq("student_id", data.id).eq("application_type", "internship").neq("status", "rejected"),
    supabaseAdmin.from("Applications").select("id", { count: "exact", head: true }).eq("student_id", data.id).eq("application_type", "program").neq("status", "rejected"),
    supabaseAdmin.from("Applications").select("id", { count: "exact", head: true }).eq("student_id", data.id).eq("application_type", "event").neq("status", "rejected"),
    fetchAllUserProjects(data.id),
    supabaseAdmin.from("stories").select("*").eq("user_id", data.user_id).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false })
  ]);

  const stats = {
    internshipsApplied: internRes?.count || 0,
    programsApplied: progRes?.count || 0,
    eventsApplied: eventRes?.count || 0,
  };
  const projects = projectsResult.success ? projectsResult.data : [];
  const activeStories = storiesRes?.data || [];

  let myProfile: any = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      myProfile = (await supabase.from("student_profiles").select("id, user_id").eq("user_id", user.id).maybeSingle()).data;
    }
  } catch (err) {}

  const { data: candidatesData } = await supabase.from("student_profiles").select("id, username, full_name, avatar_url, university, linkedin_url, phone, email, hard_skills, soft_skills").neq("id", data.id).limit(10);
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
    .neq("status", "rejected");

  const applicationsList = appsData?.map((app: any) => ({
    type: app.application_type,
    status: app.status,
    title: app.programs?.title || app.events?.title || "Unknown Activity",
    id: app.program_id || app.event_id
  })) || [];

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
    />
  );
}