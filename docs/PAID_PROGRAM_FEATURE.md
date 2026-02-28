# Paid Program Feature - Manual Payment Processing

## ✅ Final Implementation Summary

### Database Structure

#### program_content (NEW)
Stores all course content:
```sql
- id (uuid)
- program_id (uuid) - Links to program
- title (text) - Lesson/Resource title
- content_type (text) - 'lesson' | 'resource'
- description (text) - Optional details
- content_url (text) - Link to external content
- resource_type (text) - 'pdf' | 'github' | 'video' | 'assignment' | 'document'
- display_order (integer) - Sort order
- created_by (uuid) - Admin who created it
```

**Key Feature**: 
- **Lessons**: Visible to ALL accepted students (no payment required)
- **Resources**: Visible ONLY to accepted + paid students

#### program_student_payment (NEW)
Tracks manual payment status per student per program:
```sql
- id (uuid)
- program_id (uuid)
- student_id (uuid)
- application_id (uuid) - Links to application
- amount_paid_xaf (integer) - Amount in Cameroon francs
- payment_date (timestamp) - When paid
- payment_method (text) - e.g., "mobile_money"
- payment_ref (text) - Reference number
- processed_by (uuid) - Admin who processed payment
- notes (text) - Any notes from admin
- is_paid (boolean) - TRUE = can access resources
```

## 📚 How It Works

### Student View

#### For Accepted Students in FREE Programs
✅ Can see: Lessons immediately
❌ Cannot see: Resources section (not shown)

#### For Accepted Students in PAID Programs
**Before Payment:**
✅ Can see: Lessons (course content)
🔒 Cannot see: Resources section (locked with message)
📱 Message: "Complete payment to access resources. Contact admin to verify payment."

**After Payment Verified:**
✅ Can see: Lessons + Resources
📥 Can download: All PDFs, GitHub links, videos, assignments

### Admin View (Company Admin)

#### Add Course Content
1. Go to `/admin/programs/content`
2. Select program
3. Click "Add Content"
4. Choose type:
   - **Lesson** - Auto-visible to all accepted students
   - **Resource** - Only visible to paid students
5. Enter:
   - Title
   - Description
   - URL (to external resource)
   - Resource type (pdf, github, video, etc.)
6. Click Save

#### Manage Student Payments
1. Go to program details
2. See "Payments" section with all accepted students
3. For unpaid students:
   - Click "Mark as Paid"
   - Enter amount received (optional)
   - Enter payment reference (optional)
   - Add notes (optional)
   - Click "Confirm Payment"
4. Student immediately gets access to resources

## 🔌 API Endpoints

### Get Program Content
**GET** `/api/programs/{programId}/content`

Returns:
```json
{
  "content": [
    {
      "id": "uuid",
      "title": "Week 1: Intro",
      "content_type": "lesson",
      "description": "...",
      "content_url": "https://...",
      "resource_type": null
    },
    {
      "id": "uuid",
      "title": "GitHub Repository",
      "content_type": "resource",
      "resource_type": "github",
      "content_url": "https://github.com/..."
    }
  ]
}
```

### Add Content (Admin)
**POST** `/api/programs/{programId}/content`

```json
{
  "title": "Week 1: Introduction",
  "content_type": "lesson",
  "description": "Basic concepts...",
  "content_url": "https://...",
  "resource_type": null
}
```

### Get Payment Status
**GET** `/api/programs/{programId}/students/{studentId}/payment`

Returns:
```json
{
  "is_paid": true,
  "payment_date": "2026-01-04T10:00:00Z",
  "amount_paid_xaf": 25000
}
```

### Update Payment (Admin)
**POST** `/api/programs/{programId}/students/{studentId}/payment`

```json
{
  "is_paid": true,
  "amount_paid_xaf": 25000,
  "payment_date": "2026-01-04T10:00:00Z",
  "payment_ref": "TXN-12345",
  "notes": "Mobile money received",
  "applicationId": "uuid"
}
```

### Get All Payments (Admin)
**GET** `/api/programs/{programId}/payments`

Returns list of all accepted students with payment status

## 🛡️ Security (RLS Policies)

✅ **program_content**
- Anyone can view
- Only company admin can create/edit/delete

✅ **program_student_payment**
- Students see only their own payments
- Admins see payments for their programs
- Only company admins can update

## 💻 Components

### ProgramCurriculum.tsx
- Shows lessons to all accepted students
- Locks resources for unpaid students
- Links to admin payment verification message

### AdminPaymentManager.tsx
- Table of accepted students
- Status indicators (✓ Paid / ✗ Unpaid)
- Form to mark payment as received

## 📧 Email Notifications (To Implement)

When admin marks student as paid:
1. Send email: "Payment confirmed - Resources now available"
2. Include link to view resources

## 🚀 Workflow Summary

```
1. Admin creates program (is_paid = true)
2. Admin adds lessons (content_type = 'lesson')
3. Admin adds resources (content_type = 'resource')
4. Student applies → Gets accepted
5. Student sees lessons (can't see resources)
6. Student/Parent pays at HQ
7. Admin goes to program payments
8. Admin enters payment details
9. Admin clicks "Confirm Payment"
10. is_paid = true in program_student_payment
11. Student refreshes page
12. Resources section appears
13. Student can download/access all resources
```

## 📝 Key Features

✅ **No automatic payments** - Admin manually verifies
✅ **Lesson/Resource separation** - Different access levels
✅ **Payment tracking** - Reference, date, amount, notes
✅ **RLS protected** - User data properly isolated
✅ **Admin dashboard** - Easy payment management
✅ **Email ready** - Can add notifications anytime
