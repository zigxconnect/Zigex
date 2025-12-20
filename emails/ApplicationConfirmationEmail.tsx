import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface ApplicationConfirmationEmailProps {
  studentName: string;
  postTitle: string;
  postType: "Internship" | "Program" | "Event";
  companyName: string;
  viewApplicationUrl: string;
  postedDate: string;
}

export const ApplicationConfirmationEmail = ({
  studentName,
  postTitle,
  postType,
  companyName,
  viewApplicationUrl,
  postedDate,
}: ApplicationConfirmationEmailProps) => {
  const previewText = `Application Received: ${postTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://tmvipinvvhgklmqwvows.supabase.co/storage/v1/object/public/company-assets/Seed%20Company/events/SEED%20community%20Challenge-1757769838240.jpg"
                width="120"
                height="50"
                alt="ZIGEX"
                className="my-0 mx-auto"
                style={{ objectFit: "contain" }}
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Application Received!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {studentName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We have successfully received your application for the <strong>{postType}</strong>: <strong>{postTitle}</strong> at <strong>{companyName}</strong>.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={viewApplicationUrl}
              >
                View Application Status
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              The company will review your application and get back to you soon. Good luck!
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              ZIGEX Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ApplicationConfirmationEmail;
