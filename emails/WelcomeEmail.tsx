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
  Hr,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  internName: string;
  internshipTitle: string;
  companyName: string;
  customMessage?: string;
}

export const WelcomeEmail = ({
  internName,
  internshipTitle,
  companyName,
  customMessage,
}: WelcomeEmailProps) => {
  const previewText = `Welcome to ${companyName}! We're excited to have you join us.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[565px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to {companyName}!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Dear {internName},
            </Text>
            {customMessage ? (
              <Text className="text-black text-[14px] leading-[24px] whitespace-pre-wrap">
                {customMessage}
              </Text>
            ) : (
              <Text className="text-black text-[14px] leading-[24px]">
                We are thrilled to welcome you to our team as a{" "}
                <strong>{internshipTitle}</strong> intern! This is the beginning
                of an exciting journey, and we can't wait to see what you'll
                accomplish.
              </Text>
            )}
            <Section className="my-[32px]">
              <Heading className="text-black text-[18px] font-semibold my-[16px]">
                Next Steps
              </Heading>
              <Text className="text-black text-[14px] leading-[24px] my-[8px]">
                • Check your inbox for onboarding details and schedule
              </Text>
              <Text className="text-black text-[14px] leading-[24px] my-[8px]">
                • Complete any pre-arrival paperwork we send
              </Text>
              <Text className="text-black text-[14px] leading-[24px] my-[8px]">
                • Prepare any questions for your first day
              </Text>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px]">
              If you have any questions before your start date, please don't
              hesitate to reach out to us.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href="https://zigex.vercel.app/dashboard"
              >
                Access Your Dashboard
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Welcome aboard!
              <br />
              The {companyName} Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
