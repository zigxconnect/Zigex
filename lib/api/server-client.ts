import "server-only";
import { API_PREFIX, BACKEND_URL, DEFAULT_TIMEOUT_MS } from "./config";
import { parseResponse, type ApiResponse } from "./errors";
import { getAccessToken } from "./session";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; timeoutMs?: number };

/**
 * Fetch wrapper for Server Components, Server Actions and Route Handlers.
 * Calls the backend directly with the JWT from the httpOnly session cookie.
 * Paths are relative to /api/v1, e.g. serverApi.get("/students/me").
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { body, timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = options;
  const token = await getAccessToken();

  const headers = new Headers(init.headers);
  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BACKEND_URL}${API_PREFIX}${path}`, {
    cache: "no-store",
    ...init,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    signal: init.signal ?? AbortSignal.timeout(timeoutMs),
  });

  return parseResponse<T>(res);
}

export const serverApi = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};

/**
 * Raw backend response, for endpoints that may return a file (e.g. a PDF)
 * instead of JSON. Errors are not thrown; check `res.ok` / `res.status`.
 */
export async function serverApiRaw(path: string, init: Omit<RequestInit, "body"> = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${BACKEND_URL}${API_PREFIX}${path}`, {
    cache: "no-store",
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
}
