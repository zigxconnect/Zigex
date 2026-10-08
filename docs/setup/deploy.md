# Deploying the student app (VPS)

Two sites run on the same VPS, built from the same code:

| | Development | Production |
| --- | --- | --- |
| Address | `https://dev.zigexconnect.com` | `https://zigexconnect.com` |
| Deploys when | anything is pushed to `student-backend` | a version tag is pushed (`v1.0.1`) |
| Version shown at `/api/health` | `1.0.1-dev.3f2a9c1` (version + commit) | `1.0.1` |
| On the VPS | `/var/www/zigex-dev`, PM2 `zigex-dev`, port 3100 | `/var/www/zigex`, PM2 `zigex`, port 3000 |
| Secrets | `/var/www/zigex-dev/shared/.env` | `/var/www/zigex/shared/.env` |
| Search engines | blocked (noindex + disallow-all robots.txt) | indexed |

Both use the same backend (`api.zigexconnect.com`) unless you set a different `BACKEND_URL` for development. **Actions on the development site are real**: an application sent there reaches the company. Use test accounts.

```text
feature branch ──PR──► CI (type check, build, audit)
merge to student-backend ──► Deploy → development (dev.zigexconnect.com)
test on dev, then:  npm version patch && git push --follow-tags
tag v1.0.1 ──► Deploy → production (zigexconnect.com)
each deploy: build on GitHub → upload → switch → health check → automatic rollback if unhealthy
```

## What has to pass before production changes

| # | Check | If it fails |
| --- | --- | --- |
| 1 | You approve the run (if `production` has a required reviewer) | Nothing happens |
| 2 | It's a version tag matching `package.json` | Stops; live site untouched |
| 3 | **The same commit passed CI and deployed successfully to the development site** (waits up to 25 minutes, because pushing a version starts both) | Stops; live site untouched |
| 4 | The build succeeds | Stops; live site untouched |
| 5 | After switching: `/api/health` reports the new version | The previous release comes back automatically |
| 6 | **Smoke test:** sign-in, Explore, a real opportunity page and the stylesheet open without the error screen (`deploy/smoke.sh`) | The previous release comes back automatically. If the backend itself is down, it keeps the release and warns instead: rolling back wouldn't fix the backend |
| 7 | `https://zigexconnect.com/api/health` shows the new version through the real domain | The run is marked failed (DNS or Nginx problem) |

Still not covered: anything that passes these checks but behaves wrong (a button that does the wrong thing). That's what testing on the development site is for.

**Emergency fix without the development check:** Actions → Deploy → Run workflow → production, the tag, and tick *Emergency only*. Use rarely: it skips check 3.

Run the smoke test by hand any time: `deploy/smoke.sh https://zigexconnect.com` (or the dev address).

| File | What it does |
| --- | --- |
| `.github/workflows/ci.yml` | Every pull request and push: install, type check (report only for now), build, audit |
| `.github/workflows/deploy.yml` | Picks the environment, builds, packages, uploads, switches, checks the live site, creates the GitHub Release (production) |
| `deploy/remote-deploy.sh` | On the VPS: unpack, switch `current`, restart PM2, require `/api/health` to report the new version, roll back if not, keep 3 releases |
| `deploy/smoke.sh` | Opens the main pages and checks they work; exit 1 = release broken, 2 = backend down |
| `deploy/rollback.sh` | On the VPS: switch back by hand |
| `deploy/ecosystem.config.cjs` | PM2 config for either site (`APP_NAME`, `APP_PORT`, `APP_DIR`) |
| `deploy/nginx/zigex.conf`, `deploy/nginx/zigex-dev.conf` | Nginx sites |
| `app/api/health/route.ts` | `GET /api/health` → `{ status, version }` |
| `lib/app-env.ts` | `NEXT_PUBLIC_APP_ENV` (`production` / `development`), used for noindex |

---

## 1. DNS

`zigexconnect.com`'s DNS is at **Hostinger** (nameservers `ns1/ns2.dns-parking.com`). In Hostinger → Domains → DNS / Nameservers, add:

| Type | Name | Points to |
| --- | --- | --- |
| A | `dev` | your VPS IP |
| A | `@` | your VPS IP (if production isn't already pointed there) |
| CNAME | `www` | `zigexconnect.com` |

Check: `nslookup dev.zigexconnect.com` returns the VPS IP (can take up to an hour).

## 2. One-time VPS setup

Assumes Ubuntu with Nginx. Run as a sudo user.

```bash
# Node 22 (matches .nvmrc) and PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# A deploy user that owns both sites
sudo adduser --disabled-password --gecos "" deploy
for site in zigex zigex-dev; do
  sudo mkdir -p /var/www/$site/{releases,shared/logs,incoming}
done
sudo chown -R deploy:deploy /var/www/zigex /var/www/zigex-dev

# Secrets per site (start dev from a copy of production's, then change what differs)
sudo -u deploy cp /path/to/production.env /var/www/zigex/shared/.env
sudo -u deploy cp /path/to/production.env /var/www/zigex-dev/shared/.env
sudo chmod 600 /var/www/zigex/shared/.env /var/www/zigex-dev/shared/.env

# PM2 comes back after a reboot
sudo env PATH=$PATH pm2 startup systemd -u deploy --hp /home/deploy
```

**Nginx and HTTPS:** follow the comments at the top of each file in `deploy/nginx/`, then:

```bash
sudo certbot --nginx -d zigexconnect.com -d www.zigexconnect.com
sudo certbot --nginx -d dev.zigexconnect.com
```

Optionally password-protect the development site (instructions in `deploy/nginx/zigex-dev.conf`).

Firewall: only SSH, 80 and 443: `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable`. Ports 3000 and 3100 stay private (the apps listen on 127.0.0.1).

**SSH key for GitHub Actions** (on your own machine):

```bash
ssh-keygen -t ed25519 -f zigex_deploy -C "github-actions-deploy" -N ""
ssh-copy-id -i zigex_deploy.pub deploy@YOUR_VPS
ssh-keyscan -p 22 YOUR_VPS        # output → VPS_KNOWN_HOSTS secret
```

**Other services that need the dev address:**

- **Google sign-in:** Google Cloud Console → Credentials → the OAuth web client → add `https://dev.zigexconnect.com` to Authorized JavaScript origins.
- **Backend:** browser calls go through the app's own `/api/v1`, so no CORS change is needed.

## 3. GitHub settings

**Settings → Environments:** create `development` and `production`. Add yourself as a required reviewer on `production` so every release waits for your click.

**Secrets** (repository level, shared by both):

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | `deploy` |
| `VPS_PORT` | SSH port (optional, default 22) |
| `VPS_SSH_KEY` | Contents of `zigex_deploy` (private key) |
| `VPS_KNOWN_HOSTS` | Output of `ssh-keyscan` |

**Variables:** set shared values at repository level, and the ones that differ on each environment (environment values win):

| Variable | development | production |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://dev.zigexconnect.com` | `https://zigexconnect.com` |
| `FRONTEND_URL` | `https://dev.zigexconnect.com` | `https://zigexconnect.com` |
| `VPS_APP_DIR`, `APP_NAME`, `APP_PORT` | optional (defaults `/var/www/zigex-dev`, `zigex-dev`, `3100`) | optional (defaults `/var/www/zigex`, `zigex`, `3000`) |
| `BACKEND_URL` | repo level: `https://api.zigexconnect.com` (override here for a staging backend) | repo level |
| `NEXT_PUBLIC_ADMIN_APP_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`, `NEXT_PUBLIC_EMAILJS_AI_WAITLIST_TEMPLATE_ID` | repo level | repo level |

`NEXT_PUBLIC_APP_ENV` is set by the workflow from the environment; don't set it by hand.

Server-only secrets (`JWT_SECRET`, `GMAIL_*`, `EMAILJS_PRIVATE_KEY`, `RESEND_API_KEY`, `SANITY_WEBHOOK_SECRET`…) live **only** in each site's `shared/.env` on the VPS. `JWT_SECRET` must match the admin app's on the same environment (attendance QR codes).

**Branches:** protect `zigex` and `student-backend` (pull request required, CI must pass).

## 4. Day to day

- **Merge to `student-backend`** → development updates by itself in a few minutes. Check `https://dev.zigexconnect.com/api/health` shows the new commit.
- **Test on dev** with test accounts (phone sign-in, Explore, apply, My applications, notifications, Edit profile).

## 5. Releasing to production

1. Development is green and tested.
2. `CHANGELOG.md`: rename **Unreleased** to the new version and today's date, in plain words for students. Commit it.
3. Confirm the backend items this release depends on are live (check the live API, not messages).
4. Bump and tag:

   ```bash
   npm version patch      # fixes:        1.0.0 → 1.0.1
   npm version minor      # new features: 1.0.1 → 1.1.0
   npm version major      # breaking changes (rare)
   git push origin student-backend --follow-tags
   ```

   The push deploys to development again; the tag deploys to production (after your approval if you set reviewers). Production refuses anything that isn't a version tag matching `package.json`.
5. When the run is green, `https://zigexconnect.com/api/health` shows the version. Open the site on a phone.
6. For the next hour: `ssh deploy@YOUR_VPS pm2 logs zigex`.

**Redeploy by hand** (e.g. after changing a site's `shared/.env`): Actions → Deploy → Run workflow → pick the environment and the ref (`v1.0.1` for production). For an `.env` change alone, `pm2 restart zigex` (or `zigex-dev`) on the VPS is enough.

## 6. Rolling back

Deploys roll back by themselves when the new release fails its health check. By hand (a bug the health check can't see):

```bash
ssh deploy@YOUR_VPS
/var/www/zigex/current/deploy/rollback.sh                 # production: previous release
/var/www/zigex/current/deploy/rollback.sh 1.0.0           # production: a specific version
APP_DIR=/var/www/zigex-dev APP_NAME=zigex-dev APP_PORT=3100 \
  /var/www/zigex-dev/current/deploy/rollback.sh           # development
```

The last 3 releases of each site are kept in `releases/<version>_<timestamp>`. Then fix forward with a new patch version.

## 7. Troubleshooting

| Symptom | Check |
| --- | --- |
| "Production deploys need a version tag" | You ran production on a branch: use a tag (`v1.0.1`) |
| "Tag doesn't match package.json" | Use `npm version …` instead of tagging by hand |
| Host key error at "Upload and switch" | `VPS_KNOWN_HOSTS` is out of date: run `ssh-keyscan` again |
| "Missing …/shared/.env" | Create that site's `.env` (step 2) |
| Health check fails, release rolled back | `pm2 logs zigex` / `pm2 logs zigex-dev`; usually a missing variable in `shared/.env` |
| "doesn't report `version`" at "Check the live site" | The deploy worked on the VPS but the domain doesn't reach it: DNS (step 1) or the Nginx site |
| Google sign-in fails only on dev | Add the dev origin in Google Cloud Console (step 2) |
| Old version after a deploy | The PWA service worker: reload once or reopen the installed app; check `/api/health` |
| 502 Bad Gateway | The app isn't running: `pm2 status` |
