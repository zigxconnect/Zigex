# Paid Program LMS Feature - Implementation Summary

## Overview
This feature implements a comprehensive Learning Management System (LMS) for paid programs on the ZIGEX platform. It follows the user's flowchart: **Accepted? → Yes → Paid for that month? → Yes → Full Access / No → Blurred with payment guide**.

## Database Changes

### New Columns
- `Applications.is_paid` (BOOLEAN) - Tracks if candidate has paid for current month

### New Table
- `program_content` - Stores weekly lesson updates, resources, and assignments
  - `id`, `program_id`, `week_number`, `title`, `description`, `content` (Markdown)
  - `resources` (JSONB array of {type, title, url, description})
  - `is_published`, `notify_paid_users`, `notified_at`

### Migration File
```sql
supabase/migrations/003_program_lms_schema.sql
```

## Local Data (Space-Saving)

### Curriculum Data
Stored locally in `lib/data/program-curriculum.ts`:
- `PROGRAM_CURRICULA` - Object containing curriculum for each program
- Each curriculum has modules with tutors (name, title, avatar, linkedin)
- Topics for each module

### Mobile Money Payment Info
Stored locally for MTN and Orange Money (Cameroon):
- Step-by-step payment instructions
- Phone numbers and account names
- Amount in XAF

## API Endpoints

### Updated Endpoints
1. `GET /api/companies/applications` - Now includes `is_paid` and `program_id`
2. `PATCH /api/companies/applications/[id]` - Now supports `{ is_paid: boolean }`

### New Endpoints
1. `GET /api/students/enrolled-programs` - Fetch student's enrolled programs with payment status
2. `GET /api/companies/programs/content?programId=xxx` - Fetch published content for a program
3. `POST /api/companies/programs/content` - Create new program content (admin only)
   - Supports email notifications to paid students

## Admin Features

### Payment Toggle in Applicants Table
- New "Payment" column in the applicants table
- Toggle switch for accepted program applicants
- Shows tooltip with payment status
- Instant update via API

### Program Content Form
- Located at `components/sections/admin/programs/ProgramContentForm.tsx`
- Add weekly lessons with Markdown content
- Add resources (GitHub, PDF, Video, Assignment links)
- Toggle: Publish immediately
- Toggle: Notify paid students via email

## Student Features

### Program Details Page Changes
- **Accepted users**: "View Program Updates" button (green, goes to updates page)
- **Pending/Reviewed users**: "Application Under Review" (disabled, amber)
- **Non-enrolled users**: "Register Now" (blue, opens form)
- Contextual tip card changes based on status

### Program Updates Page (`/programs/[id]/updates`)
Features:
1. **Curriculum Section** - Displays modules with tutors from local data
2. **Weekly Updates Section** - Accordion of published content
3. **Payment Status Badge** - Shows "Full Access" or "Payment Required"

#### Access Control by Payment Status:
| Feature | Paid | Unpaid |
|---------|------|--------|
| Curriculum | ✅ Full | ✅ Full |
| Content Titles | ✅ Full | ✅ Full |
| Content Body | ✅ Full | ❌ Blurred |
| Resources | ✅ Full | ❌ Blurred + Lock |
| Payment Guide | Hidden | ✅ Shown |

### Payment Guide (Mobile Money - Cameroon)
- MTN Mobile Money instructions
- Orange Money instructions
- Step-by-step with numbered steps
- WhatsApp link for transaction ID verification
- Amount: 15,000 XAF (configurable)

## Files Created/Modified

### New Files
```
lib/types/program-lms.ts          # TypeScript types
lib/data/program-curriculum.ts     # Local curriculum data
supabase/migrations/003_program_lms_schema.sql

app/api/students/enrolled-programs/route.ts
app/api/companies/programs/content/route.ts

app/(dashboard)/programs/[id]/updates/page.tsx
app/(dashboard)/programs/[id]/updates/ProgramUpdatesClient.tsx

components/sections/admin/programs/ProgramContentForm.tsx
components/ui/switch.tsx
components/ui/accordion.tsx
```

### Modified Files
```
lib/types/applicants.ts           # Added isPaid, programId
app/api/companies/applications/route.ts     # Added is_paid, program_id to query
app/api/companies/applications/[id]/route.ts # Added is_paid update support
app/admin/applicants/page.tsx     # Added handleUpdatePayment
components/sections/admin/applicants/ApplicantsTable.tsx # Added Payment column
app/(dashboard)/programs/[id]/ProgramDetailsClient.tsx # Added enrollment check, dynamic button
```

## Events Note
Events do NOT require payment, as specified. The payment toggle only appears for `program` type applications.

## How to Use

### For Admins:
1. Accept a program applicant
2. Once accepted, toggle the "Payment" switch when payment is confirmed
3. Use the "Add Program Content" button to create weekly lessons
4. Check "Notify paid students" to send email notifications

### For Students:
1. Apply for a program
2. Wait for acceptance
3. Once accepted, click "View Program Updates"
4. If not paid: See curriculum but blurred resources + payment guide
5. Complete payment via Mobile Money
6. Share transaction ID on WhatsApp
7. Admin confirms → Full access granted

## Configuration

### To customize a program's curriculum:
1. Edit `lib/data/program-curriculum.ts`
2. Add program ID as key with curriculum object
3. Define modules with tutors and topics

### To customize payment info:
1. Edit `lib/data/program-curriculum.ts`
2. Update `MOBILE_MONEY_PAYMENT_INFO` array
3. Change phone numbers, amounts, and steps
