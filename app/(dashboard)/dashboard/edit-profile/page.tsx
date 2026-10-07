/**
 * Edit profile — app/(dashboard)/dashboard/edit-profile/page.tsx
 *
 * Loads the saved profile on the server so the form opens filled in (the old
 * wizard opened empty, and saving could blank fields that were already set).
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/lib/api/services/profile";
import { EditProfileForm, type ProfileValues } from "@/components/profile/EditProfileForm";

export const metadata: Metadata = { title: "Edit profile" };

const str = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : v == null ? "" : String(v));
const list = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

export default async function EditProfilePage() {
  const row = await getMyProfile().catch(() => null);
  const p = ((row as any)?.profile ?? row) as Record<string, unknown> | null;
  if (!p) redirect("/sign-in?next=/dashboard/edit-profile");

  const initial: ProfileValues = {
    avatar_url: str(p.avatar_url ?? p.profile_picture),
    cover_image_url: str(p.cover_image_url ?? p.cover_image),
    first_name: str(p.first_name),
    last_name: str(p.last_name),
    username: str(p.username).replace(/^@+/, ""),
    phone: str(p.phone),
    location: str(p.location),
    about: str(p.about),
    university: str(p.university),
    field_of_study: str(p.field_of_study),
    degree: str(p.degree),
    graduation_year: str(p.graduation_year),
    hard_skills: list(p.hard_skills),
    soft_skills: list(p.soft_skills),
    languages: list(p.languages),
    previous_roles: list(p.previous_roles),
    achievements: list(p.achievements),
    preferred_industries: list(p.preferred_industries),
    work_mode: str(p.work_mode),
    interests: list(p.interests),
    linkedin_url: str(p.linkedin_url),
    github_url: str(p.github_url),
    portfolio_url: str(p.portfolio_url),
    gpa: str(p.gpa),
    accommodations: str(p.accommodations),
  };
  const username = initial.username;
  const profileHref = username && /^[A-Za-z0-9._-]+$/.test(username) ? `/profile/${username}` : p.id ? `/profile/${p.id}` : null;

  return <EditProfileForm initial={initial} email={str(p.email)} profileHref={profileHref} />;
}
