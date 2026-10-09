# Admin side: what the student app needs from it

The student app (1.1.0) is finished on its side. Several things students see are created by companies and supervisors in the admin app. This is the list of what the admin side has to provide, with the fields the student app reads, so the two sides fit. Backend bugs that block any of it are in [../backend/open-requests.md](../backend/open-requests.md).

## 1. Placements

| Admin action | What the student sees | Fields the student app reads |
| --- | --- | --- |
| Accept an application | "Accepted" in My applications, an **Open workspace** button, the workspace, a notification | `applications.status = accepted` (programs/events: `accepted` or `rsvp_confirmed`); notification with `url` (see [../backend/notifications.md](../backend/notifications.md)) |
| Set the internship's dates | The Today panel ("Starts Friday 23 October", "has ended"), the attendance calendar ("Week 2 of 5"), which workspace "My workspace" opens | `internships.start_date`, `end_date` (and `applications.duration_months` as a fallback). **Without dates the workspace can't tell upcoming from finished**, so make them required. |
| Assign a supervisor | "Your supervisor" with Email and WhatsApp buttons; the supervisor's name in the logbook | `applications.supervisor_id` → `supervisor_profiles { full_name, email, whatsapp, role or department, avatar_url }` |
| (team) | "Other interns" and the People list | `GET /internships/{id}/team` → `{ supervisors[], interns[] }`. **Currently returns 500.** |

## 2. Daily attendance

| Admin action | What the student sees | What it needs |
| --- | --- | --- |
| Print the workplace QR poster | Students scan it (in the app or with the phone's camera) to check in | A token per internship, encoded as `https://zigexconnect.com/attendance/scan?token=<token>` (the app also accepts the bare token). Signed with the shared `JWT_SECRET`. |
| Set the office location (optional) | Check-in asks for location; a clear "Your location doesn't match the workplace" message when too far | `office_latitude`, `office_longitude`, `geofence_radius_meters`, `require_geolocation`. The backend's error message for distance should say how far, in plain words. |
| See who came in | (admin view) | One log row per student per day: `check_in_time`, `check_out_time`, `log_date`. |

## 3. Tasks

| Admin action | What the student sees | Fields |
| --- | --- | --- |
| Give a task | "New" task in the Today panel and the Tasks tab, with due date ("Due tomorrow", "2 days late"), priority, links and files; a notification | `title`, `description` (plain text), `priority` (`high`, `medium`, `low`), `due_date`, `resource_links [{ title, url }]`, `attachments [{ name, url }]`, `department`, optional `output_image_url` |
| See if it was opened | (admin view) | The student app marks tasks read (`is_read`) when opened. |

The daily report lets students tick tasks they worked on; those titles arrive in `tasks_completed` on the log.

## 4. Daily reports

| Admin action | What the student sees | Fields |
| --- | --- | --- |
| Approve a report | "Approved" on the report, counted in the logbook and the totals | log `status`: `approved` |
| Ask for changes | "Needs changes" | log `status`: `rejected` |
| Comment | "Supervisor: …" under the report, also in the logbook | **`supervisor_comment` on the log row.** The student app shows it already; the backend and admin app need to store it. |
| Sign the logbook | The printed logbook has signature lines for the supervisor and the company | Optional: `GET /applications/{id}/logbook` may return a PDF; the app passes it through as is. |

## 5. Updates for a placement

| Admin action | What the student sees | Fields |
| --- | --- | --- |
| Post an update | The Updates tab (pinned first) with a count of unread ones; a notification | `title`, `content` (HTML is fine; the app cleans it), `is_pinned`, `image_url`, `company`, `created_at`, per-student `is_read` |

## 6. Fees and payments

| Admin action | What the student sees | Fields |
| --- | --- | --- |
| Set a monthly fee | "Accept the program fee to start" before check-in and reports open; a Payments tab | `internships.monthly_rate` (FCFA); the student's acceptance sets `is_paid_acknowledgement` |
| Confirm a payment | "Confirmed" in Payments, and a receipt to download | `payment_ledger [{ month (1–12), year, amount, date, status: paid or pending }]`. Please include `year`; without it the receipt guesses from the payment date. |

Zigex doesn't take payments; the admin app records what the company received.

## 7. Learning path

Today the learning path is a fixed list per field (`lib/data/curriculum.ts`), matched by the internship's domain. If companies should set their own, the admin side needs a curriculum editor and `GET /internships/{id}/curriculum` returning modules with lessons (`title`, `duration`, `type`, `url`). The app already calls that endpoint and falls back to the fixed list.

## 8. Design system to reuse

So the admin app looks like the same product:

- **Colours:** navy `#0B1B3F` (text, dark surfaces), blue `#155DFC` (actions; hover `#0F3FB8`), body `#4A5670`, muted `#7B869C`, lines `#DCE5F5` and `#EEF2FA`, page `#F8FAFF`; success `#067647` on `#ECFDF3`, warning `#B54708` on `#FFFAEB`, error `#B42318` on `#FEF3F2`.
- **Type:** Host Grotesk for headings, Inter for text. Sentence case everywhere; no all-caps labels.
- **Surfaces:** white panels with a 1px `#DCE5F5` ring and 16px radius; no drop shadows on cards.
- **Words:** say what happened and what to do next. Buttons say what they do ("Send report", not "Submit").

Good references in this repo: `components/settings/SettingsView.tsx`, `components/workspace/`.
