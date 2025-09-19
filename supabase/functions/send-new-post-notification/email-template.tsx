// File: supabase/functions/send-new-post-notification/email-template.tsx

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface NewPostEmailProps {
  postTitle: string;
  postType: "Program" | "Internship" | "Event" | "Opportunity";
  viewPostUrl: string;
  companyLogoUrl: string;
  introText: string;
}

export const NewPostEmail = ({
  postTitle,
  postType,
  viewPostUrl,
  companyLogoUrl,
  introText,
}: NewPostEmailProps) => {
  const previewText = `New ${postType} Posted: ${postTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px] bg-white">
            <Section className="mt-[32px] text-center">
              <Img
                src={companyLogoUrl}
                width="80"
                height="80"
                alt="Company Logo"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              New <strong>{postType}</strong> Just Posted!
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              {introText}
            </Text>
            <Section className="p-4 bg-gray-50 rounded-lg text-center my-4">
              <Text className="text-lg font-semibold m-0">{postTitle}</Text>
            </Section>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={viewPostUrl}
              >
                See Details
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              You are receiving this because you're subscribed to new
              opportunity notifications.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
