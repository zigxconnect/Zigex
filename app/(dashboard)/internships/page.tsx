"use client";

import { InternshipDetailsModal } from "@/components/sections/dashboard/Internship/InternshipDetailsModal";
import { ShareButton } from "@/components/sections/dashboard/ShareButton";
import { Card } from "@/components/ui/card";
import { Building2, Clock, MapPin } from "lucide-react";

// Sample internships data - replace with your actual data fetching logic
const sampleInternships = [
  {
    id: "frontend-intern-2024",
    title: "Frontend Developer Intern",
    company: "TechCorp Solutions",
    companyLogo: "https://ui-avatars.com/api/?name=TC&background=0052CC&color=fff",
    description: "Join our dynamic frontend team and work on cutting-edge web applications. You'll get hands-on experience with React, Next.js, and modern frontend tools.",
    duration: "6 months",
    location: "Hybrid",
    department: "Frontend Development",
    requirements: [
      "Currently pursuing a degree in Computer Science or related field",
      "Strong understanding of HTML, CSS, and JavaScript",
      "Familiarity with React.js and modern frontend frameworks",
      "Good problem-solving skills and attention to detail"
    ],
    responsibilities: [
      "Develop and maintain frontend components using React.js",
      "Collaborate with designers to implement UI/UX designs",
      "Write clean, maintainable, and efficient code",
      "Participate in code reviews and team discussions"
    ]
  },
  {
    id: "backend-intern-2024",
    title: "Backend Engineer Intern",
    company: "DataFlow Systems",
    companyLogo: "https://ui-avatars.com/api/?name=DS&background=00875A&color=fff",
    description: "Work on scalable backend systems and APIs. Learn about microservices architecture and cloud computing while building real-world applications.",
    duration: "4 months",
    location: "Remote",
    department: "Backend Development",
    requirements: [
      "Strong programming skills in Python, Node.js, or Java",
      "Basic understanding of databases and RESTful APIs",
      "Familiarity with Git version control",
      "Ability to work independently and as part of a team"
    ],
    responsibilities: [
      "Design and implement backend APIs",
      "Work with databases and optimize queries",
      "Write automated tests for backend systems",
      "Document code and maintain technical documentation"
    ]
  },
  {
    id: "ai-intern-2024",
    title: "AI Research Intern",
    company: "Neural Innovations",
    companyLogo: "https://ui-avatars.com/api/?name=NI&background=BF2600&color=fff",
    description: "Join our AI research team and work on cutting-edge machine learning projects. Help develop innovative solutions using the latest AI technologies.",
    duration: "8 months",
    location: "On-site",
    department: "AI/ML",
    requirements: [
      "Strong background in Mathematics and Statistics",
      "Experience with Python and ML frameworks (TensorFlow/PyTorch)",
      "Knowledge of machine learning algorithms and concepts",
      "Research-oriented mindset and analytical skills"
    ],
    responsibilities: [
      "Conduct research on ML algorithms and techniques",
      "Implement and test ML models",
      "Analyze and visualize data using Python",
      "Present findings and contribute to research papers"
    ]
  }
];

export default function InternshipsPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Available Internships
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Launch your career with hands-on experience at leading companies.
          Apply for internships that match your skills and interests.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleInternships.map((internship) => (
          <InternshipDetailsModal
            key={internship.id}
            internship={internship}
            trigger={
              <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4 justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={internship.companyLogo}
                          alt={internship.company}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {internship.title}
                        </h3>
                        <p className="text-sm text-gray-600">{internship.company}</p>
                      </div>
                    </div>
                    <ShareButton
                      title={internship.title}
                      description={internship.description}
                      url={`/internship/${internship.id}`}
                      imageUrl={internship.companyLogo}
                      type="internship"
                    />
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {internship.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      {internship.duration}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {internship.location}
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Building2 className="h-4 w-4 mr-2" />
                      {internship.department}
                    </div>
                  </div>
                </div>
              </Card>
            }
          />
        ))}
      </div>
    </div>
  );
}