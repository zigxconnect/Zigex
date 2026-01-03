import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Heading,
} from "@react-email/components";
import * as React from "react";

interface InterviewInvitationEmailProps {
  studentName: string;
  opportunityTitle: string;
  companyName: string;
  interviewDate?: string;
}

export const InterviewInvitationEmail = ({
  studentName,
  opportunityTitle,
  companyName,
  interviewDate,
}: InterviewInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Interview Invitation: {opportunityTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>ZIGEX Recruitment</Heading>
        </Section>
        <Section style={section}>
          <Text style={text}>Hi {studentName},</Text>
          <Text style={text}>
            Great news! <strong>{companyName}</strong> is impressed with your application for the <strong>{opportunityTitle}</strong> position and would like to invite you for an interview.
          </Text>
          <Section style={details}>
             <Text style={detailText}><strong>Position:</strong> {opportunityTitle}</Text>
             {interviewDate && <Text style={detailText}><strong>Proposed Date:</strong> {interviewDate}</Text>}
          </Section>
          <Text style={text}>
            Please confirm your availability by clicking the button below or reply to this email to coordinate a suitable time.
          </Text>
          <Button style={button} href="https://ZIGEX.online/applications">
            View Application Details
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            Good luck with your interview! <br />
            — The ZIGEX Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f4f7ff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

const header = {
  marginBottom: "32px",
};

const h1 = {
  color: "#155DFC",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
};

const section = {
  padding: "0 20px",
};

const text = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "26px",
};

const details = {
  backgroundColor: "#f8fafc",
  padding: "20px",
  borderRadius: "12px",
  margin: "24px 0",
};

const detailText = {
  fontSize: "14px",
  color: "#475569",
  margin: "4px 0",
};

const button = {
  backgroundColor: "#155DFC",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px 0",
  marginTop: "24px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "32px 0",
};

const footer = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: "22px",
};
