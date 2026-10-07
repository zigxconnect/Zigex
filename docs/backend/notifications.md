# How notifications should work on Zigex

**From:** the Zigex frontend team
**Date:** 7 October 2026
**For:** backend (student API) and admin app teams

Push is now live end to end: the VAPID key is set, and turning on "Notifications on this device" in Settings subscribes the browser. This document describes what students should be notified about, what each notification says and where it leads, and what the backend needs to change so the bell, the notifications page and push all agree.

---

## 1. Principles

1. **Only notify about things a student acts on or waits for.** Application decisions matter. "A new program was posted" is useful once, in the bell, never as a phone alert.
2. **One event, one notification.** Today the same program produces two rows ("New Program!" and "New Program Available"). Each event should create exactly one notification per student.
3. **Push and the bell say the same thing.** Every push has a matching in-app notification with the same title, body and link.
4. **Every notification opens something.** The backend sends the link (`url`), so the apps never have to guess from `type`.
5. **Plain words.** Sentence case and no exclamation marks. Name the thing ("SEED Summer Internship 2026"), not the category ("New Internship!").

---

## 2. What students are notified about

| # | Event | Who receives it | Bell | Push | Title | Body | Opens (`url`) | `type` |
|---|---|---|---|---|---|---|---|---|
| 1 | Application received | The applicant | Yes | No | Application sent | `<opportunity>` at `<company>` | `/dashboard/applied-internships` | `application_received` |
| 2 | Application accepted | The applicant | Yes | **Yes** | You've been accepted | `<opportunity>` at `<company>` | `/dashboard/applied-internships` | `application_accepted` |
| 3 | Application not selected | The applicant | Yes | **Yes** | Application update | `<company>` reviewed your application for `<opportunity>` | `/dashboard/applied-internships` | `application_rejected` |
| 4 | Application shortlisted / interview | The applicant | Yes | **Yes** | You're on the shortlist | `<company>` wants to talk about `<opportunity>` | `/dashboard/applied-internships` | `application_shortlisted` |
| 5 | Program update posted | Students enrolled in that program | Yes | **Yes** | `<program title>` | First line of the update | `/programs/<id>/updates` | `program_update` |
| 6 | Event tomorrow | Students who RSVP'd | Yes | **Yes** | Tomorrow: `<event title>` | `<time>`, `<place or "Online">` | `/feed/<id>` | `event_reminder` |
| 7 | Deadline in 2 days | Students who started but didn't send an application (when drafts move to the server) | Yes | Yes | 2 days left to apply | `<opportunity>` closes on `<date>` | `/feed/<id>` | `deadline_reminder` |
| 8 | New internship | Everyone (global) | Yes | No | New internship | `<title>` at `<company>` | `/feed/<id>` | `internship` |
| 9 | New program | Everyone (global) | Yes | No | New program | `<title>` | `/programs/<id>` | `program` |
| 10 | New event | Everyone (global) | Yes | No | New event | `<title>` | `/feed/<id>` | `event` |
| 11 | New announcement | Everyone (global) | Yes | No | `<company or "Zigex">` | Announcement title | `/dashboard/blog/<slug>` | `announcement` |

Rows 1–6 are the priority. Row 7 waits until application drafts are stored on the server (today they stay on the student's device). Rows 8–10 already exist; only their wording, `url` and duplicates need fixing.

**Why new opportunities don't push:** several get posted each week. A phone alert for each one teaches students to turn notifications off, and then they miss the acceptance that matters.

---

## 3. The notification record

`GET /api/v1/notifications` should return:

```json
{
  "id": "uuid",
  "type": "application_accepted",
  "title": "You've been accepted",
  "message": "SEED Summer Internship 2026 at SEED Inc",
  "url": "/dashboard/applied-internships",
  "reference_id": "uuid of the application / opportunity / update",
  "is_read": false,
  "created_at": "2026-10-07T14:00:00Z"
}
```

Changes from today:

- **Add `url`.** It's the path the notification opens. The frontend falls back to its own mapping only when `url` is missing.
- **Use the specific `type` values** in the table above, not just `internship` / `program` / `event`.
- **Read state for global notifications must be per student.** A global row has `user_id: null`, so `is_read` can't live on the row itself, or one student reading it marks it read for everyone. Store reads in a separate `notification_reads (notification_id, user_id, read_at)` table, or create one row per student.
- **No duplicates.** Before inserting, skip if the same `(user_id or global, type, reference_id)` was created in the last 10 minutes. This also protects against retries from the admin app.
- **Keep** `?page`, `?limit`, `?unreadOnly=true`, `GET /notifications/unread-count`, and `POST /notifications/read` with `{ notificationIds }` or `{ markAll: true }`. The frontend uses all of them.

---

## 4. Sending a notification (`POST /api/v1/push/trigger`)

The admin app calls this when a company accepts or rejects an application, posts a program update, and so on. It creates the in-app notification **and** sends the push.

```json
{
  "userId": "student user id",
  "type": "application_accepted",
  "title": "You've been accepted",
  "body": "SEED Summer Internship 2026 at SEED Inc",
  "url": "/dashboard/applied-internships",
  "referenceId": "application id",
  "push": true
}
```

**Security (please confirm before release):** this endpoint can message any student. It must only accept calls from the admin backend:

- require a server-to-server secret header (e.g. `X-Internal-Key`, compared in constant time) or a separate service token;
- reject student and company JWTs, even valid ones;
- never call it from a browser; the key must not appear in frontend code;
- rate-limit it and log every call (caller, type, recipient).

`push: false` creates only the in-app notification (rows 1 and 8–11).

---

## 5. Push delivery

Payload sent to the browser (read by `public/push-sw.js`):

```json
{ "title": "You've been accepted", "body": "SEED Summer Internship 2026 at SEED Inc", "url": "/dashboard/applied-internships", "tag": "application:<id>" }
```

- **`tag`**: use one tag per thing (`application:<id>`, `program-update:<id>`), so a newer push replaces an older one about the same thing instead of stacking.
- **`url`**: must be a path on our site (starts with `/`). The service worker ignores anything else and opens `/notifications`.
- **TTL**: 24 hours for decisions, 6 hours for event reminders. An expired reminder is worse than none.
- **Urgency**: `high` for decisions (rows 2–4), `normal` otherwise.
- **Dead subscriptions**: delete a subscription when the push service answers `404` or `410`.
- **Several devices**: send to every subscription the student has (phone and laptop).

---

## 6. What the frontend does (already built)

| Place | Behaviour |
|---|---|
| Bell (top bar) | Unread count from `/notifications/unread-count`, refreshed every 60 s while the tab is visible. Shows the latest 6, with duplicates merged. Opening one marks it read and goes to its link. |
| Notifications page | Grouped by day, All / Unread, "Show older notifications", "Mark all as read". |
| Settings → Notifications on this device | Asks for permission only when the student turns it on; subscribes or unsubscribes with `/push/subscriptions`. Explains blocked or unsupported browsers. |
| Push click | Reuses an open Zigex tab, goes to `url`, and only allows paths on our site. |
| Links today | Program → `/programs/<id>`, internship/event → `/feed/<id>`, application news → My applications, announcements → Announcements. Replaced by the backend `url` once it's sent. |

---

## 7. How we'll test it together

1. Student turns on notifications in Settings (Chrome desktop and Android).
2. Admin accepts that student's test application → within a minute: push "You've been accepted", bell count +1, row on the notifications page, tapping either opens My applications.
3. Admin rejects another → "Application update", same checks.
4. Admin posts a program update → only enrolled students get it; it opens the program's updates.
5. Admin posts a new internship → bell only, no push, exactly one row.
6. Mark all as read → count 0 on every device after refresh.
7. Calling `/push/trigger` with a student's token → `401`/`403`.

**Please reply with:** how `/push/trigger` is protected, and an ETA for `url`, the specific `type` values, per-student read state and de-duplication.
