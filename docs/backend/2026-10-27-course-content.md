# Course content: what tutors post doesn't reach students (27 October 2026)

Companies and tutors write weekly modules in the company portal (admin API `POST/PUT /companies/programs/content`). Both APIs use the same `program_content` table, and the student API serves it at `GET /api/v1/programs/{programId}/content`.

**Fixed in the student app (branch `fix/student-ux-batch1`):**

- **Workspace → Learning** now shows a **Course outline** with the company's modules (week, title, description, links) first. Zigex's general lessons follow as "Extra free lessons". Before, only the built-in lessons showed, so nothing a tutor changed ever appeared.
- **Program page** (`/programs/{id}/updates`): once the company has published modules, they *are* the course outline, and the built-in "Curriculum milestone" grid only stands in while there are none.
- Unpublished drafts are no longer shown to students (they were).

These need the student API too:

## P1. Only `accepted` can read the content

`ProgramsService.getProgramContent` refuses (403) unless the application status is exactly `accepted`. Program and event registrations are confirmed as `rsvp_confirmed`, and the app treats `accepted` and `rsvp_confirmed` as "in the program". **Request:** allow both.

## P1. Drafts and paid-only modules are sent to every student

The query returns every row of the program:

- **Drafts** (`is_published = false`): we now hide them in the app, but they still leave the server. Please filter `is_published = true` for students.
- **Paid-only modules** (`payment_required = true`) are returned in full (`assignment_details`, links) to students who haven't paid. The admin API already hides `content` when the student can't access it. Please do the same here: return the title and week, with `assignment_details`, the links and `resources` set to `null` and `locked: true`.

## P1. Internships have no course content at all

- The app calls `GET /api/v1/internships/{internshipId}/curriculum`; it isn't deployed (404). Until then interns only see Zigex's general lessons.
- The company portal has no way to write an internship's curriculum (only programs have `/companies/programs/content`).

**Request:** use the same model for internships: `program_content` rows with `internship_id` (or a twin `internship_content` table), written by the admin API at `/companies/internships/content` (same body as programs), and read by the student API at `GET /internships/{id}/curriculum` with the same rules as above (accepted interns only, published only). Same fields: `week_number, title, description, assignment_details, resources (JSON [{type,title,url}]), video_url, github_url, google_docs_url, content_url, is_published, payment_required, display_order`. Tell us when it's live and we'll add the editor to the portal.

## P2. Tell students when a module is added or changed

The admin API's `createProgramContent` calls `notifyPaidStudentsAboutContent`, which only notifies **paid** students. Updates (`updateProgramContent`) notify nobody, and the notifications don't push (see `2026-10-27-push-notifications.md`).

**Request:** when a module is **published** (created as published, or switched to published) or **changed**, notify every accepted participant who can open it: "New in {program}: Week {n}, {title}", with the link `/programs/{programId}/updates` (interns: `/student/workspace`), sent with `push: true`.

## How we'll check (on dev)

1. In `devcompany.zigexconnect.com`, add a module "Week 1: Test" to a program, published.
2. As a student accepted to that program on `dev.zigexconnect.com`: Workspace → Learning shows it under **Course outline**, and so does the program page.
3. Edit its title in the portal and reload the student page: the new title shows. Set it to draft: it disappears.
