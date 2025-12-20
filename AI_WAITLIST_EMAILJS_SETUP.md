# EmailJS Template for AI Waitlist

## Create a New Template in EmailJS

1. Go to [https://dashboard.emailjs.com/admin/templates](https://dashboard.emailjs.com/admin/templates)
2. Click **"Create New Template"**
3. Name it: `AI Feature Waitlist Confirmation`

## Template Settings

### **Subject:**
```
🚀 You're on the {{feature_name}} Waitlist!
```

### **HTML Body:**
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
                🚀 You're on the Waitlist!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">
                {{feature_name}}
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
                Thank you for joining the <strong style="color: #155DFC;">{{feature_name}}</strong> waitlist!
              </p>

              <p style="margin: 0 0 30px; color: #475569; font-size: 15px;">
                We're working hard to bring you cutting-edge AI-powered features that will revolutionize how you research, learn, and discover opportunities.
              </p>

              <!-- Features Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f6f8ff 0%, #e0e7ff 100%); border-radius: 16px; padding: 24px; border: 2px solid #dbeafe;">
                    <h3 style="margin: 0 0 16px; color: #155DFC; font-size: 14px; font-weight: 900; text-transform: uppercase;">
                      What's Coming
                    </h3>
                    <ul style="margin: 0; padding: 0; list-style: none;">
                      <li style="margin: 0 0 12px; padding-left: 24px; position: relative; color: #475569; font-size: 14px;">
                        <span style="position: absolute; left: 0; color: #155DFC; font-weight: bold;">✓</span>
                        AI-powered research and analysis
                      </li>
                      <li style="margin: 0 0 12px; padding-left: 24px; position: relative; color: #475569; font-size: 14px;">
                        <span style="position: absolute; left: 0; color: #155DFC; font-weight: bold;">✓</span>
                        Intelligent opportunity matching
                      </li>
                      <li style="margin: 0 0 12px; padding-left: 24px; position: relative; color: #475569; font-size: 14px;">
                        <span style="position: absolute; left: 0; color: #155DFC; font-weight: bold;">✓</span>
                        Personalized recommendations
                      </li>
                      <li style="margin: 0; padding-left: 24px; position: relative; color: #475569; font-size: 14px;">
                        <span style="position: absolute; left: 0; color: #155DFC; font-weight: bold;">✓</span>
                        Priority access to new features
                      </li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; color: #475569; font-size: 15px;">
                We'll notify you as soon as <strong>{{feature_name}}</strong> launches. In the meantime, explore other amazing features on Zigex!
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="https://zigex.com/feed" style="display: inline-block; background: linear-gradient(135deg, #155DFC 0%, #1A3CB9 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 900; font-size: 14px; text-transform: uppercase;">
                      Explore Zigex
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

## Template Variables

The template uses these variables:
- `{{to_email}}` - Recipient's email address
- `{{feature_name}}` - The AI feature they're interested in (e.g., "Fupro AI Chat", "Deep Research", "Opportunity Finder")
- `{{user_email}}` - User's email (same as to_email)
- `{{year}}` - Current year for copyright

## Environment Variable

After creating the template, add this to your `.env.local`:

```env
NEXT_PUBLIC_EMAILJS_AI_WAITLIST_TEMPLATE_ID=your_template_id_here
```

## Testing

1. Go to `/dashboard/fupro-ai`
2. Try to send a message or select a tool
3. The waiting list modal should appear
4. Enter your email and submit
5. Check your inbox for the confirmation email!

## Features That Trigger the Waitlist

- **Sending any message** in Fupro AI chat
- **Selecting any tool**:
  - Deep Research
  - Opportunity Finder
  - Project Review
  - Scholarship Search
  - Any other tool

The modal will dynamically show the feature name in the email!
