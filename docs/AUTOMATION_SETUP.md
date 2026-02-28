# ZIGEX Automation Setup Guide

## ✅ What I Fixed

### 1. **Stats Display Bug (0 Programs Applied)**
The profile stats were querying **non-existent legacy tables** (`internship_applications`, `program_applications`, `event_rsvps`). 

**Fixed:** All queries now use the **unified `Applications` table** with proper `application_type` filters. Your "Weekend of Code" application should now appear!

### 2. **Files Updated:**
- `app/(dashboard)/dashboard/student/page.tsx` - Student directory stats
- `app/(dashboard)/dashboard/student/[username]/page.tsx` - Individual profile stats
- `lib/actions/profile.actions.ts` - Profile data fetching

---

## 🚀 To Enable Email & WhatsApp Automation

The automation code is **fully implemented**, but it requires **environment variables** to function. Here's what you need to set up in your `.env.local` file:

### Required Environment Variables

```env
# ======================
# RESEND (Email Automation)
# ======================
# Sign up at https://resend.com (Free tier: 3,000 emails/month)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ======================
# WHATSAPP (Evolution API - Self-Hosted & Free)
# ======================
# You need to self-host Evolution API OR use a hosted provider
# GitHub: https://github.com/EvolutionAPI/evolution-api

WHATSAPP_API_URL=https://your-evolution-api-instance.com
WHATSAPP_API_KEY=your-api-key-here
WHATSAPP_INSTANCE=ZIGEX
```

---

## 📧 Setting Up Resend (Email Automation)

1. Go to [https://resend.com](https://resend.com) and create a free account
2. Navigate to **API Keys** and create a new key
3. Add a verified **sending domain** (e.g., `ZIGEX.online`)
   - In Resend dashboard, go to **Domains** → Add Domain
   - Add DNS records as instructed (DKIM, SPF, MX)
4. Copy your API key to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. Restart your dev server: `npm run dev`

### Testing Emails

After setup, try applying for an internship/program/event. Check:
1. Your email inbox for the confirmation
2. The server logs for `[MAIL-JOB]` messages

---

## 📱 Setting Up WhatsApp Automation (Evolution API)

Evolution API is a **free, self-hosted WhatsApp API**. Here's how to set it up:

### Option A: Self-Host with Docker (Recommended)

```bash
# Clone Evolution API
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Start with Docker
docker-compose up -d
```

Then access: `http://localhost:8080`

### Option B: Use a Hosted Provider

If you don't want to self-host, you can use:
- [Cloud API by Evolution](https://evolution-api.com/)
- [WhatsApp Business API](https://business.whatsapp.com/products/business-platform)

### Configuring in `.env.local`

```env
WHATSAPP_API_URL=http://localhost:8080  # or your hosted URL
WHATSAPP_API_KEY=your-generated-api-key
WHATSAPP_INSTANCE=ZIGEX
```

### Connecting Your WhatsApp Number

1. Open your Evolution API dashboard
2. Create a new instance called "ZIGEX"
3. Scan the QR code with your WhatsApp
4. The instance is now connected!

---

## 🔄 What Happens When Someone Applies

### After Application Submitted:
1. **Email Confirmation** → Sent to applicant via Resend
2. **WhatsApp Alert** → Sent to applicant's phone (if configured)
3. **Admin Alert** → Sent to `zigex.connect@gmail.com`
4. **Company Alert** → Sent to the company's email (if available)

### Email Types:
| Status | Email Template |
|--------|----------------|
| `pending` | Application Confirmation |
| `rsvp_confirmed` | RSVP Confirmation |
| `accepted` | Welcome/Invite Email |
| `rejected` | Rejection Notice |

---

## 🧪 Quick Test

1. **Restart your dev server** to load the fixed code
2. **Check your profile** - stats should now show correctly
3. **Apply for a new event** - check server logs for:
   - `[WA-JOB]` - WhatsApp attempt
   - `[MAIL-JOB]` - Email attempt
4. If you see "NOT_CONFIGURED", it means the env vars are missing

---

## 📋 Checklist

- [ ] Add `RESEND_API_KEY` to `.env.local`
- [ ] Verify domain in Resend dashboard
- [ ] (Optional) Set up Evolution API for WhatsApp
- [ ] Restart `npm run dev`
- [ ] Test by applying to an event/program
- [ ] Check your inbox!

---

## Need Help?

If emails aren't sending, check:
1. Server console for errors
2. Resend dashboard for delivery logs
3. Spam folder in your email

If WhatsApp isn't working:
1. Ensure Evolution API is running
2. Check that your instance is connected
3. Verify the phone number format (should be 237XXXXXXXXX for Cameroon)
