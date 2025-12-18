import { Resend } from "resend";
import ApplicationAcceptedEmail from "@/emails/ApplicationAccepted";
import WelcomeEmail from "@/emails/WelcomeEmail";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendApplicationAcceptedEmail = async (
  email: string,
  name: string,
  opportunityTitle: string,
  type: "internship" | "program" | "event"
) => {
  if (!resend) {
    console.warn(
      "Resend API key is missing. Email sending skipped for:",
      email
    );
    return;
  }

  try {
    await resend.emails.send({
      from: "ZIGEX <notifications@ZIGEX.online>",
      to: email,
      subject: "Congratulations! Your Application was Accepted",
      react: ApplicationAcceptedEmail({
        studentName: name,
        opportunityTitle,
        type,
      }),
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export const sendWelcomeEmail = async (
  email: string,
  internName: string,
  internshipTitle: string,
  companyName: string,
  customMessage?: string
) => {
  if (!resend) {
    console.warn(
      "Resend API key is missing. Email sending skipped for:",
      email
    );
    return;
  }

  try {
    await resend.emails.send({
      from: "ZIGEX <onboarding@resend.dev>",
      to: email,
      subject: `Welcome to ${companyName}!`,
      react: WelcomeEmail({
        internName,
        internshipTitle,
        companyName,
        customMessage,
      }),
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw error;
  }
};

