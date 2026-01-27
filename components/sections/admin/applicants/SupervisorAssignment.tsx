"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Check, ChevronDown, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupervisors, assignSupervisor } from "@/lib/actions/supervisor.actions";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SupervisorAssignmentProps {
  applicationId: string;
  companyId: string;
  currentSupervisorId?: string | null;
  onAssigned?: (supervisor: any) => void;
}

export function SupervisorAssignment({ 
  applicationId, 
  companyId,
  currentSupervisorId,
  onAssigned 
}: SupervisorAssignmentProps) {
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(currentSupervisorId || null);

  useEffect(() => {
    async function loadSupervisors() {
      setIsLoading(true);
      try {
        console.log("SupervisorAssignment: Loading supervisors for company:", companyId);
        const data = await getSupervisors(companyId);
        setSupervisors(data);
      } catch (error) {
        console.error("Failed to load supervisors", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSupervisors();
  }, [companyId]);

  const handleAssign = async (supervisor: any) => {
    setIsAssigning(true);
    try {
      const result = await assignSupervisor(applicationId, supervisor.id);
      if (result.success) {
        setSelectedId(supervisor.id);
        toast.success(`Assigned to ${supervisor.full_name}`);
        if (onAssigned) onAssigned(supervisor);
      } else {
        toast.error("Failed to assign supervisor");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsAssigning(false);
    }
  };

  const currentSupervisor = supervisors.find(s => s.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Intern Supervisor
         </label>
         {isAssigning && <Loader2 size={12} className="animate-spin text-blue-600" />}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "w-full justify-between h-14 rounded-2xl border-slate-100 bg-white shadow-sm hover:border-blue-200 transition-all px-4",
              selectedId ? "ring-2 ring-blue-50 border-blue-200" : ""
            )}
          >
            <div className="flex items-center gap-3">
              {currentSupervisor ? (
                <>
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100">
                    <Image 
                      src={currentSupervisor.avatar_url || "/default-avatar.svg"} 
                      alt={currentSupervisor.full_name} 
                      width={32} 
                      height={32} 
                      className="object-cover"
                    />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{currentSupervisor.full_name}</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <Shield size={16} />
                  </div>
                  <span className="font-bold text-slate-400 text-sm">Select Supervisor</span>
                </>
              )}
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-blue-50">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 size={20} className="animate-spin mx-auto text-blue-600" />
            </div>
          ) : supervisors.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 font-bold uppercase">No tutors found</div>
          ) : (
            supervisors.map((s) => (
              <DropdownMenuItem 
                key={s.id} 
                onClick={() => handleAssign(s)}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-50 focus:bg-blue-50 group"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                  <Image src={s.avatar_url || "/default-avatar.svg"} alt={s.full_name} width={32} height={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-700 truncate group-hover:text-blue-700 transition-colors">{s.full_name}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate italic">{s.field_expertise?.join(", ") || "General Mentor"}</p>
                </div>
                {selectedId === s.id && <Check size={16} className="text-blue-600 shrink-0" />}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
