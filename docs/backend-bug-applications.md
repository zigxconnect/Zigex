# Bug report: program and event applications fail (`POST /applications`)

**Reported:** 7 October 2026, by the Zigex frontend team
**Endpoint:** `POST https://api.zigexconnect.com/api/v1/applications`
**Severity:** urgent. No student can register for a program or RSVP to an event.

---

## 1. Program and event applications always return "internship_id is required"

### What happens

Every application with `application_type` set to `"program"` or `"event"` is rejected with:

```json
400 Bad Request
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "internship_id is required" } }
```

The request body matches the Swagger spec for this endpoint ("Exactly one target ID must be provided").

### How to reproduce

Use any signed-in **student** token. The ids below are fake, so nothing is created.

```bash
# Program
curl -X POST https://api.zigexconnect.com/api/v1/applications \
  -H "Authorization: Bearer <student token>" \
  -H "Content-Type: application/json" \
  -d '{"application_type":"program","program_id":"00000000-0000-4000-8000-000000000000"}'

# Event
curl -X POST https://api.zigexconnect.com/api/v1/applications \
  -H "Authorization: Bearer <student token>" \
  -H "Content-Type: application/json" \
  -d '{"application_type":"event","event_id":"00000000-0000-4000-8000-000000000000"}'
```

Both return `400 "internship_id is required"`.

A real request from the app that failed the same way:

```json
{
  "application_type": "program",
  "program_id": "223d8466-417f-4db9-8614-8e8613286596",
  "expectations": "thank you so very much",
  "comments": "Level: Beginner"
}
```

(Program: *SEED WEEKEND OF CODE 2026*, open for registration until 7 Nov 2026.)

### Expected

| Request | Expected response |
| --- | --- |
| `application_type: "program"` + an open `program_id` | `201` with the created application |
| `application_type: "event"` + an open `event_id` | `201` with the created application |
| Unknown `program_id` / `event_id` | `404 Not found` |
| Missing the target id for the given type | `400` naming the right field, e.g. "program_id is required" |
| Same student applies twice | `409 DUPLICATE_APPLICATION` |

### Likely cause

The validation checks for `internship_id` regardless of `application_type`. It should only require `internship_id` when `application_type` is `"internship"`, `program_id` for `"program"`, and `event_id` for `"event"`.

---

## 2. Unknown internship id returns 500

```bash
curl -X POST https://api.zigexconnect.com/api/v1/applications \
  -H "Authorization: Bearer <student token>" \
  -H "Content-Type: application/json" \
  -d '{"application_type":"internship","internship_id":"00000000-0000-4000-8000-000000000000"}'
```

**Actual:** `500 "An unexpected error occurred"`
**Expected:** `404 Not found`

---

## 3. Connection timeouts during normal use

On 7 October 2026 the frontend server got connection timeouts to the API during normal use:

```text
Connect Timeout Error (attempted address: api.zigexconnect.com:443, timeout: 10000ms)
```

This affected `POST /applications` and `GET /notifications`. A few minutes later the same requests answered in about 1.5 s. Please check for restarts or an overloaded instance around that time.

---

## 4. Photo uploads

Reported separately in `backend-bug-uploads.md` (uploads return `pub-REPLACE.r2.dev` URLs).

## What the frontend does meanwhile

- Students who try to register or RSVP see: *"Registration for programs isn't working on Zigex right now. Our team is fixing it; your answers are saved, so try again later."*
- Their answers are kept, so they can resend as soon as the fix is deployed.
- Nothing needs to change on the frontend once this is fixed. We'll retest program registration and event RSVPs straight away.

**Please reply** when the fix is deployed, or if the request format should be different from the Swagger spec.
