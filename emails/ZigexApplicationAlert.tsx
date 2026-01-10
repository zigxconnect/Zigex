import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  render,
} from "@react-email/components";
import * as React from "react";

interface ZigexApplicationAlertEmailProps {
  studentName: string;
  studentEmail: string;
  opportunityTitle: string;
  type: string;
}

export const ZigexApplicationAlertEmail = ({
  studentName,
  studentEmail,
  opportunityTitle,
  type,
}: ZigexApplicationAlertEmailProps) => (
  <Html>
    <Head />
    <Preview>New Application Received on SEED INC</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>SEED INC Portal Alert</Heading>
        </Section>
        <Section style={section}>
          <Heading as="h2" style={h2}>New Application Received</Heading>
          <Text style={text}>
            You have received a new application for a <strong>{type}</strong> opportunity on the SEED INC portal.
          </Text>
          <Hr style={hr} />
          <Section style={details}>
             <Text style={detailText}><strong>Candidate:</strong> {studentName}</Text>
             <Text style={detailText}><strong>Email:</strong> {studentEmail}</Text>
             <Text style={detailText}><strong>Opportunity:</strong> {opportunityTitle}</Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Please log in to the <a href="https://zigexconnect.com/admin/applicants">Admin Dashboard</a> to review this candidate.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const header = {
  padding: "20px 30px",
};

const h1 = {
  color: "#155DFC",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const h2 = {
  color: "#1e293b",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "10px 0",
};

const section = {
  padding: "0 30px",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const details = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
};

const detailText = {
  fontSize: "14px",
  color: "#4a5568",
  margin: "5px 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  marginTop: "20px",
};
