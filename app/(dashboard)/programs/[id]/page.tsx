"use client";

import { use, useState } from "react";
import { useFetchDetails } from "@/hooks/useFetchDetails";
import { Program } from "@/lib/types/dashoard/index";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MapPin, BookOpen, TriangleAlert, Play, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/uiComponent/Alert";
import { ListItem } from "@/components/uiComponent/ListItem";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { InternshipDetailsLoadingSkeleton } from "@/components/SinglePageLoadingSkeleton";
import { Badge } from "@/components/uiComponent/Badge";
import { LiveVideoModal } from "@/components/sections/dashboard/Video/LiveVideoModal";

// DetailItem helper component
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
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const {
    data: program,
    isLoading,
    error,
  } = useFetchDetails<Program>("/api/students/programs", resolvedParams.id);

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
  const MOCK_LIVE_IDS = ["p1", "e1", "i1"];
  const programId = resolvedParams.id;
  const isLive =
    (program as any).is_live ||
    MOCK_LIVE_IDS.includes(programId) ||
    /live/i.test(program.title || "");

  const deadline = program.application_deadline
    ? new Date(program.application_deadline).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })
    : "Not specified";

  if (showForm) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-5 flex items-start">
        <Button
          className="rounded-full w-12 h-12 flex-shrink-0 mr-4 p-1"
          onClick={() => setShowForm(false)}
          variant="primary"
        >
          ←
        </Button>
        <div className="flex-1 w-full">
          <DynamicForm type="program" id={program.id} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="lg:px-8 lg:py-8">
          <div className="lg:max-w-7xl lg:mx-auto">
            <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="bg-white lg:rounded-2xl lg:shadow-lg lg:border lg:border-gray-200 overflow-hidden min-h-screen lg:min-h-0">
                  {/* Hero Image Section */}
                  <div className="relative h-64 sm:h-80 lg:h-96 w-full group">
                    <Image
                      src={program.program_picture_url}
                      alt={program.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Live Badge Overlay */}
                    {isLive && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-red-600 hover:bg-red-600 text-white animate-pulse flex items-center gap-2 px-3 py-1.5 text-sm font-semibold">
                          <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                          LIVE NOW
                        </Badge>
                      </div>
                    )}

                    {/* Play Button Overlay for Live */}
                    {isLive && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          onClick={() => setIsVideoModalOpen(true)}
                          size="lg"
                          className="bg-red-600 hover:bg-red-700 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                        >
                          <Play size={32} className="ml-1" fill="white" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-700 leading-tight flex-1">
                        {program.title}
                      </h1>
                      {isLive && (
                        <Button
                          onClick={() => setIsVideoModalOpen(true)}
                          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 animate-pulse"
                        >
                          <Play size={16} fill="white" />
                          Watch Live
                        </Button>
                      )}
                    </div>

                    {/* Company Info */}
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
                          <span className="truncate">
                            {program.location || program.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-8 space-y-8">
                      <section>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          Program Description
                        </h3>
                        <div className="prose prose-gray max-w-none text-base leading-relaxed">
                          <p>{program.description}</p>
                        </div>
                      </section>

                      {/* Required Skills */}
                      {program.required_skills &&
                        program.required_skills.length > 0 && (
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
                  </div>
                </div>
              </div>

              {/* Desktop Sidebar */}
              <div className="hidden lg:block space-y-6 lg:sticky lg:top-8">
                <Card>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-4 text-purple-700">
                      Program Details
                    </h3>
                    <DetailItem
                      label="Category"
                      value={program.program_category}
                    />
                    <DetailItem label="Type" value={program.type} />
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

        {/* Mobile bottom sheet */}
        {showMobileDetails && (
          <div className="fixed inset-0 z-50 flex items-end md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileDetails(false)}
            />
            <div className="relative w-full bg-white rounded-t-xl p-4 max-h-[80vh] overflow-auto animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{program.title}</h3>
                <button
                  onClick={() => setShowMobileDetails(false)}
                  className="text-gray-600"
                >
                  Close
                </button>
              </div>
              <div className="prose prose-gray max-w-none">
                {program.description}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Video Modal */}
      <LiveVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={(program as any).live_stream_url}
        title={program.title}
        company={company?.company_name || "Community Program"}
        description={program.description}
        thumbnail={program.program_picture_url}
      />
    </>
  );
}