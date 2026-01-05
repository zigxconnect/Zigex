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
    @media print {
      body { background: white !important; padding: 0 !important; }
      .no-print { display: none !important; }
      .receipt-card { border: none !important; box-shadow: none !important; }
    }
    .receipt-card { 
      max-width: 500px; 
      margin: 0 auto; 
      background: #ffffff; 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .receipt-header {
      background: #0f172a;
      color: white;
      padding: 30px;
      text-align: center;
    }
    .receipt-body {
      padding: 40px;
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(16, 185, 129, 0.05);
      z-index: 0;
      pointer-events: none;
      white-space: nowrap;
    }
    .meta-grid {
      display: table;
      width: 100%;
      margin-bottom: 30px;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 20px;
    }
    .meta-col {
      display: table-cell;
      width: 50%;
    }
    .label {
      font-size: 10px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      margin: 0 0 4px 0;
    }
    .value {
      font-size: 14px;
      color: #1e293b;
      font-weight: 700;
      margin: 0;
    }
    .item-row {
      margin: 20px 0;
      padding: 15px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .total-row {
      margin-top: 30px;
      text-align: right;
      padding-top: 20px;
      border-top: 2px solid #0f172a;
    }
    .stamp {
      display: inline-block;
      border: 3px solid #10b981;
      color: #10b981;
      padding: 5px 15px;
      border-radius: 4px;
      font-weight: 900;
      font-size: 14px;
      transform: rotate(-10deg);
      margin-top: 20px;
      text-transform: uppercase;
    }
  </style>
</head>
<body style="background: #f1f5f9; padding: 50px 20px;">
  <div class="receipt-card">
    <div class="receipt-header">
      <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px; text-transform: uppercase;">Official Receipt</h1>
      <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.7;">ZIGEX CONNECT LEARNING PLATFORM</p>
    </div>
    
    <div class="receipt-body">
      <div class="watermark">OFFICIAL</div>
      
      <div class="meta-grid">
        <div class="meta-col">
          <p class="label">Received From</p>
          <p class="value">${params.name}</p>
        </div>
        <div class="meta-col" style="text-align: right;">
          <p class="label">Date Paid</p>
          <p class="value">${new Date(params.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      <div class="meta-grid" style="border: none; margin-bottom: 10px;">
        <div class="meta-col">
          <p class="label">Transaction Ref</p>
          <p class="value" style="font-family: monospace;">${params.ref}</p>
        </div>
        <div class="meta-col" style="text-align: right;">
          <p class="label">Status</p>
          <p class="value" style="color: #10b981;">PAID FULL</p>
        </div>
      </div>

      <div class="item-row">
        <p class="label">Item Description</p>
        <p style="margin: 5px 0 0; font-size: 15px; font-weight: 700; color: #0f172a;">${params.programTitle}</p>
        <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">${params.month ? `Deployment: ${params.month}` : 'Program Enrollment'}</p>
      </div>

      <div class="total-row">
        <p class="label">Grand Total Paid</p>
        <p style="margin: 5px 0 0; font-size: 28px; font-weight: 900; color: #0f172a;">${finalAmount.toLocaleString()} <span style="font-size: 14px; font-weight: 400;">XAF</span></p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <div class="stamp">Verified & Paid</div>
      </div>

      <div class="no-print" style="margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="font-size: 12px; color: #94a3b8;">This is an electronically generated receipt. No signature required.</p>
        <button onclick="window.print()" style="margin-top: 15px; background: #0f172a; color: white; border: none; padding: 8px 20px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">Download / Print PDF</button>
      </div>
    </div>
  </div>
  
  <p style="text-align: center; font-size: 11px; color: #64748b; margin-top: 30px;">
    ZIGEX CONNECT • Douala, Cameroon • <a href="https://zigexconnect.com" style="color: #64748b; text-decoration: none;">zigexconnect.com</a>
  </p>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"ZIGEX Payments" <${GMAIL_USER}>`,
    to: params.email,
    subject: `Payment Receipt: ${params.programTitle}`,
    html
  });
};
