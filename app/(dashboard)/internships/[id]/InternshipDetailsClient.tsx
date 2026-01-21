"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Building2, ExternalLink, Clock, Briefcase, Users, X, CheckCircle2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/sections/dashboard/ShareButton";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { useFetchDetails } from "@/hooks/useFetchDetails";
import { InternshipDetailsLoadingSkeleton } from "@/components/SinglePageLoadingSkeleton";
import { normalizeImageSrc } from "@/lib/utils";
import InternshipApplicationModal from "@/components/feed/details/appyButton/InternshipApplicationModal";
import { DollarSign } from "lucide-react";

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

interface InternshipWithCompany {
  id: string;
  title: string;
  description?: string;
  location: string;
  duration?: string;
  department?: string;
  internship_picture_url?: string;
  company_id?: string;
  company?: {
    id: string;
    company_name: string;
    logo_url?: string;
  };
  deadline?: string;
  start_date?: string;
  end_date?: string;
  is_paid?: boolean;
  compensation_amount?: string;
  cover_image_url?: string;
  category?: string;
}

function useOtherPrograms(internship: InternshipWithCompany | null) {
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (!internship) return;
    const companyId = internship.company_id || internship.company?.id;
    if (!companyId) return;

    async function fetchPrograms() {
      try {
        const response = await fetch(`/api/public/companies/${companyId}/programs`);
        const data = await response.json();
        setPrograms(data.programs || []);
      } catch (error) {
        console.error('Error fetching other programs:', error);
        setPrograms([]);
      }
    }

    fetchPrograms();
  }, [internship]);

  return programs;
}

export default function InternshipDetailsClient({ id }: { id: string }) {
  const [showModal, setShowModal] = useState(false);
  const [companyData, setCompanyData] = useState<InternshipWithCompany['company'] | null>(null);
  
  const { data: internship, isLoading, error } = useFetchDetails<InternshipWithCompany>(
    "/api/students/internships",
    id
  );
  const otherPrograms = useOtherPrograms(internship);

  useEffect(() => {
    if (!internship) return;
    if (internship.company) {
      setCompanyData(internship.company);
      return;
    }
    const companyId = internship.company_id;
    if (!companyId) return;

    let mounted = true;
    fetch(`/api/public/companies/${companyId}`)
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setCompanyData(j.company || j);
      })
      .catch((e) => {
        console.error('Failed to fetch company data:', e);
      });

    return () => {
      mounted = false;
    };
  }, [internship]);

  if (isLoading) return <InternshipDetailsLoadingSkeleton />;
  if (error) return <div className="text-center p-12 text-red-500">{error}</div>;
  if (!internship) return <div className="text-center p-12 text-gray-500">Internship not found</div>;

  const company = companyData || internship.company;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100 to-indigo-100">
                  <Image
                    src={normalizeImageSrc(internship.cover_image_url || internship.internship_picture_url)}
                    alt={internship.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-4 right-4 z-20">
                    <ShareButton
                      title={internship.title}
                      description={internship.description || "Check out this internship opportunity"}
                      url={`/internship/${internship.id}`}
                      imageUrl={normalizeImageSrc(internship.cover_image_url || internship.internship_picture_url)}
                      type="internship"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                          <Briefcase size={14} />
                          Internship
                        </div>
                        {internship.is_paid && (
                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-sm">
                            <DollarSign size={14} />
                            Paid
                          </div>
                        )}
                        {!internship.is_paid && internship.is_paid !== undefined && (
                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full shadow-sm">
                            Free
                          </div>
                        )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                      {internship.title}
                    </h1>
                  </div>
                </div>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <Link href={`/company/${company?.id || internship.company_id}`} className="flex items-center gap-4 group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg relative">
                      <Image
                        src={normalizeImageSrc(company?.logo_url || "/seedLogo.png")}
                        alt={company?.company_name || "Company Logo"}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {company?.company_name || "Company"}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                        <span className="truncate">{internship.location}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                    About this Internship
                  </h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {internship.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="p-4 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <MapPin size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">Location</div>
                          <div className="text-xs text-gray-500">{internship.location || "Online"}</div>
                        </div>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(internship.location || "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                    <div className="w-full h-52 md:h-72 bg-gray-100">
                      <iframe
                        title="internship-location"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(internship.location || "")}&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                  </div>

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

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                    What We're Looking For
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">Strong communication and teamwork skills</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">Passionate about learning and growth</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">Ability to work in a fast-paced environment</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 space-y-4">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      <Briefcase size={20} />
                      Internship Details
                    </h3>
                  </div>
                  <div className="p-5">
                    <DetailItem 
                      label="Duration" 
                      value={internship.duration || null} 
                      icon={Clock}
                    />
                    <DetailItem 
                      label="Deadline" 
                      value={formatDate(internship.deadline) || "Not specified"} 
                      icon={Calendar}
                    />
                    {internship.is_paid && (
                       <DetailItem 
                        label="Compensation" 
                        value={internship.compensation_amount || "Paid"} 
                        icon={DollarSign}
                      />
                    )}
                  </div>
                </Card>

                {(() => {
                  const isDeadlinePassed = internship.deadline ? new Date(internship.deadline) < new Date() : false;
                  
                  return (
                    <Button
                      className={`w-full text-base py-6 font-semibold shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-0 ${
                        isDeadlinePassed ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-200/50"
                      }`}
                      onClick={() => !isDeadlinePassed && setShowModal(true)}
                      disabled={isDeadlinePassed}
                      variant={isDeadlinePassed ? "secondary" : "primary"}
                    >
                      {isDeadlinePassed ? "Applications Closed" : "Apply Now"}
                      {!isDeadlinePassed && <ExternalLink size={18} className="ml-2" />}
                      {isDeadlinePassed && <X size={18} className="ml-2" />}
                    </Button>
                  );
                })()}

                <Card className="border-blue-200 bg-blue-50/50 shadow-md">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-900 text-sm mb-1">Application Tips</h4>
                        <p className="text-blue-800 text-xs leading-relaxed">
                          Ensure your resume is up to date and highlights relevant experience. Applications are reviewed on a rolling basis.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-lg mx-auto">
            {(() => {
              const isDeadlinePassed = internship.deadline ? new Date(internship.deadline) < new Date() : false;
              return (
                <Button
                  className={`w-full py-4 text-base font-semibold shadow-2xl border-0 transform hover:scale-[1.02] transition-all duration-300 ${
                    isDeadlinePassed ? "bg-gray-400" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
                  onClick={() => !isDeadlinePassed && setShowModal(true)}
                  disabled={isDeadlinePassed}
                  variant={isDeadlinePassed ? "secondary" : "primary"}
                >
                  <Briefcase size={20} className="mr-2" />
                  {isDeadlinePassed ? "Applications Closed" : "Apply for Internship"}
                  {!isDeadlinePassed && <ExternalLink size={18} className="ml-2" />}
                </Button>
              );
            })()}
          </div>
        </div>
      </div>

      {showModal && (
        <InternshipApplicationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          internshipId={internship.id}
          internshipTitle={internship.title}
          companyName={company?.company_name || ""}
        />
      )}
    </>
  );
}
