"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Building2, ExternalLink, Clock, CalendarDays, Users, GraduationCap, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { useFetchDetails } from "@/hooks/useFetchDetails";
import { InternshipDetailsLoadingSkeleton } from "@/components/SinglePageLoadingSkeleton";
import { Badge } from "@/components/uiComponent/Badge";
import { normalizeImageSrc } from "@/lib/utils";

const MOCK_LIVE_IDS = ["p1", "e1", "i1"];

interface ProgramWithCompany {
  id: string;
  title: string;
  description?: string;
  location: string;
  duration?: string;
  format?: string;
  level?: string;
  type?: string;
  program_picture_url?: string;
  company_id?: string;
  company?: {
    id: string;
    company_name: string;
    logo_url?: string;
  };
  is_live?: boolean;
  start_date?: string;
  end_date?: string;
}

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
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <Icon size={16} className="text-blue-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block">{label}</span>
        <span className="text-sm font-semibold text-gray-900 mt-0.5 block">{value}</span>
      </div>
    </div>
  );
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

function useOtherPrograms(program: ProgramWithCompany | null) {
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (!program) return;
    const companyId = program.company_id || program.company?.id;
    if (!companyId) return;

    async function fetchPrograms() {
      try {
        const response = await fetch(`/api/public/companies/${companyId}/programs`);
        const data = await response.json();
        setPrograms((data.programs || []).filter((p: any) => p.id !== program.id));
      } catch (error) {
        console.error('Error fetching other programs:', error);
        setPrograms([]);
      }
    }

    fetchPrograms();
  }, [program]);

  return programs;
}

// Cache other programs for 4 minutes
const getOtherPrograms = unstable_cache(
  async (companyId: string, currentProgramId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/companies/${companyId}/programs`, {
        next: { tags: [`company-programs-${companyId}`] }
      });
      if (!response.ok) throw new Error('Failed to fetch other programs');
      const data = await response.json();
      return (data.programs || []).filter((p: any) => p.id !== currentProgramId);
    } catch (error) {
      console.error('Error fetching other programs:', error);
      return [];
    }
  },
  ['other-programs'],
  { revalidate: 240 } // 4 minutes
);

export default function ProgramDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // First, resolve the params Promise
  const resolvedParams = use(params);

  // Then initialize all state hooks
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Fetch program data
  const {
    data: program,
    isLoading,
    error,
  } = useFetchDetails<ProgramWithCompany>("/api/students/programs", resolvedParams.id);

  // Early returns after all hooks
  if (isLoading) return <InternshipDetailsLoadingSkeleton />;
  if (error) return <div className="text-center p-12 text-red-500">{error}</div>;
  if (!program) return <div className="text-center p-12 text-gray-500">Program not found.</div>;

  const isLive = program.is_live || 
                 MOCK_LIVE_IDS.includes(id) || 
                 /live/i.test(program.title || "");

  // Compute derived values
  const company = program.company;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100 to-indigo-100">
                <Image
                  src={normalizeImageSrc(program.program_picture_url)}
                  alt={program.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  {isLive && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full mb-3">
                      <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                      LIVE NOW
                    </div>
                  )}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                    {program.title}
                  </h1>
                </div>
              </div>
            </Card>

            {/* Company Info */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 sm:p-8">
                <Link href={`/company/${company?.id || program.company_id}`} className="flex items-center gap-4 group">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg relative">
                    <Image
                      src={company?.logo_url || "/seedLogo.png"}
                      alt={company?.company_name || "Company Logo"}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {company?.company_name || "SEED Inc"}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                      <span className="truncate">{program.location || "Online"}</span>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>

            {/* Description */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                  About this Program
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {program.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Map + Other programs section */}
              <div className="mt-6 space-y-4">
                {program.location && (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="p-4 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <MapPin size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Location</div>
                          <div className="text-xs text-gray-500">{program.location}</div>
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(program.location)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                    <div className="w-full h-52 md:h-72 bg-gray-100">
                      <iframe
                        title="program-location"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(program.location)}&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {/* Other Programs Section */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4">Other Programs by this Company</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {otherPrograms.length === 0 ? (
                      <div className="text-sm text-gray-500">No other programs available.</div>
                    ) : (
                      otherPrograms.slice(0, 6).map((program: any) => (
                        <Link 
                          key={program.id} 
                          href={`/programs/${program.id}`}
                          className="block p-4 rounded-lg border hover:shadow-md transition-shadow bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {program.program_picture_url ? (
                                <Image 
                                  src={normalizeImageSrc(program.program_picture_url)} 
                                  alt={program.title} 
                                  width={48} 
                                  height={48} 
                                  className="object-cover w-full h-full" 
                                />
                              ) : (
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm text-gray-900 truncate">
                                {program.title}
                              </h5>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(program.created_at)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
            
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Program Details Card */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <GraduationCap size={20} />
                    Program Details
                  </h3>
                </div>
                <div className="p-5">
                  <DetailItem label="Duration" value={program.duration} icon={Clock} />
                  <DetailItem label="Start Date" value={program.start_date ? formatDate(program.start_date) : null} icon={CalendarDays} />
                  <DetailItem label="End Date" value={program.end_date ? formatDate(program.end_date) : null} icon={CalendarDays} />
                  <DetailItem label="Format" value={program.format} icon={Users} />
                  <DetailItem label="Level" value={program.level} icon={GraduationCap} />
                  <DetailItem label="Type" value={program.type} />
                  <DetailItem label="Location" value={program.location} icon={MapPin} />
                </div>
              </Card>

              {/* Small Map Preview */}
              {program.location && (
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="p-4">
                    <div className="text-sm font-semibold mb-2">Location Preview</div>
                    <div className="w-full h-36 rounded-lg overflow-hidden border">
                      <iframe
                        title="program-location-preview"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(program.location)}&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(program.location)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline mt-3 block"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </Card>
              )}

              {/* CTA Button */}
              <Button
                className="w-full text-base py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
                onClick={() => setIsFormOpen(true)}
                variant="primary"
              >
                Register Now
                <ExternalLink size={18} className="ml-2" />
              </Button>

              {/* Info Alert */}
              <Card className="border-blue-200 bg-blue-50/50 shadow-md">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <GraduationCap size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-blue-900 text-sm mb-1">Application Tips</h4>
                      <p className="text-blue-800 text-xs leading-relaxed">
                        Ensure your application highlights relevant experience and your motivation for joining this program. Submissions are reviewed on a rolling basis.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between pb-4 mb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{program.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{program.company?.company_name || "Program Registration"}</p>
            </div>
            <Button
              variant="secondary-outline"
              className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
              onClick={() => setIsFormOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
          <DynamicForm type="program" id={program.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
