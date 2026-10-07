# Bug report: uploaded photos get an unusable address (`pub-REPLACE.r2.dev`)

**Reported:** 7 October 2026, by the Zigex frontend team
**Endpoints:** `POST /api/v1/uploads/avatar`, and likely every public upload (e.g. `POST /api/v1/uploads/cover-image`)
**Severity:** high. No student can set a profile photo.

---

## What happens

The upload succeeds and the file is stored in Cloudflare R2, but the URL in the response is on a placeholder host:

```json
200 OK
{
  "success": true,
  "data": {
    "key": "students/avatars/c2ecc73a-4118-495f-82ab-7c8f052a7126/avatar.png",
    "url": "https://pub-REPLACE.r2.dev/students/avatars/c2ecc73a-4118-495f-82ab-7c8f052a7126/avatar.png"
  }
}
```

`pub-REPLACE.r2.dev` doesn't exist, so the image can't load in any browser. The frontend saves this URL as the student's `avatar_url`, and the photo then shows as broken everywhere.

## How to reproduce

```bash
# Any small PNG, base64-encoded
curl -X POST https://api.zigexconnect.com/api/v1/uploads/avatar \
  -H "Authorization: Bearer <student token>" \
  -H "Content-Type: application/json" \
  -d '{"base64":"<base64 of a PNG>","mimetype":"image/png"}'
```

The response `url` starts with `https://pub-REPLACE.r2.dev/`. We tested a 157-byte PNG and a 2 MB JPEG; both upload fine and both get the placeholder host.

## Likely cause

The R2 public bucket URL setting (environment variable, e.g. `R2_PUBLIC_URL`) still has its template value `https://pub-REPLACE.r2.dev`.

## What we need

1. **Set the real public URL** of the R2 bucket in the backend config, either the bucket's `https://pub-<id>.r2.dev` address or a custom domain such as `https://files.zigexconnect.com`. Make sure public access is enabled on the bucket.
2. **Repair URLs already saved.** Some students already have `avatar_url` (and possibly `cover_image_url`) values starting with `https://pub-REPLACE.r2.dev/`. Please rewrite them to the real host (the object key after the host is correct), or set them to `null`. For example:

   ```sql
   UPDATE student_profiles
   SET avatar_url = REPLACE(avatar_url, 'https://pub-REPLACE.r2.dev', '<real public URL>')
   WHERE avatar_url LIKE 'https://pub-REPLACE.r2.dev/%';
   ```

   Do the same for `cover_image_url` and any other column that stores upload URLs (company logos and covers, program and event pictures uploaded through these endpoints).
3. **Optional, recommended:** have upload endpoints fail with a clear error if the public URL isn't configured, rather than returning an address that can't load.

## Update (7 October 2026, later the same day)

Saved URLs now use `https://files.zigexconnect.com/...` (thank you), but that domain has **no DNS record yet**, so the images still don't load:

```text
$ getent hosts files.zigexconnect.com
(no result)
```

Please connect `files.zigexconnect.com` to the R2 bucket. In Cloudflare: R2, then the bucket, then Settings, then Custom Domains, then add `files.zigexconnect.com`. Cloudflare creates the DNS record when the domain's zone is on Cloudflare. Then check that the URL from an upload opens in a browser.

## How to check it's fixed

- The `url` from `POST /uploads/avatar` opens the image when pasted into a browser.
- `GET /students/me` for the student above returns an `avatar_url` that loads.

## Related

- `GET /uploads/signed-url?key=...` refuses avatar keys ("Signed URLs are only available for private file keys"), so the frontend has no other way to show these photos. That's fine once the public URL works.

## What the frontend does meanwhile

- URLs on `pub-REPLACE.r2.dev` are treated as "no photo": students see their initials instead of a broken image.
- New uploads that come back with the placeholder host aren't saved; the student sees: *"Profile photos can't be saved right now because of a problem on Zigex's side. We're fixing it; your initials show meanwhile."*
- Nothing needs to change on the frontend once this is fixed. Photos will appear as soon as the URLs are correct.

**Please reply** when the fix is deployed so we can retest.
