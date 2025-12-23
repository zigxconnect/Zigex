import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Tailwind,
  Section,
  Button,
} from "@react-email/components";
import * as React from "react";

interface ApplicationAcceptedEmailProps {
  studentName: string;
  opportunityTitle: string;
  type: "internship" | "program" | "event";
}

export const ApplicationAcceptedEmail = ({
  studentName,
  opportunityTitle,
  type,
}: ApplicationAcceptedEmailProps) => {
  const previewText = `Congratulations! You've been accepted for ${opportunityTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Application Accepted!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {studentName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We are thrilled to inform you that your application for the{" "}
              <strong>{opportunityTitle}</strong> {type} has been accepted!
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href="https://www.zigexconnect.com/dashboard"
              >
                View Dashboard
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Best regards,
              <br />
              The Future Prospect Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ApplicationAcceptedEmail;
