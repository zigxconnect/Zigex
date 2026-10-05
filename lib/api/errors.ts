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
