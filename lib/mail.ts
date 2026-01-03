import { Resend } from "resend";
import ApplicationAcceptedEmail from "@/emails/ApplicationAccepted";
import ApplicationRejectedEmail from "@/emails/ApplicationRejected";
import { ProgramDetailedInviteEmail } from "@/emails/ProgramDetailedInvite";
import ApplicationConfirmationEmail from "@/emails/ApplicationConfirmationEmail";
import { ZigexApplicationAlertEmail } from "@/emails/ZigexApplicationAlert";
import { ZigexOnboardingWelcome } from "@/emails/ZigexOnboardingWelcome";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Sends a status update email to the candidate.
 */
export const sendCandidateStatusEmail = async (params: {
  email: string;
  name: string;
  status: string;
  opportunityTitle: string;
  opportunityDescription?: string;
  opportunityType: string;
  companyName: string;
}) => {
  if (!resend) return;

  const { email, name, status, opportunityTitle, opportunityDescription, opportunityType, companyName } = params;

  try {
    if (status === "accepted") {
      await resend.emails.send({
        from: "ZIGEX <notifications@ZIGEX.online>",
        to: email,
        subject: `Welcome to ${opportunityTitle}! - ZIGEX Invite`,
        react: ProgramDetailedInviteEmail({
          studentName: name,
          programTitle: opportunityTitle,
          programDescription: opportunityDescription || "",
          companyName,
          whatsappGroupLink: "https://chat.whatsapp.com/GzXpExampleLink",
        }),
      });
    } else if (status === "rejected") {
      await resend.emails.send({
        from: "ZIGEX <notifications@ZIGEX.online>",
        to: email,
        subject: `Update on your application: ${opportunityTitle}`,
        react: ApplicationRejectedEmail({
          studentName: name,
          postTitle: opportunityTitle,
          postType: opportunityType.charAt(0).toUpperCase() + opportunityType.slice(1) as any,
          companyName,
          viewApplicationUrl: "https://ZIGEX.online/applications",
        }),
      });
    } else if (status === "pending" || status === "rsvp_confirmed") {
      await resend.emails.send({
        from: "ZIGEX <notifications@ZIGEX.online>",
        to: email,
        subject: `Application Received: ${opportunityTitle}`,
        react: ApplicationConfirmationEmail({
          studentName: name,
          postTitle: opportunityTitle,
          postType: (opportunityType.charAt(0).toUpperCase() + opportunityType.slice(1)) as any,
          companyName: companyName || "ZIGEX Partner",
          viewApplicationUrl: "https://ZIGEX.online/applications",
          postedDate: new Date().toLocaleDateString(),
        }),
      });
    }
  } catch (error) {
    console.error("Failed to send candidate status email:", error);
  }
};

/**
 * Sends a status change alert to Zigex Admins and the specific Company.
 */
export const sendRecruitmentStatusAlert = async (params: {
  studentName: string;
  studentEmail: string;
  opportunityTitle: string;
  opportunityType: string;
  newStatus: string;
  companyEmail?: string;
}) => {
  if (!resend) return;

  const { studentName, studentEmail, opportunityTitle, opportunityType, newStatus, companyEmail } = params;

  try {
    const subjectPrefix = newStatus === "pending" ? "New Application" : `Status Update [${newStatus.toUpperCase()}]`;
    const subject = `${subjectPrefix}: ${studentName} - ${opportunityTitle}`;

    const reactElement = ZigexApplicationAlertEmail({
      studentName,
      studentEmail,
      opportunityTitle,
      type: `${opportunityType} (Current Status: ${newStatus})`,
    });

    // 1. Alert Zigex Admins
    await resend.emails.send({
      from: "ZIGEX ALERTS <alerts@ZIGEX.online>",
      to: "zigex.connect@gmail.com",
      subject,
      react: reactElement,
    });

    // 2. Alert Company
    if (companyEmail) {
      await resend.emails.send({
        from: "ZIGEX <notifications@ZIGEX.online>",
        to: companyEmail,
        subject,
        react: reactElement,
      });
    }
  } catch (error) {
    console.error("Failed to send recruitment alert email:", error);
  }
};

/**
 * Sends a welcome onboarding email to a new user.
 */
export const sendZigexWelcomeEmail = async (email: string, userName: string) => {
  if (!resend) return;

  try {
    await resend.emails.send({
      from: "ZIGEX <welcome@ZIGEX.online>",
      to: email,
      subject: `Welcome to ZIGEX, ${userName}! 🚀`,
      react: ZigexOnboardingWelcome({
        userName,
        communityLink: "https://chat.whatsapp.com/GzXpExampleLink"
      }),
    });
    console.log(`[MAIL-JOB] Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};
