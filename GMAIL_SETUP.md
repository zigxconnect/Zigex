# 📧 ZIGEX Gmail Automation Setup

## 🎯 Important Update

We have switched to **Nodemailer + Gmail** because it is:
- **100% Free** (No monthly limits like recent services)
- **Server-Side Compatible** (Works perfectly with Next.js API routes)
- **No Domain Required** (Uses your standard @gmail.com address)

---

## 🔧 Step-by-Step Setup Guide

### 1. Enable 2-Factor Authentication (If not already on)
1. Go to your **[Google Account Security Page](https://myaccount.google.com/security)**
2. Under "How you sign in to Google", ensure **2-Step Verification** is turned **ON**.

### 2. Generate an App Password
1. Go to **[App Passwords](https://myaccount.google.com/apppasswords)**
   *(If the link doesn't work, go to Security > 2-Step Verification > Scroll to bottom > App Passwords)*
2. **App name:** Type `ZIGEX`
3. Click **Create**
4. Copy the 16-character password shown (e.g., `xxxx xxxx xxxx xxxx`)

### 3. Configure `.env.local`

Open your `.env.local` file and update/add these lines:

```env
# ======================
# GMAIL AUTOMATION
# ======================
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

*(Note: Provide the password **without** spaces if you prefer, but it usually works either way. Remove any old EmailJS variables if you wish to avoid confusion.)*

---

## 🧪 How to Test

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Trigger an Email**:
   - Apply for an internship/event
   - Or update an applicant status to "Accepted" in the admin dashboard

3. **Check Console Logs**:
   You should see:
   ```
   [EMAIL] Sending "Application Received..." to user@example.com
   [EMAIL] ✅ Email sent successfully to user@example.com
   ```

---

## ❓ Why this is better
- **EmailJS** requires a paid plan for server-side sending (private keys).
- **Resend** requires a verified domain name.
- **Gmail + Nodemailer** is the robust, free standard for personal/startup apps.
