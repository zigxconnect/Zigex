import { Resend } from "resend";
import ApplicationAcceptedEmail from "@/emails/ApplicationAccepted";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendApplicationAcceptedEmail = async (
  email: string,
  name: string,
  opportunityTitle: string,
  type: "internship" | "program" | "event"
) => {
  try {
    await resend.emails.send({
      from: "Future Prospect <onboarding@resend.dev>",
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
