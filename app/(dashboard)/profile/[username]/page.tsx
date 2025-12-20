// just some updates
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
} from "lucide-react";
import { EditProfileButton } from "@/components/sections/student-profile/EditProfileButton";
import { QuickEditField } from "@/components/sections/student-profile/QuickEditField";
import QRCodeButton from "@/components/sections/dashboard/QRCodeButton";
import PersonalizedFeed from "@/components/feed/PersonalizedFeed";
import CreateProjectButton from "@/components/project/CreateProjectButton";
import SimilarStudentsSidebar from "@/components/sections/dashboard/SimilarStudentsSidebar";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  // Get current authenticated user
  const supabase = await createServerActionClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Redirect to sign in if not authenticated
  if (!authUser) {
    redirect("/sign-in");
  }

  // Fetch the profile being viewed by username
  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold">Profile not found</h2>
          <p className="text-gray-500 mt-2">This profile may have been removed.</p>
        </div>
      </div>
    );
  }

  // Verify this is the current user's profile
  const myProfile = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (myProfile.error || !myProfile.data || myProfile.data.username !== username) {
    redirect(`/dashboard/student/${username}`);
  }

  const skills = data.hard_skills || [];
  const soft = data.soft_skills || [];

  // Fetch accepted application counts
  const [internRes, progRes, eventRes] = await Promise.all([
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
  ]);

  const internshipsApplied = internRes?.count ?? 0;
  const programsApplied = progRes?.count ?? 0;
  const eventsApplied = eventRes?.count ?? 0;
  const avatarUrl = data.avatar_url || "https://i.ibb.co/CpS0wpjC/z3.jpg";
  const coverImageUrl = data.cover_image || "https://i.ibb.co/vv3sgJwd/n8.jpg";

  // Fetch similar students
  const { data: candidatesData } = await supabaseAdmin
    .from("student_profiles")
    .select("id, username, full_name, avatar_url, university, linkedin_url, phone, email, hard_skills, soft_skills")
    .neq("username", username)
    .limit(10);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FF] to-blue-50/30 pb-24 lg:pr-[26rem]">
      {/* Header Card */}
      <div className="relative bg-white md:rounded-[2rem] md:w-full mx-auto shadow-2xl shadow-blue-100/50 md:border-2 md:border-blue-50 overflow-hidden mb-6">
        {/* Cover Image */}
        <div className="relative h-32 md:h-40 lg:h-56 w-full">
          <Image
            src={coverImageUrl}
            alt="Cover image"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#155DFC]/20 via-[#155DFC]/5 to-[#155DFC]/40" />
        </div>

        {/* Avatar and QR Code Section */}
        <div className="absolute top-20 md:top-24 lg:top-32 left-4 lg:left-6 right-4 lg:right-6 flex justify-between items-end">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-2xl shadow-blue-200/50 overflow-hidden bg-white ring-4 ring-blue-50">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={data.full_name || "Profile"}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] text-white flex items-center justify-center font-black text-2xl uppercase tracking-wider">
                  {initials}
                </div>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
          </div>

          {/* QR Code Button */}
          <QRCodeButton 
            linkedinUrl={linkedinUrl}
            whatsappUrl={null}
            email={data.email}
            fullName={data.full_name}
            profileUrl={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://zigex.vercel.app'}/profile/${username}`}
            isOwner={true}
          />
        </div>

        {/* Content Area */}
        <div className="pt-12 md:pt-14 lg:pt-16 px-4 lg:px-6 pb-4 lg:pb-6">
          {/* User Info and Actions */}
          <div className="flex flex-col gap-4">
            {/* Name and Location */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                  {data.full_name || "Your Profile"}
                </h1>
                {/* Verification Badge */}
                <div className="flex items-center justify-center bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] rounded-full p-1 shadow-lg">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 md:w-5 md:h-5 fill-white"
                    aria-label="Verified"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 mb-2">
                <MapPin size={14} className="text-[#155DFC] shrink-0" />
                <p className="text-xs md:text-sm font-bold truncate">
                  {data.university || "University not specified"}
                </p>
              </div>

              {/* Similar Students Sidebar */}
              <SimilarStudentsSidebar students={similarStudents} />

              {/* Social Links */}
              <div className="flex items-center gap-3 flex-wrap text-xs">
                {data.linkedin_url && (
                  <Link
                    href={data.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F8FF] text-[#155DFC] hover:bg-[#155DFC] hover:text-white rounded-full transition-all duration-300 border border-blue-100 hover:border-[#155DFC] font-bold text-xs uppercase tracking-wider"
                  >
                    <Link2 size={14} />
                    <span>LinkedIn</span>
                  </Link>
                )}

                {data.github_url && (
                  <Link
                    href={data.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F8FF] text-[#155DFC] hover:bg-[#155DFC] hover:text-white rounded-full transition-all duration-300 border border-blue-100 hover:border-[#155DFC] font-bold text-xs uppercase tracking-wider"
                  >
                    <Github size={14} />
                    <span>Github</span>
                  </Link>
                )}

                {data.email && (
                  <Link
                    href={`mailto:${data.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F8FF] text-[#155DFC] hover:bg-[#155DFC] hover:text-white rounded-full transition-all duration-300 border border-blue-100 hover:border-[#155DFC] font-bold text-xs uppercase tracking-wider"
                  >
                    <Mail size={14} />
                    <span>Email</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Action Buttons - Edit and My Projects */}
            <div className="flex items-center gap-3 mt-2">
              <EditProfileButton
                isOwner={true}
                userId={authUser.id}
                profileData={data}
              />
              <Link
                href="/dashboard/projects"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] text-white text-sm font-black uppercase tracking-wider hover:shadow-2xl hover:shadow-blue-200 transition-all duration-500 hover:scale-105 active:scale-95"
              >
                My projects
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-4 pt-4 border-t-2 border-blue-50">
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {internshipsApplied}
                </span>
                <span className="text-[10px] md:text-xs text-slate-600 font-black uppercase tracking-wider">Internships</span>
              </div>

              <div className="w-px h-10 md:h-12 bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>

              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {programsApplied}
                </span>
                <span className="text-[10px] md:text-xs text-slate-600 font-black uppercase tracking-wider">Programs</span>
              </div>

              <div className="w-px h-10 md:h-12 bg-gradient-to-b from-transparent via-blue-200 to-transparent"></div>

              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {eventsApplied}
                </span>
                <span className="text-[10px] md:text-xs text-slate-600 font-black uppercase tracking-wider">Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 space-y-6 md:mb-0 mb-16">
        {/* Personalized Feed */}
        <PersonalizedFeed 
          userId={data.id}
          userSkills={[...skills, ...soft]}
          university={data.university}
        />

        {/* About Section */}
        {data.about && (
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-100/30 border-2 border-blue-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] rounded-2xl flex items-center justify-center shadow-lg">
                <Briefcase size={22} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">About</h2>
            </div>
            <QuickEditField
              label="About"
              value={data.about || ""}
              fieldName="about"
              multiline
              maxLength={500}
            />
          </div>
        )}

        {/* Skills Section */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-100/30 border-2 border-blue-50">
          {/* Hard Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] rounded-2xl flex items-center justify-center shadow-lg">
                  <Award size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Hard Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#F6F8FF] to-blue-50 text-[#155DFC] rounded-full text-sm font-black border-2 border-blue-100 hover:border-[#155DFC] hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300 cursor-pointer uppercase tracking-wider"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Soft Skills */}
          {soft.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] rounded-2xl flex items-center justify-center shadow-lg">
                  <Award size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Soft Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {soft.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#F6F8FF] to-blue-50 text-[#155DFC] rounded-full text-sm font-black border-2 border-blue-100 hover:border-[#155DFC] hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300 cursor-pointer uppercase tracking-wider"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-blue-100/30 border-2 border-blue-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar size={22} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Activity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#F6F8FF] to-blue-50 rounded-2xl p-5 border-2 border-blue-100 hover:border-[#155DFC] transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 group">
              <div className="text-4xl font-black bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                {internshipsApplied}
              </div>
              <div className="text-sm text-slate-700 font-black uppercase tracking-wider">Internships Applied</div>
            </div>

            <div className="bg-gradient-to-br from-[#F6F8FF] to-blue-50 rounded-2xl p-5 border-2 border-blue-100 hover:border-[#155DFC] transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 group">
              <div className="text-4xl font-black bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                {programsApplied}
              </div>
              <div className="text-sm text-slate-700 font-black uppercase tracking-wider">Programs Applied</div>
            </div>

            <div className="bg-gradient-to-br from-[#F6F8FF] to-blue-50 rounded-2xl p-5 border-2 border-blue-100 hover:border-[#155DFC] transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 group">
              <div className="text-4xl font-black bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                {eventsApplied}
              </div>
              <div className="text-sm text-slate-700 font-black uppercase tracking-wider">Events Applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Floating Button */}
      <CreateProjectButton variant="floating" />
    </div>
  );
}
