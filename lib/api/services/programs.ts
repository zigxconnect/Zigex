import "server-only";
import { serverApi } from "../server-client";
import { whenAvailable } from "../errors";
import { findFeedItemBySlug } from "./feed";
import { listApplications } from "./applications";
import { getMyProfile } from "./profile";

/**
 * "Programs I joined" (the Oct 2026 backend endpoint request → Programs I joined).
 * Content and members are spec'd endpoints: empty until deployed.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Program pages are linked by id or by a slug of the title. */
export async function resolveProgramId(idOrSlug: string): Promise<string | null> {
  if (UUID_RE.test(idOrSlug)) return idOrSlug;
  const match = await findFeedItemBySlug(idOrSlug);
  return match?.kind === "programs" ? match.item.id : null;
}

/** Raw `program_content` rows, ordered by display_order (GET /programs/{id}/content). */
export async function getProgramContent(programId: string): Promise<Record<string, any>[]> {
  return whenAvailable(
    async () => (await serverApi.get<Record<string, any>[]>(`/programs/${encodeURIComponent(programId)}/content`)).data ?? [],
    []
  );
}

export type ProgramMember = { id: string; name: string; avatar: string | null; username: string | null };

/** Accepted participants (GET /programs/{id}/members). */
export async function getProgramMembers(programId: string): Promise<{ members: ProgramMember[]; totalCount: number }> {
  return whenAvailable(
    async () => {
      const res = await serverApi.get<{ id: string; full_name?: string; username?: string; avatar_url?: string }[]>(
        `/programs/${encodeURIComponent(programId)}/members?limit=50`
      );
      const members = (res.data ?? []).map((m) => ({
        id: m.id,
        name: m.full_name || m.username || "Member",
        avatar: m.avatar_url ?? null,
        username: m.username ?? null,
      }));
      return { members, totalCount: res.meta?.total ?? members.length };
    },
    { members: [], totalCount: 0 }
  );
}

/** The signed-in student's application to a program, from GET /applications. */
export async function getProgramEnrollment(programId: string) {
  const [applications, profile] = await Promise.all([listApplications(), getMyProfile()]);
  const application = applications.find((a) => a.program_id === programId || a.program?.id === programId);
  if (!application) return null;

  const program = application.program ?? {};
  const company = program.company ?? program.company_profiles ?? {};
  // Spec'd: payment status embedded on program application rows.
  const payment = application.payment ?? null;
  const isPaid = Boolean(application.payment_completed || application.is_paid || payment?.is_paid);

  return {
    applicationId: application.id,
    programId,
    programTitle: program.title || "Unknown Program",
    programDescription: program.description,
    programPictureUrl: program.program_picture_url,
    status: application.status,
    isPaid,
    companyName: company.company_name || "Company",
    companyLogoUrl: company.logo_url,
    startDate: application.created_at,
    endDate: null,
    studentName: profile?.full_name ?? null,
    paymentDetails: payment
      ? { amount: payment.amount_paid_xaf, ref: payment.payment_ref, date: payment.payment_date || payment.created_at }
      : null,
    rawStatus: application.status,
  };
}
