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
} from "npm:@react-email/components@0.5.3";
import * as React from "npm:react@18.3.1";

interface NewPostEmailProps {
  postTitle: string;
  postType: "Program" | "Internship" | "Event";
  postLocation?: string;
  viewPostUrl: string;
  companyLogoUrl: string;
  managePreferencesUrl: string;
  recipientName?: string;
  postedDate?: string;
}

export const NewPostEmail = ({
  postTitle,
  postType,
  postLocation,
  viewPostUrl,
  companyLogoUrl,
  managePreferencesUrl,
  recipientName,
  postedDate,
}: NewPostEmailProps) => {
  const previewText = `A new ${postType} has been posted: ${postTitle}`;
  const previewText = `A new ${postType} has been posted: ${postTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#0072F5",
                light: "#F6F9FC",
                dark: "#2A2A2A",
                gray: "#8898AA",
              },
            },
          },
        }}
      >
        <Body className="bg-light my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded-lg my-[40px] mx-auto p-[32px] w-[580px] bg-white">
            {/* Header with Company Logo */}
            <Section className="mt-[24px]">
              <Img
                src={companyLogoUrl}
                width="80"
                height="80"
                alt="FutureProspect Logo"
                className="my-0 mx-auto"
                style={{ borderRadius: "12px" }}
              />
            </Section>

            {/* Professional Intro */}
            <Heading className="text-dark text-[28px] font-bold text-center p-0 my-[30px] mx-0">
              A New {postType} is Available!
            </Heading>

            <Text className="text-dark text-[16px] leading-[24px]">
              {recipientName
                ? `Dear ${recipientName},`
                : "Dear FutureProspect Member,"}
            </Text>
            <Text className="text-dark text-[16px] leading-[24px]">
              We are excited to inform you that a new opportunity has just been
              posted on <b>FutureProspect</b> — the platform dedicated to
              connecting ambitious individuals with top programs, internships,
              and events to accelerate your career journey.
            </Text>

            {/* The "Card" for the new post - Enhanced Professional Design */}
            <Section
              className="rounded-xl p-[32px] my-[28px] bg-[#f8fafc] shadow-sm"
              style={{
                border: "1.5px solid #0072F5",
                boxShadow: "0 4px 24px 0 #e0e7ef",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                {/* Post Type Icon */}
                <Img
                  src={
                    postType === "Internship"
                      ? "https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/briefcase.svg"
                      : postType === "Program"
                        ? "https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/graduation-cap.svg"
                        : "https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/calendar.svg"
                  }
                  width="28"
                  height="28"
                  alt={postType + " icon"}
                  style={{ marginRight: 10, verticalAlign: "middle" }}
                />
                <Heading
                  as="h2"
                  className="text-dark text-[23px] font-bold m-0 tracking-tight text-center"
                  style={{
                    letterSpacing: "-0.5px",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                >
                  {postTitle}
                </Heading>
              </div>
              {postLocation && (
                <Text
                  className="text-gray text-[15px] leading-[22px] m-0 mb-2 text-center"
                  style={{ fontStyle: "italic" }}
                >
                  Location:{" "}
                  <span className="text-dark font-medium">{postLocation}</span>
                </Text>
              )}
              {/* Posted Date */}
              {typeof postedDate === "string" && (
                <Text className="text-gray text-[13px] leading-[20px] m-0 mb-4 text-center">
                  Posted on: <span className="text-dark">{postedDate}</span>
                </Text>
              )}
              <Hr className="border border-solid border-[#eaeaea] my-[18px] mx-0 w-full" />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 0,
                }}
              >
                <Button
                  className="bg-brand rounded-lg text-white text-[16px] font-bold no-underline text-center px-8 py-3 shadow-md hover:bg-[#005bb5] transition-all duration-150"
                  href={viewPostUrl}
                  style={{
                    minWidth: 180,
                    fontSize: 16,
                    boxShadow: "0 2px 8px 0 #e0e7ef",
                  }}
                  aria-label={`View details for ${postTitle}`}
                >
                  View Details
                </Button>
              </div>
              <Text
                className="text-gray text-[12px] leading-[20px] mt-6 text-center"
                style={{ wordBreak: "break-all" }}
              >
                If the button above does not work, copy and paste this link into
                your browser:
                <br />
                <Link href={viewPostUrl} className="underline break-all">
                  {viewPostUrl}
                </Link>
              </Text>
            </Section>

            {/* Professional Signature */}
            <Section className="mt-[32px] mb-[8px]">
              <Text className="text-dark text-[15px] leading-[24px]">
                Best regards,
                <br />
                <b>The FutureProspect Team</b>
                <br />
                <span className="text-gray text-[13px]">
                  Empowering your future, one opportunity at a time.
                </span>
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-gray text-[12px] leading-[20px]">
              You are receiving this email because you opted in to notifications
              from FutureProspect.
              <br />
              <Link href={managePreferencesUrl} className="text-gray underline">
                Manage your notification preferences
              </Link>
              .
            </Text>
            <Text className="text-gray text-[12px] leading-[20px]">
              If you no longer wish to receive these emails, you can update your
              preferences or unsubscribe at any time.
              <br />
              <span className="text-gray">
                FutureProspect, 123 Opportunity Lane, Innovation City, Country
              </span>
            </Text>

            {/* Social Media Links */}
            <Section className="text-center mt-[32px]">
              <Link
                href="https://twitter.com/futureprospect"
                className="px-2"
                aria-label="Follow us on Twitter"
              >
                <Img
                  width="24"
                  height="24"
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg"
                  alt="Twitter logo"
                  style={{ display: "inline-block" }}
                />
              </Link>
              <Link
                href="https://linkedin.com/company/futureprospect"
                className="px-2"
                aria-label="Connect with us on LinkedIn"
              >
                <Img
                  width="24"
                  height="24"
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg"
                  alt="LinkedIn logo"
                  style={{ display: "inline-block" }}
                />
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
