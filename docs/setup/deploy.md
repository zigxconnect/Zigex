# Deploying the student app (VPS)

How code gets from a pull request to the live site, how to release a version, and how to roll back.

```
pull request ──► CI (type check, build, audit)
merge to student-backend / zigex
npm version patch ──► git push --follow-tags ──► Deploy workflow
   build on GitHub → package → upload to VPS → switch release → health check
   (unhealthy? → automatic rollback to the previous release)
```

| File | What it does |
| --- | --- |
| `.github/workflows/ci.yml` | On every pull request and push: install, type check (report only for now), build, security audit |
| `.github/workflows/deploy.yml` | On a `v*.*.*` tag (or "Run workflow"): build, package, upload, switch, check, create the GitHub Release |
| `deploy/remote-deploy.sh` | Runs on the VPS: unpacks the release, switches `current`, restarts PM2, checks `/api/health` reports the new version, rolls back if not, keeps the last 3 |
| `deploy/rollback.sh` | Runs on the VPS: switch back to an earlier release by hand |
| `deploy/ecosystem.config.cjs` | PM2 process config |
| `deploy/nginx/zigex.conf` | Example Nginx site |
| `app/api/health/route.ts` | `GET /api/health` → `{ status, version }`, no backend call |

---

## 1. One-time VPS setup

Assumes Ubuntu with Nginx. Run as a sudo user.

```bash
# Node 22 (matches .nvmrc) and PM2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# A deploy user that owns the app (no sudo needed for deploys)
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /var/www/zigex/{releases,shared/logs,incoming}
sudo chown -R deploy:deploy /var/www/zigex

# Secrets: one file outside the releases, readable only by the deploy user
sudo -u deploy cp /path/to/your/.env /var/www/zigex/shared/.env
sudo chmod 600 /var/www/zigex/shared/.env

# PM2 starts again after a reboot
sudo env PATH=$PATH pm2 startup systemd -u deploy --hp /home/deploy
```

**SSH key for GitHub Actions** (on your own machine):

```bash
ssh-keygen -t ed25519 -f zigex_deploy -C "github-actions-deploy" -N ""
# Put the public key on the VPS:
ssh-copy-id -i zigex_deploy.pub deploy@YOUR_VPS
# The VPS host key, to pin it in GitHub (no trust-on-first-use):
ssh-keyscan -p 22 YOUR_VPS
```

**Nginx and HTTPS:** follow the comments at the top of `deploy/nginx/zigex.conf` (copy it, enable it, then `certbot --nginx`).

The app listens on `127.0.0.1:3000` only. Keep ports 80, 443 and SSH open in the firewall, nothing else: `sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable`.

## 2. GitHub settings

**Settings → Secrets and variables → Actions → Secrets** (private):

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | `deploy` |
| `VPS_PORT` | SSH port (optional, default 22) |
| `VPS_SSH_KEY` | Contents of `zigex_deploy` (the private key) |
| `VPS_KNOWN_HOSTS` | Output of `ssh-keyscan` above |

**Variables** (public values baked into the browser bundle at build time, so CI needs them):

| Variable | Example |
| --- | --- |
| `BACKEND_URL` | `https://api.zigexconnect.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://zigexconnect.com` (also used to check the live site after a deploy) |
| `NEXT_PUBLIC_ADMIN_APP_URL` | `https://admin.zigexconnect.com` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth web client ID |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key (same pair as the backend) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | Sanity project |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`, `NEXT_PUBLIC_EMAILJS_AI_WAITLIST_TEMPLATE_ID` | EmailJS (Zila waitlist) |
| `FRONTEND_URL` | `https://zigexconnect.com` |
| `VPS_APP_DIR` | Optional, default `/var/www/zigex` |

Server-only secrets (`JWT_SECRET`, `GMAIL_*`, `EMAILJS_PRIVATE_KEY`, `RESEND_API_KEY`, `SANITY_WEBHOOK_SECRET`…) live **only** in `/var/www/zigex/shared/.env` on the VPS, never in GitHub.

**Recommended:**
- **Environments → production:** add yourself as a required reviewer, so every deploy waits for a click.
- **Branches:** protect `zigex` and `student-backend` (pull request required, CI must pass).

## 3. Releasing a version

1. Merge the ready pull requests into the release branch (`student-backend`).
2. Update `CHANGELOG.md`: rename **Unreleased** to the new version and today's date, in plain words for students.
3. Check: `npm ci && npm run build` locally passes, the backend items this release depends on are live (check the live API, don't rely on messages), quick test on a phone.
4. Bump the version and tag it:

   ```bash
   npm version patch      # 1.0.0 → 1.0.1 (fixes)
   npm version minor      # 1.0.1 → 1.1.0 (new features)
   npm version major      # breaking changes (rare)
   git push origin student-backend --follow-tags
   ```

   The tag push starts **Deploy**. It refuses to run if the tag and `package.json` disagree.
5. Watch the run in **Actions**. When it's green, check `https://zigexconnect.com/api/health` shows the new version, then open the site on a phone.
6. For the next hour, keep an eye on errors: `ssh deploy@YOUR_VPS pm2 logs zigex`.

**Redeploy without a new version** (for example after changing `shared/.env`): Actions → Deploy → Run workflow → enter the tag (`v1.0.1`). After an `.env` change alone, `pm2 restart zigex` on the VPS is enough.

## 4. Rolling back

The deploy rolls back by itself when the new release doesn't pass its health check. To go back by hand (the app has a bug the health check can't see):

```bash
ssh deploy@YOUR_VPS
/var/www/zigex/current/deploy/rollback.sh          # previous release
/var/www/zigex/current/deploy/rollback.sh 1.0.0    # a specific version
```

The last 3 releases are kept in `/var/www/zigex/releases/<version>_<timestamp>`. Then fix forward: commit the fix and release a new patch version.

## 5. Troubleshooting

| Symptom | Check |
| --- | --- |
| Deploy fails at "Upload and switch" with a host key error | `VPS_KNOWN_HOSTS` doesn't match the VPS: run `ssh-keyscan` again |
| "Missing /var/www/zigex/shared/.env" | Create it (step 1) |
| Health check fails, release rolled back | `pm2 logs zigex --lines 100` on the VPS; usually a missing variable in `shared/.env` |
| Site shows an old version after a deploy | The PWA service worker: reload once, or close and reopen the installed app; check `/api/health` |
| 502 Bad Gateway | The app isn't running: `pm2 status`, then `pm2 logs zigex` |
| Photos too big to upload (413) | `client_max_body_size` in the Nginx site |
