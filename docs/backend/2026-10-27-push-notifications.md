# Push notifications don't arrive (27 October 2026)

Students get the in-app notification (the bell) but no push on their phone. We traced it through the code of both backends (`ZIGEX-ADMIN-BACKEND`, `ZIGEX-BACKEND`) and checked the development site. The student app's side is working on `dev.zigexconnect.com`: `sw.js` loads `push-sw.js`, which shows the notification, and the subscription is saved with `POST /api/v1/push/subscriptions` (401 without a token, as expected).

## P1. The admin API never asks for a push

`src/shared/services/notification.service.ts` (admin API) calls the student API's trigger after creating a notification:

```ts
fetch(`${STUDENT_BACKEND_URL}/api/v1/internal/push/trigger`, {
  body: JSON.stringify({ userId, title, body: message, type, reference_id, url }),
})
```

The trigger (`notifications.controller.ts → triggerNotification`, student API) only pushes when the body has `push: true`:

```ts
const { userId, title, body, url, type, referenceId, push } = req.body;
… sendPush: push === true
```

The admin API never sends `push`, so **every accepted, rejected or shortlisted notification is saved in the bell but never pushed**.

**Fix (admin API):** send `push: true`, and send `referenceId` (camelCase, see P2):

```ts
body: JSON.stringify({ userId, title, body: message, type, referenceId: payload.referenceId, url, push: true }),
```

## P1. `reference_id` vs `referenceId`: notifications get dropped as "duplicates"

The admin API sends `reference_id`, but the trigger reads `referenceId`, so every trigger arrives with `reference_id: ''`. `notifyUser` skips a notification when the same user got the same `type` with the same `reference_id` in the last 10 minutes. With an empty id, a company that accepts a student to two postings within 10 minutes only notifies the first one. **Fix:** as above, send `referenceId` (or have the trigger accept both names).

## P1. Missing settings make it fail silently

None of these log anything when missing, so a misconfigured server looks like "push doesn't work" with no error:

| Server | Variable | What happens when missing |
| --- | --- | --- |
| Student API | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | `sendPushToUser` returns at once: no push, **no log** |
| Student API | `INTERNAL_SERVICE_KEY` | the trigger answers 401 |
| Admin API | `INTERNAL_SERVICE_KEY` (same value) | the trigger is **never called, no log** |
| Admin API | `STUDENT_BACKEND_URL` | calls `http://localhost:5001`; works only if both run on the same machine on that port |
| Student app | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | must be the **public half of the same pair** as the student API's `VAPID_PUBLIC_KEY`, or pushes are accepted by Google/Mozilla but rejected for the wrong key |

**Request:** log a warning at start-up when any of these is missing, and answer `503 push_not_configured` from the trigger instead of 200.

## P2. Bulk notifications never push

`NotificationService.notifyMultipleUsers` (admin API: announcements to several interns, etc.) only writes rows, with no trigger at all. **Fix:** call the trigger for each user, or add a bulk trigger (`POST /internal/push/trigger-many { userIds[], … }`).

## P2. Errors are swallowed

- The trigger's `fetch` in the admin API is fire-and-forget, with only `console.error` on network errors. A 401 or 500 response isn't logged at all. Please log `res.status` when it isn't 2xx.
- `sendPushToUser` logs other errors but always answers 200. Please count `sent` / `failed` / `removed` and return them, so we can test it.

## Ask: a test endpoint

`POST /api/v1/push/test` (student JWT): sends "Test notification from Zigex" to the caller's own subscriptions and returns `{ subscriptions: n, sent: n, failed: n, removed: n, configured: true|false }`. The app will add a "Send me a test" button in Settings, so anyone can check their phone in 10 seconds.

## How we'll check it's fixed (on dev)

1. Sign in on `dev.zigexconnect.com` on a phone, Settings → turn notifications on.
2. In the company portal on `devcompany.zigexconnect.com`, accept that student's application.
3. The phone shows the push within a few seconds; tapping it opens My applications.
