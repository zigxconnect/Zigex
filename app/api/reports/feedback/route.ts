import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/api/auth";

const MENTOR_EMAIL = "fonyuyjudegita@gmail.com";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentEmail, content, pointsEffect } = body;

    // The mentor is identified by the backend-verified session. A mentorEmail
    // in the request body proves nothing: the client code itself contains it.
    // TODO(backend): replace the hardcoded mentor with a supervisor role check.
    const user = await getCurrentUser();
    if (user?.email !== MENTOR_EMAIL) {
      return NextResponse.json({ error: "Forbidden: not authorized" }, { status: 403 });
    }

    if (!studentEmail) {
      return NextResponse.json({ error: "studentEmail is required" }, { status: 400 });
    }

    // Try to find the student's id from profiles (common Supabase pattern)
    const { data: profile, error: profileError } = await supabaseAdmin.from("profiles").select("id,email").eq("email", studentEmail).maybeSingle();
    if (profileError) {
      console.error("Profile lookup error:", profileError);
      return NextResponse.json({ error: "Failed to lookup student profile" }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: `No student found with email ${studentEmail}. Please ensure the student exists in the 'profiles' table.` }, { status: 404 });
    }

    const studentId = profile.id;

    // Find the most recent report for this student
    const { data: reports, error: reportsError } = await supabaseAdmin.from("daily_reports").select("id, feedback, points, report_date").eq("student_id", studentId).order("report_date", { ascending: false }).limit(1);
    if (reportsError) {
      console.error("daily_reports lookup error:", reportsError);
      return NextResponse.json({ error: "Failed to lookup student reports" }, { status: 500 });
    }

    if (!reports || reports.length === 0) {
      return NextResponse.json({ error: `No reports found for ${studentEmail}` }, { status: 404 });
    }

    const report = reports[0];

    const feedback = {
      id: crypto.randomUUID(),
      mentorEmail: user.email,
      content,
      pointsEffect,
      created_at: new Date().toISOString(),
    };

    const updatedFeedback = [...(report.feedback || []), feedback];
    const updatedPoints = (report.points || 0) + (pointsEffect || 0);

    const { data, error } = await supabaseAdmin.from("daily_reports").update({ feedback: updatedFeedback, points: updatedPoints }).eq("id", report.id).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
