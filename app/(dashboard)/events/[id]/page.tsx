"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
<<<<<<< HEAD
import { MapPin, Building2, ExternalLink, TriangleAlert, Calendar, X } from "lucide-react";
=======
import Link from "next/link";
import { MapPin, ExternalLink, Calendar, Clock, Users, X } from "lucide-react";
>>>>>>> master
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { useFetchDetails } from "@/hooks/useFetchDetails";
import { InternshipDetailsLoadingSkeleton } from "@/components/SinglePageLoadingSkeleton";
import { normalizeImageSrc } from "@/lib/utils";

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

interface EventWithCompany {
  id: string;
  title: string;
  description?: string;
  location: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  type?: string;
  format?: string;
  event_picture_url?: string;
  company_id?: string;
  company?: {
    id: string;
    company_name: string;
    logo_url?: string;
  };
  is_live?: boolean;
  max_participants?: number;
  registration_deadline?: string;
}

function useOtherPrograms(event: EventWithCompany | null) {
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (!event) return;
    const companyId = event.company_id || event.company?.id;
    if (!companyId) return;

    async function fetchPrograms() {
      try {
        const response = await fetch(`/api/public/companies/${companyId}/programs`);
        const data = await response.json();
        setPrograms((data.programs || []).filter((p: any) => p.id !== event.id));
      } catch (error) {
        console.error('Error fetching other programs:', error);
        setPrograms([]);
      }
    }

    fetchPrograms();
  }, [event]);

  return programs;
}

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // First, resolve the params Promise
  const resolvedParams = use(params);
  
  // Then initialize all state hooks
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch event data
  const { data: event, isLoading, error } = useFetchDetails<EventWithCompany>(
    "/api/students/events",
    resolvedParams.id
  );

  // Fetch other programs using custom hook
  const otherPrograms = useOtherPrograms(event);

  // Early returns after all hooks
  if (isLoading) return <InternshipDetailsLoadingSkeleton />;
  if (error) return <div className="text-center p-12 text-red-500">{error}</div>;
  if (!event) return <div className="text-center p-12 text-gray-500">Event not found</div>;

  const company = event.company;
  const isLive = event.is_live;
  
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const startDate = formatDate(event.start_date);
  const endDate = formatDate(event.end_date);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100 to-indigo-100">
                  <Image
                    src={normalizeImageSrc(event.event_picture_url || "/placeholder.png")}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-3">
                      Event
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                      {event.title}
                    </h1>
                  </div>
                </div>
              </Card>

              {/* Company Info Card */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <Link href={`/company/${company?.id || event.company_id}`} className="flex items-center gap-4 group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg relative">
                      <Image
                        src={normalizeImageSrc(company?.logo_url || "/seedLogo.png")}
                        alt={company?.company_name || event.location}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {company?.company_name || event.location}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>

              {/* Description Card */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                    About this Event
                  </h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {event.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Map + Other programs by company */}
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <div className="p-4 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <MapPin size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Location</div>
                        <div className="text-xs text-gray-500">{event.location || "Online"}</div>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                  <div className="w-full h-52 md:h-72 bg-gray-100">
                    <iframe
                      title="event-location"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(event.location || "")}&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Other programs by this company</h4>
                  <div className="space-y-3">
                    {otherPrograms.length === 0 ? (
                      <div className="text-sm text-gray-500">No programs found.</div>
                    ) : (
                      otherPrograms.slice(0,6).map((p:any) => (
                        <Link key={p.id} href={`/(dashboard)/programs/${p.id}`} className="block p-3 rounded-lg border hover:shadow transition">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                              {p.program_picture_url ? (
                                <Image src={p.program_picture_url} alt={p.title} width={48} height={48} className="object-cover" />
                              ) : (
                                <img src="/seedLogo.png" alt="logo" className="object-cover w-full h-full" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{p.title}</div>
                              <div className="text-xs text-gray-500">{formatDate(p.created_at)}</div>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar - Fixed on desktop */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 space-y-4">
                {/* Event Details Card */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      <Calendar size={20} />
                      Event Details
                    </h3>
                  </div>
                  <div className="p-5">
                    <DetailItem 
                      label="Location" 
                      value={event.location} 
                      icon={MapPin}
                    />
                    <DetailItem 
                      label="Start Date" 
                      value={startDate} 
                      icon={Calendar}
                    />
                    <DetailItem 
                      label="End Date" 
                      value={endDate} 
                      icon={Calendar}
                    />
                    <DetailItem 
                      label="Time" 
                      value={event.start_time || "Not specified"} 
                      icon={Clock}
                    />
                  </div>
                </Card>

                {/* CTA Button */}
                <Button
                  className="w-full text-base py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
                  onClick={() => setIsFormOpen(true)}
                  variant="primary"
                >
                  Register Now 
                  <ExternalLink size={18} className="ml-2" />
                </Button>

                <Card className="border-blue-200 bg-blue-50/50 shadow-md">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Calendar size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-900 text-sm mb-1">Event Information</h4>
                        <p className="text-blue-800 text-xs leading-relaxed">
                          {event.is_live 
                            ? "This event is currently live. Join now to participate in real-time!"
                            : "Register early to secure your spot. Event capacity may be limited."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-lg mx-auto">
            <Button
              className="w-full py-4 text-base font-semibold shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 transform hover:scale-[1.02] transition-all duration-300"
              onClick={() => setIsFormOpen(true)}
              variant="primary"
            >
              <Calendar size={20} className="mr-2" />
              Register for Event
              <ExternalLink size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between pb-4 mb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{company?.company_name || "Event Registration"}</p>
            </div>
            <Button
              variant="ghost"
              className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
              onClick={() => setIsFormOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>
          <DynamicForm type="event" id={event.id} />
        </DialogContent>
      </Dialog>
    </>
  );
}