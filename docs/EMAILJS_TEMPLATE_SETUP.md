# EmailJS Template Setup for Smart Apply

## Step-by-Step EmailJS Configuration

### 1. Go to EmailJS Dashboard
- Visit: https://www.emailjs.com/
- Log in to your account
- Go to **Email Templates** section

### 2. Create New Template

Click **Create New Template** and fill in:

**Template Name:** `smart_apply_application`

**Template Subject:**
```
New Application for {{opportunity_title}}
```

### 3. Email Content (HTML Format)

Copy and paste this exact template content:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 10px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
        }
        .info-box {
            background-color: #f9f9f9;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .info-box label {
            font-weight: 600;
            color: #555;
            display: block;
            margin-bottom: 5px;
            font-size: 13px;
            text-transform: uppercase;
        }
        .info-box value {
            color: #333;
            font-size: 15px;
        }
        .application-content {
            background-color: #fafafa;
            border: 1px solid #e0e0e0;
            padding: 20px;
            border-radius: 4px;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
            color: #333;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
        .highlight {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>📧 New Application Received</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Smart Apply Submission</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Highlight -->
            <div class="highlight">
                <strong>⚡ Generated with Smart Apply AI</strong> - This application was created using our intelligent application generation system.
            </div>

            <!-- Opportunity Section -->
            <div class="section">
                <div class="section-title">📋 Opportunity Details</div>
                <div class="info-box">
                    <label>Position:</label>
                    <value>{{opportunity_title}}</value>
                </div>
            </div>

            <!-- Applicant Section -->
            <div class="section">
                <div class="section-title">👤 Applicant Information</div>
                <div class="info-box">
                    <label>Name:</label>
                    <value>{{applicant_name}}</value>
                </div>
                <div class="info-box">
                    <label>Email:</label>
                    <value>{{applicant_email}}</value>
                </div>
            </div>

            <!-- Application Content Section -->
            <div class="section">
                <div class="section-title">📝 Application Content</div>
                <div class="application-content">{{message}}</div>
            </div>

            <!-- CTA Section -->
            <div class="section" style="text-align: center; margin-top: 30px;">
                <p style="color: #666; margin-bottom: 15px;">
                    Review this application in your Zigex dashboard or respond directly to this email.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0;">This is an automated email from Zigex Smart Apply System</p>
            <p style="margin: 5px 0 0 0; color: #999;">
                Applicant replied from: {{applicant_email}}
            </p>
        </div>
    </div>
</body>
</html>
```

### 4. Template Variables Reference

**Only these 5 variables are sent to the template. DO NOT reference any other variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `{{opportunity_title}}` | Job/Program title | "Summer Internship 2025" |
| `{{applicant_name}}` | Student's full name | "John Doe" |
| `{{applicant_email}}` | Student's email address | "john@example.com" |
| `{{message}}` | Full application content | "The student's application letter..." |
| `{{to_email}}` | Company's email (recipient) | "hr@company.com" |

**⚠️ IMPORTANT:** Do NOT use these variables in your template (they are NOT sent):
- `{{from_email}}` ❌
- `{{from_name}}` ❌
- `{{subject}}` ❌
- `{{location}}` ❌
- `{{company_name}}` ❌
- Any other variables not listed above ❌

### 5. After Creating Template

1. Click **Save** or **Create**
2. Copy your **Template ID** (looks like: `template_xxxxx`)
3. Add it to your `.env.local`:
   ```env
   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxx
   ```

### 6. Get Your Service ID and Public Key

**Service ID:**
1. Go to **Email Services** in EmailJS
2. Select your email service
3. Copy the **Service ID**

**Public Key:**
1. Go to **Account** → **API Keys**
2. Copy your **Public Key**

**Add to `.env.local`:**
```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxx
```

### 7. Test Your Template

1. In EmailJS, go to your template
2. Click **Test it**
3. Fill in sample data (use ONLY these 5 variables):
   ```
   to_email: your-email@example.com
   opportunity_title: Test Opportunity
   applicant_name: John Doe
   applicant_email: john@example.com
   message: This is a test application content
   ```
4. Click **Send Test Email**
5. Check your email to see how it looks

### 8. Customize the Template (Optional)

You can modify:
- **Colors**: Change `#667eea` to your brand color
- **Fonts**: Modify font families
- **Text**: Add/remove sections
- **Styling**: Adjust padding, margins, borders

### Common Issues & Solutions

**Email not sending?**
- Check all three keys are correctly added to `.env.local`
- Restart your dev server: `npm run dev`
- Verify company has an email in their profile
- Check EmailJS dashboard for error messages

**Template variables showing as {{variable}}?**
- Make sure variable names match EXACTLY (case-sensitive)
- Variable names in template should match what's sent from backend
- No extra spaces around variable names

**Email looks broken?**
- Use a different email client to test
- Some email clients don't support all CSS
- Test the HTML rendering in EmailJS preview

---

**Next Steps:**
1. Create the template with the HTML above
2. Get your Template ID
3. Add all three keys to `.env.local`
4. Test it with a sample email
5. Your Smart Apply feature will work! 🎉
