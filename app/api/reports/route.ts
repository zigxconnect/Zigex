import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { programId, report } = body;

    const { data, error } = await supabaseAdmin.from("daily_reports").insert([
      {
        id: report.id,
        program_id: programId,
        student_id: report.studentId,
        report_date: report.date,
        content: report.content,
        skills: report.skills,
        submitted: report.submitted,
        points: report.points,
        feedback: report.feedback,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
