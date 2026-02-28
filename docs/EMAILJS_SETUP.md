# EmailJS Setup for Smart Apply Waitlist

## Overview
This guide explains how to set up EmailJS to send confirmation emails when users join the Smart Apply waitlist.

## Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add Email Service
1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email
5. Copy the **Service ID** (you'll need this later)

## Step 3: Create Email Template
1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use the following template:

### Template Name
`smart_apply_waitlist_confirmation`

### Template Content

**Subject:**
```
🎉 You're on the Smart Apply Waitlist!
```

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f8ff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(21, 93, 252, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #155DFC 0%, #1A3CB9 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900;">
                🎉 You're on the List!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                Smart Apply Waitlist
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #1e293b; font-size: 16px;">
                Hi there! 👋
              </p>
              
              <p style="margin: 0 0 20px; color: #475569; font-size: 15px;">
                Thank you for joining the <strong style="color: #155DFC;">Smart Apply</strong> waitlist for <strong>{{opportunity_title}}</strong>!
              </p>

              <p style="margin: 0 0 30px; color: #475569; font-size: 15px;">
                We're working hard to bring you an AI-powered application experience that will revolutionize how you apply for opportunities.
              </p>

              <!-- Features Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f6f8ff 0%, #e0e7ff 100%); border-radius: 16px; padding: 24px; border: 2px solid #dbeafe;">
                    <h3 style="margin: 0 0 16px; color: #155DFC; font-size: 14px; font-weight: 900; text-transform: uppercase;">
                      What You'll Get
                    </h3>
                    <ul style="margin: 0; padding: 0; list-style: none;">
                      <li style="margin: 0 0 12px; padding-left: 24px; position: relative; color: #475569; font-size: 14px;">
                        <span style="position: absolute; left: 0; color: #155DFC; font-weight: bold;">✓</span>
                        AI-powered application drafts tailored to your profile
                      </li>
                      <li style="margin: 0 0 12px; padding-left: 24px; position: relative; color: #475569; font-size: 14px;">
                        <span style="position: absolute; left: 0; color: #155DFC; font-weight: bold;">✓</span>
                        Priority review in just 2 hours
                      </li>
                      <li style="margin: 0 0 12px; padding-left: 24px; position: relative; color: #475569; font-size: 14px;">
                        <span style="position: absolute; left: 0; color: #155DFC; font-weight: bold;">✓</span>
                        Personalized recommendations for better matches
                      </li>
                      <li style="margin: 0; padding-left: 24px; position: relative; color: #475569; font-size: 14px;">
                        <span style="position: absolute; left: 0; color: #155DFC; font-weight: bold;">✓</span>
                        Early access to new features and updates
                      </li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; color: #475569; font-size: 15px;">
                We'll notify you as soon as Smart Apply launches. In the meantime, feel free to explore other opportunities on Zigex!
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="https://zigex.com/feed" style="display: inline-block; background: linear-gradient(135deg, #155DFC 0%, #1A3CB9 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase;">
                      Explore Opportunities
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 2px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 13px;">
                Questions? We're here to help!
              </p>
              <p style="margin: 0 0 15px;">
                <a href="mailto:support@zigex.com" style="color: #155DFC; text-decoration: none; font-weight: 700;">
                  support@zigex.com
                </a>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © {{year}} Zigex. All rights reserved.
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

4. Save the template and copy the **Template ID**

## Step 4: Get Your Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key**

## Step 5: Add Environment Variables
Add these to your `.env.local` file:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_WAITLIST_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## Step 6: Create Database Table
Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS smart_apply_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  opportunity_title TEXT NOT NULL,
  opportunity_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, opportunity_title)
);

-- Add index for faster queries
CREATE INDEX idx_waitlist_email ON smart_apply_waitlist(email);
CREATE INDEX idx_waitlist_created ON smart_apply_waitlist(created_at DESC);
```

## Template Variables
The email template uses these variables:
- `{{to_email}}` - Recipient's email address
- `{{opportunity_title}}` - The opportunity they're interested in
- `{{user_email}}` - User's email (same as to_email)
- `{{year}}` - Current year for copyright

## Testing
1. Fill out the waitlist form on your site
2. Check the EmailJS dashboard for sent emails
3. Verify the email arrives in the user's inbox
4. Check Supabase to confirm the record was created

## Troubleshooting
- **Email not sending**: Check EmailJS dashboard for error logs
- **Template not found**: Verify the Template ID in your .env file
- **Service error**: Ensure your email service is properly connected
- **Database error**: Check Supabase logs and table permissions

## Free Tier Limits
EmailJS free tier includes:
- 200 emails per month
- 2 email services
- 2 email templates
- Basic support

For higher volume, consider upgrading to a paid plan.
