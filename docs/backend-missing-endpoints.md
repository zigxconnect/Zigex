# Zigex Frontend → Backend Integration: Requests for the Backend Team

Oct 5, 2026 · Abdul Fadiga

The student frontend now authenticates against `api.zigexconnect.com` and is ready to move every student feature off Supabase, but three blockers and 49 missing endpoints stand in the way.

Live version (with comments): https://claude.ai/code/artifact/9425f2d8-9780-4947-b394-a7f340ecace5

## Contents

- [Blockers](#blockers)
- [Missing endpoints](#missing-endpoints)
  - [Account and auth (P1)](#account-and-auth-p1)
  - [Notifications and push (P1)](#notifications-and-push-p1)
  - [Programs I joined (P1)](#programs-i-joined-p1)
  - [Intern workspace (P1)](#intern-workspace-p1)
  - [Applications and uploads: changes to existing endpoints (P1)](#applications-and-uploads-changes-to-existing-endpoints-p1)
  - [Projects (P2)](#projects-p2)
  - [Discovery and social (P2)](#discovery-and-social-p2)
  - [Stories and Happening Now (P2)](#stories-and-happening-now-p2)
  - [AI features (P3)](#ai-features-p3)
  - [Scheduled jobs and emails (P3)](#scheduled-jobs-and-emails-p3)
  - [Company-side writes found in student code (admin backend)](#company-side-writes-found-in-student-code-admin-backend)
- [Behaviour to confirm](#behaviour-to-confirm)
- [How the frontend calls the backend](#how-the-frontend-calls-the-backend)

## Blockers

These three must be fixed before the student app can go live on the backend.

1. **Login rate limit counts the frontend server, not the student.** `POST /auth/login` allows 10 attempts per hour per IP. The browser cannot call the API directly (CORS only allows `http://localhost:3000`), so every request reaches the backend from the frontend server's IP. Without a fix, the whole site shares 10 logins per hour.
   - Fix: the frontend sends the real client IP in `X-Forwarded-For`. Trust it with `app.set('trust proxy', <hops>)` and key the limiter on `req.ip`.
2. **Response bodies are not documented.** Every feed, applications, attendance, gamification and `students/me` response is typed only as `object` in Swagger. The frontend cannot map fields without guessing.
   - Fix: add response schemas (field names, types, nullability, nested company/curriculum objects) for each endpoint, or share one sample JSON response per endpoint.
3. **Verification emails are not delivered.** We registered `zigex-claude-test-1791188274@mailinator.com` and a real Gmail address on production; both got `201` and resend-OTP returned `200`, but no OTP email arrived. Login then correctly returns "Please verify your email".
   - Fix: check the mail provider logs and sender-domain verification (SPF/DKIM), then either send us the OTP or mark a test account verified so we can test against real data. Please confirm OTP emails deliver to Gmail and Outlook addresses.

## Missing endpoints

The student app needs 49 new endpoints plus field changes to 4 existing ones before it can drop Supabase; everything else already runs on the backend. All paths are under `/api/v1`, use the student JWT unless marked public, and return `{ success, data, meta? }` with database column names, as the existing endpoints do. List endpoints take `page` and `limit`.

| Area | Priority | New endpoints | What students lose until it ships |
| --- | --- | --- | --- |
| Account and auth | P1 | 5 | Password reset; 8 profile fields; cover image |
| Notifications and push | P1 | 7 | Bell icon, unread count, notifications page, push |
| Programs I joined | P1 | 4 | Course content, payment, receipt |
| Intern workspace | P1 | 13 | Tasks, curriculum, announcements, team, logbook PDF, daily reports, live updates |
| Applications and uploads | P1 | 1 | Form answers saved as text; DOCX rejected |
| Projects | P2 | 7 | Portfolio projects |
| Discovery and social | P2 | 6 | Public profiles, directory, company pages, landing stats |
| Stories and Happening Now | P2 | 5 | Feed stories, live company posts |
| AI features | P3 | 1 | AI chat history |
| Scheduled jobs | P3 | 0 (background tasks) | Attendance reminder emails |

Where the frontend has already switched to the backend (workspace tasks, announcements, team, company directory, landing stats), those parts are empty until the endpoint ships. The other areas (notifications, programs I joined, projects, profiles, stories, reports) still read Supabase from the frontend, and are removed as each endpoint arrives.

### Account and auth (P1)

Students cannot reset a forgotten password today, and profile edits silently drop 8 fields.

| Method | Path | Request | Response `data` | Notes |
| --- | --- | --- | --- | --- |
| POST | `/auth/forgot-password` | `{ email }` | none (always `200`) | Send a 6-digit reset OTP. Never reveal whether the email exists. Rate-limit. |
| POST | `/auth/reset-password` | `{ email, otp, newPassword }` | `{ token, user }` (same as login) | Replaces the Supabase email-link callback and `updateUser`. |
| PATCH | `/auth/password` | `{ currentPassword, newPassword }` | none | Signed-in password change (P2). |
| POST | `/auth/google` | `{ idToken }` | `{ token, user }` (same as login) | Verify the Google ID token server-side; create the student on first sign-in (P3). |
| POST | `/uploads/cover-image` | base64 image, like `/uploads/avatar` | `{ url }` | Profile cover image (P2). |

**`GET /students/me` must also return:** `username`, `profile_status`, `cover_image_url`, `is_intern` (has an accepted internship), `is_supervisor`.

**`PATCH /students/me` must also accept:** `username` (unique; `409` on clash), `languages[]`, `previousRoles[]`, `preferredIndustries[]`, `workMode`, `interests[]`, `achievements[]`, `accommodations`. It must also accept `""` or `null` to clear `portfolioUrl`, `githubUrl` and `linkedinUrl`; today an empty URL fails validation for the whole request.

If the backend sends the welcome email when `profile_status` becomes `complete`, the frontend can stop sending it.

### Notifications and push (P1)

The bell icon, unread badge and notifications page need these; tables `notifications` and `push_subscriptions`.

| Method | Path | Request | Response `data` | Notes |
| --- | --- | --- | --- | --- |
| GET | `/notifications` | `?page=1&limit=10&unreadOnly=true` | `[{ id, title, message, type, is_read, reference_id, created_at }]` + `meta` | Newest first. Must include broadcast notifications (rows without a user), as the current route merges both. |
| GET | `/notifications/unread-count` | none | `{ unreadCount }` | Polled by the header and mobile tab bar. |
| POST | `/notifications/read` | `{ notificationIds?: string[], markAll?: boolean }` | none | Mark some or all as read. |
| DELETE | `/notifications/{id}` | none | none | Owner only. |
| DELETE | `/notifications` | none | none | Clear all of mine (P2). |
| POST | `/push/subscriptions` | `{ endpoint, keys: { p256dh, auth }, origin }` | none | Upsert by `endpoint` for the signed-in user. |
| DELETE | `/push/subscriptions` | `{ endpoint }` | none | On unsubscribe; also delete expired subscriptions (`410` from the push service). |

Sending a web push should happen wherever notifications are created (the admin backend, per its docs); the frontend's own push sender (`lib/push.ts`) can then be removed. Please confirm who owns the `VAPID_*` keys.

### Programs I joined (P1)

Enrolled students cannot see course content, pay, or download a receipt; tables `program_content`, `program_student_payment`, `payments`, `Applications`.

| Method | Path | Request | Response `data` | Notes |
| --- | --- | --- | --- | --- |
| GET | `/programs/{programId}/content` | none | `[{ id, title, description, content, moduleNumber, weekNumber, durationWeeks, topics[], resources[], provider }]` | Sorted by module, then week. `403` unless the student has an accepted application to the program. Replaces both the `content` and `curriculum` routes. |
| POST | `/payments/initiate` | `{ programId, provider, phoneNumber }` | `{ paymentId, status: "pending", instructions? }` | Mobile money. **Take the amount and currency from the program on the server**: today the client sends `amount`, so a student can pay any price. |
| GET | `/payments/{paymentId}` | none | `{ id, status, amount_xaf, currency, created_at }` | Polled after initiating. Plus a provider webhook to confirm payment. |
| GET | `/programs/{programId}/receipt` | none | `{ student_name, program_title, company: { company_name, logo_url, address }, amount_paid_xaf, paid_at, reference }` | Only after payment. A PDF is fine too. |

**`GET /applications` rows for programs must include payment status:** `payment_completed` plus `payment: { is_paid, amount_paid_xaf }` from `program_student_payment`, so the program updates page can lock or unlock content.

### Intern workspace (P1)

An accepted intern's workspace shows empty tasks, curriculum, announcements and team today. All endpoints are scoped to the signed-in student's own internship: `403` otherwise.

| Method | Path | Request | Response `data` | Notes |
| --- | --- | --- | --- | --- |
| GET | `/internships/{internshipId}/tasks` | none | `internship_tasks` rows (all columns, as today) | Newest first. |
| PATCH | `/tasks/{taskId}/read` | none | none | Sets `is_read = true`. |
| GET | `/internships/{internshipId}/curriculum` | none | `internship_curriculum` rows | |
| GET | `/announcements` | `?internshipId=` or `?programId=` | `[{ id, company_id, content, image_url, created_at, is_read, author: { full_name, avatar_url }, company: { company_name, logo_url } }]` | Also used by the student blog page. `is_read` from `announcement_reads`. |
| POST | `/announcements/read` | `{ announcementIds: string[] }` | none | Inserts `announcement_reads`. |
| GET | `/internships/{internshipId}/team` | none | `{ supervisor: { full_name, email, avatar_url }, interns: [{ full_name, avatar_url, username }] }` | From `supervisor_profiles` and fellow accepted applications. |
| POST | `/applications/{id}/payment-acknowledgement` | none | none | Sets `internship_applications.is_paid_acknowledgement = true`. |
| GET | `/internships/{internshipId}/payment-ledger` | none | `payment_ledger` rows for this intern | |
| GET | `/applications/{id}/logbook` | none | PDF, or `{ student, internship, company, logs[] }` for us to render | Today built from `intern_logs`, `student_profiles`, `internships`, `company_profiles`. |
| GET | `/applications/{id}/receipt` | none | PDF or JSON, as above | Internship completion receipt. |
| POST | `/reports` | `{ programId, date, content, skills[] }` | the created report | Daily report (`daily_reports`). Student from the JWT; points set by the server (20). |
| POST | `/reports/{reportId}/feedback` | `{ content, pointsEffect }` | the updated report | Supervisor or mentor role only. |
| GET | `/events/stream` | none | server-sent events `{ type, id }` | See *Live updates* below (P2). |

**Live updates (P2).** The workspace used 7 Supabase realtime channels; it now re-fetches every 45 s. A server-sent events stream would restore instant updates: `GET /events/stream` for the signed-in student, emitting `{ type, id }` where `type` is one of `application_status`, `announcement`, `log_reviewed`, `task`, `payment`, `evaluation`, `notification`.

**Security note.** Until `/reports` exists, the frontend's report routes write directly to the database. They had no authentication; we have patched them to require a verified session, but they should move to the backend.

### Applications and uploads: changes to existing endpoints (P1)

These endpoints exist, but the frontend has to squeeze data into `comments` or reject files that worked before.

**`POST /applications`: accept these fields.**

- `level` (programs).
- `rsvp_status` (events).
- The paid-internship form's fields, which are now sent as labelled lines in `comments`: `school`, `school_level`, `date_of_birth`, `address`, `domain`, `duration`, `experience_level`, `reason`, `is_paid_acknowledgement`. The table `internship_applications` already has columns for most of these.
- On a duplicate, return `409` with `error.code = "DUPLICATE_APPLICATION"`. Today the frontend matches the words "already" or "duplicate" in a `400` message.

**`GET /applications` and `GET /applications/{id}`: embed the target.** Each row should include `internship`, `program` or `event` with at least `id`, `title`, `company: { id, company_name, logo_url }`, plus `payment_completed`. Without this the applied page makes one extra `/feed` call per application.

**Uploads.**

| Change | Today | Needed |
| --- | --- | --- |
| Per-application resume | Only `/uploads/cv`, which replaces the profile CV | `POST /uploads/resume/{applicationId}` |
| CV and cover-letter types | PDF and DOC | Also DOCX |
| Avatar size | 5 MB | 10 MB, as before; please document every limit in Swagger |
| Large files | Base64 JSON body | Multipart `file` field, or a pre-signed R2 upload URL |

### Projects (P2)

Students showcase portfolio projects; table `projects`, RPCs `can_student_create_project` and `get_end_date_from_duration`, buckets `project-assets` and `project-videos` (move to R2).

| Method | Path | Request | Response `data` | Notes |
| --- | --- | --- | --- | --- |
| POST | `/projects` | multipart: `projectTitle`, `description`, `githubRepository`, `projectDuration`, `projectVideoUrl?`, `coverImage?` (file), `uploadedVideo?` (file) | the project | Enforce one active project: `403` "You cannot create a new project until your current one is due". Compute the end date from `projectDuration`. |
| PUT | `/projects/{id}` | same fields as create | the project | Owner only (`403`). |
| DELETE | `/projects/{id}` | none | none | Owner only; delete its media. |
| GET | `/projects/{id}` | none | `{ id, title, description, github_repository, project_duration, project_video_url, uploaded_video_url, cover_image_url, status, created_at, student: { id, full_name, avatar_url } }` | Public project page. Media as signed or public URLs. |
| GET | `/projects` | `?studentId=` or `?username=`, `page`, `limit` | list of the above | For profile pages; `/projects?mine=true` for the signed-in student. |
| GET | `/projects/search` | `?q=&limit=` (max 50) | `[{ id, project_title, cover_image_url, student_id, status, student: { id, full_name, avatar_url } }]` | Public search box. |
| GET | `/projects/eligibility` | none | `{ canCreate, nextAllowedAt? }` | Lets the UI disable "New project" up front (P3). |

### Discovery and social (P2)

Public profiles, the student directory and company pages still read Supabase directly. All of these can be public or signed-in reads.

| Method | Path | Request | Response `data` | Notes |
| --- | --- | --- | --- | --- |
| GET | `/students/{username}` | none | `{ id, username, full_name, avatar_url, cover_image_url, university, about, hard_skills, soft_skills, linkedin_url, github_url, portfolio_url, badges[], points, stats: { internships, programs, events, projects } }` | Public profile. **No `phone` or `email`** (see the note below). |
| GET | `/students/{username}/connections` | none | `{ count, peers: [{ username, full_name, avatar_url }], supervisors: [{ full_name, avatar_url }] }` | People who share an internship or program with this student, as computed today from `Applications` and `internship_applications`. |
| GET | `/students` | `?search=&page=&limit=` | `[{ id, username, full_name, avatar_url, university, hard_skills }]` + `meta` | Student directory and "people you may know". |
| GET | `/companies` | `?page=&limit=` | `[{ id, company_name, logo_url, website_url }]` | Feed sidebar directory. No contact emails. |
| GET | `/companies/{id}` | none | public `company_profiles` fields (`company_name`, `logo_url`, `cover_image_url`, `location`, `website_url`, `about`) | Company page. |
| GET | `/stats/platform` | none | `{ activeOpportunities, students, companies, satisfactionRate }` | Landing page. Public and cacheable. `satisfactionRate` today = average `intern_logs.experience_rating` / 5. |

**Changes to existing endpoints.**

- Add a `companyId` filter to `GET /feed/internships`, `/feed/programs` and `/feed/events`. The company page and "more from this company" currently download the whole feed and filter it in the browser.
- Make `GET /feed/*` public (see [Behaviour to confirm](#behaviour-to-confirm)).
- `GET /gamification/summary` and `/badges` only return the signed-in student; public profiles need another student's badges and points (covered by `/students/{username}` above).

**Privacy note.** The current public profile page loads `phone` and `email` for up to 300 other students to build recommendations. The new endpoints must never return contact details for anyone but the signed-in student.

### Stories and Happening Now (P2)

Students post stories on the feed; companies post "Happening Now" live updates that students view. Tables `stories` and `happening_now`, buckets `stories` and `media`.

| Method | Path | Request | Response `data` | Notes |
| --- | --- | --- | --- | --- |
| GET | `/stories` | none | `[{ id, user_id, type, content, caption, color, font_size, created_at, author: { full_name, avatar_url, username } }]` | Feed stories strip, newest first. Announcements are shown in the same strip (see `/announcements`). |
| POST | `/stories` | multipart: `type`, `content` or `file`, `caption?`, `color?`, `font_size?` | the story | Signed-in student. Media to R2. |
| DELETE | `/stories/{id}` | none | none | Owner only. |
| GET | `/happening-now/latest` | none | `{ id, company, images[], video, captions, is_live, view_count, created_at, updated_at }` | Public. Latest live post. |
| POST | `/happening-now/{id}/view` | none | `{ view_count }` | Increment once per viewer; today any signed-in user can add any `increment`. |

Creating and deleting Happening Now posts is a company action: see the last section.

### AI features (P3)

The AI chat, ZigAgent and Smart Apply call the language model from the frontend server; only their data access needs the backend.

| Method | Path | Request | Response `data` | Notes |
| --- | --- | --- | --- | --- |
| POST | `/ai/interactions` | `{ prompt, response, model, metadata? }` | the saved row | Chat history log (`ai_interactions`). |

Everything else they read is covered by `GET /students/me` (full profile) and `GET /applications` with embedded internship title and company name (see *Applications and uploads*).

### Scheduled jobs and emails (P3)

Two cron routes in the frontend read the database directly; we suggest running them inside the backend as scheduled tasks, so no HTTP endpoint is needed.

| Job | Today | What it does |
| --- | --- | --- |
| Attendance reminder | `app/api/cron/attendance-reminder` | Emails each supervisor the interns who have not logged attendance today (`supervisor_profiles`, `internship_applications`, `Applications`, `intern_attendance`). |
| Reminders | `app/api/cron/reminders` | Emails supervisors their pending reminders (`supervisor_profiles`). |
| Welcome email | sent by the frontend after onboarding | Better sent by the backend when `profile_status` becomes `complete`. |
| Application confirmation | sent by the frontend after `POST /applications` | Please say whether the backend already sends one; if so we remove ours to avoid duplicates. |

### Company-side writes found in student code (admin backend)

These routes live in the student app today but are company or supervisor actions. They will move with the admin app and need endpoints on the **admin backend**, not this one.

| Action | Current route or file | Tables |
| --- | --- | --- |
| Create, edit, delete program modules and content | `app/api/programs/[programId]/content`, `modules`, `modules/[moduleId]` | `program_content` |
| List program payments; mark a student as paid | `app/api/programs/[programId]/payments`, `students/[studentId]/payment` | `program_student_payment`, `Applications` |
| Post Happening Now updates and get upload URLs | `app/api/happening-now` (POST), `happening-now/upload-urls` | `happening_now`, bucket `media` |
| Post and delete announcements | `lib/actions/announcement.actions.ts` | `announcements` |
| Mentor feedback on daily reports | `app/api/reports/feedback` | `daily_reports` |
| Create a company profile from ZigAgent | `app/api/(interns)/zigagent-ai/company` | `company_profiles` |
| Generate attendance QR codes; review logs | supervisor workspace | `intern_logs`, `internship_tasks`, bucket `task_attachments` |

## Behaviour to confirm

Please answer each of these; the frontend currently assumes the default in brackets.

- [ ] **Public feed.** `GET /feed/*` returns `401` without a token, but logged-out visitors can browse `/feed` today. Should the feed `GET` endpoints be public? (Assumed: yes, they should be.)
- [ ] **Register response.** Swagger says `POST /auth/register/student` sets an `accessToken` cookie; production returns only `{ email }`. Please fix the docs or the endpoint. (Assumed: no session until OTP verify.)
- [ ] **Verify-email response.** Does `POST /auth/verify-email` return `data.token` and `data.user` like login does? (Assumed: yes; we store the token and sign the student in.)
- [ ] **Token lifetime and refresh.** How long does the JWT last, and will there be a refresh endpoint? (Assumed: we read `exp` from the token and send the student to sign-in when it expires.)
- [ ] **JWT claims.** `GET /auth/me` documents `userId`, `email`, `role`. Is `exp` always set, and is the claim `userId` or `sub`? (Assumed: we accept either.)
- [ ] **Profile flags.** The dashboard needs to know if a student is an active intern or a supervisor. Can `GET /students/me` include these, plus `profile_status`?
- [ ] **Admin backend.** Swagger says an admin backend now handles notifications. What is its URL and docs link? The admin app is being split out next and will call it.
- [ ] **CORS.** No change needed for the student app (we call server-to-server). The admin app may call from the browser at its own domain; please confirm which origins to allow.

## How the frontend calls the backend

The browser never calls `api.zigexconnect.com` directly; every request goes through the frontend server, which forwards it with a Bearer token.

1. Browser calls the frontend at `/api/v1/<path>` (same origin, no CORS).
2. The frontend server forwards it to `https://api.zigexconnect.com/api/v1/<path>` with the same method, query string and body.
3. The backend's response (status, JSON body, `ETag`, rate-limit headers) is passed back unchanged.

| Header sent to the backend | Value |
| --- | --- |
| `Authorization` | `Bearer <JWT>` from login or verify-email, held in an httpOnly cookie on the frontend domain |
| `X-Forwarded-For` | The student's real IP (see [Blockers](#blockers), item 1) |
| `Content-Type`, `Accept`, `If-None-Match` | Passed through from the browser |

Browser cookies are not forwarded, so the backend's own `accessToken` cookie is unused by the student app. Requests time out after 15 s (60 s for `/uploads/*`); a timeout or network error is shown to the student as `504` or `502`.
