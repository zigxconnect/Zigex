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
- [ ] Create a "Glassmorphic" layout respecting Zigex Brand Colors (Signal Blue #155DFC).
- [ ] Implement responsive sidebar and top navigation for the intern workspace.

### 1.2 Dashboard Core Features
- [ ] **Overview Tab**: Display Internship Title, Department, and Supervisor Card (with social links).
- [ ] **Curriculum Tab**: Dynamic roadmap based on student level (Beginner/Intermediate/Advanced).
- [ ] **Payments Tab**: Structure and procedures, receipt download functionality.
- [ ] **Daily Reports**: "Log Report" form for daily submissions.
- [ ] **Resources Tab**: Content listing (locked until payment is confirmed).

### 1.3 Data Integration
- [ ] Fetch accepted internship data from `Applications` table.
- [ ] Create `daily_reports` table in Supabase.
- [ ] Logic for logbook generation and download (PDF).

---

## Sprint 2: Supervisor/Tutor Dashboard (7 Days)
*Focus: Tools for managing intern performance and attendance.*

### 2.1 Supervisor Authentication & Assignment
- [ ] Role-based access for Supervisors.
- [ ] Field-specific intern listing (e.g., Web Dev supervisor sees Web Dev interns).

### 2.2 Attendance & Tasks
- [ ] **Daily Attendance**: Log presence/absence for assigned department (3PM - 12AM constraint).
- [ ] **Task Manager**: Add and assign weekly tasks to interns.

### 2.3 Evaluation & Review
- [ ] **Report Review**: Approve or reject intern daily reports.
- [ ] **Weekly Evaluation**: Rate intern performance (1-5 scale).

---

## Sprint 3: Admin Dashboard Enhancement (7 Days)
*Focus: Global oversight and management.*

### 3.1 Supervisor Management
- [ ] **Invite System**: Add supervisors by email (integrated with auth).
- [ ] **Field Assignment**: Mapping supervisors to departments (ML, Backend, etc.).

### 3.2 Global Sheets & Analytics
- [ ] **Intern Matrix**: A comprehensive spreadsheet view of all interns with filters.
- [ ] **Feedback Aggregator**: View tutor feedbacks and task marks.

### 3.3 Community Features
- [ ] **Intern of the Week**: Interface to post highlights to the feed.
- [ ] **Broadcast System**: Post info/media updates to the intern community.

---

## Security & Reliability
- Implementation of Row Level Security (RLS) in Supabase.
- Input validation using Zod.
- Audit logs for attendance and payment confirmations.

---

## Commits & Branching
- All work will be committed to the `dashboard-refactor` branch.
- Each task completion triggers a commit.
