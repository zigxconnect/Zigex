// file: components/sections/admin/accepted/AcceptedInternsList.tsx

import { Applicant } from "@/lib/types/applicants";
import { Mail, Phone, Calendar } from "lucide-react";

interface AcceptedInternsListProps {
  interns: Applicant[];
  selectedIntern: Applicant | null;
  onSelectIntern: (intern: Applicant) => void;
}

export const AcceptedInternsList = ({
  interns,
  selectedIntern,
  onSelectIntern,
}: AcceptedInternsListProps) => {
  if (interns.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No accepted interns
        </h3>
        <p className="text-gray-500 text-sm">
          Interns who have been accepted will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Accepted Interns ({interns.length})
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {interns.map((intern) => (
          <div
            key={intern.id}
            className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedIntern?.id === intern.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
            }`}
            onClick={() => onSelectIntern(intern)}
          >
            <div className="flex items-start gap-3">
              <img
                src={intern.avatarUrl}
                alt={intern.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {intern.name}
                </h3>
                
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <Mail size={14} />
                  <span className="truncate">{intern.email}</span>
                </div>
                
                {intern.phone && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                    <Phone size={14} />
                    <span>{intern.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>
                    Applied {new Date(intern.appliedDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Accepted
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-2 truncate">
              {intern.internshipTitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};