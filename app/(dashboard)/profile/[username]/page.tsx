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
  params: { username: string };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = params;

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
    .select("id, full_name, avatar_url, university, linkedin_url, phone, email, hard_skills, soft_skills")
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
    <div className="min-h-screen bg-gray-50 pb-24 lg:pr-[26rem]">
      {/* Header Card */}
      <div className="relative bg-white md:rounded-2xl md:w-full mx-auto shadow-lg md:border md:border-gray-200 overflow-hidden mb-6">
        {/* Cover Image */}
        <div className="relative h-32 md:h-36 lg:h-48 w-full">
          <Image
            src={coverImageUrl}
            alt="Cover image"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        {/* Avatar and QR Code Section */}
        <div className="absolute top-20 md:top-24 lg:top-32 left-4 lg:left-6 right-4 lg:right-6 flex justify-between items-end">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
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
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl">
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
                <h1 className="text-base md:text-lg lg:text-xl font-bold text-gray-900">
                  {data.full_name || "Your Profile"}
                </h1>
                {/* Verification Badge */}
                <div className="flex items-center justify-center bg-blue-500 rounded-full p-0.5">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 md:w-5 md:h-5 fill-white"
                    aria-label="Verified"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-gray-600 mb-2">
                <MapPin size={14} className="text-gray-500 shrink-0" />
                <p className="text-xs md:text-sm font-medium truncate">
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
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    <Link2 size={14} />
                    <span className="font-medium">LinkedIn</span>
                  </Link>
                )}

                {data.github_url && (
                  <Link
                    href={data.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    <Github size={14} />
                    <span className="font-medium">Github</span>
                  </Link>
                )}

                {data.email && (
                  <Link
                    href={`mailto:${data.email}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    <Mail size={14} />
                    <span className="font-medium">Email</span>
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
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                My projects
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {internshipsApplied}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 font-medium">Internships</span>
              </div>

              <div className="w-px h-8 md:h-10 bg-gray-200"></div>

              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {programsApplied}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 font-medium">Programs</span>
              </div>

              <div className="w-px h-8 md:h-10 bg-gray-200"></div>

              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  {eventsApplied}
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 font-medium">Events</span>
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">About</h2>
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          {/* Hard Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Hard Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Soft Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {soft.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Activity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {internshipsApplied}
              </div>
              <div className="text-sm text-gray-600">Internships Applied</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {programsApplied}
              </div>
              <div className="text-sm text-gray-600">Programs Applied</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {eventsApplied}
              </div>
              <div className="text-sm text-gray-600">Events Applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Floating Button */}
      <CreateProjectButton variant="floating" />
    </div>
  );
}
