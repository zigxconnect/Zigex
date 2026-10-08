import { normaliseFeedItem } from "./feed-shape";

/**
 * Shape helpers for GET /applications rows, shared by server and browser code.
 *
 * The backend reads the old `Applications` table, so rows keep its column
 * names (application_type, internship_id, program_id, event_id, status,
 * payment_completed, created_at, ...). What we can't rely on is whether the
 * applied-to posting comes embedded: the old Supabase queries nested it as
 * `internship` / `program` / `event`. normaliseApplication() accepts either
 * singular or plural keys, and hydrateApplications() fetches the posting from
 * the feed when it is missing, so callers always get `row.<kind>.company`.
 *
 * TODO(backend): response bodies are undocumented in Swagger. When schemas
 * are published, adjust this file only.
 */

export type ApplicationKind = "internship" | "program" | "event";
export type FeedPath = "internships" | "programs" | "events";

export const FEED_PATH: Record<ApplicationKind, FeedPath> = {
  internship: "internships",
  program: "programs",
  event: "events",
};

const TARGET_KEY = {
  internship: "internship_id",
  program: "program_id",
  event: "event_id",
} as const;

export type ApplicationRow = {
  id: string;
  status: string;
  application_type?: ApplicationKind;
  internship_id?: string | null;
  program_id?: string | null;
  event_id?: string | null;
  payment_completed?: boolean;
  created_at?: string;
  internship?: any;
  program?: any;
  event?: any;
  [column: string]: any;
};

export function applicationKind(row: ApplicationRow): ApplicationKind | null {
  if (row.application_type && row.application_type in TARGET_KEY) return row.application_type;
  if (row.internship_id) return "internship";
  if (row.program_id) return "program";
  if (row.event_id) return "event";
  return null;
}

export function targetId(row: ApplicationRow): string | null {
  const kind = applicationKind(row);
  return kind ? (row[TARGET_KEY[kind]] ?? row[kind]?.id ?? null) : null;
}

export function normaliseApplication(row: ApplicationRow): ApplicationRow {
  const kind = applicationKind(row);
  if (!kind) return row;
  const posting = row[kind] ?? row[FEED_PATH[kind]] ?? null;
  return {
    ...row,
    application_type: kind,
    [TARGET_KEY[kind]]: row[TARGET_KEY[kind]] ?? posting?.id ?? null,
    [kind]: posting ? normaliseFeedItem(posting) : null,
  };
}

/**
 * The backend sometimes embeds only a stub of the posting ({ id, title }):
 * no image, dates or description. Treat that like a missing posting.
 */
const isStub = (posting: Record<string, any> | null | undefined) =>
  !posting || Object.keys(posting).filter((k) => posting[k] != null).every((k) => k === "id" || k === "title");

/** Fill in missing (or stub) postings with one feed lookup per distinct posting. */
export async function hydrateApplications(
  rows: ApplicationRow[],
  fetchPosting: (path: FeedPath, id: string) => Promise<Record<string, any> | null>
): Promise<ApplicationRow[]> {
  const normalised = rows.map(normaliseApplication);
  const missing = new Map<string, Promise<Record<string, any> | null>>();

  for (const row of normalised) {
    const kind = applicationKind(row);
    const id = targetId(row);
    if (kind && id && isStub(row[kind]) && !missing.has(`${kind}:${id}`)) {
      missing.set(`${kind}:${id}`, fetchPosting(FEED_PATH[kind], id).catch(() => null));
    }
  }
  if (missing.size === 0) return normalised;

  const postings = new Map<string, Record<string, any> | null>();
  await Promise.all([...missing].map(async ([key, promise]) => postings.set(key, await promise)));

  return normalised.map((row) => {
    const kind = applicationKind(row);
    const posting = kind ? postings.get(`${kind}:${targetId(row)}`) : null;
    return kind && posting && isStub(row[kind]) ? { ...row, [kind]: normaliseFeedItem(posting) } : row;
  });
}

export type ApplicationStatus = "not_applied" | "pending" | "accepted" | "rejected";

/** Collapse backend statuses into the four the feed UI shows. */
export function toApplicationStatus(status: string | null | undefined): ApplicationStatus {
  // A withdrawn application lets the student apply again.
  if (!status || status === "withdrawn") return "not_applied";
  if (status === "accepted" || status === "rsvp_confirmed") return "accepted";
  if (status === "rejected") return "rejected";
  return "pending";
}
