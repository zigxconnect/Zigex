/**
 * ZIGEX Email Service - Nodemailer with Gmail
 * 100% Free, No Domain Required, Works Server-Side!
 * 
 * Setup:
 * 1. Go to https://myaccount.google.com/apppasswords
 * 2. Create an App Password for "Mail"
 * 3. Add to .env.local:
 *    GMAIL_USER=your.email@gmail.com
 *    GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 */

import nodemailer from 'nodemailer';

// Configuration
const GMAIL_USER = process.env.GMAIL_USER;
// Automatically strip spaces from the password if present
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');

// Create transporter
const createTransporter = () => {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn("[EMAIL] Not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local");
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
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
        <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #155DFC 0%, #1A3CB9 100%); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">ZIGEX</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your Career Launch Platform</p>
            </td>
          </tr>

          ${statusBadge ? `
          <!-- Status Badge -->
          <tr>
            <td style="padding: 24px 40px 0; text-align: center;">
              <span style="display: inline-block; background-color: ${statusColor || '#3B82F6'}22; color: ${statusColor || '#3B82F6'}; padding: 8px 20px; border-radius: 50px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                ${statusBadge}
              </span>
            </td>
          </tr>
          ` : ''}

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px; font-size: 24px; font-weight: 700;">
                ${heading}
              </h2>
              
              ${opportunityTitle ? `
              <div style="background: #f8fafc; border-left: 4px solid #155DFC; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${opportunityType || 'Opportunity'}</p>
                <p style="margin: 4px 0 0; color: #1a1a2e; font-size: 18px; font-weight: 600;">${opportunityTitle}</p>
                ${companyName ? `<p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">at ${companyName}</p>` : ''}
              </div>
              ` : ''}
              
              <div style="color: #475569; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
            </td>
          </tr>

          ${ctaText && ctaLink ? `
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 32px; text-align: center;">
              <a href="${ctaLink}" style="display: inline-block; background: linear-gradient(135deg, #155DFC 0%, #1A3CB9 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 16px rgba(21,93,252,0.3);">
                ${ctaText}
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ZIGEX. Empowering Cameroon's Future Leaders.
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
  `;
};

// Core send function
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
}): Promise<{ success: boolean; error?: string }> => {
  const transporter = createTransporter();

  if (!transporter) {
    return { success: false, error: "NOT_CONFIGURED" };
  }

  console.log(`[EMAIL] Sending "${params.subject}" to ${params.to}`);

  try {
    const html = generateEmailHTML(params);

    await transporter.sendMail({
      from: `"ZIGEX" <${GMAIL_USER}>`,
      to: params.to,
      subject: params.subject,
      html,
    });

    console.log(`[EMAIL] ✅ Email sent successfully to ${params.to}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[EMAIL] ❌ Failed:`, error.message);
    return { success: false, error: error.message };
  }
};

// ========================================
// PRE-BUILT EMAIL FUNCTIONS
// ========================================

/**
 * Send Application Confirmation
 */
export const sendApplicationConfirmation = async (params: {
  email: string;
  name: string;
  opportunityTitle: string;
  opportunityType: string;
  companyName: string;
  isRSVP?: boolean;
}) => {
  const { email, name, opportunityTitle, opportunityType, companyName, isRSVP } = params;
  const firstName = name.split(" ")[0];

  return sendEmail({
    to: email,
    subject: isRSVP
      ? `🎟️ RSVP Confirmed: ${opportunityTitle}`
      : `✅ Application Received: ${opportunityTitle}`,
    heading: isRSVP ? "You're In!" : "Application Received",
    message: isRSVP
      ? `Hey ${firstName}! 🎉\n\nYour spot for "${opportunityTitle}" by ${companyName} is confirmed! We can't wait to see you there.\n\nKeep an eye on your inbox for event details and reminders.`
      : `Hey ${firstName}! 👋\n\nWe've received your application for "${opportunityTitle}" at ${companyName}. It's now being reviewed by the team.\n\nWe'll notify you as soon as there's an update. Good luck! 🚀`,
    opportunityTitle,
    opportunityType,
    companyName,
    statusBadge: isRSVP ? "CONFIRMED" : "UNDER REVIEW",
    statusColor: isRSVP ? "#10B981" : "#3B82F6",
    ctaText: "View My Applications",
    ctaLink: "https://zigex.online/dashboard/applied-internships",
  });
};

/**
 * Send Acceptance Email
 */
export const sendAcceptanceEmail = async (params: {
  email: string;
  name: string;
  opportunityTitle: string;
  opportunityType: string;
  companyName: string;
  whatsappGroupLink?: string;
}) => {
  const { email, name, opportunityTitle, opportunityType, companyName, whatsappGroupLink } = params;
  const firstName = name.split(" ")[0];

  return sendEmail({
    to: email,
    subject: `🎉 Congratulations! You've been accepted to ${opportunityTitle}`,
    heading: "You're Accepted! 🎉",
    message: `Congratulations ${firstName}! 🎊\n\nWe're thrilled to inform you that you've been ACCEPTED for "${opportunityTitle}" at ${companyName}!\n\nThis is a huge milestone, and we're excited to have you on board. Here's what happens next:\n\n1. Join the official WhatsApp group for updates\n2. Check your email for onboarding details\n3. Prepare to learn and grow!\n\nWelcome to the family! 🚀`,
    opportunityTitle,
    opportunityType,
    companyName,
    statusBadge: "ACCEPTED",
    statusColor: "#10B981",
    ctaText: whatsappGroupLink ? "Join WhatsApp Group" : "View Dashboard",
    ctaLink: whatsappGroupLink || "https://zigex.online/dashboard",
  });
};

/**
 * Send Rejection Email
 */
export const sendRejectionEmail = async (params: {
  email: string;
  name: string;
  opportunityTitle: string;
  opportunityType: string;
  companyName: string;
}) => {
  const { email, name, opportunityTitle, opportunityType, companyName } = params;
  const firstName = name.split(" ")[0];

  return sendEmail({
    to: email,
    subject: `Update on your ${opportunityType} application`,
    heading: "Application Update",
    message: `Hi ${firstName},\n\nThank you for your interest in "${opportunityTitle}" at ${companyName}.\n\nAfter careful consideration, we've decided not to move forward with your current application for this position.\n\nHowever, we encourage you to **Reapply**! We've removed your current application from our records so you can update your profile, polish your resume, and submit a fresh application.\n\nSometimes a few small tweaks make all the difference. We'd love to see you try again!\n\nBest of luck! 💪`,
    opportunityTitle,
    opportunityType,
    companyName,
    statusBadge: "PLEASE REAPPLY",
    statusColor: "#EAB308",
    ctaText: "Reapply Now",
    ctaLink: "https://zigex.online/feed",
  });
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (params: {
  email: string;
  name: string;
  communityLink?: string;
}) => {
  const { email, name, communityLink } = params;
  const firstName = name.split(" ")[0];

  return sendEmail({
    to: email,
    subject: `🚀 Welcome to ZIGEX, ${firstName}!`,
    heading: "Welcome to ZIGEX! 🎉",
    message: `Hey ${firstName}! 👋\n\nWelcome to ZIGEX – Cameroon's premier platform for students seeking internships, programs, and career opportunities!\n\nHere's what you can do now:\n\n🎯 Complete your profile to stand out\n🔍 Browse internships, programs & events\n🤝 Connect with like-minded students\n💡 Get AI-powered career guidance\n\nYour journey to career success starts NOW!\n\nLet's build something amazing together. 🚀`,
    statusBadge: "NEW MEMBER",
    statusColor: "#155DFC",
    ctaText: communityLink ? "Join Our Community" : "Complete Your Profile",
    ctaLink: communityLink || "https://zigex.online/profile/create",
  });
};

/**
 * Send Admin/Company Alert
 */
export const sendApplicationAlert = async (params: {
  adminEmail: string;
  studentName: string;
  studentEmail: string;
  opportunityTitle: string;
  opportunityType: string;
  status: string;
  companyName?: string;
}) => {
  const { adminEmail, studentName, studentEmail, opportunityTitle, opportunityType, status, companyName } = params;

  return sendEmail({
    to: adminEmail,
    subject: `📋 [${status.toUpperCase()}] ${studentName} - ${opportunityTitle}`,
    heading: "New Application Activity",
    message: `A new application event has occurred:\n\n👤 Student: ${studentName}\n📧 Email: ${studentEmail}\n📌 Opportunity: ${opportunityTitle}\n🏢 Company: ${companyName || "ZIGEX"}\n📊 Type: ${opportunityType}\n🔄 Status: ${status.toUpperCase()}\n\nLog in to the admin dashboard to review and take action.`,
    opportunityTitle,
    opportunityType,
    companyName: companyName || "ZIGEX",
    statusBadge: status.toUpperCase(),
    statusColor: status === "pending" ? "#F59E0B" : (status === "accepted" || status === "rsvp_confirmed") ? "#10B981" : "#6B7280",
    ctaText: "View in Dashboard",
    ctaLink: "https://zigex.online/dashboard/admin/applicants",
  });
};

/**
 * Send Event RSVP Confirmation
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
  const { email, name, eventName, companyName, eventDate, eventLocation, eventRequirements } = params;
  const firstName = name.split(" ")[0];

  const requirementsHtml = eventRequirements
    ? `\n\n📌 **Requirements / What to Bring:**\n${eventRequirements}`
    : "";

  return sendEmail({
    to: email,
    subject: `🎟️ RSVP Confirmed: ${eventName}`,
    heading: "You're Confirmed! 🎟️",
    message: `Hi ${firstName}! 👋\n\nYour spot for **${eventName}** by ${companyName} is officially confirmed.\n\nHere are the details you need:\n\n📅 **Date:** ${eventDate}\n📍 **Location:** ${eventLocation}${requirementsHtml}\n\nWe can't wait to see you there!`,
    opportunityTitle: eventName,
    opportunityType: "Event",
    companyName,
    statusBadge: "CONFIRMED",
    statusColor: "#10B981",
    ctaText: "View My Events",
    ctaLink: "https://zigex.online/dashboard/applied-internships",
  });
};
