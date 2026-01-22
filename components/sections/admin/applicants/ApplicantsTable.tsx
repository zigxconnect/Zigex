"use client"

import { Applicant, ApplicantStatus } from "@/lib/types/applicants"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { 
  Trash2, Mail, Calendar, Briefcase, ChevronRight, User, CreditCard, 
  CheckCircle2, GraduationCap, MapPin, Clock, Target, Eye, MoreHorizontal,
  Building2, Star, TrendingUp, Filter, DollarSign
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

type ApplicantsTableProps = {
  applicants: Applicant[]
  selectedApplicantId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onUpdatePayment?: (id: string, isPaid: boolean) => void
}

// Type badge component
const TypeBadge = ({ type }: { type: string }) => {
  const config = {
    internship: { bg: "bg-violet-100", text: "text-violet-700", icon: Briefcase },
    program: { bg: "bg-emerald-100", text: "text-emerald-700", icon: GraduationCap },
    event: { bg: "bg-amber-100", text: "text-amber-700", icon: Calendar }
  }[type] || { bg: "bg-slate-100", text: "text-slate-700", icon: Briefcase };

  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
      config.bg, config.text
    )}>
      <Icon size={12} />
      {type}
    </span>
  );
};

// Quick info pill
const InfoPill = ({ icon: Icon, value, label }: { icon: any, value?: string, label: string }) => {
  if (!value) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
          <Icon size={12} className="text-slate-400" />
          <span className="font-medium truncate max-w-[80px]">{value}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>{label}: {value}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const ApplicantsTable = ({
  applicants,
  selectedApplicantId,
  onSelect,
  onDelete,
  onUpdatePayment,
}: ApplicantsTableProps) => {
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Group applicants by type for stats
  const stats = {
    total: applicants.length,
    internships: applicants.filter(a => a.applicationType === "internship").length,
    programs: applicants.filter(a => a.applicationType === "program").length,
    events: applicants.filter(a => a.applicationType === "event").length,
    pending: applicants.filter(a => a.status === "pending").length,
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <User size={18} className="text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-violet-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-violet-600">{stats.internships}</p>
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Internships</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Briefcase size={18} className="text-violet-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-emerald-600">{stats.programs}</p>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Programs</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <GraduationCap size={18} className="text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-amber-600">{stats.events}</p>
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Events</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Calendar size={18} className="text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-4 shadow-lg shadow-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-white">{stats.pending}</p>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Pending</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Clock size={18} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="w-full overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <User size={12} />
                      Candidate
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Target size={12} />
                      Opportunity
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-slate-100 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={12} />
                      Background
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} />
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <DollarSign size={12} />
                      Financials
                    </div>
                  </th>
                  <th className="px-6 py-4 border-b border-slate-100 w-[100px]" />
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant, index) => (
                  <tr
                    key={applicant.id}
                    className={cn(
                      "group cursor-pointer transition-all duration-300",
                      selectedApplicantId === applicant.id 
                        ? "bg-primary/5 hover:bg-primary/10" 
                        : "hover:bg-slate-50/80"
                    )}
                  >
                    {/* Candidate Cell */}
                    <td className="px-6 py-4" onClick={() => onSelect(applicant.id)}>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {applicant.avatarUrl && applicant.avatarUrl !== "/default-avatar.svg" ? (
                            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-primary/30 transition-all shadow-sm">
                              <Image 
                                src={applicant.avatarUrl} 
                                alt={applicant.name} 
                                width={48} 
                                height={48} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm transition-all duration-300 group-hover:scale-105",
                              index % 4 === 0 ? "bg-gradient-to-br from-violet-400 to-violet-600 text-white" :
                              index % 4 === 1 ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white" :
                              index % 4 === 2 ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" :
                              "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                            )}>
                              {applicant.name?.charAt(0).toUpperCase() ?? "?"}
                            </div>
                          )}
                          {/* Online indicator */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <Star size={8} className="text-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate max-w-[150px]">
                            {applicant.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-xs text-slate-500 truncate max-w-[120px] flex items-center gap-1">
                                  <Mail size={10} />
                                  {applicant.email}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{applicant.email}</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Opportunity Cell */}
                    <td className="px-6 py-4" onClick={() => onSelect(applicant.id)}>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                          {applicant.internshipTitle || "General Application"}
                        </p>
                        <TypeBadge type={applicant.applicationType} />
                      </div>
                    </td>

                    {/* Background Cell - Desktop only */}
                    <td className="px-6 py-4 hidden lg:table-cell" onClick={() => onSelect(applicant.id)}>
                      <div className="flex flex-wrap gap-1.5">
                        <InfoPill icon={GraduationCap} value={applicant.school} label="School" />
                        <InfoPill icon={Target} value={applicant.domain} label="Domain" />
                        <InfoPill icon={Clock} value={applicant.duration} label="Duration" />
                        <InfoPill icon={MapPin} value={applicant.address} label="Location" />
                      </div>
                    </td>

                    {/* Status Cell */}
                    <td className="px-6 py-4" onClick={() => onSelect(applicant.id)}>
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={applicant.status} />
                        {applicant.applicationType === 'program' && applicant.status === 'accepted' && (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={applicant.isPaid || false}
                              onCheckedChange={(checked) => onUpdatePayment?.(applicant.id, checked)}
                              className="data-[state=checked]:bg-emerald-500 scale-90"
                            />
                            <span className={cn(
                              "text-[10px] font-bold uppercase",
                              applicant.isPaid ? "text-emerald-600" : "text-amber-600"
                            )}>
                              {applicant.isPaid ? "Paid" : "Pending"}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Financials Cell */}
                    <td className="px-6 py-4" onClick={() => onSelect(applicant.id)}>
                      <div className="flex flex-col gap-1">
                        {applicant.applicationType === 'internship' ? (
                          <>
                            <p className="text-xs font-bold text-slate-900 leading-none">
                              {(() => {
                                const ledger = applicant.paymentLedger || [];
                                const paid = ledger.reduce((sum, p) => sum + (p.status === 'paid' ? (p.amount || applicant.monthlyRate || 0) : 0), 0);
                                return `${paid.toLocaleString()} XAF`;
                              })()}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Monthly Ledger</p>
                          </>
                        ) : (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={applicant.isPaid || false}
                              onCheckedChange={(checked) => onUpdatePayment?.(applicant.id, checked)}
                              className="scale-75"
                            />
                            <span className="text-[10px] font-bold text-slate-500">{applicant.isPaid ? 'PAID' : 'PENDING'}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions Cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onSelect(applicant.id)}
                              className="w-9 h-9 p-0 rounded-xl hover:bg-primary/10 hover:text-primary"
                            >
                              <Eye size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-9 h-9 p-0 rounded-xl hover:bg-slate-100"
                            >
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem 
                              onClick={() => onSelect(applicant.id)}
                              className="rounded-lg cursor-pointer"
                            >
                              <Eye size={14} className="mr-2" />
                              View Full Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => window.open(`mailto:${applicant.email}`, '_blank')}
                              className="rounded-lg cursor-pointer"
                            >
                              <Mail size={14} className="mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="rounded-lg cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Delete Application
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-3xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-black">Delete Application?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove <span className="font-bold text-slate-700">{applicant.name}</span>'s application? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => onDelete(applicant.id)}
                                    className="rounded-xl bg-rose-600 hover:bg-rose-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {applicants.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 shadow-inner">
                  <User size={40} className="text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-700">No Candidates Yet</h3>
                  <p className="text-sm text-slate-400 max-w-[300px] mx-auto leading-relaxed">
                    When students apply for your opportunities, they'll appear here for review.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Waiting for applications...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
