# 📋 Zigex Intern Workspace - Feature Backlog (Realistic & Scalable)

This document outlines 6 practical, high-value features for our core developers. These tasks focus on improving the existing workspace foundation and are designed to be completed within a standard development sprint.

---

## 📑 Developer 1: Interactive Resource Library
**Objective**: Expand the `Curriculum` tab to support downloadable study materials.
**Tasks**:
- Modify the `Curriculum` module cards to include a "Resources" section.
- Add a list of downloadable items (PDFs, Links, GitHub repos) for each module.
- Implement a "View" vs "Download" action for resources.
- **Tech**: Lucide icons for file types, basic mapping from `intern-curriculum.ts`.

## 📎 Developer 2: Multi-File Task Submissions
**Objective**: Allow interns to upload evidence of their work.
**Tasks**:
- Enhance the Task submission form to include a file upload field (Image/PDF).
- Create a simple "Submission Preview" so interns can see what they've uploaded.
- Implement a "Status" label (Pending, Reviewing, Approved) on the task cards.
- **Tech**: Supabase Storage for file hosting, UI feedback states.

## 🔔 Developer 3: In-Workspace Notification Center
**Objective**: Keep interns updated without leaving the workspace.
**Tasks**:
- Create a `Notifications` sidebar or dropdown in the header.
- Implement real-time alerts for "New Task Assigned" and "Attendance Log Approved".
- Add a "Mark as Read" functionality.
- **Tech**: Supabase Realtime subscriptions, Framer Motion for entrance animations.

## 👤 Developer 4: Workspace Profile Manager
**Objective**: Let interns personalize their technical presence.
**Tasks**:
- Add a "Settings" tab to the workspace.
- Create forms to update social links (GitHub, LinkedIn, Portfolio).
- Implement a profile picture upload/crop feature.
- **Tech**: Form handling with validation, Supabase Storage for avatars.

## 📅 Developer 5: Detailed Attendance History
**Objective**: Provide transparency on check-in records.
**Tasks**:
- Create an "Attendance History" table within the `Logs` tab.
- Display "Check-in Time", "Check-out Time", and "Location Status".
- Add color-coded status badges (e.g., Green for On-Time, Amber for Late).
- **Tech**: Radix UI table components, Date-fns for formatting.

## 📓 Developer 6: Module-Specific Study Notes
**Objective**: A private notebook for recording learning progress.
**Tasks**:
- Add a "Notes" button to each curriculum module.
- Open a persistent text area where interns can save personal notes for that specific topic.
- Ensure notes auto-save to the database.
- **Tech**: Debounced save logic, Supabase `upsert` queries.

## 🌙 Developer 7: Advanced Theme & Accessibility Manager
**Objective**: Allow interns to tailor their workspace for long-form study.
**Tasks**:
- Implement a robust "Dark/Light/System" theme switcher.
- Add a "Compact Mode" toggle for the navigation sidebar.
- Implement "High Contrast" settings for technical documentation readability.
- **Tech**: `next-themes` library, CSS variables for design tokens.

## 📈 Developer 8: Internship Milestone Timeline
**Objective**: A visual journey showing the road from "Intern" to "Alumnus".
**Tasks**:
- Create a horizontal `Timeline` component on the Overview tab.
- Map out key milestones: Onboarding, Mid-term Review, Final Project, and Certification.
- Add "Completion Stamps" when a milestone is reached based on curriculum progress.
- **Tech**: Framer Motion for timeline animations, dynamic SVG paths.

## 🤝 Developer 9: Peer-to-Peer Help & Networking Hub
**Objective**: Connect interns within the same department for problem-solving.
**Tasks**:
- Create a "Quick Help" button in the Curriculum modules.
- Implement a "Who's working on this?" list showing other interns currently on the same module.
- Add a simple chat link (WhatsApp/Mail) for direct peer support.
- **Tech**: Supabase Realtime for "active on module" tracking.

## 💬 Developer 10: Feedback & Coaching Center
**Objective**: Centralize direct feedback from supervisors on tasks/logs.
**Tasks**:
- Add a "Feedback" section to each task card logic.
- Implement a "Request Clarification" button that notifies the supervisor.
- Create a summary card showing "Key Strengths" and "Areas for Improvement" based on supervisor ratings.
- **Tech**: Supabase Realtime for instant messaging, structured database feedback schema.

## 🏆 Developer 11: Departmental Engagement Leaderboard
**Objective**: Friendly competition to increase task completion rates.
**Tasks**:
- Create a "Top Contributors" widget for the department.
- Calculate rankings based on "Check-in Streaks" and "Task Submission Velocity".
- Implement "Privacy Mode" for students who wish to stay anonymous.
- **Tech**: SQL Aggregations in Supabase, caching for performance.

## 🧘 Developer 12: Daily Wellness & Mood Tracker
**Objective**: Monitor intern burnout and engagement levels.
**Tasks**:
- Add a 1-click emoji mood picker during the daily "Check-in".
- Display a small "Personal Energy Graph" showing mood trends over the week.
- Implement an automated "Take a Break" nudge if an intern has worked late 3 days in a row.
- **Tech**: Local storage for instant feedback, simple data viz.

## 🔍 Developer 13: Instant Module Filter
**Objective**: Help interns quickly find specific topics in their curriculum.
**Tasks**:
- Add a search bar at the top of the `Curriculum` tab.
- Implement real-time filtering of the modules based on the search term.
- Add "Filter by Category" tags (e.g., #Frontend, #Backend, #UI).
- **Tech**: Simple array filter logic, Tailwind styling.

## ⚡ Developer 14: Quick-Action Command Center
**Objective**: Reduce clicks for common workspace actions.
**Tasks**:
- Implement a "Quick Actions" card or floating menu.
- Add buttons for "Check In", "Submit Log", and "View Next Task".
- Include a "Contact Supervisor" direct mail link.
- **Tech**: Fixed positioning, Framer Motion for menu animations.

## 🏅 Developer 15: Personal Stats & Growth Card
**Objective**: Show the intern their progress at a glance.
**Tasks**:
- Create a "Career Stats" widget in the Overview.
- Display "Total Hours Logged", "Tasks Finished", and "Modules Completed".
- Add a progress bar showing the percentage completion of the entire 12-week program.
- **Tech**: Data aggregation from the `application` object.

## ❓ Developer 16: Departmental FAQ Accordion
**Objective**: Reduce supervisor overhead by answering common intern questions.
**Tasks**:
- Add a "Help / FAQ" section to the networking or overview tab.
- Define a set of department-specific questions (e.g., "How to push code?", "Review process?").
- Use an interactive Accordion for clean presentation.
- **Tech**: Radix UI Accordion, local data mapping.

## 🚀 Developer 17: Project Link & Preview Validator
**Objective**: Ensure interns submit high-quality, working links.
**Tasks**:
- Add URL validation to the project submission field.
- Implement a "Test Link" button that opens the URL in a new tab.
- Show a small "Success" checkmark if the URL is valid (GitHub/Netlify/Vercel).
- **Tech**: Regex for URL validation, UI status indicators.

## ⏳ Developer 18: Task Priority & Countdown Timer
**Objective**: Help interns manage their time effectively.
**Tasks**:
- Add "Priority" badges (Urgent, High, Medium, Low) to task cards.
- Implement a "Days Remaining" countdown for tasks with deadlines.
- Highlight urgent tasks with a subtle pulse animation.
- **Tech**: Date-fns for time calculation, CSS animations.

## 💼 Developer 19: Public Portfolio Profile View
**Objective**: Let interns showcase their workspace progress to the world.
**Tasks**:
- Create a "Toggle Public Profile" switch in settings.
- Generate a read-only public URL (e.g., `/portfolio/user-id`) showcasing badges, logs, and finished projects.
- Ensure sensitive data (attendance maps, supervisor emails) is hidden.
- **Tech**: Next.js dynamic routes, read-only UI components.

## 📝 Developer 20: Weekly Reflection Journal
**Objective**: Encourage self-assessment and long-term learning goals.
**Tasks**:
- Add a "Weekly Reflection" modal that triggers every Friday afternoon.
- Include 3 simple questions: "What did you learn?", "What was difficult?", "Goal for next week?".
- Store reflections so they can be viewed in the log history.
- **Tech**: Date logic for triggers, Supabase storage.

## 🚨 Developer 21: Daily Standup Reminder Banner
**Objective**: Ensure high attendance log compliance.
**Tasks**:
- Implement a persistent, dismissible banner at the top of the workspace.
- Show the banner if the "Daily Report" for today hasn't been submitted by 10 AM.
- Add a "Submit Now" shortcut button that opens the report modal.
- **Tech**: Frontend time-check logic, persistent local storage for "dismissed" state.

## 🔖 Developer 22: Resource Bookmarking System
**Objective**: Allow interns to save important tutorials for later reference.
**Tasks**:
- Add a "Bookmark" icon to every curriculum resource link.
- Create a "Saved Resources" sub-section in the Curriculum tab.
- Sync bookmarks with the database so they persist across sessions.
- **Tech**: Supabase `jsonb` field for bookmarks or a dedicated `user_bookmarks` table.

## 👏 Developer 23: Peer-to-Peer "Kudos" Praise
**Objective**: Build team culture through simple positive recognition.
**Tasks**:
- Add a "Send Kudos" button to intern cards in the network tab.
- Create a small pop-up with preset emojis (🚀, 💡, 🛡️, 🤝).
- Display a "Praise Count" on the intern's public profile.
- **Tech**: Supabase Realtime for instant praise notifications.

## 📄 Developer 24: Weekly Performance PDF Export
**Objective**: Help interns generate reports for their own records or universities.
**Tasks**:
- Add an "Export My Progress" button to the Overview.
- Generate a simple, clean PDF summary of the week's tasks and logs.
- Use the Zigex letterhead and branding for a professional look.
- **Tech**: `jspdf` or `react-pdf` for client-side document generation.

## 🧭 Developer 25: Guided Workspace Onboarding Tour
**Objective**: Reduce confusion for new interns on their first day.
**Tasks**:
- Implement a "Welcome Tour" using a light library like `react-joyride`.
- Highlight specific features: "Check-in here", "See your roadmap here", "Contact your supervisor here".
- Allow users to skip or restart the tour from the Help section.
- **Tech**: Joyride or a custom "Step-by-step" highlight overlay.

## 🔗 Developer 26: 1-Click Module Share (Supervisor/Peer)
**Objective**: Facilitate quick communication about specific study topics.
**Tasks**:
- Add a "Share" icon to curriculum modules.
- Open a small pop-up with options to "Email Supervisor" or "Copy Deep Link".
- Ensure the deep-link automatically opens the specific module when visited.
- **Tech**: Query parameter handling (`?module=id`), Resend for emails.

## 🗓️ Developer 27: Visual Weekly Schedule Widget
**Objective**: provide clarity on expected internship hours.
**Tasks**:
- Create a simple 7-day calendar widget in the Overview.
- Display the intern's "Shift Hours" (e.g., 9 AM - 5 PM).
- Highlight "Today" and show a countdown to the end of the shift.
- **Tech**: Local date logic, CSS Grid for the calendar view.

## 📹 Developer 28: Live Departmental Meeting Link
**Objective**: Quick access to virtual team standups.
**Tasks**:
- Add a "Live Standup" button to the header or Announcement board.
- Fetch the meeting link (Zoom/Meet/Discord) from the departmental database.
- Show a "Live Now" pulsing indicator during scheduled meeting times.
- **Tech**: Time-based conditional rendering, Supabase data fetch.

## 📊 Developer 29: Technical Skill Badge Breakdown
**Objective**: provide deeper insight into technical sub-skills.
**Tasks**:
- Create a "Skill Details" modal.
- Instead of just "Web Dev", show proficiency in "React", "TypeScript", and "Next.js".
- Update sub-skill progress as specific related curriculum modules are finished.
- **Tech**: Nested data mapping, tiered progress bars.

## 📂 Developer 30: Dismissed Announcement Archive
**Objective**: Allow interns to revisit old organization-wide updates.
**Tasks**:
- Add an "Archive" icon to the Announcement Board.
- Slide out a panel showing all announcements that were previously dismissed by the user.
- Allow users to "Re-pin" an announcement to the main board.
- **Tech**: Supabase array filtering for `dismissed_ids`.

## 📚 Developer 31: Multi-Level Technical Curriculums
**Objective**: Build a robust, scalable curriculum data engine for all domains and skill levels.
**Tasks**:
- Create a massive `CURRICULUM_MATRIX` array in `lib/data/intern-curriculum.ts`.
- Map unique technical journeys for "Intermediate" vs "Advanced" tracks in Web Dev, UI/UX, Data Science, etc.
- Ensure the workspace dynamic loader accurately pulls the correct object based on the intern's specific profile level.
- **Tech**: Deep object mapping, TypeScript interfaces for curriculum types.

## 🤝 Developer 32: Departmental Network Synchronization
**Objective**: Fix the data fetching logic in the "Collaborative Network" dashboard modal.
- Investigate the `NetworkTab` or `CollaborativeNetworkModal` component.
- Fix the query to correctly filter interns and supervisors by the user's specific `department_name` or `company_id`.
- Implement a loading skeleton to improve perceived performance during the fetch.
- **Tech**: Supabase joins, generic list filtering in React.

---

### 🚦 Instructions for Developers
1. **Sync**: `git pull origin dashboard-refactor` to get the latest UI foundation.
2. **Branch**: `git checkout -b task/feature-name`.
3. **Verify**: Ensure your changes are responsive and follow the Zigex Blue styling.
