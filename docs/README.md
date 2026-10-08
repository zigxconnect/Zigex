# Zigex docs

Only living documents are kept here. Old change reports and Supabase-era guides were removed on 7 October 2026; `git log --diff-filter=D -- docs/` lists them if you need one back.

## Start here

| Doc | What it's for |
| --- | --- |
| [architecture.md](./architecture.md) | How the system fits together: parts, request flow, sign-in, caching, uploads, notifications, environments, security. |
| [developer-guide.md](./developer-guide.md) | Working on the app: setup, folder map, conventions, recipes, git workflow, releasing, debugging. |

## Backend (send these to the backend team)

| Doc | What it's for |
| --- | --- |
| [backend/open-requests.md](./backend/open-requests.md) | Every endpoint the student app uses and its status, plus everything still open (bugs, uploads, response shapes). Start here. |
| [backend/notifications.md](./backend/notifications.md) | How notifications should work: events, wording, links, the record format, `/push/trigger` security, push delivery. |

The API itself is documented in Swagger: <https://api.zigexconnect.com/api-docs> (JSON at `/api-docs.json`).

## Product

| Doc | Status |
| --- | --- |
| [product/community-guidelines-draft.md](./product/community-guidelines-draft.md) | Draft. Items marked **[DECIDE]** need a decision before publishing. |
| [product/attendance-geolocation-qr.md](./product/attendance-geolocation-qr.md) | How geolocation and QR attendance work (short version). |
| [product/attendance-geolocation-qr-deepdive.md](./product/attendance-geolocation-qr-deepdive.md) | The full technical write-up (also as a PDF). |
| [product/intern-ledger.md](./product/intern-ledger.md) | Intern payments ledger: design and roadmap. Written before the backend move; data now lives behind the API. |
| [product/workspace-backlog.md](./product/workspace-backlog.md) | Intern workspace feature backlog. Written before the backend move. |

## Setup

| Doc | What it's for |
| --- | --- |
| [setup/deployment-guide.md](./setup/deployment-guide.md) | **Step-by-step:** put both sites online on a new VPS (DNS, server, Nginx/HTTPS, GitHub, first deploys, hand-over). |
| [setup/deploy.md](./setup/deploy.md) | CI, releasing a version, deploying to the VPS, rollback, one-time VPS setup. |
| [setup/email.md](./setup/email.md) | Gmail and EmailJS: environment variables, templates and their fields. |

## Content

| Doc | What it's for |
| --- | --- |
| [content/blog-bamenda-startups.md](./content/blog-bamenda-startups.md) | Blog article draft: top tech startups in Bamenda. |

## Keeping this folder tidy

- One topic per doc; update it in place instead of writing a new "fixes" or "summary" file.
- When a request to the backend is done, remove it from `open-requests.md`.
- Don't add docs that repeat what the code or git history already says.
