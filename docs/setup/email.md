# Email setup

The student app sends email in three ways, all configured with environment variables in `.env.local` (never committed).

## 1. Gmail (server): application and workspace emails

`lib/email.ts` sends through a Gmail account with Nodemailer. Used for application confirmations, RSVP confirmations, alerts to companies, acceptance and rejection, payment receipts, blog feedback, and workspace emails (attendance reminders, task assignments, reports).

| Variable | Value |
| --- | --- |
| `GMAIL_USER` | The sending Gmail address |
| `GMAIL_APP_PASSWORD` | A Google **app password** (Google Account, Security, 2-Step Verification, App passwords). Not the normal password. |
| `ADMIN_EMAIL` | Receives admin copies, and marks the admin account in the app |

If either Gmail variable is missing, sending fails with `[EMAIL CONFIG ERROR]` in the server log. The request that triggered the email still succeeds.

## 2. EmailJS: welcome email and waitlists

### Server: welcome email after profile setup

`lib/emailjs.ts` (`sendWelcomeEmail`, called from `lib/actions/profile.actions.ts`).

| Variable | Value |
| --- | --- |
| `EMAILJS_SERVICE_ID` | EmailJS service |
| `EMAILJS_TEMPLATE_ID` | Template, default `zigex_dynamic` |
| `EMAILJS_PUBLIC_KEY` | Account public key |
| `EMAILJS_PRIVATE_KEY` | Account private key. **Server only: never prefix it with `NEXT_PUBLIC_`**, or it ships to every browser. |

The `zigex_dynamic` template receives: `to_email`, `to_name`, `subject`, `heading`, `message`, and optionally `cta_text`, `cta_link`, `footer_note`, `opportunity_title`, `opportunity_type`, `company_name`, `status_badge`, `status_color`, plus `brand_name`, `brand_color` and `year`.

### Browser: waitlists

These run in the browser, so they use the public key only.

| Variable | Used by | Template receives |
| --- | --- | --- |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Waitlists | |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Waitlists | |
| `NEXT_PUBLIC_EMAILJS_AI_WAITLIST_TEMPLATE_ID` | Zila AI "Notify me" (`components/zila/ZilaPage.tsx`) | `to_email`, `user_email`, `feature_name`, `year` |
| `NEXT_PUBLIC_EMAILJS_WAITLIST_TEMPLATE_ID` | Smart Apply waitlist (`app/api/waitlist/smart-apply/route.ts`). No page calls it today, so it can stay unset. | `to_email`, `user_email`, `opportunity_title`, `year` |

EmailJS only sends the email; it stores nothing. To know who joined a waitlist, CC a team address in the template, or move the waitlist to a backend endpoint.

## 3. Resend: contact page

`lib/actions/contact.actions.ts` sends the contact form through Resend.

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | Resend API key. Without it the form says the email service isn't configured. |
| `EMAIL_FROM` | Sender address on a domain verified in Resend (default `onboarding@resend.dev`, for testing only) |

## Checking it works

- **Gmail:** apply to an opportunity with a test account and check both inboxes (student and `ADMIN_EMAIL`).
- **Welcome:** finish profile setup with a new account.
- **Contact form:** send a message from the Contact page.
- **Waitlists:** press "Notify me when it's ready" on Zila AI.
