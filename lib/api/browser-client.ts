import { API_PREFIX } from "./config";
import { parseResponse, type ApiResponse } from "./errors";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * Fetch wrapper for Client Components. Requests hit this app's own
 * /api/v1/* passthrough (same origin), which attaches the JWT from the
 * httpOnly cookie and forwards to the backend — so no token ever reaches JS.
 * Paths are relative to /api/v1, e.g. api.get("/feed/internships?page=2").
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { body, ...init } = options;

  const headers = new Headers(init.headers);
  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  return parseResponse<T>(res);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
