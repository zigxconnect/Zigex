# EmailJS Setup Guide for Smart Apply

This guide explains how to set up EmailJS to send applications from the Smart Apply feature to company email addresses.

## Overview

When a user submits a Smart Apply application, the system will:
1. Extract the company email from the opportunity's company profile
2. Send the application content to the company email via EmailJS
3. Store the application record in the database

## Setup Steps

### 1. Create an EmailJS Account

1. Go to [EmailJS website](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Create an Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Create New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Copy your **Service ID** (e.g., `service_xxxxx`)

### 3. Create an Email Template

1. Go to **Email Templates** in your EmailJS dashboard
2. Click **Create New Template**
3. Use the following template structure:

**Template Name:** `smart_apply_application` (or your preferred name)

**Email Content:**
```
To: {{to_email}}
From: {{from_email}}
Subject: {{subject}}

Dear Hiring Team,

A candidate {{from_name}} ({{applicant_email}}) has submitted an application for the {{opportunity_title}} position.

---
APPLICATION CONTENT:
---

{{message}}

---

Best regards,
Smart Apply System
```

4. Copy your **Template ID** (e.g., `template_xxxxx`)

### 4. Add Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxx
```

**Where to find these:**
- **Service ID**: EmailJS Dashboard → Email Services → Your Service
- **Template ID**: EmailJS Dashboard → Email Templates → Your Template
- **Public Key**: EmailJS Dashboard → Account → API Keys

### 5. Verify Company Emails are Stored

Ensure that company profiles in your Supabase database have the `email` field populated:

```sql
-- Check company_profiles table
SELECT id, company_name, email FROM company_profiles LIMIT 10;
```

## Testing

### Manual Test in Development

1. Start your dev server: `npm run dev`
2. Navigate to a job opportunity
3. Click "Smart Apply with AI"
4. Click "Edit & Submit" or "Submit"
5. Check your EmailJS dashboard under **Email Activity** to verify the email was sent

### Test Email Delivery

You can test with your own email first:
1. Update a test opportunity to use your email
2. Submit an application
3. Check if you receive the email

## Email Template Variables

The following variables are available in your EmailJS template:

| Variable | Description | Example |
|----------|-------------|---------|
| `to_email` | Company's email address | company@example.com |
| `from_email` | Student's email | student@email.com |
| `from_name` | Student's full name | John Doe |
| `subject` | Email subject | New Application for Software Engineer |
| `message` | Full application content | The student's application letter |
| `applicant_email` | Student's email (duplicate) | student@email.com |
| `applicant_name` | Student's name (duplicate) | John Doe |
| `opportunity_title` | Job/Program title | Summer Internship 2025 |

## Error Handling

If email sending fails:
- The application will still be stored in the database
- An error message will be logged in the server console
- The user will see a success message (application saved)
- A warning message will appear if emailjs isn't configured

## Troubleshooting

### Email not sending

1. **Check API Keys**: Verify all three keys are correct in `.env.local`
2. **Restart Dev Server**: After updating `.env.local`, restart with `npm run dev`
3. **Check Company Email**: Ensure the opportunity's company has an email address
4. **EmailJS Dashboard**: Check Email Activity logs for failures
5. **Browser Console**: Look for error messages in the browser dev tools

### Email with incomplete data

1. Check that company profiles have email addresses
2. Verify student profiles have email and full_name fields
3. Review the template variables match your database fields

### Rate Limiting

EmailJS free tier has limits:
- 200 emails per day
- 50 emails per hour

If you exceed limits, upgrade your EmailJS plan or implement request queueing.

## Best Practices

1. **Test with test email first** before going to production
2. **Monitor EmailJS dashboard** for failed deliveries
3. **Keep API keys secure** - never commit `.env.local` to git
4. **Update template** if database schema changes
5. **Set up email logs** for debugging and audit trails

## Next Steps

- [ ] Create EmailJS account
- [ ] Set up email service
- [ ] Create email template
- [ ] Add environment variables
- [ ] Test email delivery
- [ ] Monitor in production

---

For more help, visit [EmailJS Documentation](https://www.emailjs.com/docs/)
