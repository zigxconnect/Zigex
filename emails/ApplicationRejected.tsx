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

interface ApplicationRejectedEmailProps {
  studentName: string;
  postTitle: string;
  postType: "Internship" | "Program" | "Event";
  companyName: string;
  viewApplicationUrl: string;
}

export const ApplicationRejectedEmail = ({
  studentName,
  postTitle,
  postType,
  companyName,
  viewApplicationUrl,
}: ApplicationRejectedEmailProps) => {
  const previewText = `Update on your application for ${postTitle}`;

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
                alt="SEED INC"
                className="my-0 mx-auto"
                style={{ objectFit: "contain" }}
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Application Update
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {studentName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Thank you for your interest in the <strong>{postTitle}</strong> {postType} at <strong>{companyName}</strong>.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              After careful consideration, the company has decided not to move forward with your application at this time. We appreciate the time and effort you put into applying.
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
              We encourage you to apply for other opportunities on SEED INC that match your skills and interests.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              SEED INC Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ApplicationRejectedEmail;
