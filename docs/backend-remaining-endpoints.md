# Zigex Backend: Remaining Endpoints and Fixes

Oct 6, 2026 · Abdul Fadiga

The updated API (74 endpoints) covers 33 of the 50 endpoints the student app calls; 17 are still missing and 4 questions need an answer before the frontend can finish.

Live version (with comments): https://claude.ai/code/artifact/ce52a144-87f1-436d-b5d6-2871e08746c3
Original full request: [backend-missing-endpoints.md](./backend-missing-endpoints.md)

## Contents

- [Status](#status)
- [Missing endpoints](#missing-endpoints)
- [Decisions needed](#decisions-needed)
- [Still open from before](#still-open-from-before)

## Status

Thank you for the new endpoints: 29 match the request exactly and the frontend already calls them. For 4 more we switched the frontend to your naming, so no change is needed on your side.

| Our request | Your endpoint | Action |
| --- | --- | --- |
| `GET /notifications/unread-count` | `GET /notifications/unreadcount` | Frontend uses yours |
| `POST /applications/{id}/payment-acknowledgement` | `POST /applications/{id}/paymentacknowledgement` | Frontend uses yours |
| `GET /internships/{id}/payment-ledger` | `GET /internships/{id}/paymentledger` | Frontend uses yours |
| `GET /students/{username}` | `GET /students/{id}` | Partly covered: see [Decisions needed](#decisions-needed), item 2 |

We also now use your `GET /students/{id}/projects` for a student's project list. `POST /notifications/broadcast` was removed from the docs; the frontend no longer calls it.

The full original request is in [backend-missing-endpoints.md](./backend-missing-endpoints.md); this doc lists only what is left.

## Missing endpoints

Of the 17, these 15 still need building (the other 2 are settled by the note under the table). The frontend already calls them and shows an empty or "coming soon" state until each is deployed. Paths are under `/api/v1`, use the student JWT unless marked public, and return `{ success, data, meta? }`.

| Priority | Method | Path | Request | Response `data` | Notes |
| --- | --- | --- | --- | --- | --- |
| P1 | POST | `/uploads/resume/{applicationId}` | base64 file, like `/uploads/cv` | `{ key, url }` | Resume for one application. Today the profile CV is overwritten instead. |
| P1 | GET | `/programs/{programId}/members` | `?limit=50` | `[{ id, username, full_name, avatar_url }]` + `meta.total` | Accepted participants shown on the program page. |
| P2 | PATCH | `/auth/password` | `{ currentPassword, newPassword }` | none | Signed-in password change. |
| P2 | POST | `/uploads/cover-image` | base64 image, like `/uploads/avatar` | `{ url }` | Also saves `cover_image_url` on the profile. Or: accept `coverImageUrl` on `PATCH /students/me` and we use your `POST /uploads`. |
| P2 | GET | `/students` | `?search=&page=&limit=` | `[{ id, username, full_name, avatar_url, university, hard_skills, stats: { internships, programs, events, projects, current_program } }]` + `meta` | Student directory. No phone or email. |
| P2 | GET | `/students/{id}/connections` | none | `{ count, peers: [{ username, full_name, avatar_url }], supervisors: [{ full_name, avatar_url }] }` | People who share an internship or program with the student. |
| P2 | GET | `/projects/{id}` | none | `{ id, title, description, repo_url, role, cover_image_url, status, created_at, student: { id, full_name, avatar_url } }` | Public project page. |
| P2 | GET | `/projects` | `?mine=true`, `page`, `limit` | list of the above | The signed-in student's own projects. |
| P2 | GET | `/projects/search` | `?q=&limit=` (max 50) | `[{ id, title, cover_image_url, student: { id, full_name, avatar_url } }]` | Public search box. |
| P3 | GET | `/projects/eligibility` | none | `{ canCreate, nextAllowedAt? }` | Only if the one-active-project rule stays (see [Decisions needed](#decisions-needed), item 1). |
| P2 | POST | `/stories` | multipart: `type`, `content` or `file`, `caption?`, `color?`, `font_size?` | the story | `409` when the one-story-per-day limit is reached. |
| P2 | DELETE | `/stories/{id}` | none | none | Owner only. |
| P2 | POST | `/happeningnow/{id}/view` | none | `{ view_count }` | Count one view per viewer. Your `PATCH /stories/{id}/view` covers stories only. |
| P2 | GET | `/stats/platform` | none | `{ activeOpportunities, students, companies, satisfactionRate }` | Public landing-page counts; `satisfactionRate` as 0–100. |
| P3 | POST | `/ai/interactions` | `{ prompt, response, model, metadata? }` | the saved row | Not needed if the frontend moves to your `/ai/chat` (item 3). |

Two more are covered by decisions below rather than new endpoints: `PUT /projects/{id}` (you built `PATCH`, which is fine) and `GET /happening-now/latest` (we will use your `GET /happeningnow` once its response shape is documented).

## Decisions needed

Please answer these four; each one blocks a screen the frontend can't finish alone.

1. **Projects use a different model.** Your `POST /projects` and `PATCH /projects/{id}` take JSON `{ title, description, repo_url, role }`. The student project form sends `projectTitle`, `description`, `githubRepository`, `projectDuration`, a YouTube link, a cover image and an uploaded video, and has no `role` field. It also enforced one active project at a time.
   - Option A: the backend accepts the form's fields (multipart, or JSON plus image/video URLs from `POST /uploads`).
   - Option B: we change the form to your model and drop duration, video and the one-project rule.
   - Please say which, and what `role` means.
2. **Profile links use usernames, not ids.** Public profile URLs are `/profile/<username>` (for example `/profile/ada-lovelace`), and links across the app use the username. `GET /students/{id}` only takes a profile id, so those pages show "Student not found". Please let `GET /students/{id}` also accept a username, or add `GET /students/by-username/{username}`. Also confirm which fields it returns (we need those listed for `/students/{username}` in the original request) and that it never returns phone or email.
3. **AI chat now runs on the backend.** You added `POST /ai/chat { message, context }` and `GET /ai/history`. Should the frontend drop its own Gemini call and use these? If yes, please document the response (streamed or not, the reply field, and the history item shape) and whether `context` is a string or an object.
4. **New endpoints we didn't request.** What screen are `GET /discovery/trending` and `GET /internships/{internshipId}/projects` for, and what do they return? We will wire them once we know.

## Still open from before

These block testing and launch, regardless of the endpoints above.

- [ ] **Response bodies are still undocumented.** All 41 new endpoints, like the original ones, show no response schema in Swagger. Please add schemas, or one sample JSON response per endpoint; until then the frontend maps fields by guessing.
- [ ] **OTP emails are not delivered.** Registration and resend-OTP return success, but no code reaches mailinator or Gmail, so nobody can sign in to test. Please check the mail provider logs and SPF/DKIM, and verify one test account for us.
- [ ] **Rate limits count the frontend server, not the student.** 10 logins per hour and 100 requests per 15 minutes per IP, and every request comes from the frontend server's IP. Please trust `X-Forwarded-For` (`app.set('trust proxy', <hops>)`) and key the limiters on `req.ip`.
- [ ] **Responses are slow.** On 2026-10-06, `GET /health` took 18.7 s and `GET /api-docs.json` took 15.3 s. Please check the server's load and cold starts.
- [ ] **Public feed.** `GET /feed/*` still requires a token; logged-out visitors browse `/feed` today. Should these be public?

Once an endpoint is deployed, we check it with `npm run check:backend` in the frontend repo and test it straight away.
