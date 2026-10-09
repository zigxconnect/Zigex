# Our server: how the student app actually runs

The record of the real setup, done on 9 October 2026. [deployment-guide.md](./deployment-guide.md) is the general recipe for a fresh VPS; **where they differ, this file is right for our server.**

## The server

| | |
| --- | --- |
| Host | Contabo VPS, Ubuntu 24.04, `169.58.25.57` (`vmi3619584`) |
| Shared with | Other apps run by the server admin under the user `sawaflix`: the Zigex backend, the Zigex admin backend, SawaFlix, and the **old** Zigex frontend that serves `zigexconnect.com` today. Don't touch them. |
| Our user | `zigex` (in `sudo`, password required). Log in: `ssh zigex@169.58.25.57` |
| Node | **22** for `zigex` only, through nvm (`~/.nvm`). The system Node is 18 and stays that way for the other apps. |
| PM2 | 7, installed under nvm's Node 22, for `zigex` only |
| Nginx and HTTPS | Managed by the server admin. We don't edit Nginx; we ask the admin. |

Non-interactive SSH (the deploy from GitHub) doesn't load `~/.bashrc`, so `deploy/remote-deploy.sh` and `deploy/rollback.sh` load nvm themselves when `node`/`pm2` aren't on the PATH.

## The two sites

| | Development | Production |
| --- | --- | --- |
| Address | `https://dev.zigexconnect.com` | `https://zigexconnect.com` |
| Deploys when | anything is pushed to `zigex` | a version tag is pushed (`v1.1.0`) |
| Folder | `/home/zigex/apps/zigex-dev` | `/home/zigex/apps/zigex` |
| PM2 app | `zigex-dev` | `zigex` |
| Port (on 127.0.0.1) | **3002**, set by the GitHub variable `APP_PORT` on the *development* environment, because the admin's Nginx site for dev points there | **3200** (the pipeline's default; ports 3000, 3001 and 5000–5003 are taken) |
| Nginx | `dev.zigexconnect.com` → `127.0.0.1:3002`, HTTPS done | Still points to the **old** app. Switch when releasing 1.1.0, see below |
| Secrets | `/home/zigex/apps/zigex-dev/shared/.env` (mode 600) | `/home/zigex/apps/zigex/shared/.env` (mode 600, a copy of dev's) |
| Status | Live since 9 October 2026 | Prepared, nothing deployed yet |

Each folder has `releases/<version>_<timestamp>/`, a `current` symlink to the live release, `shared/` (`.env`, `ecosystem.config.cjs`, `logs/`) and `incoming/` (uploads from GitHub).

## GitHub settings (done)

- **Secrets:** `VPS_HOST` (`169.58.25.57`), `VPS_USER` (`zigex`), `VPS_PORT` (`22`), `VPS_SSH_KEY` (private half of `~/.ssh/github_deploy` on the server), `VPS_KNOWN_HOSTS` (`ssh-keyscan 169.58.25.57`).
- **Repository variables:** `BACKEND_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID` (`mbdfxoux`), `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_ADMIN_APP_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. The two EmailJS variables are still empty.
- **Environment `development`:** `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` = `https://dev.zigexconnect.com`, `APP_PORT` = `3002`.
- **Environment `production`:** `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` = `https://zigexconnect.com`.

The other environments listed in GitHub ("Preview – zigex…", "Production – zigex-hywn") come from Vercel. Leave them.

## Still to do

- [ ] **`JWT_SECRET`** in both `shared/.env` files: the admin app's value, from the server admin. Only attendance QR codes need it.
- [ ] **Google sign-in on dev:** add `https://dev.zigexconnect.com` to *Authorized JavaScript origins* of the OAuth client `731983944466-…` in Google Cloud Console.
- [ ] **Restart after reboot:** the admin runs once, as root: `env PATH=$PATH:/home/zigex/.nvm/versions/node/v22.23.3/bin pm2 startup systemd -u zigex --hp /home/zigex`, then on the server as `zigex`: `pm2 save`.
- [ ] **EmailJS variables** in GitHub if the Zila waitlist form is used.
- [ ] **Production switch** (below).

## Releasing 1.1.0 and switching production

`zigexconnect.com` still serves the old frontend. The first release of this app to production is **1.1.0** (`v1.0.0` was tagged on 7 October but never deployed). The switch takes three steps, and the old app keeps running so going back is one Nginx change.

1. **Release.** On `zigex`, when dev is tested: in `CHANGELOG.md` replace "not released yet" with today's date, commit, then

   ```bash
   git tag v1.1.0 && git push origin zigex v1.1.0
   ```

   `package.json` is already `1.1.0`, so don't run `npm version` this time. The tag deploys to `/home/zigex/apps/zigex` on port 3200. The run's last step ("Check the live site") **fails this first time**, because the domain still points to the old app. That's expected. On the server, `curl -s http://127.0.0.1:3200/api/health` should show `"version":"1.1.0"`.
2. **Switch.** Ask the server admin to point `zigexconnect.com` and `www.zigexconnect.com` to `http://127.0.0.1:3200` (same settings as the dev site: `client_max_body_size 15m`, `large_client_header_buffers 8 32k`, the `X-Forwarded-*` headers, no `X-Robots-Tag`), and **not** to stop the old app yet. Template: `deploy/nginx/zigex.conf`.
3. **Check, then confirm.** Open `https://zigexconnect.com/api/health` (version 1.1.0), sign in on a phone, open Explore and My workspace. Re-run the deploy for `v1.1.0` from Actions so every step is green. After a few quiet days, the admin can stop the old app.

**Going back:** the admin points `zigexconnect.com` at the old app's port again. Nothing else changes.

## Everyday commands (as `zigex` on the server)

```bash
source ~/.nvm/nvm.sh                       # if node/pm2 aren't found
pm2 ls                                     # zigex-dev (and later zigex) online
pm2 logs zigex-dev --lines 100             # recent logs
curl -s http://127.0.0.1:3002/api/health   # dev version
pm2 restart zigex-dev                      # after editing shared/.env
APP_DIR=~/apps/zigex-dev APP_NAME=zigex-dev APP_PORT=3002 ~/apps/zigex-dev/current/deploy/rollback.sh   # previous dev release
```
