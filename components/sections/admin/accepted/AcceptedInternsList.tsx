// file: components/sections/admin/accepted/AcceptedInternsList.tsx

import { Applicant } from "@/lib/types/applicants";
import { Mail, Phone, Calendar, ChevronRight, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

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
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-white rounded-2xl border border-gray-100 border-dashed">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <UserCheck className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No accepted interns
        </h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Interns who have been accepted will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Accepted Interns 
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            {interns.length}
          </span>
        </h2>
      </div>
      
      <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
        {interns.map((intern) => {
          const isSelected = selectedIntern?.id === intern.id;
          return (
            <div
              key={intern.id}
              className={cn(
                "group p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 border-l-4 border-l-transparent",
                isSelected && "bg-green-50/30 border-l-green-600"
              )}
              onClick={() => onSelectIntern(intern)}
            >
              <div className="flex items-start gap-4">
                <UserAvatar 
                  src={intern.avatarUrl} 
                  alt={intern.name} 
                  size={48} 
                  className={cn(
                    "ring-2 ring-white shadow-sm transition-transform duration-300",
                    isSelected ? "scale-105 ring-green-100" : "group-hover:scale-105"
                  )}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={cn(
                      "font-semibold truncate transition-colors",
                      isSelected ? "text-green-900" : "text-gray-900 group-hover:text-green-700"
                    )}>
                      {intern.name}
                    </h3>
                    {isSelected && <ChevronRight size={16} className="text-green-500" />}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Mail size={12} />
                      <span className="truncate">{intern.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span>
                        Applied {new Date(intern.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-700 truncate max-w-[120px] bg-gray-100 px-2 py-0.5 rounded-md">
                      {intern.internshipTitle}
                    </p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-100 text-green-700">
                      Accepted
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};