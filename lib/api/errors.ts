export class ApiClientError extends Error {
  status: number;
  code: string;
  body: unknown;

  constructor(status: number, message: string, code = "UNKNOWN_ERROR", body?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

/** Shape every backend endpoint responds with. */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  meta?: { total: number; page: number; limit: number; totalPages: number };
};

/**
 * Parses a backend response and throws ApiClientError on non-2xx.
 * Backend errors look like { success: false, error: { code, message } }.
 */
export async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const contentType = res.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const error = typeof payload === "object" ? payload?.error : undefined;
    const message =
      error?.message ?? (typeof payload === "string" && payload ? payload : "Request failed");
    throw new ApiClientError(res.status, message, error?.code, payload);
  }

  return payload as ApiResponse<T>;
}

/**
 * True when the backend has not deployed this route yet (Express's default
 * 404: "Cannot GET /api/v1/..."), as opposed to a real "resource not found".
 *
 * Features built against the Oct 2026 backend endpoint request use this to show
 * a "coming soon" / empty state until the endpoint ships, then start working
 * with no frontend change.
 */
export function isEndpointMissing(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    error.status === 404 &&
    /^Cannot (GET|POST|PUT|PATCH|DELETE) /.test(error.message)
  );
}

/** Runs a backend call; resolves to `fallback` if the endpoint is not deployed yet. */
export async function whenAvailable<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (isEndpointMissing(error)) return fallback;
    throw error;
  }
}
