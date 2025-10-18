"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Clock, GraduationCap, MapPin, Briefcase, Target } from "lucide-react";
import Image from "next/image";
import { ApplicationModal } from "../Application/ApplicationModal";

interface InternshipDetailsModalProps {
  internship: {
    id: string;
    title: string;
    company: string;
    companyLogo: string;
    description: string;
    duration: string;
    location: string;
    department: string;
    requirements: string[];
    responsibilities: string[];
  };
  trigger: React.ReactNode;
}

export function InternshipDetailsModal({ internship, trigger }: InternshipDetailsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[90vw] sm:max-w-[800px] max-h-[90vh] 
        overflow-y-auto bg-white/95 backdrop-blur-lg p-0 rounded-2xl border-0">
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20">
              <Image
                src={internship.companyLogo}
                alt={internship.company}
                fill
                className="object-contain rounded-xl"
              />
            </div>
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {internship.title}
                </DialogTitle>
                <DialogDescription className="text-lg font-medium text-gray-600">
                  {internship.company}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">{internship.duration}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{internship.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{internship.department}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                About the Role
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {internship.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Requirements
              </h3>
              <ul className="space-y-2">
                {internship.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-blue-500 mt-1">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Responsibilities
              </h3>
              <ul className="space-y-2">
                {internship.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-blue-500 mt-1">•</span>
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-center pb-6">
            <ApplicationModal
              type="internship"
              id={internship.id}
              buttonText="Apply Now"
              title={`Apply for ${internship.title}`}
              description={`Join ${internship.company} as an intern and kickstart your career!`}
            />
          </div>
        </div>

        {/* Mobile sticky bottom CTA inside modal */}
        <div className="sm:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[92%]">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100/20 flex items-center justify-between gap-4 py-3 px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div className="text-sm font-medium text-gray-900">{internship.location}</div>
              </div>
            </div>
            <div>
              <ApplicationModal type="internship" id={internship.id} buttonText="Apply" title={`Apply for ${internship.title}`} description={internship.description} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}