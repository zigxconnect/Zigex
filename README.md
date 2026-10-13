# Zigex for students

The student app of [Zigex](https://www.zigexconnect.com), the internship platform for students in Cameroon. Students find internships, programs and events, apply with their profile and follow their applications. Once accepted, interns get a workspace for their working days: check-in, tasks, a daily logbook and feedback from their supervisor.

Companies and supervisors use a separate portal ([zigxconnect/Zigex-admin](https://github.com/zigxconnect/Zigex-admin)).

| | Production | Development |
| --- | --- | --- |
| App | <https://zigexconnect.com> | <https://dev.zigexconnect.com> |
| Student API | <https://api.zigexconnect.com> ([Swagger](https://api.zigexconnect.com/api-docs)) | same |
| Deploys | a version released from GitHub Actions | every push to `zigex` |

The running version is shown at `/api/health` on each site; what changed in each version is in [CHANGELOG.md](./CHANGELOG.md).

## What it does

- **Discover:** a public feed of internships, programs and events, with opportunity and company pages open to everyone
- **Account:** sign up with email or Google, verify the email, reset the password
- **Profile:** education, skills, CV and photo, used for every application
- **Apply and follow:** apply in a few steps, track each application, withdraw and apply again where allowed
- **Intern workspace:** the day's steps (check in, tasks, daily report), QR check-in at the company, the logbook with supervisor replies, attendance
- **Programs and learning:** program details, modules and progress
- **Notifications:** in the app and by web push
- **Blog:** articles managed in Sanity (studio at `/studio`)

## How it works

```
Browser ──► this app (Next.js)
              ├─ pages: server components call the API with the session token
              └─ /api/v1/* passthrough ──► student API (api.zigexconnect.com)
```

- **The browser never calls the API directly.** The student's token lives in an httpOnly cookie. Server code uses `lib/api/server-client.ts`; client components use `lib/api/browser-client.ts`, which goes through this app's `/api/v1/*` (`app/api/v1/[...path]`) to add the token and forward the request to `BACKEND_URL`.
- **`proxy.ts`** protects signed-in pages, sends signed-in students away from the auth pages and honours `?next=` after sign-in (validated by `lib/utils/redirect.ts`).
- **No database of its own.** All data comes from the student API.

More detail: [docs/architecture.md](./docs/architecture.md).

## Tech stack

- **Next.js 16** (App Router) and **React 19**
- **TypeScript**, **Tailwind CSS v4**, Radix UI, lucide icons
- **Sanity** for the blog, **Web Push** (VAPID) for notifications, Gmail (Nodemailer) and EmailJS for email
- Node.js **22** (`.nvmrc`)

## Getting started

```bash
nvm use        # Node 22
npm install
# create .env.local with the variables below (ask the team for the values)
npm run dev    # http://localhost:3000
```

Keep port **3000**: the API only accepts browser requests from `localhost:3000`, and Google sign-in is configured for it.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `BACKEND_URL` | yes | The student API, e.g. `https://api.zigexconnect.com` |
| `NEXT_PUBLIC_SITE_URL` | yes | This app's public address (emails, metadata, sitemap) |
| `NEXT_PUBLIC_ADMIN_APP_URL` | | The company portal, for links to it |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | | "Continue with Google" |
| `JWT_SECRET` | | Checking attendance QR codes |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | | Web push (must match the API's key pair) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_WEBHOOK_SECRET` | | Blog and its revalidation |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `ADMIN_EMAIL`, `EMAILJS_*`, `NEXT_PUBLIC_EMAILJS_*` | | Email ([docs/setup/email.md](./docs/setup/email.md)) |
| `GEMINI_API_KEY`, `GOOGLE_API_KEY` | | AI features |
| `NEXT_PUBLIC_APP_ENV` | | `production` or `development`; set by the pipeline (development is `noindex`) |

Secrets go in `.env.local`, which git ignores. Never give a secret a `NEXT_PUBLIC_` name: those values are sent to every browser. On the server, runtime settings live in `~/apps/<site>/shared/.env`, and build-time values are GitHub variables ([docs/setup/server.md](./docs/setup/server.md)).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run lint` | Lint |
| `npm run build` / `npm start` | Production build and server |
| `npx tsc --noEmit` | TypeScript check |

## Project layout

```
app/
  (public)/        feed, opportunity and company pages (no sign-in needed)
  (auth)/          sign in, sign up, email verification, password reset
  (dashboard)/     signed-in pages: applications, programs, intern workspace, profile, settings…
  attendance/      QR check-in
  api/v1/          passthrough to the student API
  api/health       version and environment, checked by every deploy
components/        UI by feature (apply, feed, profile, workspace, notifications…)
lib/api/           API clients and per-feature services
lib/               helpers (images, notifications, redirects, email)
deploy/            server scripts and Nginx templates
docs/              architecture, guides, QA plans, requests to the backend team
```

## Development workflow

1. Work on a branch and open a pull request into `zigex`, the main branch. **CI** type-checks, builds and audits every pull request.
2. Merging to `zigex` deploys to **development** (`dev.zigexconnect.com`). Note what changed for students under `## Unreleased` in [CHANGELOG.md](./CHANGELOG.md).
3. Test on development with test accounts. Actions there are real: an application sent from development reaches the company.
4. **Release:** GitHub → Actions → **Release** → Run workflow → `patch` (fixes), `minor` (new features) or `major` (breaking changes). It checks that `zigex` passed CI and the development deploy, sets the version, dates the changelog, tags `vX.Y.Z` and deploys to production.
5. Every deploy checks `/api/health`, runs a smoke test and rolls back by itself if the new version is unhealthy.
6. Release adds a commit to `zigex`, so run `git pull --rebase origin zigex` before your next push.

Versions follow [semantic versioning](https://semver.org). Before the first production release (1.1.0), `zigexconnect.com` has to be switched from the old app: see [docs/setup/server.md](./docs/setup/server.md).

## Documentation

| Doc | What it's for |
| --- | --- |
| [docs/architecture.md](./docs/architecture.md) | How the system fits together: request flow, sign-in, caching, uploads, notifications, security |
| [docs/developer-guide.md](./docs/developer-guide.md) | Setup, conventions, recipes, debugging |
| [docs/setup/deploy.md](./docs/setup/deploy.md) | Pipeline, releasing, rolling back |
| [docs/setup/server.md](./docs/setup/server.md) | Our server as it is set up, and switching production |
| [docs/README.md](./docs/README.md) | Everything else: backend requests, QA plans, product write-ups |

## Related repositories

- **Company portal:** [zigxconnect/Zigex-admin](https://github.com/zigxconnect/Zigex-admin) (`company.zigexconnect.com`)
- **Student API:** [zigxconnect/ZIGEX-BACKEND](https://github.com/zigxconnect/ZIGEX-BACKEND)
- **Admin API:** [zigxconnect/ZIGEX-ADMIN-BACKEND](https://github.com/zigxconnect/ZIGEX-ADMIN-BACKEND)
