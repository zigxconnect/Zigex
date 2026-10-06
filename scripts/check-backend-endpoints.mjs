#!/usr/bin/env node
/**
 * Reports which endpoints from docs/backend-missing-endpoints.md the backend
 * has deployed. Run it whenever the backend team ships something:
 *
 *   BACKEND_TOKEN=<student JWT> npm run check:backend          # production
 *   BACKEND_URL=http://localhost:5001 BACKEND_TOKEN=... npm run check:backend
 *
 * Get a token by signing in to the app and copying the zx_access_token
 * cookie, or from the `data.token` of POST /auth/login.
 *
 * An endpoint counts as LIVE when it answers anything other than Express's
 * default "Cannot <METHOD> <path>" 404 — a 400/403/404-with-message/422 just
 * means the route exists and rejected our empty probe, which is expected.
 * Without a token, the backend's auth middleware answers 401 before route
 * matching, so those endpoints show as UNKNOWN.
 */
const BASE = (process.env.BACKEND_URL ?? "https://api.zigexconnect.com").replace(/\/$/, "") + "/api/v1";
const ID = "00000000-0000-4000-8000-000000000000";
const TOKEN = process.env.BACKEND_TOKEN;
// Stay under the backend's rate limiter.
const DELAY_MS = 400;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ENDPOINTS = [
  // [priority, area, method, path]
  ["P1", "Account and auth", "POST", "/auth/forgot-password"],
  ["P1", "Account and auth", "POST", "/auth/reset-password"],
  ["P2", "Account and auth", "PATCH", "/auth/password"],
  ["P3", "Account and auth", "POST", "/auth/google"],
  ["P2", "Account and auth", "POST", "/uploads/cover-image"],
  ["P1", "Notifications and push", "GET", "/notifications"],
  ["P1", "Notifications and push", "GET", "/notifications/unreadcount"],
  ["P1", "Notifications and push", "POST", "/notifications/read"],
  ["P1", "Notifications and push", "DELETE", `/notifications/${ID}`],
  ["P2", "Notifications and push", "DELETE", "/notifications"],
  ["P1", "Notifications and push", "POST", "/push/subscriptions"],
  ["P1", "Notifications and push", "DELETE", "/push/subscriptions"],
  ["P1", "Programs I joined", "GET", `/programs/${ID}/content`],
  ["P1", "Programs I joined", "POST", "/payments/initiate"],
  ["P1", "Programs I joined", "GET", `/payments/${ID}`],
  ["P1", "Programs I joined", "GET", `/programs/${ID}/receipt`],
  ["P1", "Intern workspace", "GET", `/internships/${ID}/tasks`],
  ["P1", "Intern workspace", "PATCH", `/tasks/${ID}/read`],
  ["P1", "Intern workspace", "GET", `/internships/${ID}/curriculum`],
  ["P1", "Intern workspace", "GET", "/announcements"],
  ["P1", "Intern workspace", "POST", "/announcements/read"],
  ["P1", "Intern workspace", "GET", `/internships/${ID}/team`],
  ["P1", "Intern workspace", "POST", `/applications/${ID}/paymentacknowledgement`],
  ["P1", "Intern workspace", "GET", `/internships/${ID}/paymentledger`],
  ["P1", "Intern workspace", "GET", `/applications/${ID}/logbook`],
  ["P1", "Intern workspace", "GET", `/applications/${ID}/receipt`],
  ["P1", "Intern workspace", "POST", "/reports"],
  ["P1", "Intern workspace", "POST", `/reports/${ID}/feedback`],
  ["P2", "Intern workspace", "GET", "/events/stream"],
  ["P1", "Applications and uploads", "POST", `/uploads/resume/${ID}`],
  ["P2", "Projects", "POST", "/projects"],
  ["P2", "Projects", "PUT", `/projects/${ID}`],
  ["P2", "Projects", "DELETE", `/projects/${ID}`],
  ["P2", "Projects", "GET", `/projects/${ID}`],
  ["P2", "Projects", "GET", "/projects"],
  ["P2", "Projects", "GET", "/projects/search?q=a"],
  ["P3", "Projects", "GET", "/projects/eligibility"],
  ["P2", "Discovery and social", "GET", "/students/some-username"],
  ["P2", "Discovery and social", "GET", "/students/some-username/connections"],
  ["P2", "Discovery and social", "GET", "/students"],
  ["P2", "Discovery and social", "GET", "/companies"],
  ["P2", "Discovery and social", "GET", `/companies/${ID}`],
  ["P2", "Discovery and social", "GET", "/stats/platform"],
  ["P2", "Stories and Happening Now", "GET", "/stories"],
  ["P2", "Stories and Happening Now", "POST", "/stories"],
  ["P2", "Stories and Happening Now", "DELETE", `/stories/${ID}`],
  ["P2", "Stories and Happening Now", "GET", "/happening-now/latest"],
  ["P2", "Stories and Happening Now", "POST", `/happening-now/${ID}/view`],
  ["P3", "AI features", "POST", "/ai/interactions"],
];

async function probe([, , method, path]) {
  try {
    const res = await fetch(BASE + path, {
      method,
      headers: {
        ...(method === "GET" || method === "DELETE" ? {} : { "Content-Type": "application/json" }),
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      body: method === "GET" || method === "DELETE" ? undefined : "{}",
      signal: AbortSignal.timeout(15_000),
    });
    const text = await res.text();
    if (res.status === 404 && /Cannot (GET|POST|PUT|PATCH|DELETE) /.test(text)) return "missing";
    if (res.status === 401) return TOKEN ? "unknown (token rejected)" : "unknown (needs BACKEND_TOKEN)";
    if (res.status === 429) return "rate-limited, retry later";
    return `live (${res.status})`;
  } catch (error) {
    return `error (${error.name})`;
  }
}

const results = [];
for (const endpoint of ENDPOINTS) {
  results.push([endpoint, await probe(endpoint)]);
  await sleep(DELAY_MS);
}

let area = "";
for (const [[priority, a, method, path], status] of results) {
  if (a !== area) console.log(`\n${(area = a)}`);
  const mark = status.startsWith("live") ? "✔" : status === "missing" ? "·" : "?";
  console.log(`  ${mark} ${priority} ${method.padEnd(6)} ${path.padEnd(52)} ${status}`);
}
const count = (prefix) => results.filter(([, s]) => s.startsWith(prefix)).length;
console.log(
  `\n${count("live")} live · ${count("missing")} missing · ${count("unknown")} unknown · ${count("rate")} rate-limited` +
    ` (of ${results.length} spec'd endpoints on ${BASE})`
);
if (!TOKEN && count("unknown")) console.log("Set BACKEND_TOKEN to check the endpoints marked unknown.");
