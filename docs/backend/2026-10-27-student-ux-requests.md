# Student API: requests from the student UX review (27 October 2026)

We reviewed the whole student app and fixed what we could on our side (branch `fix/student-ux-batch1`). These items need the student API (`api.zigexconnect.com`) to work fully. Priority: **P1** wrong for students or a privacy/product decision already taken, **P2** needed to finish a feature, **P3** cleanup.

Two product decisions were taken today:

1. **A student can apply again after withdrawing**, while the opportunity is open.
2. **Student profiles are public**: anyone with the link (companies, people on WhatsApp, signed-out visitors) can open `/profile/<username or id>`. They stay out of search engines (`noindex`).

---

## 1. Apply again after withdrawing (P1)

**Today:** `POST /applications` answers **409** when the student has *any* earlier application to the posting, including one they withdrew (`PATCH /applications/{id}/withdraw`). The app now offers "Apply again" after a withdrawal; until this ships, it shows "Applying again isn't open yet" and keeps the student's answers on the phone.

**Request:**

- Allow `POST /applications` when the student's **latest** application to that posting is `withdrawn`, and the posting is still open (see item 6 for "open"). Create a **new** application row and keep the withdrawn one as history. In SQL terms, a unique index on `(student_id, opportunity_id)` **where status <> 'withdrawn'**.
- Keep **409** when an active application exists (`pending`, `reviewing`, `reviewed`, `accepted`, `rsvp_confirmed`). Please add a code so we can tell the cases apart:
  ```json
  { "success": false, "error": "already_applied", "message": "…" }
  { "success": false, "error": "posting_closed", "message": "…" }
  ```
- `PATCH /applications/{id}/withdraw`: allow while `pending`, `reviewing` or `reviewed` (the app now offers it in all three).
- The company sees the new application like any other; please mark it so they know it's a second one (e.g. `reapplied: true` or `previous_application_id`).
- Abuse limit: at most **2 withdrawals per posting** per student; on the third attempt answer 409 `reapply_limit`.
- `GET /applications`: return all rows with `created_at`; the app shows the newest per posting.

**Question:** should a student also be able to apply again after being **rejected**? We assumed **no** (still 409).

## 2. Public student profiles (P1, privacy)

**Today:** the app calls `GET /students/{id}` (and `/students/{id}/projects`, `/students/{id}/connections`) with the student's token. Without a token it fails, so a shared link shows "This profile isn't available". The app now opens `/profile/...` for everyone, so these reads must work **without a token**.

**Request:**

- `GET /students/{idOrUsername}` **public** (no token needed), resolving the **profile id or the exact username**. Today only the id works, and the app's share links prefer the username.
- Return **only public fields**, and decide this on the server with an allow-list, not by removing fields:
  `id, username, first_name, last_name, full_name, avatar_url, cover_image_url, about, location (city), university, field_of_study, degree, graduation_year, hard_skills, soft_skills, languages, interests, preferred_industries, previous_roles, achievements, portfolio_url, github_url, linkedin_url, stats, badges, accepted_applications (title + type only)`.
- **Never** in the public response: `email`, `phone`, `date_of_birth`, `gpa`, `accommodations`, `user_id`, address, applications in review, supervisor notes, attendance.
- `GET /students/{id}/projects` public, with the same rule (only projects the student published).
- `GET /students/{id}/connections` public, counts only (no lists of names).
- Rate limit the public reads per IP (e.g. 60/min), and **don't** add a public list or search of students: profiles should be reachable only through a link the student shared.
- P3: a `profile_visibility` field (`public` | `zigex_only`). We'll add the switch in Settings; when it's `zigex_only`, answer 404 to requests without a student or company token.

## 3. Saving the profile (P1)

The app now tells students when a field wasn't saved ("Not saved yet: Languages, Interests"). To make those save, please accept in `PATCH /students/me`:

- The fields already requested on 8 October: `username`, `languages`, `previousRoles`, `preferredIndustries`, `workMode`, `interests`, `achievements`, `accommodations`. Today the request is refused (400/422) and we retry without them.
- **Clearing a value with `null`**: `portfolioUrl`, `githubUrl`, `linkedinUrl`, `graduationYear`, `gpa`, `coverImage`. Text fields are cleared with `""`, lists with `[]`. Today `null` is refused, so a student can't remove an old link or cover photo.
- When the username is taken: **409** `{ "error": "username_taken" }` (today we guess from the message text).
- Refuse only the bad field, not the whole request: answer 422 with `{ "fields": { "linkedinUrl": "must be a URL" } }`, so the other fields still save and we can show the error next to the right input.

## 4. Intern workspace (P2)

- **Fee acknowledgement**: `POST /applications/{id}/payment-acknowledgement` isn't deployed (the app gets "coming soon"). Interns with a fee can't check in or send reports until they accept it. Please deploy it, idempotent, returning the application with `is_paid_acknowledgement: true`.
- **Daily report rating optional**: `PATCH /attendance/logs/{id}/check-out` should accept a body **without** `experienceRating` (the intern skipped it) and store null. Before, the app sent 3 by default, which showed "Rated the day 3 of 5" in logbooks; it now omits it.
- **Reports marked "needs changes"**: the supervisor can ask for changes, but the intern can't resubmit (check-out is refused once done). Please allow `PATCH /attendance/logs/{id}/report` (or a second check-out) while the report's status is `needs_changes`, and set it back to `pending`.

## 5. Push notifications on sign-out (P2)

The app now removes the phone's subscription (`DELETE /push/subscriptions { endpoint }`) **before** `POST /auth/logout`, so a shared phone stops getting the previous student's notifications. Please check:

- `DELETE /push/subscriptions` removes it for that endpoint even if it belongs to a different user than the token (a phone can only have one active student), or answers 404 if unknown. It must not answer 500.
- When a **new** student subscribes an endpoint that already exists for someone else, move it to the new student (don't keep both).

## 6. Deadlines: the last day is open until midnight in Cameroon (P1)

Deadlines come as dates (`"2026-11-01"` or `"2026-11-01T00:00:00.000Z"`). The app now treats them everywhere as **open until 23:59 Africa/Douala on that day** (before, the board showed "Closed" all of the last day). Please use the same rule wherever the backend checks it: `POST /applications`, the feed's "open" filters, and any job that closes postings. Otherwise a student who applies in the evening of the last day gets refused by the server while the app says "Last day".

- Store and return them as **dates** (`YYYY-MM-DD`), or as the real closing instant (`2026-11-01T23:59:59+01:00`), but not as midnight UTC.
- On refusal: 409 `{ "error": "posting_closed" }`.

---

## Summary

| # | Item | Priority |
| --- | --- | --- |
| 1 | Apply again after withdrawing (+ error codes, withdraw while reviewing) | P1 |
| 2 | Public profile reads with an allow-list of fields, username lookup | P1 |
| 3 | Profile PATCH: requested fields, `null` to clear, per-field errors | P1 |
| 6 | Deadline = end of day in Cameroon, same rule in the API | P1 |
| 4 | Fee acknowledgement, optional rating, resubmit "needs changes" | P2 |
| 5 | Push subscriptions on sign-out / shared phones | P2 |
