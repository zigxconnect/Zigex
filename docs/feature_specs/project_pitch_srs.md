# Software Requirements Specification (SRS): Zigex "Project Pitch" & Innovation Ecosystem

## 1. Executive Summary
The "Project Pitch" feature transforms Zigex from a simple project listing site into a dynamic **Innovation Ecosystem**. It shifts the focus from static GitHub repositories to video-first entrepreneurship, creating a direct pipeline between student founders and corporate sponsors/investors. This feature introduces a gamified lifecycle for projects—from raw pitch to funded venture to collaborative development—powered by **Liveblocks** real-time technology.

## 2. Strategic Value Proposition

### 2.1 Financial Benefits for Zigex
*   **Sponsorship Transaction Fees**: Zigex can take a percentage (e.g., 5-10%) of any sponsorship or grant money transferred from Company to Project through the platform.
*   **Premium "Talent" Subscriptions**: Students can purchase specific "Skill Badges" or "Pro" status to be eligible as Collaborators on high-profile sponsored projects.
*   **Corporate SaaS Tier**: Companies pay for advanced project management tools, analytics on trend spotting in student projects, and "Priority Access" to top talent.
*   **Gamified Retention**: By turning project development into a leveling-up game (Pitch -> Review -> Sponsored -> Public Launch), user retention increases, driving ad revenue or subscription renewals.

### 2.2 Growth & Scalability
*   **Attracting Entrepreneurs**: Removing the Github requirement lowers the barrier to entry, attracting non-technical founders with great ideas who need technical collaborators.
*   **Attracting Investors**: A curated, video-first feed of pitches is more engaging for investors than reading code repositories.
*   **Scalability**: The model scales from local university projects to a global startup incubator platform.

---

## 3. Detailed User Journeys

### 3.1 The "Pitch" (Founder -> Company)
*   **Objective**: Secure sponsorship or mentorship.
*   **Flow**:
    1.  **Creation**: User selects "New Pitch".
    2.  **Requirement**: GitHub links are **Optional**. A **Video Pitch** (1-3 mins) is **Mandatory**.
    3.  **Targeting**: User selects a specific target Company (e.g., "Google", "Local Bank").
    4.  **Submission**: Project is submitted in `DRAFT` state, visible ONLY to the Founder and the Goal Company.
    5.  **Notification**: Company receives an instant in-app notification (Liveblocks) regarding a new submission.

### 3.2 The "Handshake" (Company -> Founder)
*   **Objective**: Evaluate and initiate contact.
*   **Flow**:
    1.  **Review**: Company dashboard displays new pitches.
    2.  **Interaction**: Company watches the video. If interested, they click "Schedule Meeting".
    3.  **Notification**: Founder receives a real-time notification: *"Company X is excited to know more!"* with a Google Meet link.
    4.  **Verdict**:
        *   **Reject**: Feedback provided.
        *   **Validate (Sponsor)**: Status changes to `VALID/SPONSORED`. Company becomes the official "Incubator".

### 3.3 The "Market" (Public Collaboration)
*   **Objective**: Build the team.
*   **Flow**:
    1.  **Public Launch**: Company toggles the project to `PUBLIC`.
    2.  **Discovery**: Students with relevant skills see the project in the "Innovation Feed".
    3.  **Connection**: Students click "DM Owner" to apply as collaborators.
    4.  **Team Building**: Founder verifies skills via chat.
    5.  **Onboarding**: Founder adds student as `COLLABORATOR`. Existing project resources (docs, links) are shared automatically.

---

## 4. Functional Requirements

### 4.1 Project Submission Module
*   **FR-01**: System MUST allow video file uploads (blob storage) or embedded video links.
*   **FR-02**: System MUST allow skipping GitHub/Repo fields during creation.
*   **FR-03**: System MUST enforce selection of a Target Company.

### 4.2 Company Dashboard & Review
*   **FR-04**: System MUST provide a "Submissions" inbox for companies.
*   **FR-05**: System MUST allow companies to send structured "Meeting Requests" (Date/Time/Link) via the chat interface.
*   **FR-06**: System MUST allow Companies to toggle Project Visibility (`PRIVATE` vs `PUBLIC`).
*   **FR-07**: System MUST allow Companies to update Project Lifecycle Status (e.g., `Reviewing`, `Meeting Scheduled`, `Sponsored`, `Development`, `Completed`).

### 4.3 Real-Time Notification System (Liveblocks)
*   **FR-08**: **Submission Alert**: Instant toast/badge for Company when a pitch arrives.
*   **FR-09**: **Status Update Alert**: Instant alert for Founder when status changes (e.g., "Your project is now Sponsored!").
*   **FR-10**: **Meeting Alert**: Instant notification for Founder when a meeting invitation is sent.

### 4.4 Collaboration Market
*   **FR-11**: System MUST restrict the "DM Owner" button to users who meet specific criteria (e.g., "Purchased Skills" or verified profile).
*   **FR-12**: System MUST support a `project_collaborators` table to manage team access rights.

---

## 5. Technical Architecture

### 5.1 Technology Stack
*   **Frontend**: Next.js 15 (App Router).
*   **Real-time Engine**: **Liveblocks** (Presence, Notifications, Storage).
*   **Database**: Supabase (PostgreSQL) for relational data (`projects`, `submissions`, `collaborators`).
*   **Storage**: Supabase Storage for Video Pitches.

### 5.2 Data Model Enhancements
**Table: `projects`**
*   `video_pitch_url` (TEXT, Required)
*   `github_url` (TEXT, Optional)
*   `sponsoring_company_id` (UUID, FK)
*   `lifecycle_stage` (ENUM: 'pitch', 'review', 'valid', 'building', 'shipped')

**Table: `project_status_logs`** (Gamification History)
*   Tracks timeline: "Pitched on Jan 1", "Meeting on Jan 3", "Sponsored on Jan 5".

### 5.3 Liveblocks Implementation
*   **Room Design**:
    *   `submission_room_{company_id}`: For companies to listen to incoming pitches.
    *   `project_room_{project_id}`: For Founder-Company collaboration and later Team chat.
*   **Notifications**: Using Liveblocks `InboxNotification` components for a unified notification center.

---

## 6. Gamification & Future Scaling

### 6.1 Gamification Elements
*   **Milestone Unlocks**: As the Company updates the status (e.g., to "Building"), new features unlock in the project dashboard (e.g., Jira integration, Budget view).
*   **Badges**: "Sponsored Project" badge on student profiles.
*   **Progress Bars**: Visual timeline showing the project's journey from "Pitch" to "Product".

### 6.2 Implementation Roadmap
1.  **Phase 1 (Core Pitch)**: Video upload, streamlined submission, Company Inbox.
2.  **Phase 2 (The Handshake)**: Status updates, Meeting scheduling UI, Notifications.
3.  **Phase 3 (Collaboration Market)**: Public feed, Verified Skill requirement for DMs, Collaborator management.

---

This SRS provides a robust framework to build a highly engaging, financially viable feature that connects ambition (Students) with capital/resources (Companies) through a modern, video-first interface.
