import Link from "next/link";
import type { Metadata } from "next";
import { getPublicProfile, getPublicProfileRow } from "@/lib/api/services/public-profile";
import { StudentProfile } from "@/components/students/StudentProfile";
import { landingButton } from "@/components/sections/landing/landing-ui";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfileRow(decodeURIComponent(username)).catch(() => null);
  if (!data) return { title: "Student not found" };
  const name = String(data.full_name ?? "").replace(/\s+/g, " ").trim() || "Zigex student";
  const description = (data.about ? String(data.about) : `${name} on Zigex.`).slice(0, 160);
  return { title: name, description, openGraph: { title: name, description, type: "profile" } };
}

/** Profile pages are found by profile id or exact username (see student-ui profileHref). */
export default async function Page({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicProfile(decodeURIComponent(username)).catch(() => null);

  if (!profile) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-[#0B1B3F]">This profile isn&apos;t available</h1>
        <p className="mt-2 text-base text-[#4A5670]">The link may be old, or the student may have changed their username.</p>
        <Link href="/dashboard/student" className={`${landingButton("primary", "md")} mt-6`}>
          Find them in Students
        </Link>
      </div>
    );
  }

  return (
    <StudentProfile
      data={profile.data}
      projects={profile.projects as any[]}
      accepted={profile.applicationsList}
      isMe={Boolean(profile.myProfile && profile.myProfile.id === profile.data.id)}
      back={{ href: "/dashboard/student", label: "Students" }}
    />
  );
}
