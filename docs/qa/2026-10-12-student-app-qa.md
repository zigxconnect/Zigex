# Zigex student app: QA test plan (version 1.1.0)

**For testers.** Work through each section on a phone and on a computer, tick each test, and report anything that doesn't match "Expected". This plan covers the student side only (zigexconnect.com). The company portal has its own plan.

Prepared 12 October 2026, for the 1.1.0 release.

---

## Before you start

### Where to test

| Site | Address | Use it for |
| --- | --- | --- |
| **Development** | https://dev.zigexconnect.com | All testing in this plan |
| Production | https://zigexconnect.com | Don't test here until we say so (it still shows the old app) |

**Check you're on the right version.** Open https://dev.zigexconnect.com/api/health. You should see `"status":"ok"` and a version starting with `1.1.0-dev.`. Write that version in your report.

> **Actions on the development site are real.** It uses the real Zigex server: an application you send reaches the company, and companies see your profile. Use the test accounts below and apply only to postings whose title starts with **"TEST"**. Never apply to a real company's posting.

### Accounts

| Account | What for |
| --- | --- |
| Your own **new** student account | Sign-up tests (section 1). Use an email you can open; you'll receive codes |
| The shared test student (details from the team lead) | Everything after sign-up |
| A company test account (team lead) | Only the team lead uses it, to publish TEST postings and accept you (sections 5–8) |

### Devices and browsers

Test every section on **at least one phone and one computer**. Spread these across the team:

| Device | Browser |
| --- | --- |
| Android phone (any, ideally a low-end one) | Chrome |
| iPhone | Safari |
| Computer (Windows or Mac) | Chrome |
| Computer | Firefox or Edge |

Also try once: a slow connection (Chrome DevTools → Network → "Slow 3G", or a weak mobile signal), and going offline in the middle of an action.

### How to report a bug

One bug per report, with:

1. **Test ID** (e.g. `APPLY-07`) and the **version** from `/api/health`
2. **Device and browser** (e.g. "Tecno Spark 10, Chrome 129")
3. **Steps** you took, numbered
4. **Expected** (copy it from this plan) and **what happened**
5. **Screenshot or screen recording**, and the page address
6. **Severity:**

| Severity | Means | Example |
| --- | --- | --- |
| **Blocker** | A student can't complete a main task | Can't sign up, can't apply, check-in always fails |
| **Major** | A feature is wrong or broken, but there's a way around it | Filter shows wrong results; a button does nothing |
| **Minor** | Works, but looks or reads wrong | Text overflows on small phones; a typo |
| **Suggestion** | Not a bug: an idea to make it better | "This label is confusing" |

### Result column

In each table, mark **Result**: ✅ pass, ❌ fail (report it), ⚠️ partly (report it), ⏭️ skipped (say why).

---

## 1. Sign-up and email verification

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| SIGNUP-01 | Page loads | Open `/sign-up` | Title "Create your student account". Buttons "Sign up with Google" and "Create account". Fields First name, Last name, Email, Password | |
| SIGNUP-02 | Empty fields | Click into each field, then out, leaving it empty | "Enter your first name (2 letters or more).", "Enter your last name (2 letters or more).", "Enter a valid email address, like you@example.com.", "Use at least 8 characters." | |
| SIGNUP-03 | Email typo helper | Type `you@gmial.com`, leave the field | "Did you mean you@gmail.com?" One tap fixes it | |
| SIGNUP-04 | Weak password | Type `abcdefgh` | Meter shows "Weak" and the error "Too weak. Mix in numbers or capital letters." | |
| SIGNUP-05 | Password strength | Type `Abcdefgh12`, then `Abcdefgh12!xyz` | Meter rises to "Strong", then "Stronger"; tips change as you type | |
| SIGNUP-06 | Show password | Tap the eye icon | Password becomes visible ("Hide password"), and hides again | |
| SIGNUP-07 | Caps Lock (computer) | Turn on Caps Lock in the password field | "Caps Lock is on." | |
| SIGNUP-08 | Legal line | Read below the button | "By creating an account you confirm you're 18 or over and agree to our Terms of Use and Privacy Policy." Both links open | |
| SIGNUP-09 | Create an account | Fill in valid details with a **new** email, click "Create account" | Button shows "Creating account…", then you land on "Check your email" with your address | |
| SIGNUP-10 | Email already used | Sign up again with the same email | "There's already an account for … Sign in or reset your password." Both are links | |
| SIGNUP-11 | Code arrives | Check the inbox (and spam) | An email with a 6-digit code within ~2 minutes | |
| SIGNUP-12 | Wrong code | Enter `000000` | "That code is wrong or has expired. Check the latest email, or send a new code." | |
| SIGNUP-13 | Resend code | Click "Send a new code" | Disabled with a countdown "Send a new one in …s" (30 s). After it: "We sent a new code to …". Only the newest code works | |
| SIGNUP-14 | Right code | Enter the code from the newest email | It submits by itself once 6 digits are in, and you're signed in on Opportunities (`/feed`) | |
| SIGNUP-15 | Sign up from an opportunity | Signed out, open a TEST posting, tap "Create an account to apply", sign up | Title "Create an account to apply". After verifying, you're **back on that posting** | |
| SIGNUP-16 | Google | Click "Sign up with Google" | **Known:** may show "Google sign-in isn't switched on yet…" or a Google error on the development site (not set up for dev yet). Note what you see | |

---

## 2. Sign-in, password and sign-out

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| SIGNIN-01 | Page loads | Open `/sign-in` | "Sign in to Zigex", "Continue with Google", Email, Password, "Forgot password?", "Sign in" | |
| SIGNIN-02 | Wrong password | Correct email, wrong password | "The email or password is incorrect." | |
| SIGNIN-03 | Too many tries | Sign in wrongly ~10 times quickly | "Too many sign-in attempts. Wait a minute, then try again." The button counts down "Try again in …s" | |
| SIGNIN-04 | Sign in | Correct details | "Signing in…", then Opportunities with "Welcome back, <first name>" | |
| SIGNIN-05 | Return to a page | Signed out, open `/dashboard/applied-internships` | Sent to sign-in; after signing in you land on **My applications** | |
| SIGNIN-06 | Already signed in | Signed in, open `/sign-in` | Sent straight to Opportunities | |
| SIGNIN-07 | Company account | Sign in with the company test account | "That account belongs to a company. Companies sign in on the Zigex company portal." | |
| SIGNIN-08 | Unverified account | Sign up, don't verify, then sign in | A new code is sent and you're taken to "Check your email" | |
| PASS-01 | Forgot password | "Forgot password?" → your email → "Send reset code" | "Set a new password" page; "If … has a Zigex account, a 6-digit code is on its way." The email arrives | |
| PASS-02 | Unknown email | Ask for a reset with an email that has no account | Same message as PASS-01 (doesn't reveal whether the account exists) | |
| PASS-03 | Wrong reset code | Enter a wrong code and a new password | "That code is wrong or has expired…" | |
| PASS-04 | Reset the password | Right code + new password → "Save new password" | You're signed in. The old password no longer works; the new one does | |
| PASS-05 | Change password in Settings | Settings → Password: current, new, confirm → "Change password" | "Password changed. Use the new one next time you sign in." | |
| PASS-06 | Settings: mistakes | Wrong current password / passwords don't match / same as current | "Your current password isn't right…" / "The two new passwords don't match." / "The new password is the same as the current one." | |
| OUT-01 | Sign out | Avatar menu → "Sign out" | Back on the home page, signed out. The browser's Back button doesn't show your pages | |
| OUT-02 | Session expired | Ask the team lead how to expire a session, or wait for it to expire | Opening a page sends you to sign-in, then back to that page | |

---

## 3. Home page and public pages (signed out)

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| HOME-01 | Home page | Open `/` signed out | "Get real work experience before you graduate.", "Create your free account", "Browse opportunities", a real opportunity card | |
| HOME-02 | Latest opportunities | Scroll | "Latest opportunities" with cards and "See all opportunities" | |
| HOME-03 | Sections | Scroll the page | How it works (3 steps), For companies, Why Zigex exists, FAQ, final call to action | |
| HOME-04 | Company links | "Post an opportunity" and "Company sign in" | Open the company portal | |
| HOME-05 | Footer | Check every footer link | Opportunities/Internships/Programs/Events filter the list; Terms and Privacy open. **Known:** social icons (LinkedIn, X, Facebook, GitHub) go nowhere ("#"); report as Minor only if still the case | |
| HOME-06 | Signed in | Open `/` while signed in | Sent to Opportunities | |
| HOME-07 | Phone menu | On a phone, tap ☰ | Menu opens with all header links | |
| PUB-01 | Opportunities, signed out | Open `/feed` | "Opportunities" list; right side: "Create an account to apply" | |
| PUB-02 | Opportunity, signed out | Open any opportunity | Details, "Create an account to apply" and "I have an account" | |
| PUB-03 | Company page | Tap a company name | Company page with "Verified by Zigex", facts and its opportunities. Contact email shows "Sign in to see" when signed out | |
| PUB-04 | Unknown company/opportunity | Open `/company/abc` and `/feed/abc` | "Company not found" / "This page doesn't exist" with a way back | |
| PUB-05 | Terms and Privacy | Open `/terms`, `/privacy` | Readable on a phone; section links jump to the right place | |
| PUB-06 | Share preview | Paste an opportunity link into WhatsApp | The preview shows its title, company and image | |

---

## 4. Opportunities (signed in)

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| FEED-01 | Page loads | Sign in | "Welcome back, <name>", a status line, the list of open opportunities | |
| FEED-02 | Search | Type a word from a title, company, skill or town | List filters as you type; "N open opportunities for "…""; "Clear search" empties it. On a computer the search is in the top bar | |
| FEED-03 | Type tabs | "All", "Internships", "Programs", "Events" | Only that type shows. Counts show on wide screens | |
| FEED-04 | Sort | "Newest first" / "Closing soon" | Order changes accordingly | |
| FEED-05 | Free only | Turn on "Free only" | Only free opportunities ("Free") | |
| FEED-06 | Filters in the address | Set filters, copy the address, open it in a new tab | Same filters applied | |
| FEED-07 | No results | Search `zzzzzz` | "No opportunities match these filters." with "Clear filters" | |
| FEED-08 | More | If there are more than 12 | "Show N more" loads the next ones | |
| FEED-09 | Recently closed | Open "Recently closed (N)" | Closed ones listed with "Closed on …" | |
| FEED-10 | Card details | Look at cards | Company (and verified badge), dates, place, price ("Free", "N XAF" or "Fee applies"), deadline ("Apply by …", "Last day", "Open now") | |
| FEED-11 | Right side | On a computer | Your application counts, "Profile strength" with steps, "Your workspaces" (if accepted somewhere) | |
| FEED-12 | Opportunity page | Open one | Image, type, title, company, Apply panel (status, deadline, dates, place, work mode, cost), "About this…", map, "More from <company>" | |
| FEED-13 | Programs page | Menu → Programs | "Your programs" (if any), "Open for registration", "Past programs" | |
| FEED-14 | Phone navigation | On a phone | Bottom bar: Explore, Applications, Programs (or Workspace once accepted), Community. ☰ opens the full menu | |

---

## 5. Applying

Use **TEST** postings only. The team lead publishes a TEST internship, a TEST program (with a fee) and a TEST event.

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| APPLY-01 | Open the form | TEST internship → "Apply now" | A panel opens (full screen on phones): "Applying as <you>", "Edit profile" link | |
| APPLY-02 | Profile gaps | With an empty profile | "Your profile has no school, skills or short intro yet… You can still apply now." | |
| APPLY-03 | Required answer | Send with "Why are you a good fit?" empty, then with 10 characters | "Tell the company why you're a good fit." / "Write a little more (n/30 characters)." The counter shows "N more characters needed", then "Good length" | |
| APPLY-04 | Optional chips | Choose area, length, experience | Chips select and unselect | |
| APPLY-05 | CV: PDF | Attach a PDF under 5 MB | Accepted. After sending: "CV attached" | |
| APPLY-06 | CV: wrong type / too big | Attach a `.docx`, a `.jpg`, and a PDF over 5 MB | "Use a PDF (or a .doc file)." / "That file is over 5 MB. Export a smaller PDF." (**.docx is rejected by design**: note if confusing) | |
| APPLY-07 | Draft is kept | Type an answer, close the panel, reopen | Your answer is still there ("Draft saved on this device") | |
| APPLY-08 | Send | Fill in and "Send application" | "Sending…", then "Application sent": "<Company> will review it and let you know. You'll get an email and a notification on Zigex." | |
| APPLY-09 | Email | Check your inbox | Confirmation email received | |
| APPLY-10 | Apply twice | Open the same posting again | The panel says your application is in review; no second application possible ("You've already applied" if you try) | |
| APPLY-11 | Program with a fee | TEST program → "Register" | "Your level in this subject" (required), "What do you hope to get from it?" (20+ chars), and the fee checkbox: "… I understand the company will explain how to pay if I'm accepted." Required: "Confirm you've read about the fee." | |
| APPLY-12 | Event | TEST event → "Reserve my spot" | One tap: "Spot requested" / "…will confirm your place." | |
| APPLY-13 | Add a note | "Add a note for the company" | A "Note (optional)" field appears and is sent | |
| APPLY-14 | Offline | Turn off data, then "Send application" | "You seem to be offline… Your answers are saved." with "Try again"; works after reconnecting | |
| APPLY-15 | Closed posting | Open a closed opportunity | "You can't apply any more…" with "Browse open opportunities"; no Apply button | |
| APPLY-16 | Keyboard (computer) | Press Ctrl + Enter in the form | Sends the application | |

---

## 6. My applications

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| APPS-01 | Page | Menu → My applications | "My applications"; each row "<Type> at <Company>", title, "Applied <date>", status, "Details" | |
| APPS-02 | Empty | New account with no applications | "You haven't applied to anything yet." with "Browse opportunities" | |
| APPS-03 | Status filters | Use the chips | "All", "In review", "Accepted", "Not selected", "Withdrawn"; a chip appears only when it has applications | |
| APPS-04 | Details | Open "Details" | Your answers and attached files | |
| APPS-05 | Statuses | Team lead shortlists, accepts, declines your TEST applications | Badges "Reviewed", "Accepted", "Not selected" with matching notes. Accepted shows "Open workspace" (internship) or "Program updates" (program) | |
| APPS-06 | Withdraw | On an "In review" application → "Withdraw application" → "Withdraw" | Confirmation "Withdraw this application?…", then status "Withdrawn" | |
| APPS-07 | Withdraw after a decision | Try to withdraw an accepted application | Not offered (or "It can't be withdrawn anymore: the company has already made a decision.") | |
| APPS-08 | Re-apply after withdrawing | Open the posting you withdrew from | **Check:** the Apply button shows again; try applying. Report what happens | |

---

## 7. Workspace (after being accepted for an internship)

The team lead accepts you for the TEST internship. Ask them for a **TEST attendance QR code**.

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| WORK-01 | Not accepted yet | Before acceptance, open Workspace | "Your workspace opens when you're accepted" with "See my applications" and "Find opportunities" | |
| WORK-02 | Opens | After acceptance, open Workspace | Your placement: type, title, company, place, dates, "Logbook" | |
| WORK-03 | Before the first day | If the internship starts later | "Starts <date>", "Test your camera" button, no report button | |
| WORK-04 | Camera test | "Test your camera", scan any QR code (a product, a poster) | "Your camera is ready… Nothing was recorded." | |
| WORK-05 | Camera blocked | Deny the camera permission, try again | "Camera access is off" with steps to allow it and "Try again" | |
| WORK-06 | Today panel | On a work day | "Today, <date>", "N of 3 done": Check in, Tasks, Daily report | |
| WORK-07 | Weekend | On Saturday or Sunday | "No work day today. Enjoy the weekend." | |
| WORK-08 | Check in by QR | "Scan QR code", scan the TEST code | "Confirming you're at work…", then "Checked in at HH:MM". The panel shows "Checked in at HH:MM". **Known:** check-in may fail with a server error until the backend fix lands; report what you see | |
| WORK-09 | Scan twice | Scan again the same day | "You're already checked in today" | |
| WORK-10 | Wrong code | Scan a QR code from another placement or a random code | "This code is for another placement" or "This is not an attendance QR code." | |
| WORK-11 | Phone camera app | Scan the QR poster with the phone's own camera (not inside Zigex) | Opens Zigex and checks you in, then "Open my workspace". **Check also signed out:** after signing in, are you checked in? (Suspected bug: the code is lost.) | |
| WORK-12 | Daily report | "Write report" | "Today's report"; "What did you do and learn today?" needs 8+ words ("Write a little more: at least 8 words."); optional tasks and a 1–5 rating | |
| WORK-13 | Send report | Send a report | "Sent. Your supervisor will review it." in the panel. **Check:** does a message "Report sent. Your supervisor has been told." appear? (Suspected bug: it doesn't) | |
| WORK-14 | Report without check-in | On a new day, send a report without scanning | It checks you in and out with the report | |
| WORK-15 | Report twice | Try a second report the same day | "You have already submitted a log for today." / no "Write today's report" button | |
| WORK-16 | Supervisor feedback | Team lead answers your report | Reports tab: status "Approved" or "Needs changes", "Supervisor: <comment>" | |
| WORK-17 | Tabs | Overview, Tasks, Reports, Updates, Learning (and Payments if a fee) | Each opens; the tab stays in the address (e.g. `#tasks`); on phones all tabs are visible as icons | |
| WORK-18 | Tasks | Team lead adds a task | "N new tasks from your supervisor"; opening it marks it read; links and files open | |
| WORK-19 | Updates | Team lead posts an announcement | It appears under Updates; unread count clears after opening | |
| WORK-20 | Attendance | Overview → Attendance | Week N of M, "Present X of Y work days", Mon–Fri grid | |
| WORK-21 | People | Overview → People | Your supervisor with Email/WhatsApp, or "Not assigned yet…"; other interns | |
| WORK-22 | Logbook | "Logbook" | "Ready to print and sign"; "Print" makes a clean A4 page; "Save as PDF" works | |
| WORK-23 | Several placements | Accepted on two TEST internships | Workspace shows a list ("Current", "Starting soon", "Finished"); "Switch placement" appears | |
| WORK-24 | Fee to accept | Accepted on a placement with a monthly fee | "Accept the program fee to start"; Scan and Report disabled until "Accept and start" | |
| WORK-25 | Ended | A finished placement | "This internship has ended" with days present, reports sent, "Open logbook". **Known:** says "internship" even for programs | |

---

## 8. Programs after acceptance

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| PROG-01 | Updates page | Accepted on the TEST program → "Program updates" | "Program Updates", weekly updates and resources | |
| PROG-02 | Not accepted | Open `/programs/<id>/updates` for a program you're not in | "Access Restricted" | |
| PROG-03 | Payment view | Program with a fee, not yet paid | Payment guide (MTN / Orange Money) and "I've Made The Transfer" (opens WhatsApp). **Known:** price is fixed at 10,000 FCFA and some locked text is placeholder; report if shown to students | |
| PROG-04 | Back link | "Back to Program Details" | **Check:** does it open the program, or "page not found"? (Suspected bug) | |
| PROG-05 | Progress | Tick a module | Progress % updates. **Check:** does "Progress updated!" appear? | |

---

## 9. Notifications

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| NOTIF-01 | Bell | After a status change on your TEST application | Bell shows a number; the dropdown lists it; "Mark all read" clears it | |
| NOTIF-02 | Page | "See all notifications" | "Notifications", tabs "All" / "Unread", grouped by day | |
| NOTIF-03 | Open one | Click a notification | Opens the right page (opportunity, application, update); it's marked read | |
| NOTIF-04 | New account | A brand-new account | Doesn't receive every old notification (fixed in 1.1.0) | |
| NOTIF-05 | Push (phone) | Settings → "Notifications on this device" → on | Permission prompt, then "On…". **Known:** may say "coming soon" if not configured | |

---

## 10. Profile

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| PROF-01 | Edit profile | Avatar → View profile → Edit profile | Form with "Saves automatically" | |
| PROF-02 | Autosave | Change your school; wait 2 s | "Saving…", then "All changes saved"; reload: still there | |
| PROF-03 | Photo | "Add a profile photo", choose a JPG | "Position your photo" crop; "Save photo"; photo shows everywhere | |
| PROF-04 | Wrong photo | Choose a PDF, and a photo over 5 MB | "Use a JPG, PNG or WebP photo." / "Profile picture must be 5 MB or smaller." | |
| PROF-05 | Cover | "Add cover", then "Remove" | Cover appears, then is removed | |
| PROF-06 | Short intro | Type more than 600 characters | Counter stops at 600 | |
| PROF-07 | Skills | Add skills with Enter and comma; Backspace removes | Tags added/removed; max 15 | |
| PROF-08 | Links | Type `linkedin.com/in/test` | `https://` is added. Bad text: "That doesn't look like a web link…" | |
| PROF-09 | Username | More details → Username: try spaces, 2 letters, a taken one | "Use 3–30 letters, numbers, dots, dashes or underscores. No spaces." / "That username is taken. Try another one." | |
| PROF-10 | Phone | Type `677123456` | Becomes `+237 6XX XX XX XX` format | |
| PROF-11 | Leave unsaved | Type, then close the tab quickly | The browser asks before leaving | |
| PROF-12 | Profile strength | Fill the steps | % rises to "Your profile is complete" | |
| PROF-13 | Public profile | "View public profile" | "This is your public profile…", "Share profile" (phone: share sheet; computer: "Link copied"), sections | |
| PROF-14 | Public profile signed out | Open your profile link signed out | **Known:** asks to sign in first; note if that's a problem | |
| PROF-15 | Students | Menu → Students | List, "Search by name", "Show more students" | |

---

## 11. Settings and account

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| SET-01 | Page | Avatar → Settings | "Settings": Account, Password, Notifications, App on your phone, Privacy, Sign out and account | |
| SET-02 | Install (Android Chrome) | "Install the app" | Installs; opens from the home screen without the browser bar; then "Zigex is installed on this device." | |
| SET-03 | Install (iPhone) | Open Settings in Safari | Steps "Tap Share…", "Choose Add to Home Screen." | |
| SET-04 | Delete account: cancel | "Delete account" → "Keep my account" | Nothing deleted | |
| SET-05 | Delete account | **Your own test account only:** password + type `DELETE` → "Delete my account" | Signed out; home page shows "Your account has been deleted". Signing in again fails | |

---

## 12. Other pages

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| OTHER-01 | Announcements | Menu → Announcements | "News from companies and the Zigex team." and blog articles | |
| OTHER-02 | Communities | Menu → Communities | Discord card ("Open the chat"), your program WhatsApp groups, upcoming events | |
| OTHER-03 | Zila AI | Menu → Zila AI | "In development", "Notify me when it's ready". **Known:** may fail ("That didn't go through…") until configured | |
| OTHER-04 | Wrong address | Open `/this-does-not-exist` | "This page doesn't exist" with a way back | |

---

## 13. Across the whole app

| ID | Test | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| ALL-01 | Small phone | Use a 320–360 px wide phone (or DevTools) on every page | No sideways scrolling, nothing cut off, buttons reachable | |
| ALL-02 | Zoom | Pinch to zoom on a phone | Zoom works (fixed in 1.1.0) | |
| ALL-03 | Slow connection | "Slow 3G" on Opportunities, an opportunity, Workspace | Loading placeholders show; pages finish loading; no blank screens | |
| ALL-04 | Offline | Turn off data, open a new page | "You're offline… the page reloads by itself when you're back online." | |
| ALL-05 | Back button | Use the browser/phone Back button through a flow | Returns to the previous screen sensibly; no loops | |
| ALL-06 | Keyboard (computer) | Use Tab and Enter only to sign in and apply | Every control reachable; a visible focus outline | |
| ALL-07 | Messages | Watch for pop-up messages after actions (report sent, link copied…) | **Check:** they appear. (Suspected: some never show; list which) | |
| ALL-08 | Text | Read every screen | Clear English, no typos, nothing in all caps, no placeholder text like "Lorem" | |
| ALL-09 | Dark mode | Phone set to dark mode | The app stays readable | |

---

## Known issues: no need to report again

These are already known. Test them only where a test above asks you to **check**.

| # | Issue |
| --- | --- |
| 1 | Google sign-in may not work on the development site (not set up for dev yet). |
| 2 | QR check-in may fail with a server error until the backend fix lands. |
| 3 | The program payment page shows a fixed price (10,000 FCFA) and some placeholder text. |
| 4 | Footer social icons go nowhere. |
| 5 | Public profiles need sign-in to view. |
| 6 | CVs: only PDF and .doc are accepted (not .docx). |
| 7 | No "save opportunity" or share button yet (share by copying the address). |
| 8 | Zila AI and push notifications may show "coming soon" or fail until configured. |
| 9 | A finished program's workspace says "This internship has ended". |

## Suspected bugs to confirm

Tell us what you see for each (tests above):

| # | What to check | Test |
| --- | --- | --- |
| A | Some pop-up messages never appear ("Report sent…", fee accepted, "Progress updated!") | WORK-13, PROG-05, ALL-07 |
| B | Scanning the QR poster with the phone's camera **while signed out**: after signing in, the check-in is lost | WORK-11 |
| C | "Back to Program Details" leads to "page not found" | PROG-04 |
| D | After withdrawing, the Apply button comes back; does applying again work? | APPS-08 |

---

## Sign-off

| | |
| --- | --- |
| Tester name | |
| Dates tested | |
| Version (`/api/health`) | |
| Devices and browsers | |
| Tests passed / failed / skipped | |
| Blockers found | |
| Ready for release? (yes / no, why) | |
