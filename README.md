# Zigex: student app

The student side of [Zigex](https://www.zigexconnect.com): students in Cameroon find internships, programs and events, apply with their profile, and follow their applications. Interns get a workspace once accepted.

Companies and supervisors use a separate admin app.

## Stack

- **Next.js 16** (App Router) and **React 19**, **Tailwind CSS v4**, Radix UI, lucide icons
- **Backend:** the Zigex student API at `https://api.zigexconnect.com` ([Swagger](https://api.zigexconnect.com/api-docs)). This app keeps no database of its own.
- **Blog:** Sanity (studio at `/studio`)
- **Email:** Gmail (Nodemailer) and EmailJS. See [docs/setup/email.md](./docs/setup/email.md).
- **Push notifications:** Web Push with a VAPID key; the backend sends the pushes.

## How it talks to the backend

The browser never calls the API directly. Requests go to this app's own `/api/v1/*` route (`app/api/v1/[...path]`), which adds the student's token from an httpOnly cookie and forwards to `BACKEND_URL`. Server components use `lib/api/server-client.ts`; client components use `lib/api/browser-client.ts`.

`proxy.ts` protects signed-in pages, sends signed-in students away from the auth pages, and honours `?next=` after sign-in (checked by `lib/utils/redirect.ts`).

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

The backend only accepts browser requests from `localhost:3000`, so keep that port in development.

### Environment variables

| Variable | Needed for |
| --- | --- |
| `BACKEND_URL` | The student API (e.g. `https://api.zigexconnect.com`). Required. |
| `JWT_SECRET` | Signing and checking attendance QR codes |
| `NEXT_PUBLIC_SITE_URL` | Links in emails, metadata and the sitemap |
| `NEXT_PUBLIC_ADMIN_APP_URL` | Where company and supervisor links go |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | "Continue with Google" |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push notifications (must match the backend's key pair) |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_EMAIL`, `EMAILJS_*`, `NEXT_PUBLIC_EMAILJS_*` | Email: see [docs/setup/email.md](./docs/setup/email.md) |
| `SANITY_WEBHOOK_SECRET` | Revalidating the blog when Sanity publishes |

Secrets go in `.env.local`, which git ignores. Never give a secret a `NEXT_PUBLIC_` name: those are sent to every browser.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | Lint |

## Project layout

```
app/
  (public)/       feed and opportunity pages (open without signing in)
  (auth)/         sign in, sign up, password reset
  (dashboard)/    signed-in pages: programs, applications, students, settings…
  api/v1/         passthrough to the backend
components/       UI by feature (apply, feed, profile, settings, notifications…)
lib/api/          API clients and per-feature services
lib/              helpers (images, notifications, redirects, email)
docs/             living docs: see docs/README.md
```

## Releases and deploys

The app runs on a VPS as two sites: **development** (`dev.zigexconnect.com`, updated on every push to `student-backend`) and **production** (`zigexconnect.com`, updated when a version tag is pushed). CI checks every pull request; every deploy rolls back automatically if the new release is unhealthy. How to release, roll back and set up the VPS: [docs/setup/deploy.md](./docs/setup/deploy.md). What changed in each version: [CHANGELOG.md](./CHANGELOG.md).

## Docs

[docs/README.md](./docs/README.md) lists what's there: open backend requests, the notifications spec, product write-ups and setup guides.
