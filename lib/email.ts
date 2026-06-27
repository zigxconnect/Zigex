/**
 * ZIGEX Email Service - Nodemailer with Gmail
 * 100% Free, No Domain Required, Works Server-Side!
 */

"use server";

import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import AttendanceReminderEmail from '@/emails/AttendanceReminder';


// Configuration - Strip ALL whitespace from app password
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');

// Create transporter with optimized settings
const createTransporter = () => {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    const errorMsg = "[EMAIL CONFIG ERROR] GMAIL_USER or GMAIL_APP_PASSWORD is missing in .env.local";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log(`[EMAIL] Creating transporter for ${GMAIL_USER}...`);

  console.log(`[EMAIL] Creating transporter for: ${GMAIL_USER}`);

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Use secure port 465 for Gmail (SSL)
    secure: true,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
    // Connection settings for faster delivery
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

// Email template generator
const generateEmailHTML = (params: {
  heading: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  statusBadge?: string;
  statusColor?: string;
  opportunityTitle?: string;
  opportunityType?: string;
  companyName?: string;
}) => {
  const { heading, message, ctaText, ctaLink, statusBadge, statusColor, opportunityTitle, opportunityType, companyName } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #155DFC 0%, #1A3CB9 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">${companyName || 'SEED INC'}</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your Career Launch Platform</p>
            </td>
          </tr>

          ${statusBadge ? `
          <!-- Status Badge -->
          <tr>
            <td style="padding: 24px 40px 0; text-align: center;">
              <span style="display: inline-block; background-color: ${statusColor || '#3B82F6'}22; color: ${statusColor || '#3B82F6'}; padding: 8px 20px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
                ${statusBadge}
              </span>
            </td>
          </tr>
          ` : ''}

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                ${heading}
              </h2>
              
              ${opportunityTitle ? `
              <div style="background: #f8fafc; border-left: 4px solid #155DFC; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 12px 12px 0;">
                <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">${opportunityType || 'Opportunity'}</p>
                <p style="margin: 4px 0 0; color: #1a1a2e; font-size: 17px; font-weight: 700;">${opportunityTitle}</p>
                ${companyName ? `<p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">via ${companyName}</p>` : ''}
              </div>
              ` : ''}
              
              <div style="color: #475569; font-size: 15px; line-height: 1.7;">${message.replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
            </td>
          </tr>

          ${ctaText && ctaLink ? `
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${ctaLink}" style="display: inline-block; background: #155DFC; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 8px 20px rgba(21,93,252,0.25);">
                ${ctaText}
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 11px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                © ${new Date().getFullYear()} ${companyName || 'SEED INC'}
              </p>
              <p style="margin: 10px 0 0;">
                <a href="https://zigexconnect.com" style="color: #155DFC; text-decoration: none; font-size: 12px; font-weight: 800;">visit our website</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Generic notification email sender
 */
export const sendEmail = async (params: {
  to: string;
  subject: string;
  heading: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  statusBadge?: string;
  statusColor?: string;
  opportunityTitle?: string;
  opportunityType?: string;
  companyName?: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const html = generateEmailHTML(params);

  try {
    await transporter.sendMail({
      from: `"${params.companyName || "SEED INC"}" <${GMAIL_USER}>`,
      to: params.to,
      subject: params.subject,
      html: html,
    });
    console.log(`[EMAIL] Sent to ${params.to}: ${params.subject}`);
  } catch (error) {
    console.error("[EMAIL] Failed:", error);
    throw error;
  }
};

/**
 * Sends acceptance email to candidate with WhatsApp link and start date
 */
export const sendAcceptanceEmail = async (params: {
  email: string;
  name: string;
  opportunityTitle: string;
  opportunityType: string;
  companyName: string;
  whatsappGroupLink?: string;
  startDate?: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const whatsappMessage = params.whatsappGroupLink
    ? `\\n\\nTo begin your onboarding, meet your fellow team members, and get started, please join our official community group via the button below.`
    : `\\n\\nYou can view your application status and next steps on your dashboard.`;

  const html = generateEmailHTML({
    heading: `Congratulations, ${params.name}!`,
    message: `We are absolutely thrilled to inform you that you have been accepted into "${params.opportunityTitle}"! 🎉\\n\\nYou stood out amongst many applicants, and we can't wait to see what you achieve with us. This is a significant milestone in your professional journey.${whatsappMessage}`,
    ctaText: params.whatsappGroupLink ? "Join WhatsApp Community" : "Go to Dashboard",
    ctaLink: params.whatsappGroupLink || "https://zigexconnect.com/dashboard",
    statusBadge: "Selection Confirmed",
    statusColor: "#10b981",
    opportunityTitle: params.opportunityTitle,
    opportunityType: params.opportunityType,
    companyName: params.companyName
  });

  await transporter.sendMail({
    from: `"${params.companyName || "SEED INC"}" <${GMAIL_USER}>`,
    to: params.email,
    subject: `Welcome to the Program: ${params.opportunityTitle}!`,
    html
  });
};

/**
 * Sends a notification email to the company when a student submits a new application
 */
export const sendNewApplicationNotification = async (params: {
  companyEmail: string;
  companyName: string;
  studentName: string;
  studentEmail: string;
  opportunityTitle: string;
  opportunityType: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const html = generateEmailHTML({
    heading: `New Application Received`,
    message: `A new applicant has applied to your opportunity.\\n\\n👤 **Applicant:** ${params.studentName}\\n📧 **Email:** ${params.studentEmail}\\n\\nPlease review their application on the admin dashboard.`,
    ctaText: "Review Applications",
    ctaLink: "https://zigexconnect.com/admin/applicants",
    statusBadge: "New Application",
    statusColor: "#3B82F6",
    opportunityTitle: params.opportunityTitle,
    opportunityType: params.opportunityType,
    companyName: params.companyName
  });

  await transporter.sendMail({
    from: `"Zigex Notifications" <${GMAIL_USER}>`,
    to: params.companyEmail,
    subject: `📩 New Application: ${params.studentName} applied to ${params.opportunityTitle}`,
    html
  });
};

/**
 * Sends rejection email to candidate
 */
export const sendRejectionEmail = async (params: {
  email: string;
  name: string;
  opportunityTitle: string;
  opportunityType: string;
  companyName: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const html = generateEmailHTML({
    heading: `Hi ${params.name},`,
    message: `Thank you for your interest in the "${params.opportunityTitle}". After careful consideration, we have decided not to move forward with your application at this time.\n\nPlease don't be discouraged—we receive many high-quality applications and encourage you to explore other opportunities on our platform that match your skills.`,
    ctaText: "Explore More Opportunities",
    ctaLink: "https://zigexconnect.com/feed",
    statusBadge: "Appication Update",
    statusColor: "#ef4444",
    opportunityTitle: params.opportunityTitle,
    opportunityType: params.opportunityType,
    companyName: params.companyName
  });

  await transporter.sendMail({
    from: `"${params.companyName || "SEED INC"}" <${GMAIL_USER}>`,
    to: params.email,
    subject: `Update regarding your application for ${params.opportunityTitle}`,
    html
  });
};

/**
 * Sends application confirmation to candidate
 */
export const sendApplicationConfirmation = async (params: {
  email: string;
  name: string;
  opportunityTitle: string;
  opportunityType: string;
  companyName: string;
  isRSVP?: boolean;
}) => {
  const firstName = params.name.split(" ")[0];
  await sendEmail({
    to: params.email,
    subject: params.isRSVP
      ? `🎟️ RSVP Confirmed: ${params.opportunityTitle}`
      : `✅ Application Received: ${params.opportunityTitle}`,
    heading: params.isRSVP ? "You're In!" : "Application Received",
    message: params.isRSVP
      ? `Hey ${firstName}! 🎉\n\nYour spot for "${params.opportunityTitle}" by ${params.companyName} is confirmed! We can't wait to see you there.`
      : `Hey ${firstName}! 👋\n\nWe've received your application for "${params.opportunityTitle}" at ${params.companyName}. It's now being reviewed by the team.`,
    opportunityTitle: params.opportunityTitle,
    opportunityType: params.opportunityType,
    companyName: params.companyName,
    statusBadge: params.isRSVP ? "CONFIRMED" : "UNDER REVIEW",
    statusColor: params.isRSVP ? "#10B981" : "#3B82F6",
    ctaText: "View My Applications",
    ctaLink: "https://zigexconnect.com/dashboard/applied-internships",
  });
};

/**
 * Sends event RSVP confirmation
 */
export const sendEventRSVPConfirmation = async (params: {
  email: string;
  name: string;
  eventName: string;
  companyName: string;
  eventDate: string;
  eventLocation: string;
  eventRequirements?: string;
}) => {
  await sendEmail({
    to: params.email,
    subject: `🎟️ RSVP Confirmed: ${params.eventName}`,
    heading: "Your spot is reserved!",
    message: `Hi ${params.name},\n\nYour RSVP for **${params.eventName}** has been confirmed.\n\n📅 **Date:** ${params.eventDate}\n📍 **Location:** ${params.eventLocation}\n\nWe look forward to seeing you there!`,
    opportunityTitle: params.eventName,
    opportunityType: "Event",
    companyName: params.companyName,
    ctaText: "View Event Details",
    ctaLink: `https://zigexconnect.com/events`,
  });
  return { success: true };
};

/**
 * Sends a welcome email
 */
export const sendWelcomeEmail = async (params: {
  email: string,
  name: string,
  opportunityTitle?: string,
  companyName?: string,
  customMessage?: string,
  communityLink?: string
}) => {
  const { email, name, opportunityTitle, companyName, customMessage, communityLink } = params;
  const firstName = name.split(" ")[0];
  await sendEmail({
    to: email,
    subject: `🚀 Welcome to ${companyName || 'SEED INC'}, ${firstName}!`,
    heading: "Welcome aboard!",
    message: customMessage || `Hey ${firstName}! 👋\n\nWelcome to ${companyName || 'SEED INC'}. We're excited to have you as part of our platform.${opportunityTitle ? ` You've joined the "${opportunityTitle}" program at ${companyName}.` : ''}`,
    ctaText: communityLink ? "Join Our Community" : "Go to Dashboard",
    ctaLink: communityLink || "https://zigexconnect.com/dashboard",
  });
};

/**
 * Sends an alert to admins/companies about an application status change
 */
export const sendApplicationAlert = async (params: {
  adminEmail: string;
  studentName: string;
  studentEmail: string;
  opportunityTitle: string;
  opportunityType: string;
  status: string;
  companyName: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const html = generateEmailHTML({
    heading: `Application Status Alert`,
    message: `Candidate **${params.studentName}** (${params.studentEmail}) has been moved to state: **${params.status.toUpperCase()}** for the opportunity "${params.opportunityTitle}".`,
    ctaText: "Review in Dashboard",
    ctaLink: "https://zigexconnect.com/admin/applicants",
    statusBadge: `Status: ${params.status}`,
    opportunityTitle: params.opportunityTitle,
    opportunityType: params.opportunityType,
    companyName: params.companyName
  });

  // Handle multiple emails in adminEmail string
  const recipients = params.adminEmail.split(',').map(e => e.trim());

  await transporter.sendMail({
    from: `"SEED INC ALERTS" <${GMAIL_USER}>`,
    to: recipients,
    subject: `[ALERT] ${params.status.toUpperCase()}: ${params.studentName}`,
    html
  });
};

/**
 * Sends a professional payment receipt email
 */
export const sendPaymentReceiptEmail = async (params: {
  email: string;
  name: string;
  programTitle: string;
  amount: number;
  date: string;
  ref: string;
  month?: string;
  companyName?: string;
  companyLogo?: string;
  companyAddress?: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  // Specific override for "Weekend of Code" as requested
  const finalAmount = params.programTitle.toLowerCase().includes("weekend of code")
    ? 10000
    : params.amount;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; }
    .receipt-card { background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .header { background: #000000; padding: 40px; text-align: center; }
    .body { padding: 40px; }
    .meta-grid { margin-bottom: 30px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 20px; }
    .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; margin-bottom: 4px; }
    .value { font-size: 15px; color: #0f172a; font-weight: 700; margin-bottom: 20px; }
    .item-box { background: #f1f5f9; padding: 24px; border-radius: 16px; margin-bottom: 30px; }
    .total-section { text-align: right; }
    .total-amount { font-size: 32px; font-weight: 950; color: #000000; }
    .stamp { display: inline-block; border: 3px solid #10b981; color: #10b981; padding: 8px 16px; border-radius: 8px; font-weight: 900; font-size: 16px; text-transform: uppercase; transform: rotate(-5deg); margin-top: 30px; }
    .footer { text-align: center; padding-top: 40px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="receipt-card">
      <div class="header">
        <img src="${params.companyLogo || 'https://zigexconnect.com/seedLogo.png'}" alt="${params.companyName || 'SEED'}" style="height: 50px; margin-bottom: 15px;">
        <h1 style="color: white; margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">Payment Receipt</h1>
      </div>
      
      <div class="body">
        <div class="meta-grid">
          <div class="label">Candidate Name</div>
          <div class="value">${params.name}</div>
          
          <div class="label">Date of Payment</div>
          <div class="value">${new Date(params.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          
          <div class="label">Transaction Ref</div>
          <div class="value" style="font-family: monospace;">${params.ref}</div>
        </div>

        <div class="item-box">
          <div class="label">Description</div>
          <div style="font-size: 18px; font-weight: 800; color: #000000; margin: 5px 0;">${params.programTitle}</div>
          <div style="color: #64748b; font-size: 14px;">${params.month ? `Current Term: ${params.month}` : 'Program Enrollment'}</div>
        </div>

        <div class="total-section">
          <div class="label">Net Amount Paid</div>
          <div class="total-amount">${finalAmount.toLocaleString()} XAF</div>
        </div>

        <div style="text-align: center;">
          <div class="stamp">Verified & Paid</div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p style="font-weight: 700; color: #64748b; margin-bottom: 4px;">${params.companyName || 'SEED INC'} • GLOBAL TECH CAREERS</p>
      <p>© ${new Date().getFullYear()} ${params.companyName || 'SEED INC'}. ${params.companyAddress || 'Bamenda, Cameroon'}</p>
    </div>
  </div>
</body>
</html>
    `;

  await transporter.sendMail({
    from: `"${params.companyName || "SEED INC"} Payments" <${GMAIL_USER}>`,
    to: params.email,
    subject: `Payment Receipt: ${params.programTitle}`,
    html
  });
};

/**
 * Sends blog post feedback/comment email to Zigex admin
 */
export const sendBlogFeedbackEmail = async (params: {
  postTitle: string;
  postSlug: string;
  senderName: string;
  senderEmail: string;
  message: string;
  feedbackType?: 'comment' | 'suggestion' | 'question' | 'issue';
}) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[EMAIL] Blog feedback not sent - email not configured");
    return { success: false, error: "Email not configured" };
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'fonyuyjudegita@gmail.com';
  const feedbackTypeLabel = params.feedbackType
    ? params.feedbackType.charAt(0).toUpperCase() + params.feedbackType.slice(1)
    : 'Feedback';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 32px 40px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                📰 Blog ${feedbackTypeLabel}
              </h1>
              <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 13px; font-weight: 500;">
                New feedback on Zigex News
              </p>
            </td>
          </tr>

          <!-- Post Info -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <div style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 12px 12px 0;">
                <p style="margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px;">Article</p>
                <p style="margin: 6px 0 0; color: #0f172a; font-size: 16px; font-weight: 700;">${params.postTitle}</p>
                <a href="https://zigexconnect.com/dashboard/blog/${params.postSlug}" style="display: inline-block; margin-top: 10px; color: #3b82f6; font-size: 12px; font-weight: 600; text-decoration: none;">View Article →</a>
              </div>
            </td>
          </tr>

          <!-- Sender Info -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <table width="100%" style="background: #fafafa; border-radius: 16px; padding: 20px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 4px; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">From</p>
                    <p style="margin: 0; color: #0f172a; font-size: 15px; font-weight: 700;">${params.senderName}</p>
                    <p style="margin: 4px 0 0; color: #3b82f6; font-size: 13px;">${params.senderEmail}</p>
                  </td>
                  <td style="padding: 16px; text-align: right;">
                    <span style="display: inline-block; background: ${params.feedbackType === 'issue' ? '#fef2f2' :
      params.feedbackType === 'question' ? '#fef9c3' :
        params.feedbackType === 'suggestion' ? '#f0fdf4' : '#eff6ff'
    }; color: ${params.feedbackType === 'issue' ? '#dc2626' :
      params.feedbackType === 'question' ? '#ca8a04' :
        params.feedbackType === 'suggestion' ? '#16a34a' : '#2563eb'
    }; padding: 6px 14px; border-radius: 50px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                      ${feedbackTypeLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 24px 40px;">
              <p style="margin: 0 0 12px; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px;">Message</p>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
                <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${params.message}</p>
              </div>
            </td>
          </tr>

          <!-- Reply Button -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="mailto:${params.senderEmail}?subject=Re: Your feedback on ${encodeURIComponent(params.postTitle)}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                Reply to ${params.senderName.split(' ')[0]}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                This feedback was submitted via <strong>Zigex News</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"Zigex News Feedback" <${GMAIL_USER}>`,
      to: adminEmail,
      replyTo: params.senderEmail,
      subject: `[${feedbackTypeLabel}] ${params.postTitle} - from ${params.senderName}`,
      html
    });
    console.log(`[EMAIL] Blog feedback sent from ${params.senderEmail} about "${params.postTitle}"`);
    return { success: true };
  } catch (error: any) {
    console.error("[EMAIL] Blog feedback failed:", error);
    return { success: false, error: error.message };
  }
};


/**
 * Sends a verification email for new signups
 */
export const sendVerificationEmail = async (params: {
  email: string;
  name: string;
  link: string;
}) => {
  console.log(`[EMAIL] Attempting to send verification email to: ${params.email}`);

  const transporter = createTransporter();
  if (!transporter) {
    console.error("[EMAIL] Transporter not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD env vars.");
    throw new Error("Email service not configured");
  }

  const html = generateEmailHTML({
    heading: "Verify Your Account",
    message: `Hi ${params.name},\n\nWelcome to Zigex! Please verify your email address to complete your account setup and start applying to opportunities.\n\nIf you didn't create this account, you can safely ignore this email.`,
    ctaText: "Verify My Email",
    ctaLink: params.link,
    statusBadge: "Action Required",
    statusColor: "#155DFC",
    companyName: "Zigex"
  });

  try {
    const result = await transporter.sendMail({
      from: `"Zigex" <${GMAIL_USER}>`,
      to: params.email,
      subject: "🚀 Verify your Zigex account",
      html
    });
    console.log(`[EMAIL] Verification email sent successfully to ${params.email}. MessageId: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error(`[EMAIL] Failed to send verification email to ${params.email}:`, error.message);
    throw error;
  }
};

/**
 * Sends a premium, Duolingo-inspired Supervisor Welcome Email
 */
export const sendSupervisorWelcomeEmail = async (params: {
  email: string;
  name: string;
  companyName: string;
  dashboardLink: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const firstName = params.name.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Zigex!</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
    body { margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'Nunito', sans-serif; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f7f7f7; padding-bottom: 60px; }
    .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 20px; overflow: hidden; border: 2px solid #e5e5e5; }
    .header { background-color: #155DFC; padding: 40px 20px; text-align: center; }
    .content { padding: 40px 30px; text-align: center; }
    .button { display: inline-block; background-color: #58cc02; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 16px; font-weight: 800; font-size: 18px; text-transform: uppercase; letter-spacing: 0.8px; box-shadow: 0 4px 0 #46a302; transition: all 0.2s; }
    .button:hover { transform: translateY(2px); box-shadow: 0 2px 0 #46a302; }
    .card { background-color: #f0f9ff; border: 2px solid #155DFC; border-radius: 16px; padding: 20px; margin: 20px 0; text-align: left; }
    .info-icon { font-size: 24px; display: inline-block; vertical-align: top; margin-top: 2px; }
    .footer-text { color: #888888; font-size: 11px; font-weight: 700; text-transform: uppercase; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" cellspacing="0" cellpadding="0">
      
      <!-- Colorful Header -->
      <tr>
        <td class="header">
          <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-shadow: 0 2px 0 rgba(0,0,0,0.1);">You're In! 🎉</h1>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td class="content">
          
           <!-- Fun Bubble -->
           <div style="margin-bottom: 25px;">
             <span style="display: inline-block; background-color: #ffc800; color: #734b00; padding: 8px 16px; border-radius: 50px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 3px 0 #eebb00;">New Role Unlocked</span>
           </div>

          <h2 style="color: #3c3c3c; margin: 0 0 15px; font-weight: 800; font-size: 24px;">Congratulations, ${firstName}!</h2>
          
          <p style="color: #777777; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            You've been officially added as a <strong>Supervisor</strong> on the Zigex Platform by <strong style="color: #155DFC;">${params.companyName}</strong>.
          </p>

          <!-- Info Card -->
          <div class="card">
            <table width="100%">
              <tr>
                <td width="40" valign="top">
                  <span class="info-icon">🛡️</span>
                </td>
                <td>
                  <p style="margin: 0; font-weight: 800; color: #155DFC; font-size: 15px;">What's Next?</p>
                  <p style="margin: 5px 0 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                    Visit your dashboard to see your assigned interns, review their logs, and guide them to success.
                  </p>
                </td>
              </tr>
            </table>
          </div>

          <!-- Big CTA Button -->
          <div style="margin: 35px 0;">
            <a href="${params.dashboardLink}" class="button">
              View My Dashboard
            </a>
          </div>

          <p style="color: #afafaf; font-size: 14px; margin-top: 30px;">
            Happy Mentoring,<br>
            <strong>The Zigex Team</strong>
          </p>

        </td>
      </tr>
      
      <!-- Footer Stripe -->
      <tr>
        <td style="background-color: #e5e5e5; padding: 15px; text-align: center;">
          <p class="footer-text">© ${new Date().getFullYear()} Zigex Platform</p>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"Zigex Supervisor Team" <${GMAIL_USER}>`,
      to: params.email,
      subject: `🎉 Congratulations! You're now a Supervisor at ${params.companyName}`,
      html
    });
    console.log(`[EMAIL] Supervisor welcome sent to ${params.email}. MessageId: ${result.messageId}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[EMAIL] Failed to send supervisor welcome to ${params.email}:`, error.message);
    throw error;
  }
};

/**
 * Sends a premium notification for new student assignment
 */
export const sendSupervisorAssignmentEmail = async (params: {
  email: string;
  name: string;
  studentName: string;
  programTitle: string;
  companyName: string;
  dashboardLink: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const firstName = params.name.split(" ")[0];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
    body { margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'Nunito', sans-serif; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f7f7f7; padding-bottom: 60px; }
    .main-table { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 24px; overflow: hidden; border: 2px solid #e5e5e5; }
    .header { background-color: #1a1a2e; padding: 40px 20px; text-align: center; }
    .content { padding: 40px 30px; text-align: center; }
    .button { display: inline-block; background-color: #155DFC; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 16px; font-weight: 800; font-size: 18px; text-transform: uppercase; letter-spacing: 0.8px; box-shadow: 0 4px 0 #0d3eb3; transition: all 0.2s; }
    .card { background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 20px; padding: 25px; margin: 25px 0; text-align: left; }
    .info-badge { display: inline-block; background-color: #10b98122; color: #10b981; padding: 6px 14px; border-radius: 50px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" cellspacing="0" cellpadding="0">
      <tr>
        <td class="header">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">New Assignment 📋</h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          <h2 style="color: #1e293b; margin: 0 0 15px; font-weight: 800; font-size: 22px;">Hello ${firstName}!</h2>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
            You have been assigned as the official supervisor for a new student on the Zigex Platform.
          </p>

          <div class="card">
            <span class="info-badge">Assignment Details</span>
            <p style="margin: 0; font-size: 14px; color: #64748b;">Student Name</p>
            <p style="margin: 4px 0 20px; font-size: 18px; font-weight: 800; color: #1e293b;">${params.studentName}</p>

            <p style="margin: 0; font-size: 14px; color: #64748b;">Program</p>
            <p style="margin: 4px 0 20px; font-size: 16px; font-weight: 700; color: #1e293b;">${params.programTitle}</p>

            <p style="margin: 0; font-size: 14px; color: #64748b;">Organization</p>
            <p style="margin: 4px 0 0; font-size: 16px; font-weight: 700; color: #155DFC;">${params.companyName}</p>
          </div>

          <div style="margin: 35px 0;">
            <a href="${params.dashboardLink}" class="button">Access Supervisor Hub</a>
          </div>

          <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
            Thank you for helping shape the next generation of tech talent.<br>
            <strong>The Zigex Team</strong>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase;">© ${new Date().getFullYear()} Zigex Connect</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"Zigex Supervisor Alerts" <${GMAIL_USER}>`,
      to: params.email,
      subject: `📋 New Student Assigned: ${params.studentName}`,
      html
    });
  } catch (error: any) {
    console.error(`[EMAIL] Failed to send assignment email: `, error.message);
  }
};

/**
 * Sends an attendance reminder email via Gmail/Nodemailer
 */
export const sendAttendanceReminderEmail = async (params: {
  email: string;
  name: string;
  interns: { name: string }[];
  dashboardLink: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    const html = await render(AttendanceReminderEmail({
      supervisorName: params.name,
      interns: params.interns,
      dashboardLink: params.dashboardLink
    }));

    await transporter.sendMail({
      from: `"Zigex Supervisor Hub" <${GMAIL_USER}>`,
      to: params.email,
      subject: `⏰ Attendance Reminder: Don't forget to mark your interns today`,
      html
    });
    console.log(`[EMAIL] Attendance reminder sent via Gmail to ${params.email}`);
  } catch (error) {
    console.error("[EMAIL] Failed to send attendance reminder via Gmail:", error);
    throw error;
  }
};



/**
 * Sends a task assignment notification to a student.
 */
export const sendTaskAssignmentEmail = async (params: {
  email: string;
  name: string;
  taskTitle: string;
  taskDescription: string;
  dueDate?: string;
  priority?: string;
  supervisorName: string;
}) => {
  const { email, name, taskTitle, taskDescription, dueDate, priority, supervisorName } = params;

  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("[EMAIL] Task notification not sent — email not configured.");
      return;
    }

    const html = generateEmailHTML({
      heading: `New Task Assigned: ${taskTitle}`,
      message: `
        Hello ${name}, <br/><br/>
        Your supervisor, <strong>${supervisorName}</strong>, has assigned you a new task:
        <br/><br/>
        <strong>Task:</strong> ${taskTitle}<br/>
        <strong>Description:</strong> ${taskDescription}<br/>
        ${dueDate ? `<strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}<br/>` : ""}
        ${priority ? `<strong>Priority:</strong> ${priority.toUpperCase()}<br/>` : ""}
        <br/>
        Please log in to your dashboard to view the details and track your progress.
      `,
      ctaText: "VIEW DASHBOARD",
      ctaLink: "https://zigexconnect.com/intern/workspace",
      statusBadge: priority?.toUpperCase() || "NEW TASK",
      statusColor: priority === "high" ? "#EF4444" : "#3B82F6",
      opportunityTitle: taskTitle,
      opportunityType: "Task Assignment",
      companyName: "SEED INC"
    });

    await transporter.sendMail({
      from: `"${supervisorName} via SEED INC" <${GMAIL_USER}>`,
      to: email,
      subject: `[Task Notification] ${taskTitle}`,
      html: html,
    });

    console.log(`[EMAIL] Task notification sent to ${email}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send task notification to ${email}: `, error);
  }
};



/**
 * Sends a notification to the supervisor when an intern submits a daily report.
 */
export const sendReportSubmissionEmail = async (params: {
  email: string;
  supervisorName: string;
  studentName: string;
  reportDate: string;
  reportSummary: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const html = generateEmailHTML({
    heading: "New Report Submitted",
    message: `Hi ${params.supervisorName}, <br/><br/>${params.studentName} has just submitted their daily report for ${params.reportDate}.<br/><br/>Report Preview:<br/>"${params.reportSummary.length > 150 ? params.reportSummary.substring(0, 150) + "..." : params.reportSummary}"<br/><br/>Please review and confirm this report in your dashboard.`,
    ctaText: "Review Report",
    ctaLink: "https://zigexconnect.com/supervisor",
    statusBadge: "NEW SUBMISSION",
    statusColor: "#3B82F6",
    companyName: "SEED INC"
  });

  try {
    await transporter.sendMail({
      from: `"SEED INC Notifications" <${GMAIL_USER}>`,
      to: params.email,
      subject: `New Report: ${params.studentName} (${params.reportDate})`,
      html
    });
    console.log(`[EMAIL] Report notification sent to ${params.email}`);
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send report notification to ${params.email}: `, error);
  }
};
