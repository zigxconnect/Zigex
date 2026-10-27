import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/api/auth";
import { aiServiceConfigured, AiServiceError, searchDocuments, handbookDepartment } from "@/lib/api/ai-service";
import { getAcceptedInternships } from "@/lib/actions/intenship.actions";
import { placementOpportunity, placementTargetId } from "@/lib/api/services/workspace";

/**
 * POST /api/ai/handbook/search { applicationId, query }
 *
 * Searches the documents a company uploaded for the intern's placement
 * (AI service POST /v1/search). The department and cohort are taken from the
 * student's own placement on the server, never from the request, so a student
 * can only search their own placement's documents.
 *
 * The AI service files each document under a `department` (one of its fixed
 * slugs, see AI_DEPARTMENTS) and a free-text `cohort_id`. The admin portal
 * uploads with `cohort_id` = the internship or program id and `department` =
 * handbookDepartment(category, title); this must match it.
 */

const Body = z.object({
  applicationId: z.string().trim().min(1).max(100),
  query: z.string().trim().min(2, "Type at least 2 characters.").max(300, "Keep your question under 300 characters."),
});

// Per-student limit; one Node process serves the app, so memory is enough.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;
const recent = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5_000) recent.clear();
  return hits.length > MAX_PER_WINDOW;
}

const fail = (status: number, message: string) => NextResponse.json({ success: false, data: null, message }, { status });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail(401, "Sign in to search your handbook.");
  if (!aiServiceConfigured()) return fail(503, "Handbook search isn't available yet.");
  if (rateLimited(session.userId)) return fail(429, "That's a lot of searches. Wait a minute and try again.");

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(422, parsed.error.issues[0]?.message ?? "Invalid search.");
  const { applicationId, query } = parsed.data;

  const placement = (await getAcceptedInternships()).find((p) => p.id === applicationId);
  if (!placement) return fail(404, "This placement isn't in your workspaces.");

  const opportunity = placementOpportunity(placement) ?? {};
  const cohortId = placementTargetId(placement);
  if (!cohortId) return fail(404, "This placement isn't in your workspaces.");
  const department = handbookDepartment(opportunity.category ?? opportunity.program_category, opportunity.title);

  try {
    const hits = await searchDocuments({ query, department, cohortId: String(cohortId), topK: 6 });
    return NextResponse.json({
      success: true,
      data: {
        hits: hits.map((h) => ({
          text: h.text,
          score: h.score,
          documentId: h.document_id,
          title: h.title,
          source: h.source,
          page: h.page ?? null,
          section: h.section ?? null,
        })),
      },
      message: hits.length ? "" : "No matches.",
    });
  } catch (error) {
    console.error("[handbook] search failed:", error);
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    if (timedOut) return fail(504, "The search took too long. Try a shorter question.");
    if (error instanceof AiServiceError && error.status === 422) return fail(422, "Try rephrasing your question.");
    return fail(502, "Search isn't working right now. Try again in a few minutes.");
  }
}
