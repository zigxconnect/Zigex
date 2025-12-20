// file: app/api/companies/accepted-interns/route.ts

import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Applicant } from "@/lib/types/applicants";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await authMiddleware(request);
  if (auth instanceof NextResponse) return auth;
  if (auth.type !== "company" || !auth.company) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }
  const { company } = auth;

  try {
    // Local lightweight types
    interface IdRow {
      id?: string;
    }
    type ApplicationRow = {
      id: string;
      status?: string;
      resume_url?: string | null;
      cover_letter_url?: string | null;
      created_at?: string;
      application_type?: string;
      internship?: { id?: string; title?: string; company_id?: string } | null;
      program?: { id?: string; title?: string; company_id?: string } | null;
      event?: { id?: string; title?: string; company_id?: string } | null;
      student?: {
        full_name?: string;
        avatar_url?: string | null;
        email?: string | null;
        phone?: string | null;
      } | null;
    };

    const selectString = `
        id,
        status,
        resume_url,
        cover_letter_url,
        created_at,
        application_type,
        internship:internships(id, title, company_id),
        program:programs(id, title, company_id),
        event:event(id, title, company_id),
        student:student_profiles ( 
          full_name,
          avatar_url,
          email,
          phone 
        )
      `;

    // 1) fetch all posting ids that belong to this company
    const [
      { data: internships, error: internshipsError },
      { data: programs, error: programsError },
      { data: events, error: eventsError },
    ] = await Promise.all([
      supabaseAdmin
        .from("internships")
        .select("id")
        .eq("company_id", company.id),
      supabaseAdmin.from("programs").select("id").eq("company_id", company.id),
      supabaseAdmin.from("event").select("id").eq("company_id", company.id),
    ]);

    if (internshipsError || programsError || eventsError) {
      console.error(
        "Error fetching company postings:",
        internshipsError || programsError || eventsError
      );
      return NextResponse.json(
        {
          error:
            (internshipsError || programsError || eventsError)?.message ||
            "Error fetching postings",
        },
        { status: 500 }
      );
    }

    const internshipIds = (internships ?? [])
      .map((r: IdRow) => r.id)
      .filter(Boolean) as string[];
    const programIds = (programs ?? [])
      .map((r: IdRow) => r.id)
      .filter(Boolean) as string[];
    const eventIds = (events ?? [])
      .map((r: IdRow) => r.id)
      .filter(Boolean) as string[];

    // If company has no postings, return empty
    if (
      internshipIds.length === 0 &&
      programIds.length === 0 &&
      eventIds.length === 0
    ) {
      return NextResponse.json([]);
    }

    const orConditions: string[] = [];
    if (internshipIds.length > 0)
      orConditions.push(`internship_id.in.(${internshipIds.join(",")})`);
    if (programIds.length > 0)
      orConditions.push(`program_id.in.(${programIds.join(",")})`);
    if (eventIds.length > 0)
      orConditions.push(`event_id.in.(${eventIds.join(",")})`);

    const orQuery = orConditions.join(",");

    // Fetch only applications with status 'accepted'
    const { data: applications, error } = await supabaseAdmin
      .from("Applications")
      .select(selectString)
      .or(orQuery)
      .eq("status", "accepted") // Only get accepted applications
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!applications) {
      return NextResponse.json([]);
    }

    const formattedApplicants: Applicant[] = (
      applications as ApplicationRow[]
    ).map((app) => {
      const opportunity = app.internship || app.program || app.event;

      return {
        id: app.id,
        name: app.student?.full_name || "N/A",
        avatarUrl:
          app.student?.avatar_url || `/default-avatar.svg`,
        email: app.student?.email || "No email",
        phone: app.student?.phone || "No phone",
        internshipTitle: opportunity?.title || app.application_type,
        internshipId: opportunity?.id,
        appliedDate: app.created_at,
        status: app.status,
        resumeUrl: app.resume_url,
        coverLetter: app.cover_letter_url,
      };
    });

    return NextResponse.json(formattedApplicants);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "An internal server error occurred.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}