# Zigex Internship Management System - Implementation Plan

## Overview
This plan outlines the staged development of the Intern Management System on the Zigex platform, focusing on three key user roles: Students (Interns), Supervisors (Tutors), and Admins.

## Technology Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion.
- **Backend**: Supabase (Auth, Database, Storage).
- **Communication**: WhatsApp API, Gmail/EmailJS.
- **UI Architecture**: Shadcn UI (Customized for Zigex brand).

---

## Sprint 1: Student/Intern Dashboard (7 Days)
*Focus: Designing and implementing a simple, intuitive, and premium dashboard.*

### 1.1 UI/UX Design
- [x] Create a "Glassmorphic" layout respecting Zigex Brand Colors (Signal Blue #155DFC).
- [x] Implement responsive sidebar and top navigation for the intern workspace.

### 1.2 Dashboard Core Features
- [x] **Overview Tab**: Display Internship Title, Department, and Supervisor Card (with social links).
- [x] **Curriculum Tab**: Dynamic roadmap based on student level (Beginner/Intermediate/Advanced).
- [x] **Payments Tab**: Structure and procedures, receipt download functionality.
- [x] **Daily Reports**: "Log Report" form for daily submissions.
- [x] **Resources Tab**: Content listing (locked until payment is confirmed).

### 1.3 Data Integration
- [x] Fetch accepted internship data from `Applications` table.
- [x] Create `daily_reports` table in Supabase.
- [x] Logic for logbook generation and download (PDF).

---

## Sprint 2: Supervisor/Tutor Dashboard (7 Days)
*Focus: Tools for managing intern performance and attendance.*

### 2.1 Supervisor Authentication & Assignment
- [x] Role-based access for Supervisors.
- [x] Field-specific intern listing (e.g., Web Dev supervisor sees Web Dev interns).

### 2.2 Attendance & Tasks
- [x] **Daily Attendance**: Log presence/absence for assigned department.
- [x] **Task Manager**: Add and assign weekly tasks to interns.

### 2.3 Evaluation & Review
- [x] **Report Review**: Approve or reject intern daily reports (Real-time).
- [ ] **Weekly Evaluation**: Rate intern performance (1-5 scale).

---

## Sprint 3: Admin Dashboard Enhancement (7 Days)
*Focus: Global oversight and management.*

### 3.1 Supervisor Management
- [x] **Invite System**: Add supervisors by email (integrated with auth).
- [x] **Field Assignment**: Mapping supervisors to departments (ML, Backend, etc.).

### 3.2 Global Sheets & Analytics
- [x] **Intern Matrix**: A comprehensive spreadsheet view of all interns with filters.
- [x] **Real-time Performance**: Syncing logs and assignments instantly across dashboards.
- [ ] **Feedback Aggregator**: View tutor feedbacks and task marks.

### 3.3 Community Features
- [ ] **Intern of the Week**: Interface to post highlights to the feed.
- [ ] **Broadcast System**: Post info/media updates to the intern community.

---

## Sprint 4: Finalization & Evaluation (7 Days)
*Focus: Finalizing evaluations, community features, and certificate issuance.*

### 4.1 Community & Engagement
- [ ] **Intern Group Chat**: Integration of Discord/WidgetBot for real-time collaboration.
- [ ] **Announcement Board**: Company-wide broadcasts for interns.

### 4.2 Evaluation System
- [ ] **Supervisor Evaluation Interface**: Detailed rating system for interns.
- [ ] **Student Self-Evaluation**: Reflective reports at the end of the month.

### 4.3 Recognition
- [ ] **Certificate Hub**: Automated PDF generation for completed internships.
- [ ] **Alumni Portal**: Access for past interns to community resources.

---

## Security & Reliability
- Implementation of Row Level Security (RLS) in Supabase.
- Input validation using Zod.
- Audit logs for attendance and payment confirmations.

---

## Commits & Branching
- All work will be committed to the `dashboard-refactor` branch.
- Each task completion triggers a commit.
