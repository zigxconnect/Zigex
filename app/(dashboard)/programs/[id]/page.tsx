"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Building2, ExternalLink, Clock, GraduationCap, Users, X, CheckCircle2, CalendarDays, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { useFetchDetails } from "@/hooks/useFetchDetails";
import { InternshipDetailsLoadingSkeleton } from "@/components/SinglePageLoadingSkeleton";

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
  params: { id: string };
}) {
  const { data: program, isLoading, error } = useFetchDetails<any>(
    "/api/students/programs",
    params.id
  );
  const [showModal, setShowModal] = useState(false);

  if (isLoading) return <InternshipDetailsLoadingSkeleton />;
  if (error) return <div className="text-center p-12 text-red-500">{error}</div>;
  if (!program) return <div className="text-center p-12 text-gray-500">Program not found.</div>;

  const company = program.company;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const startDate = program.start_date ? formatDate(program.start_date) : "To be announced";
  const endDate = program.end_date ? formatDate(program.end_date) : "To be announced";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-purple-100 to-indigo-100">
                  <Image
                    src={program.program_picture_url || "/placeholder.png"}
                    alt={program.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full mb-3">
                      <GraduationCap size={14} />
                      Program
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                      {program.title}
                    </h1>
                  </div>
                </div>
              </Card>

              {/* Company Info Card */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg flex-shrink-0">
                      <Building2 size={32} className="sm:w-10 sm:h-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                        {company?.company_name || program.organizer || "Program Organizer"}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-purple-600 flex-shrink-0" />
                        <span className="truncate">{program.location || "Online"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Description Card */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                    About this Program
                  </h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {program.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </Card>

              {/* What You'll Learn Card */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                    What You'll Learn
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">Hands-on practical skills and industry best practices</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">Real-world projects and portfolio development</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">Mentorship from experienced professionals</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">Certificate of completion upon finishing the program</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Program Schedule Card */}
              {program.schedule && (
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6 sm:p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
                      Program Schedule
                    </h3>
                    <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                      <p className="text-gray-700 leading-relaxed">{program.schedule}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar - Fixed on desktop */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 space-y-4">
                {/* Program Details Card */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      <GraduationCap size={20} />
                      Program Details
                    </h3>
                  </div>
                  <div className="p-5">
                    <DetailItem 
                      label="Duration" 
                      value={program.duration || "Year-long"} 
                      icon={Clock}
                    />
                    <DetailItem 
                      label="Start Date" 
                      value={startDate} 
                      icon={CalendarDays}
                    />
                    <DetailItem 
                      label="End Date" 
                      value={endDate} 
                      icon={CalendarDays}
                    />
                    <DetailItem 
                      label="Format" 
                      value={program.format || "In-person & Online"} 
                      icon={Users}
                    />
                    <DetailItem 
                      label="Level" 
                      value={program.level || "All Levels"} 
                      icon={GraduationCap}
                    />
                  </div>
                </Card>

                {/* CTA Button */}
                <Button
                  className="w-full text-base py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0"
                  onClick={() => setShowModal(true)}
                  variant="primary"
                >
                  Enroll Now 
                  <ExternalLink size={18} className="ml-2" />
                </Button>

                {/* Info Card */}
                <Card className="border-purple-200 bg-purple-50/50 shadow-md">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <CalendarDays size={16} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-900 text-sm mb-1">Weekend Program</h4>
                        <p className="text-purple-800 text-xs leading-relaxed">
                          This is a year-long program that runs every weekend (Saturday and Sunday). Perfect for balancing with your studies or work.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Commitment Card */}
                <Card className="border-amber-200 bg-amber-50/50 shadow-md">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Clock size={16} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-900 text-sm mb-1">Time Commitment</h4>
                        <p className="text-amber-800 text-xs leading-relaxed">
                          Expect to dedicate 8-10 hours per weekend. Consistency is key to getting the most out of this program.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Certificate Card */}
                <Card className="border-green-200 bg-green-50/50 shadow-md">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Award size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-green-900 text-sm mb-1">Certification</h4>
                        <p className="text-green-800 text-xs leading-relaxed">
                          Receive a certificate of completion that validates your new skills and knowledge.
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
              className="w-full py-4 text-base font-semibold shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-0 transform hover:scale-[1.02] transition-all duration-300"
              onClick={() => setShowModal(true)}
              variant="primary"
            >
              <GraduationCap size={20} className="mr-2" />
              Enroll in Program
              <ExternalLink size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl transform transition-all duration-300 animate-in fade-in zoom-in-95">
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg hover:bg-gray-100 flex items-center justify-center transition-all duration-200 hover:scale-110 group border-2 border-gray-200"
              >
                <X size={20} className="text-gray-600 group-hover:text-gray-900" />
              </button>
              
              {/* Form Container with Custom Scrollbar */}
              <div className="bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
                <style jsx global>{`
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #9333ea 0%, #4f46e5 100%);
                    border-radius: 10px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #7e22ce 0%, #4338ca 100%);
                  }
                  
                  /* Firefox */
                  .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #9333ea #f1f5f9;
                  }
                `}</style>
                
                <DynamicForm type="program" id={program.id} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}