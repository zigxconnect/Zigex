import { unstable_rethrow } from "next/navigation";
/**
 * Students — app/(dashboard)/dashboard/student/page.tsx
 *
 * Find other students on Zigex and open their profiles. Shows only what the
 * backend actually returns (name, @username, photo, school); the old page's
 * badges, online dots, "active now" count and profile score were invented.
 */

import type { Metadata } from "next";
import { serverApi } from "@/lib/api/server-client";
import { whenAvailable } from "@/lib/api/errors";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { getMyProfile } from "@/lib/api/services/profile";
import { StudentDirectory } from "@/components/students/StudentDirectory";
import { StudentAvatar, tidySchool, type StudentRow } from "@/components/students/student-ui";
import { landingButton } from "@/components/sections/landing/landing-ui";

export const metadata: Metadata = { title: "Students" };

async function firstPage(): Promise<{ rows: StudentRow[]; total: number }> {
  try {
    const res = await whenAvailable(() => serverApi.get<StudentRow[]>("/students?page=1&limit=50"), null);
    return { rows: res?.data ?? [], total: res?.meta?.total ?? res?.data?.length ?? 0 };
  } catch (error) {
    // Let Next.js's own signals (e.g. "this page reads cookies, render it per request") through.
    unstable_rethrow(error);
    console.error("[students] list failed:", error);
    return { rows: [], total: 0 };
  }
}

/** The student's own card, as everyone else sees it in this directory. */
function YourCard({ me }: { me: StudentRow }) {
  const school = tidySchool(me.university);
  const missing = [!me.avatar_url && "a photo", !school && "your school"].filter(Boolean) as string[];
  return (
    <section aria-labelledby="you-title" className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <StudentAvatar s={me} size="h-14 w-14 text-lg" />
        <div className="min-w-0">
          <p id="you-title" className="text-sm text-[#7B869C]">How other students see you</p>
          <p className="truncate font-heading text-base font-semibold text-[#0B1B3F]">{me.full_name}</p>
          {school ? (
            <p className="flex items-center gap-1.5 text-sm text-[#4A5670]">
              <GraduationCap className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
              {school}
            </p>
          ) : (
            <p className="text-sm text-[#7B869C]">School not added</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        {missing.length > 0 && (
          <p className="text-sm text-[#4A5670]">Add {missing.join(" and ")} so classmates recognise you.</p>
        )}
        <Link href="/dashboard/edit-profile" className={`${landingButton(missing.length ? "primary" : "secondary", "md")} self-start sm:self-auto`}>
          Edit profile
        </Link>
      </div>
    </section>
  );
}

export default async function StudentsPage() {
  const [{ rows, total }, meRow] = await Promise.all([firstPage(), getMyProfile().catch(() => null)]);
  const mine = (meRow?.profile ?? meRow) as Record<string, any> | null;
  const me: StudentRow | null = mine
    ? { id: mine.id, username: mine.username, full_name: mine.full_name, avatar_url: mine.avatar_url ?? mine.profile_picture, university: mine.university }
    : null;
  return (
    <div className="pb-16">
      <header className="mb-6">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">Students</h1>
        <p className="mt-1 text-base text-[#4A5670]">Find classmates and other students on Zigex, and see their profiles.</p>
      </header>
      {me?.full_name && <YourCard me={me} />}
      <StudentDirectory initial={rows.filter((r) => r.id !== me?.id)} total={total} />
    </div>
  );
}
