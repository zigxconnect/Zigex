import { Resend } from "resend";
import ApplicationAcceptedEmail from "@/emails/ApplicationAccepted";
import ApplicationRejectedEmail from "@/emails/ApplicationRejected";
import { ProgramDetailedInviteEmail } from "@/emails/ProgramDetailedInvite";
import ApplicationConfirmationEmail from "@/emails/ApplicationConfirmationEmail";
import { ZigexApplicationAlertEmail } from "@/emails/ZigexApplicationAlert";
import { ZigexOnboardingWelcome } from "@/emails/ZigexOnboardingWelcome";
import { TaskAssignmentEmail } from "@/emails/TaskAssignmentEmail";

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
        from: `${companyName || "SEED INC"} <notifications@zigexconnect.com>`,
        to: email,
        subject: `Welcome to ${opportunityTitle}! - ${companyName || "SEED INC"} Invite`,
        react: ProgramDetailedInviteEmail({
          studentName: name,
          programTitle: opportunityTitle,
          programDescription: opportunityDescription || "",
          companyName,
          // Use the specific WhatsApp link for Weekend of Code or default to it
          whatsappGroupLink: "https://chat.whatsapp.com/DXYGLpny3DwGs5pkb1fPAr",
        }),
      });
    } else if (status === "rejected") {
      await resend.emails.send({
        from: `${companyName || "SEED INC"} <notifications@zigexconnect.com>`,
        to: email,
        subject: `Update on your application: ${opportunityTitle}`,
        react: ApplicationRejectedEmail({
          studentName: name,
          postTitle: opportunityTitle,
          postType: opportunityType.charAt(0).toUpperCase() + opportunityType.slice(1) as any,
          companyName,
          viewApplicationUrl: "https://zigexconnect.com/applications",
        }),
      });
    } else if (status === "pending" || status === "rsvp_confirmed") {
      await resend.emails.send({
        from: `${companyName || "SEED INC"} <notifications@zigexconnect.com>`,
        to: email,
        subject: `Application Received: ${opportunityTitle}`,
        react: ApplicationConfirmationEmail({
          studentName: name,
          postTitle: opportunityTitle,
          postType: (opportunityType.charAt(0).toUpperCase() + opportunityType.slice(1)) as any,
          companyName: companyName || "ZIGEX Partner",
          viewApplicationUrl: "https://zigexconnect.com/applications",
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
      from: "SEED INC ALERTS <alerts@zigexconnect.com>",
      to: "zigex.connect@gmail.com",
      subject,
      react: reactElement,
    });

    // 2. Alert Company
    if (companyEmail) {
      await resend.emails.send({
        from: "SEED INC <notifications@zigexconnect.com>",
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
      from: "SEED INC <welcome@zigexconnect.com>",
      to: email,
      subject: `Welcome to SEED INC, ${userName}! 🚀`,
      react: ZigexOnboardingWelcome({
        userName,
        communityLink: "https://chat.whatsapp.com/DXYGLpny3DwGs5pkb1fPAr"
      }),
    });
    console.log(`[MAIL-JOB] Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};

/**
 * Sends a task assignment email to a student.
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
  if (!resend) return;
  const { email, name, taskTitle, taskDescription, dueDate, priority, supervisorName } = params;

  try {
    await resend.emails.send({
      from: "SEED INC Supervisors <notifications@zigexconnect.com>",
      to: email,
      subject: `New Task Assigned: ${taskTitle}`,
      react: TaskAssignmentEmail({
        studentName: name,
        taskTitle,
        taskDescription,
        dueDate,
        priority,
        supervisorName
      }),
    });
  } catch (error) {
    console.error("Failed to send task assignment email:", error);
  }
};
