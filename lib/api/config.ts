// Base URL of the standalone Zigex backend (https://api.zigexconnect.com in
// production). Server-only: the browser never talks to the backend directly,
// it goes through the same-origin passthrough at /api/v1/* — the backend's
// CORS policy does not allow the production frontend origin.
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5001";

export const API_PREFIX = "/api/v1";

// httpOnly cookie on the frontend's own domain holding the backend JWT.
export const ACCESS_TOKEN_COOKIE = "zx_access_token";

// Used when the JWT has no readable `exp` claim.
export const DEFAULT_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export const DEFAULT_TIMEOUT_MS = 15_000;
export const UPLOAD_TIMEOUT_MS = 60_000;
