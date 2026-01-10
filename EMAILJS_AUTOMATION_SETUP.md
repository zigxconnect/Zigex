# 📧 ZIGEX EmailJS Setup Guide

## 🎯 Overview

Your ZIGEX platform now uses **EmailJS** for all automated email notifications. This guide will walk you through creating a new EmailJS account and configuring it for your use case.

---

## 🔧 Step 1: Create a New EmailJS Account

1. Go to **[https://www.emailjs.com/](https://www.emailjs.com/)**
2. Click **"Sign Up Free"**
3. Create a new account with a fresh email (e.g., `zigex.emails@gmail.com`)
4. Verify your email address

---

## 📬 Step 2: Add an Email Service

1. In your EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Select **Gmail** (recommended) or any other provider
4. Click **"Connect Account"** and authorize with your Gmail
5. Name it: `zigex_gmail`
6. **Copy your Service ID** (looks like `service_xxxxxxx`)

---

## 📝 Step 3: Create the Dynamic Email Template

1. Go to **"Email Templates"**
2. Click **"Create New Template"**
3. Set **Template ID** to: `zigex_dynamic`

### Template Content (Copy & Paste):

**Subject:**
```
{{subject}}
```

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #155DFC 0%, #1A3CB9 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ZIGEX</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your Career Launch Platform</p>
            </td>
          </tr>

          <!-- Status Badge (if provided) -->
          {{#status_badge}}
          <tr>
            <td style="padding: 24px 40px 0; text-align: center;">
              <span style="display: inline-block; background-color: {{status_color}}22; color: {{status_color}}; padding: 8px 20px; border-radius: 50px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                {{status_badge}}
              </span>
            </td>
          </tr>
          {{/status_badge}}

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px; font-size: 24px; font-weight: 700;">
                {{heading}}
              </h2>
              
              {{#opportunity_title}}
              <div style="background: #f8fafc; border-left: 4px solid #155DFC; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">{{opportunity_type}}</p>
                <p style="margin: 4px 0 0; color: #1a1a2e; font-size: 18px; font-weight: 600;">{{opportunity_title}}</p>
                {{#company_name}}
                <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">at {{company_name}}</p>
                {{/company_name}}
              </div>
              {{/opportunity_title}}
              
              <div style="color: #475569; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">{{message}}</div>
            </td>
          </tr>

          <!-- CTA Button -->
          {{#cta_text}}
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="{{cta_link}}" style="display: inline-block; background: linear-gradient(135deg, #155DFC 0%, #1A3CB9 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 16px rgba(21,93,252,0.3);">
                {{cta_text}}
              </a>
            </td>
          </tr>
          {{/cta_text}}

          <!-- Footer Note -->
          {{#footer_note}}
          <tr>
            <td style="padding: 0 40px 24px;">
              <p style="color: #94a3b8; font-size: 14px; font-style: italic; text-align: center; margin: 0;">
                💡 {{footer_note}}
              </p>
            </td>
          </tr>
          {{/footer_note}}

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                © {{year}} ZIGEX. Empowering Cameroon's Future Leaders.
              </p>
              <p style="margin: 8px 0 0;">
                <a href="https://zigex.online" style="color: #155DFC; text-decoration: none; font-size: 12px; font-weight: 600;">zigex.online</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

4. Click **"Save"**
5. **Copy your Template ID** (should be `zigex_dynamic`)

---

## 🔑 Step 4: Get Your API Keys

1. Go to **"Account"** → **"General"**
2. Copy your **Public Key** (looks like `xxxxxxxxxxxxxxx`)
3. Scroll down and generate a **Private Key** (for server-side use)

---

## 📋 Step 5: Add to Your Environment Variables

Add these to your `.env.local` file:

```env
# ======================
# EMAILJS CONFIGURATION
# ======================
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=zigex_dynamic
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
EMAILJS_PRIVATE_KEY=xxxxxxxxxxxxxxx
```

---

## ✅ Step 6: Test Your Setup

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Apply for an event/program/internship** on your platform

3. **Check your server logs** for:
   ```
   [EMAILJS] Sending "Application Received: Weekend of Code" to user@email.com
   [EMAILJS] ✅ Email sent successfully to user@email.com
   ```

4. **Check your inbox!**

---

## 📊 Email Types Sent Automatically

| Trigger | Email Type | Recipient |
|---------|-----------|-----------|
| User applies to internship/program/event | Application Confirmation | Candidate |
| User applies | Admin Alert | zigex.connect@gmail.com |
| User applies | Company Alert | Company email (if set) |
| Application accepted | Acceptance Email | Candidate |
| Application rejected | Rejection Email | Candidate |
| User completes profile | Welcome Email | New User |

---

## 🔧 Troubleshooting

### "NOT_CONFIGURED" in logs
- Check that all 4 environment variables are set
- Restart your dev server after adding them

### Emails not sending
- Check EmailJS dashboard for delivery logs
- Verify your Gmail service is still connected
- Check spam folder

### Template errors
- Make sure you used the exact template ID: `zigex_dynamic`
- Verify the HTML template was saved correctly

---

## 📱 WhatsApp Automation (Optional)

If you also want WhatsApp messages, add these:

```env
WHATSAPP_API_URL=https://your-evolution-api.com
WHATSAPP_API_KEY=your-key
WHATSAPP_INSTANCE=ZIGEX
```

See the Evolution API docs: https://github.com/EvolutionAPI/evolution-api

---

## 🎉 You're Done!

Your ZIGEX platform now sends beautiful, dynamic emails for all application events. Every candidate will receive professional, branded notifications automatically!
