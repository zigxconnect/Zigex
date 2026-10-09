# Open backend requests

What the student app still needs from the backend. Update this file as items are fixed; delete an item once it ships (git history keeps the record).

**Last checked:** 8 October 2026, with live calls and public DNS lookups after the backend's third reply. Items below still fail on the live API.

---

## Urgent

### 1. `files.zigexconnect.com` still doesn't exist, and every stored file now points to it

The migration rewrote all avatars, logos and resumes to `https://files.zigexconnect.com/...`, but that name doesn't exist on the public internet:

```
dns.google        files.zigexconnect.com  → NXDOMAIN (Status 3)
cloudflare-dns    files.zigexconnect.com  → NXDOMAIN (Status 3)
zigexconnect.com nameservers → ns1.dns-parking.com, ns2.dns-parking.com (Hostinger)
```

**Why:** an R2 custom domain only works when the domain's DNS is managed by Cloudflare. `zigexconnect.com` uses Hostinger's nameservers, so adding the custom domain in R2 never created a record. The files themselves are fine: the same paths load from `https://pub-1dcd0f5533e34efc96bdebb29d58437b.r2.dev/...` (checked: 200).

**Fix (pick one):**
- **Move `zigexconnect.com` to Cloudflare DNS:** add the site in Cloudflare, copy every existing record (website, email MX/TXT…), then change the nameservers at Hostinger to the two Cloudflare gives you. Once active, the R2 custom domain connects by itself. Check with `nslookup files.zigexconnect.com`.
- **Until then, roll the links back** to the `r2.dev` address so files load for every client.

The student web app temporarily rewrites `files.zigexconnect.com` links to the `r2.dev` address, so photos show again there; other clients (admin app, emails) still get broken links.

---

## Still open

### 2. `GET /programs/{programId}/members` still returns 500

The third reply says the fix is deployed, but the live API still fails (checked 8 October):

```http
GET /api/v1/programs/dcfe2bae-f27a-4b6f-83f0-ba7e89540883/members?limit=3
→ 500 { "success": false, "error": { "code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred" } }
```

### 3. `GET /applications` lost a program registration

On 7 October the test student had two applications: the internship *SEED Summer Internship Program 2026* and a registration for the program *SEED WEEKEND OF CODE 2026*. On 8 October `GET /applications` returns only the internship (1 row). Probably related to the `student_id` / `student_profiles.id` remapping: please check program and event rows are still returned for their student.

Also: embedded postings are stubs (`internships: { id, title }`), without image, dates or description. The app now fetches the full posting when it gets a stub, but returning the full object (or `cover_image_url` / `program_picture_url` / `event_picture_url` at least) would save a call per application.

### 4. Data retention promised in the Privacy Policy

The new Privacy Policy (`/privacy`, section 6) commits to these periods. They need scheduled jobs on the backend:

| Data | Delete when |
| --- | --- |
| Applications and their documents (R2) | 2 years after the opportunity closes |
| Internship records (check-ins, reports) | 2 years after the internship ends |
| Inactive accounts | No sign-in for 3 years: email a warning, delete after 30 more days without a reply (same cascade as `DELETE /students/me`) |
| Technical logs | After 90 days |

Please confirm when these run, or tell us different periods so we can update the policy. Requests for a copy of a student's data are answered by email for now; an export endpoint would help later.

### 4b. `GET /internships/{id}/team` returns 500

The intern workspace asks for the people on a placement (supervisors and other interns) with `GET /internships/{id}/team`. For internship `e4694c21-2c9a-45e6-9dd9-569df0f5cd84` (IT Infrastructure Intern), signed in as an accepted intern, it returns `500` with "An unexpected error occurred". The workspace hides the list when this fails, so interns currently can't see their supervisor or each other.

Also: `GET /students/me` returns `is_intern: false` for this student although their application is `accepted`. The app now treats an accepted application as enough, but the flag should match.

### 5. Notification links

The app now follows each notification's `url` when it's a path on our site. The report's example uses `/dashboard/applications`; the app redirects that to My applications (`/dashboard/applied-internships`), so either works. Please use the links from [notifications.md](./notifications.md), section 2.

### 6. Response shapes (noted for later)

Most responses have no schema in Swagger. Adding them would let us remove guesswork in the frontend.

---

## Done (7–8 October 2026)

- Uploads: unique file names with timestamps, real MIME types and extensions, old files deleted on replace.
- `POST /applications` for programs and events: correct ID fields, `404` for unknown targets.
- Account deletion cascades across records and R2 files; `DELETE /students/me` is the only path (`/auth/account` removed and confirmed `404`).
- Old alias `/applications/{id}/paymentacknowledgement` removed.
- Push trigger only at `POST /internal/push/trigger` with `X-Internal-Key`; the old `/push/trigger` no longer exists.
- New VAPID key pair; the frontend has the public key and subscribing works.
- Notifications: `url` field, per-student read state, 10-minute de-duplication, push `tag`, TTL and urgency; the list and unread count return 200 (schema synced on the live database).
- Internal push key rotated and kept in server environments only.
- Endpoints now in Swagger and live: withdraw, change password, cover image, resume per application, payment acknowledgement, happening now.

---

**Please reply with:** item 1 fixed (`nslookup files.zigexconnect.com` returns an address, or links rolled back) item 2 returning 200 on the live API, and item 3 (the missing program registration).
