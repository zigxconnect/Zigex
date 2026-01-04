/**
 * ZIGEX Email Service - Nodemailer with Gmail
 * 100% Free, No Domain Required, Works Server-Side!
 */

import nodemailer from 'nodemailer';

// Configuration
const GMAIL_USER = process.env.GMAIL_USER;
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
        <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
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
              
              <div style="color: #475569; font-size: 15px; line-height: 1.7;">${message.replace(/\n/g, '<br/>')}</div>
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
                © ${new Date().getFullYear()} ZIGEX CONNECT
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
 * Sends acceptance email to candidate
 */
export const sendAcceptanceEmail = async (params: {
  email: string;
  name: string;
  opportunityTitle: string;
  opportunityType: string;
  companyName: string;
  whatsappGroupLink?: string;
}) => {
  const transporter = createTransporter();
  if (!transporter) return;

  const html = generateEmailHTML({
    heading: `Congratulations, ${params.name}!`,
    message: `We are thrilled to inform you that your application for "${params.opportunityTitle}" has been accepted! This is a significant milestone in your professional journey.\n\nTo begin your onboarding and meet your fellow cohort members, please join our official community group via the button below.`,
    ctaText: "Join WhatsApp Community",
    ctaLink: params.whatsappGroupLink || "https://zigexconnect.com/dashboard",
    statusBadge: "Selection Confirmed",
    statusColor: "#10b981",
    opportunityTitle: params.opportunityTitle,
    opportunityType: params.opportunityType,
    companyName: params.companyName
  });

  await transporter.sendMail({
    from: `"ZIGEX" <${GMAIL_USER}>`,
    to: params.email,
    subject: `Welcome to the Program: ${params.opportunityTitle}!`,
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
    from: `"ZIGEX" <${GMAIL_USER}>`,
    to: params.email,
    subject: `Update regarding your application for ${params.opportunityTitle}`,
    html
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
    from: `"ZIGEX ALERTS" <${GMAIL_USER}>`,
    to: recipients,
    subject: `[ALERT] ${params.status.toUpperCase()}: ${params.studentName}`,
    html
  });
};
