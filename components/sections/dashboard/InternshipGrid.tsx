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
    office: "https://i.ibb.co/Fk55D4CJ/skye8-internship.jpg"
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
    office:  "https://i.ibb.co/qSQTbpk/unib.png"
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
    office: "https://i.ibb.co/yF80L7jc/ccc.png",
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
    office: "https://i.ibb.co/VchKJd69/seedLogo.webp"
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
    office: "https://i.ibb.co/MkXDZsfx/Civil-Salt.jpg"
    
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
    office: "https://i.ibb.co/bMcCwpSp/nervtech.png"
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
// upload images to imgbb.com and create the link and replace