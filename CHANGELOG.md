# Changelog

What changed for students in each release. Newest first. Versions follow [semantic versioning](https://semver.org): patch for fixes, minor for new features, major for breaking changes.

New changes go under a top section `## Unreleased`. Releasing (GitHub Actions → Release) turns it into the version and date; see [docs/setup/deploy.md](./docs/setup/deploy.md).

## Unreleased

- **Picked for you:** a second tab on Opportunities, next to **All on Zigex**. Every Monday, internships, hackathons, scholarships, jobs and events found on the web for students in your course and city, each with why it fits, its deadline or date, and a link to apply on the organiser's site. Kept apart from Zigex's own opportunities because you apply on another website and it doesn't appear in My applications. Needs `AI_SERVICE_API_KEY` on the server; without it, nothing changes.
- **Ask your handbook:** a new **Ask** tab in the intern workspace searches the documents your company shared (rules, schedules, guides) and quotes the passage with its document, page and section. Your own placement's documents only; limited to 15 searches a minute.

## 1.1.0 (2026-10-12)

The first version to reach `zigexconnect.com` (1.0.0 was tagged but never deployed). On the development site since 9 October 2026; tested with the QA plan in `docs/qa/2026-10-12-student-app-qa.md`.

- **Intern workspace, redesigned around the working day:**
  - A **Today** panel with the day's three steps, check in, tasks and daily report, each with its state ("Checked in at 08:12") and its button. Before the first day it shows the start date and a **Test your camera** button; after the last day it shows *This internship has ended* with your totals and the logbook.
  - **Attendance** as a calendar of working days ("Week 2 of 5"): report sent, checked in, missed.
  - Tasks with due dates ("Due tomorrow", "2 days late"), links and files; reports you can open to see tasks, times and your supervisor's comment; updates; a learning path; payments only when there's a fee.
  - On phones: one column ordered by daily use, tabs that all fit on screen, full-width buttons.
- **Check-in scanner:** opens the camera with a viewfinder and says exactly what happened and what to do: camera blocked or missing, confirming your location, checked in, already checked in, wrong placement, or too far from the workplace. Scanning the poster with your phone's own camera works too.
- **Daily report:** plain questions with an example, your supervisor's tasks to add with one tap, "How was today?", and a draft kept on your phone until you send it.
- **Logbook and receipts:** a clean A4 logbook with every day's report, your totals and signature lines, readable on a phone and ready to print or save as PDF; payment receipts with a stable number.
- **Several or finished placements:** "Open workspace" opens the placement you clicked; "My workspace" opens the one running now; a list (Current, Starting soon, Finished) only when several run at once; "Switch placement" in the workspace.
- **Notifications:** new accounts no longer receive every old announcement ever sent.
- **Sharing:** links to opportunities show their own title, company, deadline, place and flyer in WhatsApp and other apps, instead of the home page's.
- **Search:** internships can appear in Google's job search; events and programs carry their dates; a sitemap lists every open opportunity.
- **App:** new icons for Android and iPhone home screens, a navy splash screen, shortcuts, screenshots in the install dialog, "Install the app" in Settings, and a new offline page.
- **Privacy Policy and Terms of Use:** rewritten in plain language, with sign-up confirming you're 18+ and agree to both.
- **Landing page:** a real open opportunity on the hero photo, open listings only, 500+ students, accurate FAQ answers, footer links and the right address (Mawa, Mile 6 Nkwen, Bamenda).
- **Fixes:** the camera was blocked on the whole site, so in-app check-in could never start; the workspace showed no company, description or dates for some placements; "My workspace" was missing from the menu for some accepted interns; the "Finish setting up your profile" banner is gone; programs open their public page for visitors; pinch-zoom works again. Also: success messages such as "Report sent" now appear; scanning the QR poster with your phone's camera while signed out checks you in after you sign in; "Back to Program Details" opens the program instead of a missing page; after withdrawing, the opportunity says so and offers "Apply again".
- **Security:** text written by companies and admins is cleaned before it's shown, and the logbook and receipts can no longer be broken or abused by what's typed into a report.
- **Behind the scenes:** a development site at `dev.zigexconnect.com` updated on every push; production only deploys a version that passed CI and ran on dev; every deploy is checked page by page (including that its scripts load) and rolls back by itself if broken.

## 1.0.0 (2026-10-07)

First stable release of the redesigned student app, fully on the new Zigex backend.

- **Explore and opportunities:** new opportunity cards with real images, filters that work on phones, a clear opportunity page, and a one-screen apply flow with saved drafts, an optional CV for internships, and plain-language errors.
- **Your profile:** simple Edit profile with autosave, photo cropping, cover image, a strength meter, and a proof-first public profile.
- **Applications and programs:** My applications with status and withdraw, redesigned Programs and Announcements.
- **Notifications:** a calm notifications page and bell that open the right page, and phone notifications you can turn on in Settings.
- **Account:** sign in and sign up with Google, Settings with password change and account deletion.
- **Reliability:** friendly screens when the network is slow or offline, page-shaped loading skeletons, faster pages and lighter images.
