"use client";

import { useState } from "react";
import { 
  Applicant, 
  ApplicantStatus 
} from "@/lib/types/applicants";
import { 
  Users, 
  MapPin, 
  Calendar, 
  User, 
  Shield, 
  CheckCircle2, 
  MessageSquare,
  ChevronRight,
  MoreVertical,
  Activity,
  Award,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SupervisorAssignment } from "./SupervisorAssignment";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InternManagementTableProps {
  applicants: Applicant[];
  companyId: string;
  onSelect: (id: string) => void;
}

export function InternManagementTable({ 
  applicants, 
  companyId,
  onSelect 
}: InternManagementTableProps) {
  const activeInterns = applicants.filter(app => 
    app.status === "accepted"
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Roster</h2>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
            {activeInterns.length} Active Interns
          </Badge>
        </div>
      </div>

      {/* Grid of Interns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeInterns.length > 0 ? (
          activeInterns.map((intern) => (
            <div 
              key={intern.id}
              className="bg-white rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Header / Avatar Section */}
              <div className="p-6 pb-0 flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden ring-4 ring-blue-50 shadow-lg">
                      {intern.avatarUrl && intern.avatarUrl !== "/default-avatar.svg" ? (
                        <Image src={intern.avatarUrl} alt={intern.name} width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
                          {intern.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight text-lg group-hover:text-blue-600 transition-colors">{intern.name}</h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {intern.school || "Zigex Academy"}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                      <MoreVertical size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl w-48 p-2 border-blue-50">
                    <DropdownMenuItem onClick={() => onSelect(intern.id)} className="rounded-xl py-2.5">
                      <User size={14} className="mr-2" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl py-2.5">
                      <MessageSquare size={14} className="mr-2" /> Chat with Intern
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                      <Award size={14} className="mr-2" /> Certify Intern
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Progress Info */}
              <div className="px-6 py-6 space-y-4">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500" /> Duration</span>
                    <span className="text-slate-900">{intern.duration || "N/A"}</span>
                 </div>
                 
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                          <Activity size={12} className="text-indigo-500" /> logbook progress
                       </span>
                       <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">80%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: '80%' }} />
                    </div>
                 </div>
              </div>

              {/* Supervisor Assignment Dropdown */}
              <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/30">
                <SupervisorAssignment 
                  applicationId={intern.id}
                  companyId={companyId}
                  currentSupervisorId={intern.supervisorId}
                  onAssigned={(sup) => {
                    // Refresh parent if needed - though realtime will handle it
                  }}
                />
              </div>

              {/* Footer Action */}
              <button 
                onClick={() => onSelect(intern.id)}
                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:bg-blue-600 hover:text-white transition-all border-t border-blue-50 flex items-center justify-center gap-2 group/btn"
              >
                Launch Intern Control Center
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-blue-100">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-blue-300">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No active interns found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2">
              Accept more candidates to see them in this management view.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
