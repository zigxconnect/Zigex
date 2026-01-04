"use client"

import { Applicant, ApplicantStatus } from "@/lib/types/applicants"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { Trash2, Mail, Calendar, Briefcase, ChevronRight, User, CreditCard, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type ApplicantsTableProps = {
  applicants: Applicant[]
  selectedApplicantId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onUpdatePayment?: (id: string, isPaid: boolean) => void
}

export const ApplicantsTable = ({
  applicants,
  selectedApplicantId,
  onSelect,
  onDelete,
  onUpdatePayment,
}: ApplicantsTableProps) => {
  return (
    <TooltipProvider>
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
              <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <CreditCard size={12} />
                  Payment
                </div>
              </th>
              <th className="px-8 py-5 border-b border-slate-100" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/50">
            {applicants.map((applicant, index) => (
              <tr
                key={applicant.id}
                className={`group cursor-pointer transition-all duration-300 hover:bg-slate-50/80 ${
                  selectedApplicantId === applicant.id ? "bg-primary/5 hover:bg-primary/10" : ""
                }`}
              >
                <td className="px-8 py-5" onClick={() => onSelect(applicant.id)}>
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
                <td className="px-8 py-5" onClick={() => onSelect(applicant.id)}>
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                         <Mail size={12} className={applicant.email === "No email" ? "text-red-300" : "text-slate-300"} />
                         <span className={`text-xs font-medium ${applicant.email === "No email" ? "text-red-400 italic" : "text-slate-500"}`}>
                           {applicant.email}
                         </span>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5" onClick={() => onSelect(applicant.id)}>
                   <div className="flex items-center gap-2 max-w-[200px]">
                      <div className="p-2 bg-slate-50 rounded-xl">
                         <Briefcase size={14} className="text-slate-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {applicant.internshipTitle || "General Application"}
                      </span>
                   </div>
                </td>
                <td className="px-8 py-5" onClick={() => onSelect(applicant.id)}>
                   <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} className="text-slate-300" />
                      <span className="text-xs font-medium">
                        {format(new Date(applicant.appliedDate), "MMM dd, yyyy")}
                      </span>
                   </div>
                </td>
                <td className="px-8 py-5" onClick={() => onSelect(applicant.id)}>
                   <StatusBadge status={applicant.status} />
                </td>
                <td className="px-6 py-5">
                   {/* Payment toggle - only for accepted program applications */}
                   {applicant.applicationType === 'program' && applicant.status === 'accepted' ? (
                     <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <div className="flex items-center gap-2">
                             <Switch
                               checked={applicant.isPaid || false}
                               onCheckedChange={(checked) => onUpdatePayment?.(applicant.id, checked)}
                               className="data-[state=checked]:bg-emerald-500"
                             />
                             {applicant.isPaid ? (
                               <CheckCircle2 size={14} className="text-emerald-500" />
                             ) : (
                               <CreditCard size={14} className="text-amber-500" />
                             )}
                           </div>
                         </TooltipTrigger>
                         <TooltipContent side="top" className="bg-slate-900 text-white text-xs">
                           {applicant.isPaid ? 'Payment confirmed' : 'Awaiting payment'}
                         </TooltipContent>
                       </Tooltip>
                     </div>
                   ) : applicant.applicationType === 'program' ? (
                     <span className="text-[10px] text-slate-400 italic">Accept first</span>
                   ) : (
                     <span className="text-[10px] text-slate-300">N/A</span>
                   )}
                </td>
                <td className="px-8 py-5 text-right">
                   <div className="flex items-center justify-end gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 size={16} />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white rounded-3xl border border-slate-100 shadow-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-bold text-slate-900">Delete Application?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                              Are you sure you want to remove <span className="font-bold text-slate-700">{applicant.name}</span>'s application? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDelete(applicant.id)}
                              className="rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all outline-none"
                        onClick={() => onSelect(applicant.id)}
                      >
                        <ChevronRight size={18} />
                      </div>
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
    </TooltipProvider>
  )
}
