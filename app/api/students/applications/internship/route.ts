import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/api/auth";
import { applicationErrorResponse, createApplication } from "@/lib/api/services/applications";

const internshipApplicationSchema = z.object({
  internship_id: z.string().uuid(),
  full_name: z.string().min(2),
  school: z.string().min(2),
  school_level: z.string(),
  date_of_birth: z.string(), // ISO date string
  address: z.string().min(5),
  domain: z.string(),
  duration: z.string(),
  experience_level: z.string(),
  reason: z.string().min(10),
  expectations: z.string().min(10),
  is_paid_acknowledgement: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge that this is a paid internship.",
  }),
  comment: z.string().optional(),
});

/** "3-6 months" → 6; "Flexible" → undefined */
function durationMonths(duration: string): number | undefined {
  const numbers = duration.match(/\d+/g)?.map(Number);
  return numbers?.length ? Math.max(...numbers) : undefined;
}

/**
 * Paid-internship application form → POST /applications.
 *
 * The form's extra answers are sent as real fields (spec'd in
 * docs/backend-missing-endpoints.md) and also as labelled lines in
 * `comments`, so the company sees them even before the backend stores them.
 */
export async function POST(request: Request) {
  try {
    if (!(await getSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validationResult = internshipApplicationSchema.safeParse(await request.json());
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation Error", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }
    const form = validationResult.data;

    const comments = [
      `Full name: ${form.full_name}`,
      `School: ${form.school} (${form.school_level})`,
      `Date of birth: ${form.date_of_birth}`,
      `Address: ${form.address}`,
      `Domain: ${form.domain}`,
      `Preferred duration: ${form.duration}`,
      `Experience level: ${form.experience_level}`,
      `Reason for applying: ${form.reason}`,
      "Acknowledged this is a paid internship: yes",
      form.comment ? `Comment: ${form.comment}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const application = await createApplication({
        application_type: "internship",
        internship_id: form.internship_id,
        department: form.domain,
        duration_months: durationMonths(form.duration),
        expectations: form.expectations,
        school: form.school,
        school_level: form.school_level,
        date_of_birth: form.date_of_birth,
        address: form.address,
        domain: form.domain,
        duration: form.duration,
        experience_level: form.experience_level,
        reason: form.reason,
        is_paid_acknowledgement: form.is_paid_acknowledgement,
        comments,
      });
      return NextResponse.json(application, { status: 201 });
    } catch (error) {
      const { error: message, status } = applicationErrorResponse(error, "Failed to submit internship application.");
      // Callers show this message as-is; the old route answered duplicates with 400.
      return NextResponse.json({ error: message }, { status: status === 409 ? 400 : status });
    }
  } catch (error: any) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
