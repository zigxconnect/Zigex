import { InternshipBody } from "@/app/_components/sections/dashboard/details/InternshipBody";
import { InternshipInfoPanel } from "@/app/_components/sections/dashboard/details/InternshipInfoPanel";

// Mock data function - it ignores the ID and always returns the same details.
// This is perfect for our current stage of development.
async function getInternshipData(id: string) {
  console.log(`Page received ID: ${id}, but will show the same mock data.`);

  // The data below is taken directly from the Figma design for the details page.
  return {
    title: "Software Development Intern",
    company: "TechCorp Bamenda",
    location: "Bamenda",
    office: "TechCorp Bamenda Office",
    companyInitial: "TC",
    jobDescription:
      "Join our dynamic team of software developers and work on cutting-edge projects that impact thousands of users. This internship offers hands-on experience with modern web technologies and the opportunity to contribute to real-world applications. You will be mentored by senior developers and participate in our agile development process.",

    responsibilities: [
      "Develop and maintain web applications using React and Node.js",
      "Collaborate with cross-functional teams to define and implement new features",
      "Write clean, maintainable, and efficient code",
      "Participate in code reviews and team meetings",
      "Debug and troubleshoot application issues",
      "Assist in testing and quality assurance processes",
      "Learn and apply best practices in software development",
    ],

    requiredSkills: [
      "Currently pursuing a degree in Computer Science, Software Engineering, or related field",
      "Strong foundation in JavaScript and web development fundamentals",
      "Experience with React.js and modern frontend frameworks",
      "Basic understanding of Node.js and backend development",
      "Familiarity with version control systems (Git)",
      "Good problem-solving and analytical skills",
      "Excellent communication and teamwork abilities",
      "Eagerness to learn and adapt to new technologies",
    ],

    details: {
      salary: "$800/month",
      duration: "3 months",
      type: "Full-time",
      industry: "Technology",
      posted: "Jan 15, 2024",
      deadline: "Feb 15, 2024",
      applicants: "47 applied",
    },

    requiredSkillsTags: ["JavaScript", "React", "Node.js", "Git", "MongoDB"],
  };
}

export default async function InternshipDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const internship = await getInternshipData(params.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
        <InternshipBody internship={internship} />
      </div>
      <div className="lg:col-span-1">
        <InternshipInfoPanel internship={internship} />
      </div>
    </div>
  );
}
