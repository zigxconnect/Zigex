# Request: push notifications and account deletion

**From:** the Zigex frontend team
**Date:** 7 October 2026
**Why:** the new Settings page has a "Notifications on this device" switch and a place for "Delete account". Both are ready on the frontend and wait on the items below.

---

## 1. Push notifications (Web Push with VAPID keys)

### What we need

1. **Generate one VAPID key pair** and share the public key with us:

   ```bash
   npx web-push generate-vapid-keys
   ```

   - **Public key:** we set it in the frontend as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
   - **Private key:** stays on the backend only (with a contact, e.g. `mailto:zigexconnect.com@gmail.com`).
   - Both sides must use the **same pair**, or pushes fail silently.

2. **Keep the existing subscription endpoints** (already in Swagger):

   | Method | Path | Body |
   | --- | --- | --- |
   | `POST` | `/api/v1/push/subscriptions` | `{ "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." }, "origin": "https://www.zigexconnect.com" }` |
   | `DELETE` | `/api/v1/push/subscriptions` | `{ "endpoint": "..." }` |

   A student can have several subscriptions (phone and laptop). Delete a subscription when the push service answers `404` or `410`.

3. **Send a push** when something a student cares about happens:

   | Event | Title | Body | Opens |
   | --- | --- | --- | --- |
   | Application accepted | You've been accepted | `<title>` at `<company>` | `/dashboard/applied-internships` |
   | Application not selected | Application update | `<company>` reviewed your application for `<title>` | `/dashboard/applied-internships` |
   | New announcement | `<company or Zigex>` | announcement title | `/dashboard/blog` |
   | Program update posted | `<program title>` | first line of the update | `/programs/<id>/updates` |

   Payload shape the service worker reads:

   ```json
   { "title": "You've been accepted", "body": "SEED Summer Internship at SEED Inc", "url": "/dashboard/applied-internships" }
   ```

   Please also create the matching in-app notification (`GET /notifications`) for the same events, so the bell and the push say the same thing.

### How we'll test

Turn the switch on in Settings, accept a test application from the admin app, and check the push arrives on Chrome (desktop and Android).

---

## 2. Delete account

Students should be able to delete their account themselves. Today Settings tells them to email support.

### Endpoint

```http
DELETE /api/v1/students/me
Authorization: Bearer <student token>
Content-Type: application/json

{ "password": "<current password>" }
```

(Any path is fine, e.g. `DELETE /api/v1/auth/account`; please tell us which.)

### Behaviour

| Case | Response |
| --- | --- |
| Correct password | `204 No Content`; the session token stops working |
| Wrong password | `401` `{ "error": { "code": "INVALID_PASSWORD", "message": "..." } }` |
| Account signed up with Google (no password) | Accept `{ "confirm": "DELETE" }` instead of a password, or tell us the alternative |
| Too many attempts | `429` |

### What gets deleted

- The student profile, login and push subscriptions.
- Uploaded files (avatar, cover, CVs, cover letters) from R2.
- Applications: delete them, or anonymise them if companies need to keep records. Please tell us which, so the confirmation text is accurate.
- The email address becomes free to register again.

### What the frontend will do

Settings will get a **Delete account** button that opens a confirmation asking for the password, explains what's removed, then signs the student out and returns them to the home page.

---

**Please reply** with the VAPID public key (or confirm you've set it in our hosting) and the delete endpoint's final path once it's deployed. We'll wire and test both the same day.
