"use client";

import { use, useState } from "react";
import { useFetchDetails } from "@/hooks/useFetchDetails";
import { Program } from "@/lib/types/dashoard/index";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MapPin, Building2, ExternalLink, Clock, CalendarDays, Users, GraduationCap, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { InternshipDetailsLoadingSkeleton } from "@/components/SinglePageLoadingSkeleton";
import { Badge } from "@/components/uiComponent/Badge";
import { LiveVideoModal } from "@/components/sections/dashboard/Video/LiveVideoModal";

const DetailItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null;
  icon?: any;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50/50 px-2 -mx-2 rounded-lg transition-all duration-200">
      {Icon && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
          <Icon size={16} className="text-purple-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block">{label}</span>
        <span className="text-sm font-semibold text-gray-900 mt-0.5 block">{value}</span>
      </div>
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
  const [showForm, setShowForm] = useState(false);

  const {
    data: program,
    isLoading,
    error,
  } = useFetchDetails<Program>("/api/students/programs", resolvedParams.id);

  if (isLoading) return <InternshipDetailsLoadingSkeleton />;
  if (error) return <div className="text-center p-12 text-red-500">{error}</div>;
  if (!program) return <div className="text-center p-12 text-gray-500">Program not found.</div>;

  const company = program.company;
  const MOCK_LIVE_IDS = ["p1", "e1", "i1"];
  const programId = resolvedParams.id;
  const isLive =
    (program as any).is_live ||
    MOCK_LIVE_IDS.includes(programId) ||
    /live/i.test(program.title || "");

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
      <div className="bg-[#F8FAFC] p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h1 className="text-4xl font-bold text-green-700">{program.title}</h1>
            
            {/* Hero Image with Live Badge */}
            <div className="mt-6 h-56 bg-gray-200 rounded-xl overflow-hidden relative group">
              <Image
                src={program.program_picture_url}
                alt={program.title}
                fill
                className="object-cover"
              />
              {isLive && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-red-600 hover:bg-red-600 text-white animate-pulse flex items-center gap-2 px-3 py-1.5 text-sm font-semibold">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                    LIVE NOW
                  </Badge>
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="mt-8 flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-green-500 text-white font-bold text-2xl shadow-md">
                <Building2 size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {company?.company_name || program.organizer || "Program Organizer"}
                </h2>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin size={14} /> {program.location || "Online"}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 prose max-w-none">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                About this Program
              </h3>
              <p>{program.description || "No description provided."}</p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky top-8">
            <Card>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-4 text-green-700">
                  Program Details
                </h3>
                <DetailItem label="Duration" value={program.duration} icon={Clock} />
                <DetailItem label="Start Date" value={program.start_date} icon={CalendarDays} />
                <DetailItem label="End Date" value={program.end_date} icon={CalendarDays} />
                <DetailItem label="Format" value={program.format} icon={Users} />
                <DetailItem label="Level" value={program.level} icon={GraduationCap} />
                <DetailItem label="Type" value={program.type} />
                <DetailItem label="Location" value={program.location} />
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