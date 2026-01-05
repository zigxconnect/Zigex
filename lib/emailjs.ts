/**
 * ZIGEX EmailJS Integration
 * Dynamic email sending for all application notifications
 * 
 * Setup Instructions:
 * 1. Go to https://www.emailjs.com/ and create a NEW account
 * 2. Add an Email Service (Gmail recommended)
 * 3. Create a template called "zigex_dynamic" with the variables below
 * 4. Copy your Service ID, Template ID, and Public/Private Key to .env.local
 */

// Environment Variables
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "zigex_dynamic";
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

// Types for dynamic email content
interface EmailParams {
    to_email: string;
    to_name: string;
    subject: string;
    heading: string;
    message: string;
    cta_text?: string;
    cta_link?: string;
    footer_note?: string;
    opportunity_title?: string;
    opportunity_type?: string;
    company_name?: string;
    status_badge?: string;
    status_color?: string;
}

/**
 * Send email via EmailJS REST API (Server-Side)
 */
export const sendEmailJS = async (params: EmailParams): Promise<{ success: boolean; error?: string }> => {
    // Validation
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
        console.warn("[EMAILJS] Not configured. Set EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY in .env.local");
        return { success: false, error: "NOT_CONFIGURED" };
    }

    console.log(`[EMAILJS] Sending "${params.subject}" to ${params.to_email}`);

    try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                accessToken: EMAILJS_PRIVATE_KEY, // Optional but recommended for server-side
                template_params: {
                    ...params,
                    // Add brand defaults
                    brand_name: "ZIGEX",
                    brand_color: "#155DFC",
                    year: new Date().getFullYear(),
                },
            }),
        });

        if (response.ok) {
            console.log(`[EMAILJS] ✅ Email sent successfully to ${params.to_email}`);
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error(`[EMAILJS] ❌ Failed: ${errorText}`);
            return { success: false, error: errorText };
        }
    } catch (error: any) {
        console.error("[EMAILJS] Network error:", error.message);
        return { success: false, error: error.message };
    }
};

// ========================================
// PRE-BUILT EMAIL FUNCTIONS
// ========================================

/**
 * Send Application Confirmation (Pending/RSVP)
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

    return sendEmailJS({
        to_email: email,
        to_name: name,
        subject: isRSVP
            ? `🎟️ RSVP Confirmed: ${opportunityTitle}`
            : `✅ Application Received: ${opportunityTitle}`,
        heading: isRSVP ? "You're In!" : "Application Received",
        message: isRSVP
            ? `Hey ${firstName}! 🎉\n\nYour spot for "${opportunityTitle}" by ${companyName} is confirmed! We can't wait to see you there.\n\nKeep an eye on your inbox for event details and reminders.`
            : `Hey ${firstName}! 👋\n\nWe've received your application for "${opportunityTitle}" at ${companyName}. It's now being reviewed by the team.\n\nWe'll notify you as soon as there's an update. Good luck! 🚀`,
        opportunity_title: opportunityTitle,
        opportunity_type: opportunityType,
        company_name: companyName,
        status_badge: isRSVP ? "CONFIRMED" : "UNDER REVIEW",
        status_color: isRSVP ? "#10B981" : "#3B82F6",
        cta_text: "View My Applications",
        // ... (inside sendApplicationConfirmation)
        cta_link: "https://zigexconnect.com/dashboard/applied-internships",
        footer_note: "You're receiving this because you applied through ZIGEX.",
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

    return sendEmailJS({
        to_email: email,
        to_name: name,
        subject: `🎉 Congratulations! You've been accepted to ${opportunityTitle}`,
        heading: "You're Accepted! 🎉",
        message: `Congratulations ${firstName}! 🎊\n\nWe're thrilled to inform you that you've been ACCEPTED for "${opportunityTitle}" at ${companyName}!\n\nThis is a huge milestone, and we're excited to have you on board. Here's what happens next:\n\n1. Join the official WhatsApp group for updates\n2. Check your email for onboarding details\n3. Prepare to learn and grow!\n\nWelcome to the family! 🚀`,
        opportunity_title: opportunityTitle,
        opportunity_type: opportunityType,
        company_name: companyName,
        status_badge: "ACCEPTED",
        status_color: "#10B981",
        cta_text: whatsappGroupLink ? "Join WhatsApp Group" : "View Dashboard",
        cta_link: whatsappGroupLink || "https://zigexconnect.com/dashboard",
        footer_note: "Congratulations again! We can't wait to see you thrive.",
    });
};

/**
 * Send Rejection Email (Compassionate)
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

    return sendEmailJS({
        to_email: email,
        to_name: name,
        subject: `Update on your ${opportunityType} application`,
        heading: "Application Update",
        message: `Hi ${firstName},\n\nThank you for your interest in "${opportunityTitle}" at ${companyName}.\n\nAfter careful consideration, we've decided to move forward with other candidates whose experience more closely matches our current needs.\n\nThis doesn't reflect on your abilities – competition was tough! We encourage you to:\n\n• Keep building your skills and portfolio\n• Apply to more opportunities on ZIGEX\n• Connect with our community for support\n\nYour next opportunity is just around the corner. Keep pushing! 💪`,
        opportunity_title: opportunityTitle,
        opportunity_type: opportunityType,
        company_name: companyName,
        status_badge: "NOT SELECTED",
        status_color: "#6B7280",
        cta_text: "Explore More Opportunities",
        cta_link: "https://zigexconnect.com/feed",
        footer_note: "Don't give up – your breakthrough is coming!",
    });
};

/**
 * Send Welcome Email (New User Onboarding)
 */
export const sendWelcomeEmail = async (params: {
    email: string;
    name: string;
    communityLink?: string;
}) => {
    const { email, name, communityLink } = params;
    const firstName = name.split(" ")[0];

    return sendEmailJS({
        to_email: email,
        to_name: name,
        subject: `🚀 Welcome to ZIGEX, ${firstName}!`,
        heading: "Welcome to ZIGEX! 🎉",
        message: `Hey ${firstName}! 👋\n\nWelcome to ZIGEX – Cameroon's premier platform for students seeking internships, programs, and career opportunities!\n\nHere's what you can do now:\n\n🎯 Complete your profile to stand out\n🔍 Browse internships, programs & events\n🤝 Connect with like-minded students\n💡 Get AI-powered career guidance\n\nYour journey to career success starts NOW!\n\nLet's build something amazing together. 🚀`,
        status_badge: "NEW MEMBER",
        status_color: "#155DFC",
        cta_text: communityLink ? "Join Our Community" : "Complete Your Profile",
        cta_link: communityLink || "https://zigexconnect.com/profile/create",
        footer_note: "Welcome to the family! We're excited to have you.",
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

    return sendEmailJS({
        to_email: adminEmail,
        to_name: "ZIGEX Admin",
        subject: `📋 [${status.toUpperCase()}] ${studentName} - ${opportunityTitle}`,
        heading: `New Application Activity`,
        message: `A new application event has occurred:\n\n👤 Student: ${studentName}\n📧 Email: ${studentEmail}\n📌 Opportunity: ${opportunityTitle}\n🏢 Company: ${companyName || "ZIGEX"}\n📊 Type: ${opportunityType}\n🔄 Status: ${status.toUpperCase()}\n\nLog in to the admin dashboard to review and take action.`,
        opportunity_title: opportunityTitle,
        opportunity_type: opportunityType,
        company_name: companyName || "ZIGEX",
        status_badge: status.toUpperCase(),
        status_color: status === "pending" ? "#F59E0B" : status === "accepted" ? "#10B981" : "#6B7280",
        cta_text: "View in Dashboard",
        cta_link: "https://zigexconnect.com/dashboard/admin/applicants",
        footer_note: "This is an automated alert from ZIGEX.",
    });
};
