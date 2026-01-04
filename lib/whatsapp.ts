
/**
 * ZIGEX WhatsApp Automation Suite
 * Designed for perfect, automated outreach using 'Appropriate Technology' (Evolution API).
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE || "ZIGEX";

/**
 * Sends an automated WhatsApp message to a candidate.
 * Optimized for Evolution API (Self-hosted & Free).
 */
export const sendWhatsAppMessage = async (phone: string, text: string) => {
    // 1. Sanitize Phone (Remove non-digits, ensure country code)
    let cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone.startsWith("237") && cleanPhone.length === 9) {
        cleanPhone = "237" + cleanPhone; // Default to Cameroon if only 9 digits
    }

    // 2. Logging for Visibility (The 'Job' record)
    console.log(`[WA-JOB] Preparing message for ${cleanPhone}: ${text.slice(0, 50)}...`);

    // 3. Skip if no API configured (Avoid crashes)
    if (!WHATSAPP_API_URL || !WHATSAPP_API_KEY) {
        console.warn("[WA-JOB] WhatsApp API not fully configured. Set WHATSAPP_API_URL and WHATSAPP_API_KEY in .env");
        return { success: false, reason: "NOT_CONFIGURED" };
    }

    try {
        const response = await fetch(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": WHATSAPP_API_KEY,
            },
            body: JSON.stringify({
                number: cleanPhone,
                text: text,
                linkPreview: true,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log(`[WA-JOB] Success! Message sent to ${cleanPhone}`);
            return { success: true, data };
        } else {
            console.error(`[WA-JOB] Failed! ${data.message || response.statusText}`);
            return { success: false, reason: data.message };
        }
    } catch (error) {
        console.error("[WA-JOB] Network Error:", error);
        return { success: false, reason: "NETWORK_ERROR" };
    }
};

/**
 * Specialized: Send Welcome & Group Invite
 */
export const sendWhatsAppWelcomeInvite = async (candidateName: string, phone: string) => {
    const firstName = candidateName.split(" ")[0];
    const groupLink = "https://chat.whatsapp.com/DXYGLpny3DwGs5pkb1fPAr"; // Replace with real link

    const message = `🚀 *Welcome to ZIGEX, ${firstName}!* \n\n` +
        `Your profile is now complete! We're excited to help you find your next career opportunity.\n\n` +
        `💡 *Next Step:* Join our official Community Group for real-time alerts and networking:\n` +
        `${groupLink}\n\n` +
        `We'll talk soon!`;

    return sendWhatsAppMessage(phone, message);
};
