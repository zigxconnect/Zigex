import "server-only";

/**
 * Client for the Zigex AI service (https://ai.zigexconnect.com/docs):
 * weekly opportunity digests and search over internship documents.
 *
 * Server-only: every call carries the service's API key (`x-api-key`), which
 * must never reach the browser. Client components go through this app's
 * route handlers (e.g. /api/ai/handbook/search).
 */

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL ?? "https://ai.zigexconnect.com").replace(/\/+$/, "");
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY;

const DEFAULT_TIMEOUT_MS = 10_000;

/** False when the key isn't set: the AI features hide instead of failing. */
export const aiServiceConfigured = () => Boolean(AI_SERVICE_API_KEY);

export class AiServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "AiServiceError";
  }
}

type AiRequest = Omit<RequestInit, "body"> & { body?: unknown; timeoutMs?: number };

async function request<T>(path: string, { body, timeoutMs = DEFAULT_TIMEOUT_MS, ...init }: AiRequest = {}): Promise<T> {
  if (!AI_SERVICE_API_KEY) throw new AiServiceError("AI_SERVICE_API_KEY is not set", 503);

  const headers = new Headers(init.headers);
  headers.set("x-api-key", AI_SERVICE_API_KEY);
  headers.set("Accept", "application/json");
  if (body !== undefined) headers.set("Content-Type", "application/json");

  const res = await fetch(`${AI_SERVICE_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: init.signal ?? AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    // FastAPI errors are { detail: string | ValidationError[] }; log, don't forward.
    const detail = await res.text().catch(() => "");
    throw new AiServiceError(`AI service ${res.status} on ${path}: ${detail.slice(0, 300)}`, res.status);
  }
  return (await res.json()) as T;
}

/* ---------- digests ---------- */

/**
 * Latest published digest for the student's segment, or null when there is
 * none yet (404). `studentId` is the student profile id (GET /students/me → id),
 * the same id the digest job reads from the Zigex API.
 */
export async function getStudentDigest(studentId: string): Promise<unknown | null> {
  try {
    return await request<unknown>(`/v1/digests/student/${encodeURIComponent(studentId)}`, {
      // Digests change weekly; a short cache keeps /feed fast.
      cache: undefined,
      next: { revalidate: 600 },
      timeoutMs: 5_000,
    });
  } catch (error) {
    if (error instanceof AiServiceError && error.status === 404) return null;
    throw error;
  }
}

/* ---------- document search (RAG) ---------- */

export type SearchHit = {
  text: string;
  score: number;
  document_id: string;
  title: string;
  source: string;
  page?: number | null;
  section?: string | null;
};

export async function searchDocuments(input: {
  query: string;
  department: string;
  cohortId: string;
  topK?: number;
}): Promise<SearchHit[]> {
  const res = await request<{ hits?: SearchHit[] }>("/v1/search", {
    method: "POST",
    body: { query: input.query, department: input.department, cohort_id: input.cohortId, top_k: input.topK ?? 5 },
    // Embedding + vector search; slower than a normal API call.
    timeoutMs: 20_000,
  });
  return Array.isArray(res.hits) ? res.hits : [];
}

/* ---------- departments ---------- */

/**
 * The AI service only stores and searches documents under these departments
 * (settings.allowed_departments in zila-knowledge-base-with-search).
 */
export const AI_DEPARTMENTS = ["ml", "web-frontend", "web-backend", "mobile", "cyber-security", "embedded-system", "design", "gen-ai"] as const;
export type AiDepartment = (typeof AI_DEPARTMENTS)[number];

// Checked in order: the more specific tracks first ("gen ai" before "ai").
const DEPARTMENT_KEYWORDS: [AiDepartment, RegExp][] = [
  ["gen-ai", /\b(gen(erative)?[\s-]?ai|llms?|prompt)\b/],
  ["cyber-security", /\b(cyber|security|infosec|pentest|ethical hacking)/],
  ["embedded-system", /\b(embedded|iot|electronics?|arduino|firmware|robotics)\b/],
  ["ml", /\b(machine learning|ml|ai|artificial intelligence|data scien\w*|deep learning)\b/],
  ["mobile", /\b(mobile|android|ios|flutter|react native)\b/],
  ["design", /\b(design|ui|ux|graphic|figma|product design)\b/],
  ["web-backend", /\b(back[\s-]?end|api|server|devops|full[\s-]?stack|node|django|laravel)\b/],
  ["web-frontend", /\b(front[\s-]?end|web|react|javascript)\b/],
];

/**
 * Only a filing value: `cohort_id` (the posting id) is what keeps one
 * posting's documents apart from another's. Postings whose category and title
 * match no track are filed under this one.
 */
const FALLBACK_DEPARTMENT: AiDepartment = "web-frontend";

/**
 * The department a posting's documents are filed under, from its category,
 * then its title. Must stay identical to handbookDepartment() in the admin
 * portal (zigex-admin lib/api/ai-service.ts), which files the uploads.
 */
export function handbookDepartment(category: unknown, title: unknown): AiDepartment {
  for (const raw of [category, title]) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const text = raw.toLowerCase().trim();
    if ((AI_DEPARTMENTS as readonly string[]).includes(text)) return text as AiDepartment;
    const hit = DEPARTMENT_KEYWORDS.find(([, pattern]) => pattern.test(text));
    if (hit) return hit[0];
  }
  return FALLBACK_DEPARTMENT;
}
