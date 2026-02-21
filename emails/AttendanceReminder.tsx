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

interface AttendanceReminderEmailProps {
  supervisorName: string;
  interns: { name: string }[];
  dashboardLink: string;
}

export const AttendanceReminderEmail = ({
  supervisorName,
  interns,
  dashboardLink,
}: AttendanceReminderEmailProps) => {
  const previewText = `Reminder: Please record attendance for your interns today.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded-[24px] my-[40px] mx-auto p-[32px] max-w-[500px] shadow-lg">
            <Text className="text-[#155DFC] text-[12px] font-black uppercase tracking-widest text-center mb-4">
              ATTENDANCE REMINDER
            </Text>
            <Heading className="text-black text-[28px] font-black text-center p-0 mb-[20px] mx-0 leading-tight">
              Don't Forget! 📝
            </Heading>
            
            <div className="flex justify-center mb-6">
               <div className="bg-blue-50 text-blue-600 p-4 rounded-full">
                  <span className="text-2xl">⏰</span>
               </div>
            </div>

            <Text className="text-slate-600 text-[16px] leading-[26px] mb-6">
              Hi <strong>{supervisorName}</strong>,<br/>
              This is a friendly reminder to record today's attendance for your interns. Keeping track of attendance helps us monitor progress and ensure consistency.
            </Text>

            <Section className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
              <Text className="text-slate-500 text-[12px] font-black uppercase tracking-widest mb-4 px-1">
                Interns awaiting attendance today:
              </Text>
              <ul className="m-0 p-0 list-none">
                {interns.map((intern, index) => (
                  <li key={index} className="flex items-center gap-3 py-2 border-b border-slate-200 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <Text className="text-slate-900 text-[14px] font-bold m-0">
                      {intern.name}
                    </Text>
                  </li>
                ))}
              </ul>
            </Section>

            <Section className="text-center">
              <Button
                className="bg-[#155DFC] rounded-xl text-white text-[14px] font-bold no-underline text-center px-8 py-4 shadow-xl shadow-blue-500/20"
                href={dashboardLink}
              >
                Go to Supervisor Dashboard
              </Button>
            </Section>
            
            <Text className="text-slate-400 text-[12px] leading-[24px] text-center mt-8">
              Thank you for your commitment to mentoring our future leaders!
            </Text>
            <Text className="text-slate-400 text-[10px] text-center mt-2">
              Sent from Zigex Supervisor Hub
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AttendanceReminderEmail;
