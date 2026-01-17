# Student Pitching & Investment System Design
## "From Inspiration to Investment"

This document outlines the architecture and implementation plan for the new **Pitching System** on the Zigex platform. The system allows students to transform their projects into investment pitches, collaborate with developers, and get validated by companies.

---

## 1. Executive Summary
The goal is to create a seamless ecosystem where:
- **Students** can pitch projects to specific companies/investors.
- **Projects** serve as public inspiration and portfolios.
- **Developers** can discover projects matching their stack and collaborate.
- **Companies** receive pitches, review decks, and validate projects.

## 2. Database Design (Schema Extensions)
We will extend the existing `projects` table and create new relationships.

### 2.1. `projects` Table Updates
We need to add columns to support pitching and collaboration context.

```sql
ALTER TABLE projects ADD COLUMN is_pitch BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN target_company_id UUID REFERENCES company_profiles(id); -- The company being pitched to
ALTER TABLE projects ADD COLUMN pitch_deck_url TEXT; -- URL to PDF/Doc
ALTER TABLE projects ADD COLUMN pitch_status TEXT DEFAULT 'draft'; -- 'submitted', 'under_review', 'accepted', 'rejected'
ALTER TABLE projects ADD COLUMN tech_stack TEXT[]; -- Array of strings e.g. ['React', 'Node.js']
ALTER TABLE projects ADD COLUMN collaboration_open BOOLEAN DEFAULT true; -- Is the owner looking for collaborators?
```

### 2.2. `pitch_feedback` Table (New)
To allow companies to send feedback or status updates with comments.

```sql
CREATE TABLE pitch_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES company_profiles(id),
  status TEXT, -- 'accepted', 'rejected', 'needs_revision'
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3. `collaborations` / `messages` (Existing or New)
If a generic messaging system exists, we use it. If not, we define a lightweight conversation starter.
*Assumed existing or we use a `direct_messages` table.*

---

## 3. User Flows & Features

### 3.1. Student (The Pitcher)
**Goal**: Create a project and pitch it.
1.  **Create/Edit Project Form**:
    *   Standard fields (Title, Desc, Media).
    *   **New Section**: "Pitch to Investors".
    *   **Toggle**: "Is this a Pitch?".
    *   **Select**: Target Company (Dropdown of registered companies/investors).
    *   **Upload**: Pitch Deck (PDF).
    *   **Input**: Tech Stack (Tags input).
    *   **Action**: Submit.
2.  **Dashboard**:
    *   View status of pitch (e.g., "Under Review by Google").

### 3.2. Public User (Developer/Beginner)
**Goal**: View projects for inspiration and collaboration.
1.  **Project Feed**: 
    *   Visible to all (Open Access).
    *   **Badge**: "Pitched to [Company]" (Adds credibility/interest).
    *   **Filter**: By Tech Stack (e.g., "Show React projects").
2.  **Project Details**:
    *   **Pitch Deck Viewer**: "View Pitch Deck" button (If public).
    *   **Tech Stack List**: "Built with: React, Supabase".
    *   **Collaboration**:
        *   If Viewer is a Developer and `collaboration_open` is true:
        *   **Button**: "DM Owner to Collaborate".
        *   *Logic*: Checks if Viewer's skills overlap with Project's stack (Gamification/Matching highlight).

### 3.3. Company (The Investor/Validator)
**Goal**: Review inbound pitches.
1.  **Company Dashboard**:
    *   **New Tab**: "Inbound Pitches".
    *   List of projects targeting them.
2.  **Review Interface**:
    *   View Project Details + Pitch Deck.
    *   **Actions**:
        *   "Validate Project" (Sets status to `accepted` / `validated`).
        *   "Request Changes" / "Reject".
        *   Send Feedback message.

---

## 4. UI/UX Implementation Plan

### 4.1. Project Creation Form (`MultiStepForm` or `ProjectForm`)
*   Add **Step 3: Investment & Pitching**.
*   Company Selector (Async search).
*   File Upload (Drag & drop for Pitch Deck).
*   Stack Selector (Tag input).

### 4.2. Project Details Page (`ProjectDetailsView.tsx`)
*   **Header**: Add Pitch Status Badge.
*   **Sidebar/Info**: Add "Tech Stack" section.
*   **Actions**: 
    *   "View Pitch Deck" (Secondary Action).
    *   "Message Owner" (Primary Call-to-Action for Devs).
    *   *Note*: Message button opens a DM modal pre-filled with "Hi, I saw your project [Name] and I'd like to collaborate...".

### 4.3. Company Dashboard
*   Create `app/dashboard/company/pitches/page.tsx`.
*   Table/Card view of incoming pitches.

---

## 5. API Routes Required

1.  `POST /api/projects/create` (Update to handle new fields).
2.  `GET /api/companies/list` (For the selector).
3.  `POST /api/projects/[id]/pitch/status` (For companies to update status).
4.  `POST /api/messages/create` (For DM initiation).

---

## 6. Implementation Roadmap

1.  **Database Migration**: Apply Schema changes.
2.  **Backend Logic**: Update Types and API handlers.
3.  **Frontend - Project Form**: Add Pitching fields.
4.  **Frontend - Project Details**: Display Stack, Deck, and Message button.
5.  **Frontend - Company View**: Build the review dashboard.
