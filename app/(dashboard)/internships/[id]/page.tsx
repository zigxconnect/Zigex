"use client";

import { useState } from "react";
import { useFetchDetails } from "@/hooks/useFetchDetails";
import { Internship } from "@/lib/types/dashoard/index";
import { Spinner } from "@/components/uiComponent/Spinner";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MapPin, Building2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import DynamicForm from "@/components/sections/dashboard/Application/application";

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

export default function InternshipDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const {
    data: internship,
    isLoading,
    error,
  } = useFetchDetails<Internship>("/api/students/internships", params.id);

  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="text-center p-6 text-red-500 text-lg">{error}</div>
      </div>
    );
  }
  if (!internship) {
    return (
      <div className="text-center p-12 text-gray-500">
        Internship not found.
      </div>
    );
  }

  const company = internship.company;

  if (showForm) {
    return (
      <div className="w-full max-w-4xl p-4 md:p-5 rounded-2xl flex ">
        <Button
          className="hidden md:block text-white rounded-full w-12 h-12 flex-shrink-0 p-1"
          onClick={() => setShowForm(false)}
          variant="primary"
        >
          ←
        </Button>

        <div className="flex-1 w-full">
          <DynamicForm type="internship" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-4xl font-bold text-green-700">
            {internship.title}
          </h1>
          <div className="mt-6 h-56 bg-gray-200 rounded-xl overflow-hidden relative">
            <Image
              src={internship.internship_picture_url}
              alt={internship.title}
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
                <MapPin size={14} /> {internship.location}
              </div>
            </div>
          </div>
          <div className="mt-8 prose max-w-none">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              About this Internship
            </h3>
            <p>{internship.description || "No description provided."}</p>
          </div>
        </div>

        <div className="space-y-6 sticky top-8">
          <Card>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4 text-green-700">
                Internship Details
              </h3>
              <DetailItem label="Location" value={internship.location} />
              <DetailItem label="Start Date" value={internship.start_date} />
              <DetailItem label="End Date" value={internship.end_date} />
            </div>
          </Card>

          <Button
            className="w-full text-base py-3 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowForm(true)}
          >
            Apply Now <ExternalLink size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
