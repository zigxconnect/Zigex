"use client";

import { useFetchDetails } from "@/hooks/useFetchDetails";
import { Program } from "@/lib/types/dashoard/index";
import { Spinner } from "@/components/uiComponent/Spinner";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import { MapPin, BookOpen, TriangleAlert, LoaderPinwheel } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/uiComponent/Alert";
import { ListItem } from "@/components/uiComponent/ListItem";

// Reusing the DetailItem helper component
const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
};

export default function ProgramDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: program,
    isLoading,
    error,
  } = useFetchDetails<Program>("/api/students/programs", params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
          <LoaderPinwheel/>
     
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 text-red-500 text-lg">{error}</div>
      </div>
    );
  }
  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 text-gray-500 text-lg">Program not found.</div>
      </div>
    );
  }

  const company = program.company;
  const deadline = program.application_deadline
    ? new Date(program.application_deadline).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : "Not specified";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile: No padding, Desktop: Padding */}
      <div className="lg:px-8 lg:py-8">
        <div className="lg:max-w-7xl lg:mx-auto">
          
          {/* Mobile: Stack layout, Desktop: Grid layout */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Mobile: Full width card with no border radius, Desktop: Rounded card */}
              <div className="bg-white lg:rounded-2xl lg:shadow-lg lg:border lg:border-gray-200 overflow-hidden min-h-screen lg:min-h-0">
                
                {/* Hero Image - Much larger on mobile */}
                <div className="relative h-64 sm:h-80 lg:h-96 w-full">
                  <Image
                    src={program.program_picture_url}
                    alt={program.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Gradient overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Title - Larger and more prominent */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-700 leading-tight">
                    {program.title}
                  </h1>

                  {/* Company Info - Better mobile layout */}
                  <div className="mt-6 flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center bg-purple-500 text-white font-bold shadow-md">
                      <BookOpen size={24} className="sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {company?.company_name || "Community Program"}
                      </h2>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 capitalize">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span className="truncate">{program.location || program.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Sections - Better typography */}
                  <div className="mt-8 space-y-8">
                    <section>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Program Description
                      </h3>
                      <div className="prose prose-gray max-w-none text-base leading-relaxed">
                        <p>{program.description}</p>
                      </div>
                    </section>
                    
                    {program.required_skills && program.required_skills.length > 0 && (
                      <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          Required Skills
                        </h3>
                        <ul className="space-y-2">
                          {program.required_skills.map((skill, i) => (
                            <li key={i}>
                              <ListItem>{skill}</ListItem>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>

                  {/* Mobile Program Details - Show here on small screens */}
                  <div className="mt-8 lg:hidden">
                    <Card>
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-4 text-purple-700">
                          Program Details
                        </h3>
                        <DetailItem label="Category" value={program.program_category} />
                        <DetailItem label="Type" value={program.type} />
                        <DetailItem label="Location" value={program.location} />
                      </div>
                    </Card>
                    
                    {/* Mobile Apply Button */}
                    <Button className="w-full text-base py-4 font-semibold mt-6">
                      Apply or Learn More
                    </Button>

                    {/* Mobile Alert */}
                    <div className="mt-6 mb-8">
                      <Alert icon={TriangleAlert} variant="warning">
                        <h4 className="font-bold">Application Deadline</h4>
                        <p className="mt-1">
                          Applications close on {deadline}. Apply soon!
                        </p>
                      </Alert>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Sidebar - Hidden on mobile since content is moved above */}
            <div className="hidden lg:block space-y-6 lg:sticky lg:top-8">
              <Card>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-purple-700">
                    Program Details
                  </h3>
                  <DetailItem label="Category" value={program.program_category} />
                  <DetailItem label="Type" value={program.type} />
                  <DetailItem label="Location" value={program.location} />
                </div>
              </Card>
              
              <Button className="w-full text-base py-3 font-semibold">
                Apply or Learn More
              </Button>
              
              <Alert icon={TriangleAlert} variant="warning">
                <h4 className="font-bold">Application Deadline</h4>
                <p className="mt-1">
                  Applications close on {deadline}. Apply soon!
                </p>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}