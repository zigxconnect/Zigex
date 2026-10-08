# Developer guide

Everything you need to work on the Zigex student app: setup, where things live, the conventions to follow, and step-by-step recipes. Read [architecture.md](./architecture.md) first for how the pieces fit together.

---

## 1. Setup

Requirements: **Node.js 22** (see `.nvmrc`), npm, Git. A student test account on the backend.

```bash
git clone git@github.com:zigxconnect/Zigex.git && cd Zigex
nvm use                    # Node 22
npm ci                     # exact versions from package-lock.json
cp .env.example .env.local # fill in values (ask the team; never commit them)
npm run dev                # http://localhost:3000
```

- Keep port **3000**: the backend only accepts browser traffic from `localhost:3000`, and Google sign-in is configured for it.
- Minimum `.env.local` to see pages: `BACKEND_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`. Everything else turns a feature on (email, Google sign-in, push…). Meanings: `.env.example` and [setup/email.md](./setup/email.md).
- The dev server compiles each page on first visit (slow the first time). To judge real speed, use a production build: `npm run build && npm start`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server (webpack) |
| `npm run build` | Production build (standalone output) |
| `npm start` | Serve the production build |
| `npx tsc --noEmit -p .` | Type check (51 old errors exist; don't add new ones) |
| `deploy/smoke.sh http://localhost:3000` | Open the main pages and check they work |

## 2. Where things live

```text
app/                      Pages (App Router). Folders in (parentheses) group routes without changing URLs.
  (main)/                 Landing, privacy
  (public)/feed/          Explore and opportunity pages (public)
  (auth)/                 Sign in/up, password reset, verify email
  (onboarding)/           First-time profile setup
  (dashboard)/            Signed-in pages + shared shell (layout.tsx)
  api/v1/[...path]/       Passthrough to the backend (adds the JWT)
  api/health/             Liveness check for deploys
  error.tsx, global-error.tsx, not-found.tsx
components/
  apply/                  Apply dialog and panel
  feed/                   Explore board, opportunity cards, opportunity page
  profile/                Edit profile, photo crop
  students/               Student directory and public profile
  settings/               Settings, delete account
  layout/dashboard/       Sidebar, header, mobile tab bar, bell, profile menu
  skeletons/Skeleton.tsx  Bone, PageTitle, Surface, CardBone, RowBone, Loading
  errors/ErrorScreen.tsx  Friendly error screen
  CoverImage.tsx          Optimised card/hero image (next/image with fallback)
  SafeImg.tsx             Avatar image that hides itself if broken
  ui/                     Small shared primitives (button, dialog, inputs…)
lib/
  api/                    HTTP clients, shapes and services (see §3)
  actions/                Server Actions used by forms
  images.ts               usableImageUrl()
  notifications.ts        notificationHref(), wording, de-duplication
  utils/redirect.ts       Safe ?next= handling
  app-env.ts              production / development flag
proxy.ts                  Route protection, redirects, security headers
deploy/                   VPS scripts, PM2 and Nginx config, smoke test
docs/                     This documentation
public/                   Static files (icons, images, service workers)
```

## 3. Conventions

### Talking to the backend

- **Server Components / Server Actions:** call a function in `lib/api/services/<domain>.ts`, which uses `serverApi` (`lib/api/server-client.ts`). Services start with `import "server-only"`.
- **Client Components:** call `lib/api/<domain>-client.ts`, which uses `api` (`lib/api/browser-client.ts`) → `/api/v1/…` → backend. Never call `api.zigexconnect.com` from the browser.
- **Response quirks belong in shape files** (`lib/api/*-shape.ts`): field renames, stubs, missing values. Pages should receive clean objects.
- **Errors:** HTTP failures throw `ApiClientError` (`status`, `code`, `message`). Use `isEndpointMissing(error)` / `whenAvailable(fn, fallback)` for endpoints the backend hasn't deployed yet, so the page shows an empty state instead of crashing.
- **Caching:** wrap per-request reads in React `cache()` when several components need them. Public, token-free data may use `fetch(..., { next: { revalidate: 120 } })`. Personal data stays `no-store`.
- **No waterfalls:** start independent requests together with `Promise.all`.
- **In catch blocks that log,** call `unstable_rethrow(error)` first (from `next/navigation`).
- **Mind the rate limit:** the backend allows ~100 requests per 15 minutes per IP, shared with your dev server.

### UI and design

- **Fonts:** Host Grotesk for headings (`font-heading`), Inter for text (default).
- **Type scale:** body 16px, secondary 14px, small 12px; page titles 28px (`text-[28px] font-bold`).
- **Colours:** navy `#0B1B3F` (text), blue `#155DFC` (actions; hover `#0F3FB8`), wash `#F3F7FF` / `#F8FAFF`, lines `#DCE5F5` / `#EEF2FA`, secondary text `#4A5670`, muted `#7B869C`, error `#B42318`, success `#067647`.
- **Controls:** inputs and primary buttons are 48px tall (`h-12`), `rounded-xl`. Use `landingButton(variant, size)` from `components/sections/landing/landing-ui.ts` for buttons outside forms.
- **Copy:** sentence case, plain words, no exclamation marks, no ALL CAPS labels. Errors say what happened and what to do.
- **Mobile first:** check every change at 360px wide. No horizontal scrolling.
- **Accessibility:** labels on every input, visible focus rings (`focus-visible:ring-2`), `aria-live` for status messages, icons `aria-hidden` unless meaningful.

### Pages

- Every data page gets a **`loading.tsx` skeleton** shaped like the page, built from `components/skeletons/Skeleton.tsx`. No top progress bar.
- **Profile banner:** pages where the "complete your profile" banner shouldn't show are listed in `hideProfileBanner()` in `components/sections/dashboard/DashboardClientLayout.tsx`.
- **Navigation:** sidebar groups live in `components/layout/dashboard/Sidebar.tsx`; the phone tab bar in `MobileTabBar.tsx`.

### Images

- Avatars and logos: pass URLs through `usableImageUrl()` and render with `SafeImg` over initials.
- Opportunity and cover images: `CoverImage` (resized by Next.js). A new image host must be added to both `images.remotePatterns` in `next.config.mjs` and `OPTIMISED_HOSTS` in `components/CoverImage.tsx`.
- Uploads: use the helpers in `lib/api/uploads.ts` (they resize first). Profile photos go through `PhotoCropDialog`.

### Code style

- TypeScript everywhere; no new `any` without a reason in a comment.
- Comments explain *why*, not *what*. Match the surrounding code's style.
- Small focused components; one feature per folder under `components/`.

## 4. Recipes

### Add a signed-in page

1. Create `app/(dashboard)/<path>/page.tsx` (a Server Component). Fetch through a service.
2. Add `loading.tsx` next to it with a page-shaped skeleton.
3. If the profile banner shouldn't show, add the path to `hideProfileBanner()`.
4. Link it from the sidebar / tab bar if it's a main destination.
5. Check at 360px and 1280px, signed in and signed out (it should redirect to sign-in).

### Call a new backend endpoint

1. Confirm it's in Swagger (`https://api.zigexconnect.com/api-docs`) and works live (curl it with a test token).
2. Add a function to the right service (`lib/api/services/<domain>.ts`) or browser client (`lib/api/<domain>-client.ts`).
3. If the response needs cleaning, add it to the domain's shape file.
4. If it might not be deployed yet, wrap it in `whenAvailable()` with a sensible fallback.
5. If it's missing or broken, add it to [backend/open-requests.md](./backend/open-requests.md) with the exact request and response.

### Add an environment variable

1. Use it in code via `process.env.NAME` (server) or `process.env.NEXT_PUBLIC_NAME` (browser; public values only).
2. Add it to `.env.example` with a one-line explanation.
3. Production/development: public values → GitHub Variables; secrets → `shared/.env` on the VPS ([setup/deploy.md](./setup/deploy.md)).

### Add a notification type

1. Agree the event, wording and link with the backend ([backend/notifications.md](./backend/notifications.md)).
2. If the type needs a special link, extend `notificationKind()` / `notificationHref()` in `lib/notifications.ts`.

## 5. Git workflow

- **`zigex`** is the main and deployment branch. Every push to it updates `dev.zigexconnect.com`.
- Work on a short-lived branch from `zigex`: `feat/<thing>`, `fix/<thing>`, `docs/<thing>`, `chore/<thing>`.
- Open a pull request into `zigex`. CI (type check, build, audit) must pass; get one review.
- **Commit messages:** `type(scope): what changed`, e.g. `fix(apply): show the CV status after sending`. Types: `feat`, `fix`, `perf`, `docs`, `chore`, `ci`. The body says *why*.
- Never commit secrets, `.env*` files, build output (`.next/`, `public/sw.js`, `workbox-*.js`) or release tarballs (all in `.gitignore`).

## 6. Releasing

Short version (full checklist in [setup/deploy.md](./setup/deploy.md)):

1. Test on `dev.zigexconnect.com`.
2. Move the **Unreleased** notes in `CHANGELOG.md` under the new version.
3. `npm version patch` (fixes) / `minor` (features) / `major` (breaking).
4. `git push origin zigex --follow-tags`.
5. The production deploy waits for CI and the development deploy of that commit, builds, switches, health-checks, smoke-tests, and rolls back by itself if anything fails.

## 7. Debugging

| Problem | Where to look |
| --- | --- |
| A page shows "This page didn't load" | Server log (`npm run dev` terminal, or `pm2 logs zigex` on the VPS). The reference code on screen matches the logged error's digest. |
| Data looks wrong or empty | Call the endpoint directly with your token and compare with Swagger; check the shape file. Backend changes are the most common cause. |
| Images don't show | Is the URL reachable in a browser? Is the host in `next.config.mjs` and `CoverImage`? Does `usableImageUrl()` drop it? |
| Redirected to sign-in unexpectedly | Cookie expired, or the path isn't in `PUBLIC_PAGES` in `proxy.ts` |
| Push notifications don't arrive | Settings shows "On"? Same VAPID key as the backend? Browser site permissions? |
| Build passes locally, fails in CI | A missing `NEXT_PUBLIC_*` variable in GitHub, or Node version (use 22) |

## 8. Further reading

- [architecture.md](./architecture.md): system architecture
- [setup/deploy.md](./setup/deploy.md): CI, environments, releasing, rollback, VPS setup
- [setup/email.md](./setup/email.md): email services and templates
- [backend/open-requests.md](./backend/open-requests.md): what we're waiting on from the backend
- [backend/notifications.md](./backend/notifications.md): notification events and push
- [CHANGELOG.md](../CHANGELOG.md): what changed in each version
