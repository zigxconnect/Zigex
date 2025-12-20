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
    <div className="min-h-screen bg-background pb-24 lg:pr-[26rem]">
      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 lg:px-6 pt-6 space-y-6 md:mb-0 mb-16">
        {/* Header Card */}
        <div className="relative bg-card rounded-3xl border border-border overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-32 md:h-40 lg:h-56 w-full">
          <Image
            src={coverImageUrl}
            alt="Cover image"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/10" />
        </div>

        {/* Avatar and QR Code Section */}
        <div className="absolute top-20 md:top-24 lg:top-32 left-4 lg:left-6 right-4 lg:right-6 flex justify-between items-end">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full border-4 border-card overflow-hidden bg-card ring-4 ring-muted">
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
                <div className="w-full h-full bg-primary text-white flex items-center justify-center font-black text-2xl uppercase tracking-wider">
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
                <h1 className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground tracking-tight">
                  {data.full_name || "Your Profile"}
                </h1>
                {/* Verification Badge */}
                <div className="flex items-center justify-center bg-primary rounded-full p-1">
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 md:w-5 md:h-5 fill-white"
                    aria-label="Verified"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <MapPin size={14} className="text-primary shrink-0" />
                <p className="text-xs md:text-sm font-bold truncate">
                  {data.university || "University not specified"}
                </p>
              </div>

              {/* Similar Students Sidebar */}
              <SimilarStudentsSidebar students={similarStudents} />
            </div>

            {/* Action Buttons and Social Links */}
            <div className="flex items-center gap-4 flex-wrap mt-2">
              <div className="flex items-center gap-3">
                <EditProfileButton
                  isOwner={true}
                  userId={authUser.id}
                  profileData={data}
                />
                <Link
                  href="/dashboard/projects"
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  My projects
                </Link>
              </div>

              {/* Social Links - Repositioned beside buttons */}
              <div className="flex items-center gap-4 text-foreground ml-2">
                {data.linkedin_url && (
                  <Link
                    href={data.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors duration-300"
                    title="LinkedIn"
                  >
                    <svg fill="currentColor" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                      <path d="M28.778 1.004h-25.56c-0.008-0-0.017-0-0.027-0-1.199 0-2.172 0.964-2.186 2.159v25.672c0.014 1.196 0.987 2.161 2.186 2.161 0.010 0 0.019-0 0.029-0h25.555c0.008 0 0.018 0 0.028 0 1.2 0 2.175-0.963 2.194-2.159l0-0.002v-25.67c-0.019-1.197-0.994-2.161-2.195-2.161-0.010 0-0.019 0-0.029 0h0.001zM9.9 26.562h-4.454v-14.311h4.454zM7.674 10.293c-1.425 0-2.579-1.155-2.579-2.579s1.155-2.579 2.579-2.579c1.424 0 2.579 1.154 2.579 2.578v0c0 0.001 0 0.002 0 0.004 0 1.423-1.154 2.577-2.577 2.577-0.001 0-0.002 0-0.003 0h0zM26.556 26.562h-4.441v-6.959c0-1.66-0.034-3.795-2.314-3.795-2.316 0-2.669 1.806-2.669 3.673v7.082h-4.441v-14.311h4.266v1.951h0.058c0.828-1.395 2.326-2.315 4.039-2.315 0.061 0 0.121 0.001 0.181 0.003l-0.009-0c4.5 0 5.332 2.962 5.332 6.817v7.855z"></path>
                    </svg>
                  </Link>
                )}

                {data.github_url && (
                  <Link
                    href={data.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors duration-300"
                    title="GitHub"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" aria-label="GitHub" role="img" viewBox="0 0 512 512" fill="currentColor" className="w-6 h-6">
                      <path d="M335 499c14 0 12 17 12 17H165s-2-17 12-17c13 0 16-6 16-12l-1-50c-71 16-86-28-86-28-12-30-28-37-28-37-24-16 1-16 1-16 26 2 40 26 40 26 22 39 59 28 74 22 2-17 9-28 16-35-57-6-116-28-116-126 0-28 10-51 26-69-3-6-11-32 3-67 0 0 21-7 70 26 42-12 86-12 128 0 49-33 70-26 70-26 14 35 6 61 3 67 16 18 26 41 26 69 0 98-60 120-117 126 10 8 18 24 18 48l-1 70c0 6 3 12 16 12z"/>
                    </svg>
                  </Link>
                )}

                {data.email && (
                  <Link
                    href={`mailto:${data.email}`}
                    className="hover:text-primary transition-colors duration-300"
                    title="Email"
                  >
                    <Mail size={24} />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-primary">
                  {internshipsApplied}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Internships</span>
              </div>

              <div className="w-px h-10 md:h-12 bg-border"></div>

              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-primary">
                  {programsApplied}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Programs</span>
              </div>

              <div className="w-px h-10 md:h-12 bg-border"></div>

              <div className="flex flex-col items-center cursor-pointer group">
                <span className="text-xl md:text-2xl lg:text-3xl font-semibold text-primary">
                  {eventsApplied}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Events</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Personalized Feed wrapped in a card */}
        <div className="bg-card rounded-3xl border border-border overflow-hidden">
          <PersonalizedFeed 
            userId={data.id}
            userSkills={[...skills, ...soft]}
            university={data.university}
          />
        </div>

        {/* About Section */}
        {data.about && (
          <div className="bg-card rounded-3xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                <Briefcase size={26} className="text-white" />
              </div>
              <h2 className="text-xl lg:text-2xl font-heading font-bold text-foreground uppercase tracking-wide">About</h2>
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
        <div className="bg-card rounded-3xl p-6 border border-border">
          {/* Hard Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                  <Award size={26} className="text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-foreground uppercase tracking-wide">Hard Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2.5 bg-muted text-primary rounded-full text-sm font-semibold border border-border hover:border-primary transition-all duration-300 cursor-pointer uppercase tracking-wider"
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
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                  <Award size={26} className="text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-foreground uppercase tracking-wide">Soft Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {soft.map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2.5 bg-muted text-primary rounded-full text-sm font-semibold border border-border hover:border-primary transition-all duration-300 cursor-pointer uppercase tracking-wider"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Stats */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Calendar size={26} className="text-white" />
            </div>
            <h3 className="text-xl lg:text-2xl font-heading font-bold text-foreground uppercase tracking-wide">Activity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted rounded-2xl p-5 border border-border">
              <div className="text-3xl md:text-4xl font-semibold text-primary mb-2">
                {internshipsApplied}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Internships Applied</div>
            </div>

            <div className="bg-muted rounded-2xl p-5 border border-border">
              <div className="text-3xl md:text-4xl font-semibold text-primary mb-2">
                {programsApplied}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Programs Applied</div>
            </div>

            <div className="bg-muted rounded-2xl p-5 border border-border">
              <div className="text-3xl md:text-4xl font-semibold text-primary mb-2">
                {eventsApplied}
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Events Applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Floating Button */}
      <CreateProjectButton variant="floating" />
    </div>
  );
}
