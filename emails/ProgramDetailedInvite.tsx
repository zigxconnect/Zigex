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
  Img,
} from "@react-email/components";
import * as React from "react";

interface ProgramDetailedInviteEmailProps {
  studentName: string;
  programTitle: string;
  programDescription: string;
  whatsappGroupLink?: string;
  companyName: string;
}

export const ProgramDetailedInviteEmail = ({
  studentName,
  programTitle,
  programDescription,
  whatsappGroupLink,
  companyName,
}: ProgramDetailedInviteEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to {programTitle} - Next Steps</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>ZIGEX Official Welcome</Heading>
        </Section>
        <Section style={section}>
          <Text style={text}>Congratulations {studentName}!</Text>
          <Text style={text}>
            You have been officially accepted into the <strong>{programTitle}</strong> by <strong>{companyName}</strong>. We are excited to have you on board!
          </Text>
          
          <Section style={infoBox}>
             <Heading style={h2}>About the Program</Heading>
             <Text style={descText}>{programDescription}</Text>
          </Section>

          <Text style={text}>
            To ensure you have the best experience, we have created a dedicated community for all participants. Please join our official WhatsApp group below:
          </Text>

          {whatsappGroupLink && (
            <Button style={whatsappButton} href={whatsappGroupLink}>
              Join Official WhatsApp Group
            </Button>
          )}

          <Hr style={hr} />
          
          <Text style={text}>
            Stay tuned for further updates regarding the onboarding session. If you have any questions, feel free to reply to this email.
          </Text>

          <Button style={dashboardButton} href="https://ZIGEX.online/applications">
            View Application Workspace
          </Button>

          <Hr style={hr} />
          <Text style={footer}>
            Empowering the next generation of professionals. <br />
            — The ZIGEX Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f0f4f8",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "24px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
};

const header = {
  marginBottom: "32px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#155DFC",
  fontSize: "26px",
  fontWeight: "bold",
  margin: "0",
  letterSpacing: "-1px",
};

const h2 = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "12px",
};

const section = {
  padding: "0 10px",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
};

const infoBox = {
  backgroundColor: "#f8fafc",
  padding: "24px",
  borderRadius: "16px",
  margin: "24px 0",
  border: "1px solid #e2e8f0",
};

const descText = {
  fontSize: "14px",
  color: "#64748b",
  lineHeight: "22px",
  fontStyle: "italic",
};

const whatsappButton = {
  backgroundColor: "#22C55E",
  borderRadius: "14px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "14px 0",
  marginTop: "16px",
  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
};

const dashboardButton = {
  backgroundColor: "#155DFC",
  borderRadius: "14px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  marginTop: "24px",
};

const hr = {
  borderColor: "#f1f5f9",
  margin: "32px 0",
};

const footer = {
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center" as const,
};
