"use client";

import { useFetchDetails } from "@/hooks/useFetchDetails";
import { Program } from "@/lib/types/dashoard/index";
import { Spinner } from "@/components/uiComponent/Spinner";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import { MapPin, BookOpen, TriangleAlert } from "lucide-react";
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
      <span className="text-sm font-semibold text-gray-800 text-right">
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
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return <div className="text-center p-12 text-red-500">{error}</div>;
  }
  if (!program) {
    return (
      <div className="text-center p-12 text-gray-500">Program not found.</div>
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
    <div className="bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-4xl font-bold text-purple-700">
            {program.title}
          </h1>
          <div className="mt-6 h-56 bg-gray-200 rounded-xl overflow-hidden relative">
            <Image
              src={program.program_picture_url}
              alt={program.title}
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
                <MapPin size={14} /> {program.location || program.type}
              </div>
            </div>
          </div>
          <div className="mt-8 prose max-w-none space-y-8">
            <section>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Program Description
              </h3>
              <p>{program.description}</p>
            </section>
            {program.required_skills && program.required_skills.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6 sticky top-8">
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
  );
}
