"use client";
import { use } from "react";
import { BookOpen, MapPin, TriangleAlert, Bell } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// For demo: static mock data for a notification's program
const mockPrograms = {
  "ai-fundamentals": {
    id: "ai-fundamentals",
    title: "AI Fundamentals Bootcamp",
    description: "Kickstart your career in AI with hands-on projects and expert mentors. Learn Python, machine learning, and more!",
    company_id: "company-1",
    program_category: "Technology",
    start_date: "2025-10-01",
    end_date: "2025-12-15",
    application_deadline: "2025-09-30",
    location: "Online",
    type: "Bootcamp",
    program_picture_url: "/ccc.png",
    required_skills: ["Python", "Machine Learning", "Data Analysis"],
    company: {
      company_name: "ZIGEX Academy",
      logo_url: "/ccc.png",
      cover_image_url: "/ccc.png"
    }
  },
  // Add more mock programs here if needed
};

export default function NotificationProgramPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const { id } = params;
  const displayProgram = (mockPrograms as any)[id] || mockPrograms["ai-fundamentals"];
  const company = displayProgram.company;
  const deadline = displayProgram.application_deadline
    ? new Date(displayProgram.application_deadline).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : "Not specified";

  return (
    <div className="bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center gap-2 bg-blue-100 border border-blue-300 rounded-lg px-4 py-3 shadow">
          <Bell size={20} className="text-blue-600" />
          <span className="text-blue-900 font-medium">You opened this program from a notification.</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-4xl font-bold text-purple-700">
            {displayProgram.title}
          </h1>
          <div className="mt-6 h-56 bg-gray-200 rounded-xl overflow-hidden relative">
            <Image
              src={displayProgram.program_picture_url}
              alt={displayProgram.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-8 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-purple-500 text-white font-bold text-2xl shadow-md">
              <BookOpen size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {company?.company_name || "Community Program"}
              </h2>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 capitalize">
                <MapPin size={14} /> {displayProgram.location || displayProgram.type}
              </div>
            </div>
          </div>
          <div className="mt-8 prose max-w-none space-y-8">
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Program Description
              </h3>
              <p className="text-gray-700 text-base">
                {displayProgram.description}
              </p>
            </section>
            {/* Add more sections as needed */}
          </div>
        </div>
        {/* Sidebar */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <TriangleAlert size={18} className="text-yellow-500" />
            Program Details
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-500 font-medium">Location</span>
              <span className="text-sm font-semibold text-gray-800 text-right">{displayProgram.location}</span>
            </div>
            <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-500 font-medium">Type</span>
              <span className="text-sm font-semibold text-gray-800 text-right">{displayProgram.type}</span>
            </div>
            <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-500 font-medium">Application Deadline</span>
              <span className="text-sm font-semibold text-gray-800 text-right">{deadline}</span>
            </div>
            <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-500 font-medium">Company</span>
              <span className="text-sm font-semibold text-gray-800 text-right">{company?.company_name ?? null}</span>
            </div>
          </div>
          <Button className="mt-6 w-full" variant="primary">
            Apply Now
          </Button>
        </div>
      </div>
    </div>
  );
}
