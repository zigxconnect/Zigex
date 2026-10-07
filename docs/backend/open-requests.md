# Open backend requests

What the student app still needs from the backend. Update this file as items are fixed; delete an item once it ships (git history keeps the record).

**Last checked:** 7 October 2026 (evening), with live calls after the backend's second reply. Items below still fail on the live API.

---

## Urgent

### 1. `files.zigexconnect.com` has no DNS record

The report says the bucket now uses `https://files.zigexconnect.com`, but the name still doesn't resolve after the latest reply (`getent hosts files.zigexconnect.com` returns nothing; HTTPS connection fails). If new uploads return `files.zigexconnect.com` links, every new photo will be broken.

Fix in Cloudflare: R2, the bucket, Settings, Custom Domains, add `files.zigexconnect.com` (Cloudflare creates the DNS record when the `zigexconnect.com` zone is on Cloudflare). Then check an uploaded URL opens in a browser.

Afterwards, please also move existing links: profiles still point to `https://pub-1dcd0f5533e34efc96bdebb29d58437b.r2.dev/...`. Rewrite them to the custom domain once it serves the same files.

### 2. Rotate the internal push key (not answered yet)

The `X-Internal-Key` value for `POST /internal/push/trigger` was written in plain text in the integration report, which was shared in documents and chat. Please generate a new key and give it only to whoever runs the admin backend, through its server environment. It must never appear in a document, a repository or browser code.

---

## Still open

### 3. `GET /programs/{programId}/members` still returns 500

The reply says this was fixed with a raw SQL query, but the live API still fails, so the fix is probably not deployed:

```http
GET /api/v1/programs/dcfe2bae-f27a-4b6f-83f0-ba7e89540883/members?limit=3
→ 500 { "success": false, "error": { "code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred" } }
```

### 4. Notification links

The app now follows each notification's `url` when it's a path on our site. The report's example uses `/dashboard/applications`; the app redirects that to My applications (`/dashboard/applied-internships`), so either works. Please use the links from [notifications.md](./notifications.md), section 2.

### 5. Response shapes

Most responses have no schema in Swagger. Adding them would let us remove guesswork in the frontend.

---

## Done (7 October 2026)

- Uploads: unique file names with timestamps, real MIME types and extensions, old files deleted on replace.
- `POST /applications` for programs and events: correct ID fields, `404` for unknown targets.
- Account deletion cascades across records and R2 files; `DELETE /students/me` is the only path (`/auth/account` removed and confirmed `404`).
- Old alias `/applications/{id}/paymentacknowledgement` removed.
- Push trigger only at `POST /internal/push/trigger` with `X-Internal-Key`; the old `/push/trigger` no longer exists.
- New VAPID key pair; the frontend has the public key and subscribing works.
- Notifications: `url` field, per-student read state, 10-minute de-duplication, push `tag`, TTL and urgency; the list and unread count return 200 again (7 Oct, evening).
- Endpoints now in Swagger and live: withdraw, change password, cover image, resume per application, payment acknowledgement, happening now.

---

**Please reply with:** fixes for 1 and 3 (deployed, so the live API returns 200), and confirmation that the internal key was rotated (2).
