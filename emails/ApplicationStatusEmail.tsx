import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
  Hr,
  Preview,
  Tailwind,
} from "@react-email/components";

interface ApplicationStatusEmailProps {
  studentName: string;
  companyName: string;
  positionTitle: string;
  status: "accepted" | "rejected" | "interview";
  feedback?: string;
  actionUrl?: string;
}

export const ApplicationStatusEmail = ({
  studentName,
  companyName,
  positionTitle,
  status,
  feedback,
  actionUrl = "https://futureprospect.online/dashboard",
}: ApplicationStatusEmailProps) => {
  const getStatusContent = () => {
    switch (status) {
      case "accepted":
        return {
          subject: `Congratulations! You've been accepted to ${positionTitle}`,
          heading: "Congratulations! 🎉",
          message: `We are thrilled to inform you that your application for the ${positionTitle} position at ${companyName} has been accepted!`,
          subMessage: "We were very impressed with your profile and believe you will be a great addition to our team.",
          buttonText: "View Next Steps",
          color: "text-green-600",
        };
      case "interview":
        return {
          subject: `Interview Invitation: ${positionTitle} at ${companyName}`,
          heading: "Interview Invitation 📅",
          message: `We reviewed your application for the ${positionTitle} position and would like to invite you for an interview.`,
          subMessage: "We'd love to discuss your experience and how you can contribute to our team.",
          buttonText: "Schedule Interview",
          color: "text-blue-600",
        };
      case "rejected":
        return {
          subject: `Update on your application for ${positionTitle}`,
          heading: "Application Update",
          message: `Thank you for giving us the opportunity to review your application for the ${positionTitle} position at ${companyName}.`,
          subMessage: "After careful consideration, we have decided to move forward with other candidates who more closely match our current needs.",
          buttonText: "View Other Opportunities",
          color: "text-gray-600",
        };
      default:
        return {
          subject: `Update on your application`,
          heading: "Application Update",
          message: `There has been an update to your application for ${positionTitle}.`,
          subMessage: "",
          buttonText: "View Dashboard",
          color: "text-gray-600",
        };
    }
  };

  const content = getStatusContent();

  return (
    <Html>
      <Head />
      <Preview>{content.subject}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-xl">
            <Section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* Header */}
              <div className="mb-8 text-center">
                <Img
                  src="https://futureprospect.online/logo.png"
                  alt="FutureProspect"
                  width="48"
                  height="48"
                  className="mx-auto mb-4"
                />
              </div>

              {/* Content */}
              <Text className={`text-2xl font-bold text-center mb-6 ${content.color}`}>
                {content.heading}
              </Text>

              <Text className="text-gray-700 text-base leading-relaxed mb-4">
                Dear {studentName},
              </Text>

              <Text className="text-gray-700 text-base leading-relaxed mb-4">
                {content.message}
              </Text>

              <Text className="text-gray-700 text-base leading-relaxed mb-6">
                {content.subMessage}
              </Text>

              {feedback && (
                <Section className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
                  <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Feedback from the team
                  </Text>
                  <Text className="text-gray-700 italic">"{feedback}"</Text>
                </Section>
              )}

              {/* Action Button */}
              <Section className="text-center mt-8 mb-8">
                <Button
                  href={actionUrl}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors"
                >
                  {content.buttonText}
                </Button>
              </Section>

              <Hr className="border-gray-100 my-6" />

              {/* Footer */}
              <Text className="text-center text-gray-400 text-xs">
                © {new Date().getFullYear()} FutureProspect. All rights reserved.
                <br />
                This email was sent regarding your application to {companyName}.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ApplicationStatusEmail;
