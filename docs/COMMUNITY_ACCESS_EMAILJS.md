# Community Access EmailJS Template Setup

## Overview
This template is used to send verification codes and Discord invite links when users request access to the Zigex Community Hub.

## Template Configuration

### Template Name
`community_access_verification`

### Template ID
Add to your `.env.local`:
```env
NEXT_PUBLIC_EMAILJS_COMMUNITY_TEMPLATE_ID=your_template_id_here
```

> **Note:** The current implementation uses `NEXT_PUBLIC_EMAILJS_AI_WAITLIST_TEMPLATE_ID`. 
> You can either update that template or create a new one specifically for community access.

---

## Email Template Content

### Subject Line
```
🔐 Your Zigex Community Access Code: {{verification_code}}
```

### HTML Body
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
            <td style="background: linear-gradient(135deg, #155DFC 0%, #4F46E5 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">🌐</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900;">
                Welcome to Zigex Community
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">
                Your access code is ready
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #1e293b; font-size: 16px;">
                Hi there! 👋
              </p>
              
              <p style="margin: 0 0 30px; color: #475569; font-size: 15px; line-height: 1.6;">
                You requested access to the <strong style="color: #155DFC;">{{feature_name}}</strong>. 
                Use the code below to verify your email and unlock the community chat.
              </p>

              <!-- Verification Code Box -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f6f8ff 0%, #e0e7ff 100%); border-radius: 16px; padding: 30px; text-align: center; border: 2px solid #dbeafe;">
                    <p style="margin: 0 0 10px; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                      Your Verification Code
                    </p>
                    <p style="margin: 0; color: #155DFC; font-size: 36px; font-weight: 900; letter-spacing: 8px; font-family: monospace;">
                      {{verification_code}}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px; color: #475569; font-size: 15px; line-height: 1.6;">
                After verifying, you'll have full access to our live community chat where you can connect with fellow Zigex students in real-time!
              </p>

              <!-- Discord Invite Section -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="background: #1e293b; border-radius: 16px; padding: 24px; text-align: center;">
                    <p style="margin: 0 0 15px; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      Join Our Discord Server
                    </p>
                    <a href="{{discord_invite}}" style="display: inline-block; background: #5865F2; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;">
                      🎮 Join Discord Server
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Direct Channel Link -->
              <p style="margin: 0 0 10px; color: #64748b; font-size: 13px; text-align: center;">
                Or go directly to the community channel:
              </p>
              <p style="margin: 0; text-align: center;">
                <a href="{{channel_link}}" style="color: #155DFC; font-size: 13px; text-decoration: none; font-weight: 600;">
                  {{channel_link}}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 2px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 13px;">
                This code expires in 24 hours.
              </p>
              <p style="margin: 0 0 15px; color: #94a3b8; font-size: 12px;">
                If you didn't request this, please ignore this email.
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

---

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Recipient's email | user@example.com |
| `{{user_email}}` | Same as to_email | user@example.com |
| `{{feature_name}}` | Feature name | Zigex Community Hub |
| `{{verification_code}}` | 6-char code | ABC123 |
| `{{discord_invite}}` | Server invite URL | https://discord.gg/zigex |
| `{{channel_link}}` | Direct channel URL | https://discord.com/channels/... |
| `{{year}}` | Current year | 2024 |

---

## How It Works

1. **User clicks "Request Access"** on the community page
2. **User enters their email** in the modal
3. **System generates a 6-character code** and sends it via EmailJS
4. **User receives email** with:
   - Verification code
   - Discord server invite link
   - Direct channel link
5. **User enters the code** in the verification step
6. **Access is granted** and stored in localStorage
7. **Chat widget is revealed** without the blur overlay

---

## Testing

1. Visit `/dashboard/community`
2. Click "Request Access"
3. Enter a test email
4. Check the email for the verification code
5. Enter the code to unlock the chat

---

## Troubleshooting

- **Email not sending**: Check EmailJS dashboard for errors
- **Invalid code**: Codes are case-insensitive, 6 characters
- **Access not persisting**: Check browser localStorage for `zigex_community_access`
- **Reset access**: Clear localStorage or use browser DevTools

---

## Security Notes

- Verification codes are generated client-side (for simplicity)
- For production, consider server-side code generation and validation
- Access is stored in localStorage (cleared on browser data clear)
- Consider adding rate limiting for email sends
