"use server";

import { resend } from "@/lib/resend";

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export async function sendContactEmail(formData: ContactFormData) {
    const { name, email, subject, message } = formData;

    const EMAIL_TO = "zigexconnect.com@gmail.com";
    const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

    if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "Email service not configured. Please check RESEND_API_KEY." };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: `Zigex Contact <${EMAIL_FROM}>`,
            to: [EMAIL_TO],
            replyTo: email,
            subject: `[Contact Form] ${subject}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #155DFC; border-bottom: 2px solid #155DFC; padding-bottom: 10px;">New Contact Message</h1>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            This email was sent from the Zigex Contact Form.
          </p>
        </div>
      `,
        });

        if (error) {
            console.error("[CONTACT_ACTION] Resend error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, id: data?.id };
    } catch (err: any) {
        console.error("[CONTACT_ACTION] Unexpected error:", err);
        return { success: false, error: "An unexpected error occurred. Please try again later." };
    }
}
