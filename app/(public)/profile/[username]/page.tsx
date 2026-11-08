import Link from "next/link";
import type { Metadata } from "next";
import { getPublicProfile, getPublicProfileRow } from "@/lib/api/services/public-profile";
import { StudentProfile } from "@/components/students/StudentProfile";
import { landingButton } from "@/components/sections/landing/landing-ui";
import { getSession } from "@/lib/api/auth";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { IS_PRODUCTION } from "@/lib/app-env";
import { slugifyUsername } from "@/lib/utils";

type Props = { params: Promise<{ username: string }> };

/** The profile's own address: its username with spaces written as "_", else its id. */
const profilePath = (data: { username?: string | null; id: string }) =>
  `/profile/${encodeURIComponent(data.username ? slugifyUsername(data.username) : data.id)}`;

const cleanName = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfileRow(decodeURIComponent(username)).catch(() => null);
  if (!data) return { title: "Student not found", robots: { index: false, follow: false } };
  const name = cleanName(data.full_name) || "Zigex student";
  const school = [data.field_of_study, data.university].map(cleanName).filter(Boolean).join(", ");
  const about = cleanName(data.about);
  const description = (about || `${name}${school ? `, ${school}` : ""}. Student profile on Zigex.`).slice(0, 160);
  // Search engines may list a profile only when the student chose "public", and
  // never on the development site.
  const listable = IS_PRODUCTION && Boolean(data.is_public);
  return {
    ...pageMetadata({ title: school ? `${name} – ${school}` : name, description, path: profilePath(data), type: "profile" }),
    robots: listable ? { index: true, follow: true } : { index: false, follow: false },
  };
}

/** Lets search engines know the page is about this person (schema.org Person). */
function personJsonLd(data: Record<string, any> & { id: string }) {
  const links = [data.linkedin_url, data.github_url, data.portfolio_url].filter(
    (url): url is string => typeof url === "string" && /^https?:\/\//.test(url)
  );
  const json = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}${profilePath(data)}`,
    mainEntity: {
      "@type": "Person",
      name: cleanName(data.full_name),
      ...(data.username && { alternateName: data.username }),
      ...(data.avatar_url && { image: data.avatar_url }),
      ...(cleanName(data.about) && { description: cleanName(data.about).slice(0, 500) }),
      ...(cleanName(data.university) && { affiliation: { "@type": "EducationalOrganization", name: cleanName(data.university) } }),
      ...(cleanName(data.location) && { homeLocation: { "@type": "Place", name: cleanName(data.location) } }),
      ...(Array.isArray(data.hard_skills) && data.hard_skills.length > 0 && { knowsAbout: data.hard_skills.slice(0, 20) }),
      ...(links.length > 0 && { sameAs: links }),
    },
  };
  // "<" is escaped so text a student typed can never close the script tag.
  return JSON.stringify(json).replace(/</g, "\\u003c");
}

/**
 * A student's profile, found by profile id or exact username (see student-ui
 * profileHref). Public: companies and signed-out visitors open shared links
 * too. Phone, email, date of birth and GPA are never shown.
 */
export default async function Page({ params }: Props) {
  const { username } = await params;
  const [profile, session] = await Promise.all([getPublicProfile(decodeURIComponent(username)).catch(() => null), getSession()]);
  const student = session?.role === "student";

  if (!profile) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-[#0B1B3F]">This profile isn&apos;t available</h1>
        <p className="mt-2 text-base text-[#4A5670]">The link may be old, or the student may have changed their username.</p>
        <Link href={student ? "/dashboard/student" : "/feed"} className={`${landingButton("primary", "md")} mt-6`}>
          {student ? "Find them in Students" : "See opportunities on Zigex"}
        </Link>
      </div>
    );
  }

  return (
    <>
      {profile.data.is_public && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd(profile.data) }} />
      )}
      <StudentProfile
        data={profile.data}
        projects={profile.projects as any[]}
        accepted={profile.applicationsList}
        isMe={Boolean(profile.myProfile && profile.myProfile.id === profile.data.id)}
        back={student ? { href: "/dashboard/student", label: "Students" } : { href: "/feed", label: "Opportunities on Zigex" }}
      />
    </>
  );
}
