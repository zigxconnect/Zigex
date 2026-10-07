import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/api/auth";
import { applicationErrorResponse, createApplication } from "@/lib/api/services/applications";
import { getFeedItem } from "@/lib/api/services/feed";

/**
 * Internship application → POST /applications.
 *
 * The company sees the student's profile (name, school, contact) with every
 * application, so the form only asks what the profile can't say: why they
 * fit (required) and a few optional preferences. The fee acknowledgement is
 * required only when the internship has a fee.
 */
const schema = z.object({
  internship_id: z.string().uuid(),
  reason: z.string().trim().min(30, "Tell the company a little more about why you fit (30 characters or more).").max(2000),
  domain: z.string().trim().max(100).optional(),
  duration: z.string().trim().max(50).optional(),
  experience_level: z.string().trim().max(50).optional(),
  comment: z.string().trim().max(2000).optional(),
  is_paid_acknowledgement: z.boolean().optional(),
});

/** "3 months" → 3; "Flexible" → undefined */
function durationMonths(duration?: string): number | undefined {
  const numbers = duration?.match(/\d+/g)?.map(Number);
  return numbers?.length ? Math.max(...numbers) : undefined;
}

export async function POST(request: Request) {
  try {
    if (!(await getSession())) {
      return NextResponse.json({ error: "Sign in to apply." }, { status: 401 });
    }

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json({ error: first?.message ?? "Some answers are missing." }, { status: 400 });
    }
    const form = parsed.data;

    const posting = await getFeedItem("internships", form.internship_id).catch(() => null);
    if (!posting) return NextResponse.json({ error: "This internship couldn't be found." }, { status: 404 });
    if (posting.is_paid && !form.is_paid_acknowledgement) {
      return NextResponse.json({ error: "Confirm that you've read about the fee." }, { status: 400 });
    }

    // Labelled lines so the company sees every answer even before the backend stores them as fields.
    const comments = [
      `Why I'm a good fit: ${form.reason}`,
      form.domain && `Area: ${form.domain}`,
      form.duration && `Available for: ${form.duration}`,
      form.experience_level && `Experience: ${form.experience_level}`,
      posting.is_paid && "Acknowledged the internship fee: yes",
      form.comment && `Note: ${form.comment}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const application = await createApplication({
        application_type: "internship",
        internship_id: form.internship_id,
        department: form.domain,
        duration_months: durationMonths(form.duration),
        domain: form.domain,
        duration: form.duration,
        experience_level: form.experience_level,
        reason: form.reason,
        is_paid_acknowledgement: posting.is_paid ? true : undefined,
        comments,
      });
      return NextResponse.json(application, { status: 201 });
    } catch (error) {
      const { error: message, status } = applicationErrorResponse(error, "The application couldn't be sent.");
      return NextResponse.json({ error: message }, { status: status === 409 ? 400 : status });
    }
  } catch (error) {
    console.error("[apply/internship] failed:", error);
    return NextResponse.json(
      { error: "Zigex couldn't reach its server just now. Nothing was sent; your answers are kept. Try again in a moment." },
      { status: 503 }
    );
  }
}
