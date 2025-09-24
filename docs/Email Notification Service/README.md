# Email Notification Service Setup Guide

## 1. Overview

This document provides instructions on how to configure and deploy the email notification service for the FutureProspect platform.

This service automatically sends an email notification to subscribed users whenever a new Program, Internship, or Event is posted. It is built using a Supabase Edge Function (Deno runtime) and the Resend API for email delivery. The email templates are built with React Email.

**Core Technologies:**

- **Backend Logic:** Supabase Edge Function (`Deno`)
- **Email Provider:** Resend API
- **Database Triggers:** Supabase Database Webhooks
- **Email Templates:** React Email (`.tsx`)

## 2. Prerequisites

Before you begin, ensure you have the following:

- A **Supabase Project** created.
- A **Resend Account** (a free account is sufficient).
- The project code cloned to your local machine.
- **Supabase CLI** installed in your project:
  ```bash
  npm install supabase --save-dev
  ```
  _(**Note:** All command line instructions will use `npx supabase ...` to run the locally installed CLI.)_

## 3. Configuration Steps

Configuration involves getting an API key from Resend and setting it up securely in your Supabase project.

### Step 1: Get Your Resend API Key

1.  Log in to your **Resend Dashboard**.
2.  Navigate to the **API Keys** section from the left-hand menu.
3.  Click **"Create API Key"**.
4.  Give it a descriptive name (e.g., `FutureProspect Dev Key`).
5.  Set the permission to **"Sending access"**.
6.  Click **"Create"**.
7.  **Immediately copy the API key** and store it somewhere safe. You will only see it once.

### Step 2: Set Supabase Secrets

The Edge Function needs secure access to several keys and URLs. These **must** be stored as secrets in your Supabase project.

You can do this in two ways: via the Supabase Dashboard or the CLI in your VSCode terminal.

#### A) Recommended Method: Using the Supabase Dashboard

1.  Go to your **Supabase Project Dashboard**.
2.  Navigate to **Project Settings** (the gear icon) > **Secrets**.
3.  Add the following three secrets:
    - **Name:** `RESEND_API_KEY`
      - **Value:** Paste the API key you copied from Resend.
    - **Name:** `SUPABASE_URL`
      - **Value:** Find this in your Supabase Dashboard under **Project Settings > API > Project URL**.
    - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
      - **Value:** Find this in your Supabase Dashboard under **Project Settings > API > Project API Keys** (use the `service_role` key).

#### B) Alternative Method: Using the CLI (in VSCode)

Open your terminal in the root of the project directory and run the following commands, replacing the placeholder values:

npx supabase secrets set RESEND_API_KEY your_resend_api_key_here
npx supabase secrets set SUPABASE_URL your_supabase_project_url_here
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY your_supabase_service_role_key_here```

### Step 3: Set Up the Database Function (RPC)

The Edge Function uses a PostgreSQL function to securely fetch the list of subscribed users.

1.  Go to your **Supabase Project Dashboard**.
2.  Navigate to the **SQL Editor** (the database icon).
3.  Click **`+ New query`**.
4.  Copy and paste the entire SQL script below and click **"RUN"**.

```sql
-- First, remove any old versions of the function to ensure a clean setup.
DROP FUNCTION IF EXISTS get_subscribed_emails();

-- Now, create the function with the correct permissions and return type.
CREATE OR REPLACE FUNCTION get_subscribed_emails()
RETURNS TABLE (email VARCHAR)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT u.email
  FROM auth.users u
  JOIN public.student_profiles sp ON u.id = sp.user_id
  WHERE sp.is_subscribed_to_notifications = TRUE;
END;
$$;
```

## 4. Local Development & Testing

For testing in a development environment without a custom domain.

- **"From" Address:** The function is hardcoded to send from `onboarding@resend.dev`. This is a requirement for Resend's free tier sandbox.
- **"To" Address Limitation:** The free tier will **only deliver emails to the email address you used to sign up for your Resend account.**

To receive a test email, you must ensure the following:

1.  In your `student_profiles` table, you have a test user.
2.  That user's `is_subscribed_to_notifications` column is set to `true`.
3.  The email for that user in the `auth.users` table is **exactly the same as your Resend login email**.

## 5. Going to Production

Before deploying to a live audience, you must complete these steps.

#### Step 1: Verify Your Domain in Resend

1.  In the Resend Dashboard, go to the **Domains** tab.
2.  Add your application's domain (e.g., `futureprospect.com`).
3.  Follow the instructions to add the provided DNS records to your domain provider (Vercel, GoDaddy, etc.).

#### Step 2: Update Production Values in the Code

In the file `supabase/functions/send-new-post-notification/index.ts`, update the following `// TODO:` sections:

1.  **Update the "From" Address:** Change the `from` field to use your newly verified domain.
    ```typescript
    // Change from:
    from: 'FutureProspect <onboarding@resend.dev>',
    // Change to:
    from: 'FutureProspect <notifications@your-verified-domain.com>',
    ```
2.  **Update the Application URL:** Change the `postUrl` variable to point to your live website.
    ```typescript
    // Change from:
    const postUrl = `http://localhost:3000/${tableName}/${postId}`;
    // Change to:
    const postUrl = `https://www.futureprospect.com/${tableName}/${postId}`;
    ```
3.  **(Optional) Update the Company Logo URL** for long-term stability.

#### Step 3: Re-deploy the Function

After updating the code, deploy the final version from your terminal:

npx supabase functions deploy send-new-post-notification --no-verify-jwt```

## 6. Troubleshooting

- **"I created a post but didn't get an email."**
  1.  **Check the Function Logs:** Go to `Supabase Dashboard > Edge Functions > send-new-post-notification > Logs`. Look for any errors.
  2.  **Check the Resend Dashboard:** Go to `Resend Dashboard > Emails`. See if the email was logged and what its status is ("Delivered", "Bounced", etc.).

- **"I see 'module not found' errors in VSCode."**
  1.  Ensure you have the official **Deno extension** installed and enabled for your workspace.
  2.  Ensure your root `tsconfig.json` file excludes the `supabase` folder to prevent conflicts:
      ```json
      "exclude": ["node_modules", "supabase"]
      ```
