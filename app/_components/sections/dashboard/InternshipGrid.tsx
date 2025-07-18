import { InternshipCard, type Internship } from "./InternshipCard";

const mockInternships: Internship[] = [
  {
    id: 1,
    title: "Software Development Intern",
    company: "TechCorp",
    location: "Bamenda",
    salary: 800,
    isPaid: true,
    skills: ["JavaScript", "React", "Node.js"],
    companyInitial: "TC",
    office: "Bamenda Office",
  },
  {
    id: 2,
    title: "Marketing Assistant",
    company: "AdSolutions",
    location: "Bamenda",
    salary: 600,
    isPaid: true,
    skills: ["Social Media", "Content Creation", "Analytics"],
    companyInitial: "CS",
    office: "Creative Studio",
  },
  {
    id: 3,
    title: "Finance Intern",
    company: "BankPlus",
    location: "Douala",
    salary: 700,
    isPaid: true,
    skills: ["Excel", "Financial Analysis", "Accounting"],
    companyInitial: "BP",
    office: "Douala Branch",
  },
  {
    id: 4,
    title: "Data Analyst Trainee",
    company: "DataFlow Inc",
    location: "Yaounde",
    salary: 750,
    isPaid: true,
    skills: ["Python", "SQL", "Data Visualization"],
    companyInitial: "DF",
    office: "Data Center",
  },
  {
    id: 5,
    title: "HR Assistant",
    company: "People First",
    location: "Bamenda",
    salary: 0,
    isPaid: false,
    skills: ["Communication", "Recruitment", "Employee Relations"],
    companyInitial: "PF",
    office: "HR Office",
  },
  {
    id: 6,
    title: "Graphic Design Intern",
    company: "Visual Arts Studio",
    location: "Douala",
    salary: 650,
    isPaid: true,
    skills: ["Photoshop", "Illustrator", "Figma"],
    companyInitial: "VA",
    office: "Design Studio",
  },
];

export const InternshipGrid = () => {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 mb-4">
        {mockInternships.length} results found
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockInternships.map((internship) => (
          <InternshipCard key={internship.id} internship={internship} />
        ))}
      </div>
    </div>
  );
};
