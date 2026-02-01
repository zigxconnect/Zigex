
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
  Img,
  Link,
} from "@react-email/components";
import * as React from "react";

interface ZigexOnboardingWelcomeProps {
  userName: string;
  communityLink?: string;
}

export const ZigexOnboardingWelcome = ({
  userName,
  communityLink = "https://chat.whatsapp.com/K0RflJDzxyKDIM2yuvzTTQ?mode=gi_t",
}: ZigexOnboardingWelcomeProps) => {
  const previewText = `Welcome to SEED INC, ${userName}! Your journey starts now.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans px-2">
          <Container className="bg-white border border-solid border-[#eaeaea] rounded-[2rem] my-[40px] mx-auto p-[40px] max-w-[565px] shadow-xl">
            <Section className="text-center mt-[10px]">
               <Img
                src="https://tmvipinvvhgklmqwvows.supabase.co/storage/v1/object/public/company-assets/Seed%20Company/events/SEED%20community%20Challenge-1757769838240.jpg"
                width="120"
                height="50"
                alt="ZIGEX"
                className="my-0 mx-auto"
                style={{ objectFit: "contain" }}
              />
            </Section>
            
            <Heading className="text-slate-900 text-[32px] font-black text-center p-0 mt-[40px] mb-[10px] mx-0 tracking-tighter">
              Welcome to SEED INC! 🚀
            </Heading>
            
            <Text className="text-slate-600 text-[16px] leading-[26px] text-center mb-[30px]">
              Hi {userName}, your profile is now complete. You're officially part of the SEED INC ecosystem—the gateway to your next big career move.
            </Text>

            <Section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-[30px]">
              <Heading className="text-indigo-900 text-[20px] font-bold m-0 mb-4">
                What's Next?
              </Heading>
              <Section className="space-y-4">
                <Text className="text-indigo-800 text-[14px] m-0 mb-3">
                  ✅ <strong>Explore Postings:</strong> Find internships and programs tailored for you.
                </Text>
                <Text className="text-indigo-800 text-[14px] m-0 mb-3">
                  ✅ <strong>Join the Community:</strong> Connect with peers and industry experts.
                </Text>
                <Text className="text-indigo-800 text-[14px] m-0">
                  ✅ <strong>Apply with One Click:</strong> Your profile is your strongest asset.
                </Text>
              </Section>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#155DFC] rounded-xl text-white text-[14px] font-bold no-underline text-center px-6 py-4 shadow-lg"
                href="https://zigexconnect.com/dashboard"
              >
                Go to My Dashboard
              </Button>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Section className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <Text className="text-slate-600 text-[14px] leading-[24px] m-0 mb-4 font-bold text-center">
                   Join our WhatsApp Community for real-time updates:
                </Text>
                <Section className="text-center">
                    <Button
                        className="bg-[#25D366] rounded-xl text-white text-[14px] font-bold no-underline text-center px-6 py-4"
                        href={communityLink}
                    >
                        Join WhatsApp Group
                    </Button>
                </Section>
            </Section>

            <Text className="text-[#999999] text-[12px] leading-[20px] text-center mt-[40px]">
              If you didn't create this account, please ignore this email.
              <br />
              SEED INC Team • Cameroon, Africa
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ZigexOnboardingWelcome;
