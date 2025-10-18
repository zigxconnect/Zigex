# LiveReports integration (Liveblocks + Supabase)

This document describes the data model, Supabase schema, Liveblocks integration patterns, and dev instructions for the collaborative Daily Reports feature.

## Goals
- Allow students to submit one daily report per day (real-time collaborative editing supported via Liveblocks).
- Mentor (only `fonyuyjudegita@gmail.com`) can add feedback and signed comments.
- After program completion, students can download a packaged report containing the reports + mentor feedback + signatures.
- Use Supabase for persistent storage and Liveblocks for ephemeral, real-time collaboration (presence, comments, notifications).

## Data Contract (TypeScript)

```ts
type MentorFeedback = {
  id: string;
  mentorEmail: string;
  content: string;
  pointsEffect: number;
  created_at: string;
};

type DailyReport = {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  content: string;
  skills: string[];
  submitted: boolean;
  points: number;
  feedback: MentorFeedback[];
};
```

## Supabase Schema (SQL)

Run this in your Supabase SQL editor to create the `daily_reports` table.

```sql
create table if not exists daily_reports (
  id uuid primary key,
  program_id uuid not null,
  student_id uuid not null,
  report_date date not null,
  content text,
  skills text[],
  submitted boolean default false,
  points int default 0,
  feedback jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists daily_reports_student_date_idx on daily_reports (student_id, report_date);
```

Notes:
- `feedback` stores an array of feedback objects (mentor email, content, pointsEffect, created_at)

## Liveblocks design
- Use one Liveblocks Room per program-student pair: `program-<programId>-student-<studentId>`
- Use `storage` to keep a LiveList of in-progress reports; this mirrors persistent DB but is ephemeral.
- Use `presence` to show who is viewing/editing and to attach roles (student vs mentor).
- Use broadcast events to notify of final submission and to trigger server save.
- Permissions: only authenticated mentor email `fonyuyjudegita@gmail.com` allowed to post mentor feedback—enforce on server side when persisting feedback.

Key APIs:
- @liveblocks/react: RoomProvider, usePresence, useStorage, LiveList, useBroadcastEvent

## Environment variables
- NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY — Liveblocks public API key (client)
- LIVEBLOCKS_SECRET_KEY — Liveblocks secret key (server) if you need server-side REST calls (optional)
- NEXT_PUBLIC_SUPABASE_URL — required (existing)
- NEXT_PUBLIC_SUPABASE_ANON_KEY — required (existing)
- SUPABASE_SERVICE_ROLE_KEY — for server-side work (existing)

## Server-side rules / endpoints
- POST `/api/reports` — saves a report to `daily_reports`. Use `supabaseAdmin` (service role) to insert.
- POST `/api/reports/:id/feedback` — mentor-only: append feedback and optionally sign (server-side signature generation or image).
- GET `/api/reports/:studentId?programId=` — returns all reports and feedback for a student in a program (for download/packaging).

## AI (Gemini) integration notes
- Use server-side calls to Gemini models for tasks like:
  - Summarize a week of reports into a single paragraph
  - Suggest mentor feedback based on report content
  - Moderate comments (flag toxic content)
- Always call Gemini from a server endpoint (do not place API keys in the client).

## How to test locally
1. Add env vars to `.env.local`:

```env
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_test_your_key
LIVEBLOCKS_SECRET_KEY=sk_test_your_key
```

2. Run dev server:

```bash
npm run dev
```

3. Open a student's `track-progress` page and the LiveReports pane. Use two browser windows to test real-time collaboration.

## Next steps
- Implement mentor signature generation (PDF or image) and download packaging.
- Add Liveblocks presence avatars (use user profile pictures).
- Wire feedback permission checks on server endpoints (check mentor email).

---

If you'd like, I can now integrate the `LiveReports` component into the existing `track-progress` page and add the feedback POST endpoint and a fetch-based download generator. Tell me to proceed and I'll implement those next.
