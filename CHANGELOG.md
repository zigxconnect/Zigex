# Changelog

What changed for students in each release. Newest first. Versions follow [semantic versioning](https://semver.org): patch for fixes, minor for new features, major for breaking changes.

When releasing, rename **Unreleased** to the new version and date, then run `npm version <patch|minor|major>` (see [docs/setup/deploy.md](./docs/setup/deploy.md)).

## Unreleased

- Release pipeline: CI on every pull request; a development site (`dev.zigexconnect.com`) updated on every push to `zigex`; production deployed from version tags; automatic rollback and a `/api/health` check.
- The development site is hidden from search engines.
- **Sharing:** links to opportunities now show their own title, company, deadline, place and flyer in WhatsApp and other apps, instead of the home page's.
- **Search:** internships can appear in Google's job search; events and programs carry their dates; a sitemap lists every open opportunity.
- **App:** new icons that fit Android and iPhone home screens, a navy splash screen, shortcuts (Explore, My applications, Programs, Notifications), screenshots in the install dialog, an "Install the app" option in Settings, and a new offline page.
- **Fixes:** the privacy page and the offline page no longer require signing in; pinch-zoom works again; the landing photo and logo are served from Zigex itself (faster, and they work offline).
- Production only deploys a commit that already passed CI and ran on the development site, and every deploy opens the main pages after switching (rolling back if they're broken).

## 1.0.0 (2026-10-07)

First stable release of the redesigned student app, fully on the new Zigex backend.

- **Explore and opportunities:** new opportunity cards with real images, filters that work on phones, a clear opportunity page, and a one-screen apply flow with saved drafts, an optional CV for internships, and plain-language errors.
- **Your profile:** simple Edit profile with autosave, photo cropping, cover image, a strength meter, and a proof-first public profile.
- **Applications and programs:** My applications with status and withdraw, redesigned Programs and Announcements.
- **Notifications:** a calm notifications page and bell that open the right page, and phone notifications you can turn on in Settings.
- **Account:** sign in and sign up with Google, Settings with password change and account deletion.
- **Reliability:** friendly screens when the network is slow or offline, page-shaped loading skeletons, faster pages and lighter images.
