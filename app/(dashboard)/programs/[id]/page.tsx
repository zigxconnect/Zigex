"use client";

import { useState } from "react";
import { useFetchDetails } from "@/hooks/useFetchDetails";
import { Program } from "@/lib/types/dashoard/index";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MapPin, Building2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { InternshipDetailsLoadingSkeleton } from "@/components/SinglePageLoadingSkeleton";

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
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return <InternshipDetailsLoadingSkeleton />;
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
        <div className="text-center p-6 text-gray-500 text-lg">
          Program not found.
        </div>
      </div>
    );
  }

  const company = program.company;

  if (showForm) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-5 flex items-start">
        <Button
          className="hidden md:block rounded-full w-12 h-12 flex-shrink-0 mr-4 p-1"
          onClick={() => setShowForm(false)}
          variant="primary"
        >
          ←
        </Button>
        <div className="flex-1 w-full">
          {/* ✨ FIX: Pass the program's ID to the form */}
          <DynamicForm type="program" id={program.id} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-4xl font-bold text-green-700">{program.title}</h1>
          <div className="mt-6 h-56 bg-gray-200 rounded-xl overflow-hidden relative">
            <Image
              src={program.program_picture_url}
              alt={program.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-8 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-green-500 text-white font-bold text-2xl shadow-md">
              <Building2 size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {company?.company_name}
              </h2>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin size={14} /> {program.location}
              </div>
            </div>
          </div>
          <div className="mt-8 prose max-w-none">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              About this Program
            </h3>
            <p>{program.description || "No description provided."}</p>
          </div>
        </div>
        <aside className="space-y-6 lg:sticky top-8">
          <Card>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4 text-green-700">
                Program Details
              </h3>
              <DetailItem label="Location" value={program.location} />
              <DetailItem label="Start Date" value={program.start_date} />
              <DetailItem label="End Date" value={program.end_date} />
            </div>
          </Card>
          <Button
            className="w-full text-base py-3 font-semibold"
            onClick={() => setShowForm(true)}
            variant="primary"
          >
            Register Now <ExternalLink size={16} className="ml-2" />
          </Button>
        </aside>
      </div>
    </div>
  );
}
