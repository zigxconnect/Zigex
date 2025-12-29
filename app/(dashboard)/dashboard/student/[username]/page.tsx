import React from "react";
import { supabaseAdmin, createServerActionClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { 
  Github, 
  Link2, 
  MapPin, 
  Briefcase, 
  Award, 
  Calendar,
  Mail,
  Phone,
  MessageCircle,
  Linkedin,
  Heart,
  Share2,
  Activity,
  Zap
} from "lucide-react";
import ConnectBar from "@/components/sections/dashboard/ConnectBar";
import QRCodeButton from "@/components/sections/dashboard/QRCodeButton";
import SimilarStudentsSidebar from "@/components/sections/dashboard/SimilarStudentsSidebar";
import ProjectCard from "@/components/uiComponent/ProjectCard";
import AnimatedConnectButtons from "@/components/customButtons/AnimatedConnectButtons";
import NoProjectMessage from "@/components/sections/dashboard/NoProjectMessage";
import { fetchAllUserProjects } from "@/lib/actions/getProjects.action";
import CreateProjectButton from "@/components/project/CreateProjectButton";
import { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
  const supabase = supabaseAdmin;

  let query = supabase.from("student_profiles").select("*");
  if (isUuid) {
    query = query.eq("id", username);
  } else {
    query = query.eq("username", username);
  }

  const { data } = await query.maybeSingle();
  if (!data) return { title: "Student Not Found" };

  const title = `${data.full_name} | Zigex Student`;
  const description = data.about || `View ${data.full_name}'s professional profile and projects on Zigex.`;
  const image = data.cover_image || "https://i.ibb.co/k2Rpz2jQ/og-image-2x-100.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function StudentDetailPage({ params }: Props) {
  const { username } = await params;

  // Check if the username param is a UUID (fallback for old links or users without usernames)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);

  const supabase = await createServerActionClient();

  let query = supabase.from("student_profiles").select("*");

  if (isUuid) {
    query = query.eq("id", username);
  } else {
    query = query.eq("username", username);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold">Student not found</h2>
          <p className="text-gray-500 mt-2">This profile may have been removed.</p>
        </div>
      </div>
    );
  }

  const skills = data.hard_skills || [];
  const soft = data.soft_skills || [];
  
  // Fetch stats and projects in parallel
  const [internRes, progRes, eventRes, projectsResult] = await Promise.all([
    supabaseAdmin
      .from("Applications")
      .select("id", { count: "exact", head: true })
      .eq("student_id", data.id)
      .eq("application_type", "internship")
      .eq("status", "accepted"),
    supabaseAdmin
      .from("Applications")
      .select("id", { count: "exact", head: true })
      .eq("student_id", data.id)
      .eq("application_type", "program")
      .eq("status", "rsvp_confirmed"),
    supabaseAdmin
      .from("Applications")
      .select("id", { count: "exact", head: true })
      .eq("student_id", data.id)
      .eq("application_type", "event")
      .eq("status", "rsvp_confirmed"),
    fetchAllUserProjects(data.id)
  ]);

  const internshipsApplied = internRes?.count ?? 0;
  const programsApplied = progRes?.count ?? 0;
  const eventsApplied = eventRes?.count ?? 0;
  const projects = projectsResult.success ? projectsResult.data : [];
  
  const avatarUrl = data.avatar_url || "https://i.ibb.co/CpS0wpjC/z3.jpg";
  const coverImageUrl = data.cover_image || "https://i.ibb.co/vv3sgJwd/n8.jpg";

  // Fetch visitor's profile for "isOwner" check
  let myProfile: any = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: _myProfile } = await supabase
        .from("student_profiles")
        .select("id, user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      myProfile = _myProfile;
    }
  } catch (err) {
    console.error("Error fetching visitor data:", err);
  }

  // Fetch similar students
  let similarQuery = supabase
    .from("student_profiles")
    .select("id, username, full_name, avatar_url, university, linkedin_url, phone, email, hard_skills, soft_skills")
    .neq("id", data.id);

  if (myProfile?.id) {
    similarQuery = similarQuery.neq("id", myProfile.id);
  }

  const { data: candidatesData } = await similarQuery.limit(10);
  const candidates = (candidatesData || []) as Array<any>;

  const myHard: string[] = data.hard_skills || [];
  const mySoft: string[] = data.soft_skills || [];

  function countOverlap(arrA: string[], arrB: string[] = []) {
    if (!arrA || !arrB) return 0;
    const s = new Set(arrB.map((x) => (x || "").toLowerCase()));
    return arrA.reduce((acc: number, cur: string) => acc + (s.has((cur || "").toLowerCase()) ? 1 : 0), 0);
  }

  const scored = candidates
    .map((c) => {
      const hard = countOverlap(c.hard_skills || [], myHard);
      const soft = countOverlap(c.soft_skills || [], mySoft);
      return { ...c, score: hard + soft, hardMatches: hard, softMatches: soft };
    })
    .sort((a, b) => b.score - a.score);

  let similar = scored.filter((s) => s.score >= 4);
  if (similar.length < 4) {
    similar = scored.slice(0, 3);
  }

  const similarStudents = similar.slice(0, 6).map((s) => ({
    id: s.id,
    username: s.username,
    full_name: s.full_name,
    avatar_url: s.avatar_url,
    university: s.university,
    linkedin_url: s.linkedin_url,
    phone: s.phone,
    email: s.email,
    hard_skills: s.hard_skills,
    soft_skills: s.soft_skills,
    score: s.score,
  }));

  const initials = (data.full_name || "")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const linkedinUrl = data.linkedin_url;
  const whatsappUrl = data.phone 
    ? `https://wa.me/${data.phone.replace(/\D/g, '')}`
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 lg:pr-[26rem]">
      {/* 1. Header Card */}
      <div className="relative bg-white md:rounded-3xl md:w-full mx-auto shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="relative h-40 md:h-48 lg:h-56 w-full">
          <Image
            src={coverImageUrl}
            alt="Cover image"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        </div>

        <div className="absolute top-28 md:top-36 lg:top-40 left-6 right-6 flex justify-between items-end">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-white">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={data.full_name || "Student"}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-3xl">
                  {initials}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
          </div>

          <QRCodeButton 
            linkedinUrl={linkedinUrl}
            whatsappUrl={whatsappUrl}
            email={data.email}
            fullName={data.full_name}
            profileUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/student/${data.username || username}`}
            isOwner={false}
          />
        </div>

        <div className="pt-16 md:pt-20 lg:pt-24 px-6 pb-8">
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {data.full_name || "Zigex Student"}
                </h1>
                <div className="flex items-center justify-center bg-blue-600 rounded-full p-1 shadow-md shadow-blue-200">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <MapPin size={16} className="text-blue-500" />
                <p className="text-sm md:text-base font-semibold">{data.university || "University not specified"}</p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {data.linkedin_url && (
                  <Link href={data.linkedin_url} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100">
                    <Linkedin size={14} /> LinkedIn
                  </Link>
                )}
                {data.github_url && (
                  <Link href={data.github_url} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-200">
                    <Github size={14} /> Github
                  </Link>
                )}
                {data.email && (
                  <Link href={`mailto:${data.email}`} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all border border-rose-100">
                    <Mail size={14} /> Email
                  </Link>
                )}
              </div>
            </div>

            <AnimatedConnectButtons linkedinUrl={linkedinUrl} whatsappUrl={whatsappUrl} />
          </div>
        </div>
      </div>

      {/* 2. Main Content Feed */}
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        
        {/* About Section - PRIORITIZED TOP */}
        {data.about && (
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Briefcase size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">About Me</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Professional Summary</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-wrap">
              {data.about}
            </p>
          </section>
        )}

        {/* Similar Students (Mobile View) */}
        <div className="lg:hidden">
            <SimilarStudentsSidebar students={similarStudents} />
        </div>

        {/* Projects Section - MOVED UP */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-100">
                <Award size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Projects Started</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{projects.length} Initiatives</p>
              </div>
            </div>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  user={data} 
                  project={project} 
                  isVisitor={true} 
                  isOwner={myProfile?.id === data.id} 
                />
              ))}
            </div>
          ) : (
            <NoProjectMessage studentName={data.full_name || 'This student'} studentPhone={data.phone} />
          )}
        </section>

        {/* Activity & Stats - MOVED DOWN */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Ecosystem Activity</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Growth & Impact</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 hover:scale-105 transition-transform">
              <div className="text-4xl font-black text-blue-600 mb-2">{internshipsApplied}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Internships</div>
            </div>
            <div className="p-6 bg-purple-50/50 rounded-3xl border border-purple-100 hover:scale-105 transition-transform">
              <div className="text-4xl font-black text-purple-600 mb-2">{programsApplied}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Programs</div>
            </div>
            <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 hover:scale-105 transition-transform">
              <div className="text-4xl font-black text-emerald-600 mb-2">{eventsApplied}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Events</div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Hard Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-sm font-bold border border-slate-200 hover:border-slate-400 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Heart size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Soft Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {soft.map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100 hover:border-blue-300 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Sidebar (Desktop) */}
      <div className="hidden lg:block">
        <SimilarStudentsSidebar students={similarStudents} />
      </div>

      {/* 4. Utilities */}
      <ConnectBar 
        linkedin={data.linkedin_url} 
        whatsapp={data.phone} 
        x={data.twitter_url || data.x_url} 
        email={data.email} 
      />

      {myProfile?.id === data.id && (
        <CreateProjectButton variant="floating" />
      )}
    </div>
  );
}