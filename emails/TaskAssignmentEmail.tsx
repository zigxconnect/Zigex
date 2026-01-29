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

interface TaskAssignmentEmailProps {
  studentName: string;
  taskTitle: string;
  taskDescription: string;
  dueDate?: string;
  priority?: string;
  supervisorName: string;
}

export const TaskAssignmentEmail = ({
  studentName,
  taskTitle,
  taskDescription,
  dueDate,
  priority,
  supervisorName,
}: TaskAssignmentEmailProps) => {
  const previewText = `New Task Assigned: ${taskTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded-[24px] my-[40px] mx-auto p-[32px] max-w-[500px] shadow-lg">
            <Text className="text-[#155DFC] text-[12px] font-black uppercase tracking-widest text-center mb-4">
              NEW ASSIGNMENT
            </Text>
            <Heading className="text-black text-[28px] font-black text-center p-0 mb-[20px] mx-0 leading-tight">
              {taskTitle}
            </Heading>
            
            <Text className="text-slate-600 text-[16px] leading-[26px] mb-6">
              Hi <strong>{studentName}</strong>,<br/>
              Your supervisor, {supervisorName}, has assigned you a new task.
            </Text>

            <Section className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
              <Text className="text-slate-500 text-[12px] font-black uppercase tracking-widest mb-2 px-1">
                Description
              </Text>
              <Text className="text-slate-900 text-[14px] leading-relaxed mb-4 font-medium">
                {taskDescription}
              </Text>

              {dueDate && (
                <div className="mb-2">
                   <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-1 mb-1">
                    Due Date
                  </Text>
                  <Text className="text-slate-900 text-[14px] font-bold">
                    {dueDate}
                  </Text>
                </div>
              )}
              
              {priority && (
                <div>
                   <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest px-1 mb-1">
                    Priority
                  </Text>
                  <Text className="text-blue-600 text-[14px] font-bold uppercase">
                    {priority}
                  </Text>
                </div>
              )}
            </Section>

            <Section className="text-center">
              <Button
                className="bg-[#155DFC] rounded-xl text-white text-[14px] font-bold no-underline text-center px-8 py-4 shadow-xl shadow-blue-500/20"
                href="https://zigexconnect.com/intern/workspace"
              >
                View Task in Workspace
              </Button>
            </Section>
            
            <Text className="text-slate-400 text-[12px] leading-[24px] text-center mt-8">
              Sent from Zigex Supervisor Hub
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TaskAssignmentEmail;
