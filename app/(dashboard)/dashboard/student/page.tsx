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
import { StudentDirectory, type StudentRow } from "@/components/students/StudentDirectory";

export const metadata: Metadata = { title: "Students" };

async function firstPage(): Promise<{ rows: StudentRow[]; total: number }> {
  try {
    const res = await whenAvailable(() => serverApi.get<StudentRow[]>("/students?page=1&limit=50"), null);
    return { rows: res?.data ?? [], total: res?.meta?.total ?? res?.data?.length ?? 0 };
  } catch (error) {
    console.error("[students] list failed:", error);
    return { rows: [], total: 0 };
  }
}

export default async function StudentsPage() {
  const { rows, total } = await firstPage();
  return (
    <div className="pb-16">
      <header className="mb-6">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">Students</h1>
        <p className="mt-1 text-base text-[#4A5670]">Find classmates and other students on Zigex, and see their profiles.</p>
      </header>
      <StudentDirectory initial={rows} total={total} />
    </div>
  );
}
