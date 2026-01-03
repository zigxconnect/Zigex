"use client"

import { Applicant, ApplicantStatus } from "@/lib/types/applicants"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Mail, Calendar, Briefcase, ChevronRight, User } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

type ApplicantsTableProps = {
  applicants: Applicant[]
  selectedApplicantId: string | null
  onSelect: (id: string) => void
}

export const ApplicantsTable = ({
  applicants,
  selectedApplicantId,
  onSelect,
}: ApplicantsTableProps) => {
  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                Candidate
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                Contact
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                Applied For
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                Applied Date
              </th>
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                Status
              </th>
              <th className="px-8 py-5 border-b border-slate-100" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/50">
            {applicants.map((applicant, index) => (
              <tr
                key={applicant.id}
                onClick={() => onSelect(applicant.id)}
                className={`group cursor-pointer transition-all duration-300 hover:bg-slate-50/80 ${
                  selectedApplicantId === applicant.id ? "bg-primary/5 hover:bg-primary/10" : ""
                }`}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {applicant.avatarUrl ? (
                         <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-primary/20 transition-all">
                            <Image 
                              src={applicant.avatarUrl} 
                              alt={applicant.name} 
                              width={40} 
                              height={40} 
                              className="w-full h-full object-cover"
                            />
                         </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-500 ${
                          index % 2 === 0 ? 'bg-indigo-50 text-indigo-600 ring-indigo-100' : 'bg-blue-50 text-blue-600 ring-blue-100'
                        }`}>
                          {applicant.name?.charAt(0) ?? "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {applicant.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium tracking-tight">ID: #{applicant.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                         <Mail size={12} className={applicant.email === "No email" ? "text-red-300" : "text-slate-300"} />
                         <span className={`text-xs font-medium ${applicant.email === "No email" ? "text-red-400 italic" : "text-slate-500"}`}>
                           {applicant.email}
                         </span>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2 max-w-[200px]">
                      <div className="p-2 bg-slate-50 rounded-xl">
                         <Briefcase size={14} className="text-slate-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {applicant.internshipTitle || "General Application"}
                      </span>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} className="text-slate-300" />
                      <span className="text-xs font-medium">
                        {format(new Date(applicant.appliedDate), "MMM dd, yyyy")}
                      </span>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <StatusBadge status={applicant.status} />
                </td>
                <td className="px-8 py-5 text-right">
                   <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all outline-none">
                      <ChevronRight size={18} />
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {applicants.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <User size={32} className="text-slate-200" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-slate-700">No candidates found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px] leading-relaxed mx-auto italic">
                   Start your recruitment process to see applications here.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
