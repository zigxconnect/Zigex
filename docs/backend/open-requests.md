# Open backend requests

What the student app still needs from the backend. Update this file as items are fixed; delete an item once it ships (git history keeps the record).

## Endpoint status (7 October 2026)

**From:** the Zigex frontend team
**Checked against:** `https://api.zigexconnect.com/api-docs.json` (92 operations) and live calls on 7 October 2026

Thank you: every endpoint the student app calls is now in Swagger. This lists the endpoints behind the features we built recently, whether each one works live, and the few things still open.

---

## 1. Endpoints behind recent features

| Feature (where in the app) | Endpoint | In Swagger | Live check | Frontend |
| --- | --- | --- | --- | --- |
| Delete account (Settings) | `DELETE /students/me` `{ password?, confirm: "DELETE" }` | Yes | Route answers (401 without sign-in) | Wired. Sends `confirm`, plus `password` when typed, so Google sign-ups can delete too |
| Withdraw application (My applications) | `PATCH /applications/{id}/withdraw` | Yes | Works (unknown id gives `404 Application not found`) | Wired. 400/403/404 shown in plain words |
| Change password (Settings) | `PATCH /auth/password` `{ currentPassword, newPassword }` | Yes | Route answers | Wired |
| Push on/off (Settings) | `POST` / `DELETE /push/subscriptions` | Yes | Works end to end with the new VAPID key | Wired |
| Notifications bell and page | `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/read` | Yes | Works | Wired |
| Profile photo | `POST /uploads/avatar` | Yes | Works | Wired, with crop and resize before upload |
| Cover image | `POST /uploads/cover-image` | Yes | Route answers | Ready to wire |
| Resume for one application | `POST /uploads/resume/{applicationId}` | Yes | Route answers | Ready to wire |
| Program members (program page) | `GET /programs/{programId}/members?limit=` | Yes | **500 error** (see 2.1) | Wired, shows nothing until fixed |
| Payment acknowledgement (workspace) | `POST /applications/{id}/payment-acknowledgement` | Yes | Route answers | Switched to this hyphenated path |
| Happening now | `GET /happeningnow`, `POST /happeningnow/{id}/view` | Yes | Works | Switched from the old `/happening-now/latest` |
| Apply (internship, program, event) | `POST /applications` | Yes | Works (internship apply confirmed by a real application) | Wired |

---

## 2. Still open

### 2.1 `GET /programs/{programId}/members` returns 500

```http
GET /api/v1/programs/dcfe2bae-f27a-4b6f-83f0-ba7e89540883/members?limit=5
Authorization: Bearer <student token>
→ 500 { "success": false, "error": { "code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred" } }
```

The program exists (SEED Inc Embedded Systems & IoT Training Program). It is probably the same `user_id` vs `student_profiles.id` mix-up fixed for applications. Expected: `200` with `[{ id, username, full_name, avatar_url }]` and `meta.total`, or an empty list.

### 2.2 Two delete-account endpoints

Swagger has both `DELETE /students/me` and `DELETE /auth/account`, with the same description. The app uses **`DELETE /students/me`**. Please keep one, or confirm both do exactly the same thing (including deleting uploaded files and push subscriptions).

### 2.3 Old path aliases

`POST /applications/{id}/paymentacknowledgement` (no hyphen) still answers. The app no longer calls it, so you can remove it whenever you like.

### 2.4 `POST /push/trigger` security

It currently answers `401 Invalid or expired token` without a token, so it needs some token. Please confirm a **student or company** token is rejected too, and that only the admin backend can call it (shared secret header or service token). Otherwise anyone signed in can send notifications to any student. Details: [notifications.md](./notifications.md), section 4.

### 2.5 Uploads

Uploads now return working addresses. Three things remain:

1. **Every avatar is saved at the same address** (`students/avatars/<id>/avatar.jpg`). Browsers and CDNs keep the old picture cached, so a new photo doesn't appear. Please save each upload under a new name (e.g. `avatar-<timestamp>.jpg`) and delete the previous file.
2. **The stored type must match the file.** A JPEG was once stored as `avatar.png` and served as `image/png`. Use the uploaded `mimetype` for the extension and `Content-Type`.
3. **Move off `pub-….r2.dev`.** It's Cloudflare's development address: rate-limited, slow (a 2.7 MB photo hadn't loaded after 30 seconds) and not meant for production. In Cloudflare: R2, the bucket, Settings, Custom Domains, add `files.zigexconnect.com` (Cloudflare creates the DNS record when the zone is on Cloudflare). Then set `CLOUDFLARE_R2_PUBLIC_URL` to it and check an uploaded URL opens in a browser.

The app resizes photos before upload (avatars 1080px, covers 2400px, JPEG), so new uploads are 150–400 KB.

### 2.6 Notifications

See [notifications.md](./notifications.md): add `url`, use specific `type` values, per-student read state for global notifications, and no duplicates.

### 2.7 Response shapes

Most responses have no schema in Swagger. Adding them would let us remove guesswork in the frontend.

---

**Please reply with:** a fix for 2.1, which delete endpoint stays (2.2), and confirmation for 2.4.
