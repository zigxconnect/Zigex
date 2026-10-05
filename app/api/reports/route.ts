import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/api/auth";

// Points awarded for submitting a daily report. Set here, never by the client.
const REPORT_POINTS = 20;

export async function POST(req: Request) {
  try {
    // TODO(backend): move to a backend endpoint (see "Missing endpoints: Daily reports").
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { programId, report } = body;

    const { data, error } = await supabaseAdmin.from("daily_reports").insert([
      {
        id: report.id,
        program_id: programId,
        // The signed-in student, not a client-supplied id.
        student_id: user.userId,
        report_date: report.date,
        content: report.content,
        skills: report.skills,
        submitted: report.submitted,
        points: REPORT_POINTS,
        feedback: [],
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
