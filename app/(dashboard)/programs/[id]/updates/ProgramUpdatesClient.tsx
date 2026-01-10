"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Unlock,
  BookOpen,
  Users,
  Calendar,
  FileText,
  Github,
  Video,
  ExternalLink,
  ChevronRight,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  ArrowLeft,
  X,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MOBILE_MONEY_PAYMENT_INFO,
  formatXAF,
} from "@/lib/data/program-curriculum";
import type { 
  ProgramContent, 
  ProgramResource,
  ProgramModule,
  ProgramCurriculum
} from "@/lib/types/program-lms";
import { 
  PROGRAM_CURRICULA,
  getProgramCurriculum
} from "@/lib/data/program-curriculum";

interface EnrolledProgramData {
  applicationId: string;
  programId: string;
  programTitle: string;
  programDescription?: string;
  programPictureUrl?: string;
  status: string;
  isPaid: boolean;
  companyName: string;
  companyLogoUrl?: string;
  startDate?: string;
  endDate?: string;
  studentName?: string;
  paymentDetails?: {
    amount: number;
    ref: string;
    date: string;
  } | null;
}

// Resource icon helper
const getResourceIcon = (type: string) => {
  switch (type) {
    case "github":
      return <Github size={16} className="text-gray-700" />;
    case "pdf":
      return <FileText size={16} className="text-red-500" />;
    case "video":
      return <Video size={16} className="text-purple-500" />;
    case "assignment":
      return <BookOpen size={16} className="text-blue-500" />;
    default:
      return <ExternalLink size={16} className="text-gray-500" />;
  }
};

// Payment Guide Component
const PaymentGuide = ({ onClose, className }: { onClose?: () => void; className?: string }) => {
  const [selectedProvider, setSelectedProvider] = useState<"MTN" | "Orange">("MTN");
  const paymentInfo = MOBILE_MONEY_PAYMENT_INFO.find(p => p.provider === selectedProvider);

  return (
    <Card className={cn("border-0 shadow-2xl overflow-hidden bg-white flex flex-col", className)}>
      {/* Premium Header - Fixed */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20 backdrop-blur-sm"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl skew-x-[-3deg] transform hover:skew-x-0 transition-transform duration-500">
            <Lock size={32} className="text-white drop-shadow-md" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2">
              Premium Access
            </h3>
            <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-white/10 w-fit">
              <span className="text-blue-100 text-xs font-bold uppercase tracking-wider">Unlock everything for</span>
              <span className="text-white font-black text-sm">10,000 FCFA <span className="text-white/60 font-normal">/ mo</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Scrollable with Custom Scrollbar */}
      <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-50 [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-400 text-left">
        {/* Provider Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedProvider("MTN")}
            className={cn(
              "relative overflow-hidden py-4 px-2 rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 border-2",
              selectedProvider === "MTN"
                ? "bg-[#FFCC00]/10 border-[#FFCC00] shadow-lg shadow-[#FFCC00]/10"
                : "bg-gray-50 border-transparent hover:bg-gray-100 grayscale hover:grayscale-0"
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#DBAE00]">Pay With</span>
            <span className={cn("text-base font-black tracking-tight", selectedProvider === "MTN" ? "text-gray-900" : "text-gray-500")}>MTN Mobile Money</span>
            {selectedProvider === "MTN" && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FFCC00]" />
            )}
          </button>
          
          <button
            onClick={() => setSelectedProvider("Orange")}
            className={cn(
              "relative overflow-hidden py-4 px-2 rounded-2xl transition-all duration-300 flex flex-col items-center gap-2 border-2",
              selectedProvider === "Orange"
                ? "bg-[#FF7900]/10 border-[#FF7900] shadow-lg shadow-[#FF7900]/10"
                : "bg-gray-50 border-transparent hover:bg-gray-100 grayscale hover:grayscale-0"
            )}
          >
             <span className="text-[10px] font-bold uppercase tracking-widest text-[#C25C00]">Pay With</span>
             <span className={cn("text-base font-black tracking-tight", selectedProvider === "Orange" ? "text-gray-900" : "text-gray-500")}>Orange Money</span>
             {selectedProvider === "Orange" && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF7900]" />
            )}
          </button>
        </div>

        {/* Payment Details */}
        {paymentInfo && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
                <div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Amount</span>
                   <div className="flex items-baseline gap-1">
                     <span className="text-3xl font-black text-slate-900 tracking-tight">
                       {formatXAF(paymentInfo.amount)}
                     </span>
                     <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-full shadow-sm">FCFA</span>
                   </div>
                </div>
                
                <div className="text-right w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Send to Number</span>
                   <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 group-hover:border-blue-200 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Phone size={16} />
                      </div>
                      <span className="font-mono font-bold text-lg text-slate-900 tracking-wide">
                        {paymentInfo.phoneNumber}
                      </span>
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 relative z-10">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">?</div>
                    <span className="text-xs font-medium text-slate-500">Receiver Name</span>
                 </div>
                 <span className="font-bold text-sm text-slate-900">{paymentInfo.accountName || "SEED INC"}</span>
              </div>
            </div>

            {/* Steps */}
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Easy Payment Steps
              </h4>
              <div className="space-y-4">
                {paymentInfo.steps.map((step, idx) => (
                  <div key={step.stepNumber} className="flex gap-4 group/step">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 border-2 border-blue-100 text-blue-600 flex items-center justify-center text-sm font-black shadow-sm group-hover/step:bg-blue-600 group-hover/step:text-white group-hover/step:border-blue-600 transition-all duration-300 flex-shrink-0">
                        {step.stepNumber}
                      </div>
                      {idx !== paymentInfo.steps.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-100 group-hover/step:bg-blue-100 transition-colors" />
                      )}
                    </div>
                    <div className="pb-4">
                      <h5 className="font-bold text-sm text-slate-900 mb-1">{step.title}</h5>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation CTA */}
            <div className="pt-2">
               <a
                href="https://wa.me/237650463077?text=Hi%20SEED%20INC!%20I%20just%20made%20a%20payment%20for%20my%20program.%20Transaction%20ID:%20"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 group/btn"
              >
                <MessageCircle size={18} className="group-hover/btn:rotate-12 transition-transform" />
                I've Made The Transfer
                <ChevronRight size={16} className="opacity-70 group-hover/btn:translate-x-1 transition-transform" />
              </a>
              <p className="text-center text-[10px] font-medium text-slate-400 mt-4 bg-slate-50 py-2 rounded-lg">
                <span className="text-blue-500">Note:</span> Access is usually granted within 30 minutes of verification.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};



// Resource Item Component
const ResourceItem = ({ 
  resource, 
  isBlurred 
}: { 
  resource: ProgramResource; 
  isBlurred: boolean;
}) => (
  <a
    href={isBlurred ? "#" : resource.url}
    target={isBlurred ? "_self" : "_blank"}
    rel="noopener noreferrer"
    onClick={(e) => isBlurred && e.preventDefault()}
    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      isBlurred
        ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60"
        : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"
    }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
      isBlurred ? "bg-gray-200" : "bg-gray-50"
    }`}>
      {getResourceIcon(resource.type)}
    </div>
    <div className="flex-1 min-w-0">
      <div className={`font-semibold text-sm ${isBlurred ? "text-gray-400" : "text-gray-900"}`}>
        {isBlurred ? "🔒 " : ""}{resource.title}
      </div>
      {resource.description && (
        <p className={`text-xs ${isBlurred ? "text-gray-300" : "text-gray-500"}`}>
          {resource.description}
        </p>
      )}
    </div>
    <ChevronRight size={16} className={isBlurred ? "text-gray-300" : "text-gray-400"} />
  </a>
);

// Curriculum Module Item
const CurriculumModuleItem = ({ 
  module, 
  isCompleted, 
  onToggle 
}: { 
  module: ProgramModule; 
  isCompleted: boolean; 
  onToggle: (id: number) => void;
}) => (
  <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-100 transition-all group">
    <button 
      onClick={() => onToggle(module.moduleNumber)}
      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        isCompleted 
          ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-100" 
          : "border-gray-200 hover:border-blue-400 group-hover:bg-blue-50/50"
      }`}
    >
      {isCompleted && <CheckCircle2 size={14} strokeWidth={3} />}
    </button>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          Module {module.moduleNumber}
        </span>
        <span className="text-[10px] font-bold text-gray-400">• {module.durationWeeks} weeks</span>
      </div>
      <h4 className={`font-bold text-sm mb-1 ${isCompleted ? "text-gray-400 line-through" : "text-gray-900"}`}>
        {module.title}
      </h4>
      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
        {module.description}
      </p>
      
      {module.topics && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {module.topics.map((topic, i) => (
            <span key={i} className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 group-hover:border-blue-100 group-hover:bg-white transition-colors">
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Crew Member Type
interface CrewMember {
  id: string;
  name: string;
  avatar: string | null;
  username: string | null;
}

// Crew Avatar Stack (Overlapping Avatars)
const CrewAvatarStack = ({ 
  members, 
  totalCount,
  maxDisplay = 5, 
  onClick 
}: { 
  members: CrewMember[]; 
  totalCount: number;
  maxDisplay?: number;
  onClick: () => void;
}) => {
  const displayMembers = members.slice(0, maxDisplay);
  const remaining = totalCount - displayMembers.length;

  if (totalCount === 0) return null;

  return (
    <button 
      onClick={onClick}
      className="group flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex -space-x-3">
        {displayMembers.map((member, index) => (
          <div 
            key={member.id}
            className="relative w-10 h-10 rounded-full border-[3px] border-white shadow-md overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 transition-transform group-hover:translate-x-0 hover:z-10 hover:scale-110"
            style={{ zIndex: maxDisplay - index }}
            title={member.name}
          >
            <Image
              src={member.avatar || "https://i.ibb.co/8n8d37H4/white-logo-4x.png"}
              alt={member.name}
              fill
              className={cn(
                "object-cover",
                !member.avatar && "bg-gradient-to-br from-blue-500 to-indigo-600 p-2"
              )}
            />
          </div>
        ))}
        {remaining > 0 && (
          <div 
            className="relative w-10 h-10 rounded-full border-[3px] border-white shadow-md bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold"
            style={{ zIndex: 0 }}
          >
            +{remaining}
          </div>
        )}
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">
          {totalCount} {totalCount === 1 ? 'Member' : 'Members'}
        </p>
        <p className="text-xs text-blue-100/80">Click to view crew</p>
      </div>
    </button>
  );
};

// Crew Modal Component
const CrewModal = ({ 
  isOpen, 
  onClose, 
  members,
  programTitle
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  members: CrewMember[];
  programTitle: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-10 safe-area-bottom">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="w-full max-w-2xl relative animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
        <Card className="border-0 shadow-2xl overflow-hidden bg-white max-h-[90vh] flex flex-col rounded-[2.5rem]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20 backdrop-blur-sm"
            >
              <X size={20} />
            </button>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-2">
                <Users size={16} />
                <span>Program Crew</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {programTitle} Crew
              </h2>
              <p className="text-blue-100 text-sm mt-1 opacity-90">
                {members.length} talented {members.length === 1 ? 'individual' : 'individuals'} enrolled
              </p>
            </div>
          </div>

          {/* Members Grid */}
          <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-50 [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {members.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No crew members yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to join!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {members.map((member) => (
                  <Link
                    key={member.id}
                    href={member.username ? `/dashboard/student/${member.username}` : '#'}
                    className="group flex flex-col items-center p-4 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative w-16 h-16 rounded-full border-[3px] border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                      <Image
                        src={member.avatar || "https://i.ibb.co/8n8d37H4/white-logo-4x.png"}
                        alt={member.name}
                        fill
                        className={cn(
                          "object-cover",
                          !member.avatar && "bg-gradient-to-br from-blue-500 to-indigo-600 p-3"
                        )}
                      />
                    </div>
                    <p className="font-bold text-sm text-slate-800 text-center truncate w-full group-hover:text-blue-600 transition-colors">
                      {member.name}
                    </p>
                    {member.username && (
                      <p className="text-xs text-slate-400 truncate w-full text-center">
                        @{member.username}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Main Component
export default function ProgramUpdatesClient({ 
  id, 
  initialContent = [], 
  initialEnrollment = null,
  crew = { members: [], totalCount: 0 }
}: { 
  id: string;
  initialContent?: any[];
  initialEnrollment?: any;
  crew?: { members: CrewMember[], totalCount: number };
}) {
  const [enrollment, setEnrollment] = useState<EnrolledProgramData | null>(initialEnrollment);
  const [content, setContent] = useState<ProgramContent[]>(initialContent);
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(!initialEnrollment);
  const [showPaymentGuide, setShowPaymentGuide] = useState(false);
  const [showCrewModal, setShowCrewModal] = useState(false);

  // Load curriculum modules
  useEffect(() => {
    if (enrollment) {
      const curriculum = getProgramCurriculum(id, enrollment.programTitle);
      if (curriculum) {
        setModules(curriculum.modules);
      }
    }
  }, [id, enrollment]);

  // Load progress from local storage
  useEffect(() => {
    const saved = localStorage.getItem(`progress_${id}`);
    if (saved) {
      try {
        setCompletedModules(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse progress:", e);
      }
    }
  }, [id]);

  const toggleModule = (moduleNum: number) => {
    const newCompleted = completedModules.includes(moduleNum)
      ? completedModules.filter(m => m !== moduleNum)
      : [...completedModules, moduleNum];
    
    setCompletedModules(newCompleted);
    localStorage.setItem(`progress_${id}`, JSON.stringify(newCompleted));
    
    if (!completedModules.includes(moduleNum)) {
      toast.success("Progress updated!", {
        description: "Great work keeping up with your curriculum!",
        icon: "🎉"
      });
    }
  };

  const progress = modules.length > 0 
    ? Math.round((completedModules.length / modules.length) * 100) 
    : 0;





  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading program updates...</p>
        </div>
      </div>
    );
  }

  // Not enrolled or not in valid status
  const currentStatus = enrollment?.status?.toLowerCase();
  if (!enrollment || (currentStatus !== "accepted" && currentStatus !== "rsvp_confirmed")) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-20 px-6 flex items-center justify-center">
        <div className="max-w-xl w-full text-center space-y-10">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-slate-100 relative z-10 animate-pulse">
              <AlertCircle size={44} className="text-amber-500" strokeWidth={2.5} />
            </div>
            <div className="absolute inset-0 bg-amber-200/20 blur-3xl rounded-full translate-y-4" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter sm:text-5xl">
              Access Restricted
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md mx-auto">
              {enrollment?.status === "pending" || enrollment?.status === "reviewed"
                ? "Your journey is currently being reviewed by our team. Check back soon for full access!"
                : "This universe is exclusive to accepted voyagers. Start your journey by applying today."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={`/programs/${id}`} className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <ArrowLeft size={16} />
              Return Home
            </Link>
            <Link href="/dashboard/student" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Users size={16} />
              Discover Peers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = enrollment.isPaid;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href={`/feed/${enrollment.programTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
               <ArrowLeft size={14} />
            </div>
            <span className="font-medium">Back to Program Details</span>
          </Link>
        </div>

        {/* Hero Header - Matches Details Page */}
        <Card className="overflow-hidden border-0 shadow-lg mb-8 relative group">
           <div className="relative h-48 sm:h-64 bg-slate-900">
             {enrollment.programPictureUrl ? (
               <Image
                 src={enrollment.programPictureUrl}
                 alt={enrollment.programTitle}
                 fill
                 className="object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-500"
               />
             ) : (
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 opacity-90" />
             )}
             
             <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 mixed-blend-overlay" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
             
             <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
               <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-blue-100 text-sm font-medium mb-2">
                      <span className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
                        {enrollment.companyName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <GraduationCap size={14} />
                        Program Updates
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg tracking-tight mb-4">
                      {enrollment.programTitle}
                    </h1>
                    
                    {/* Integrated Crew Stats */}
                    {crew.totalCount > 0 && (
                      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                        <CrewAvatarStack 
                          members={crew.members} 
                          totalCount={crew.totalCount}
                          maxDisplay={5}
                          onClick={() => setShowCrewModal(true)} 
                        />
                      </div>
                    )}
                  </div>

                 <Badge
                    variant={isPaid ? "default" : "secondary"}
                    className={`px-4 py-2 text-sm shadow-xl backdrop-blur-md border hover:scale-105 transition-transform cursor-default ${
                      isPaid
                        ? "bg-blue-600/90 hover:bg-blue-600 text-white border-blue-400/50"
                        : "bg-amber-100/90 text-amber-800 border-amber-200"
                    }`}
                  >
                    {isPaid ? (
                      <span className="flex items-center gap-1.5 fw-bold">
                        <Unlock size={14} />
                        Full Access Unlocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 fw-bold">
                        <Lock size={14} />
                        Payment Required
                      </span>
                    )}
                  </Badge>
               </div>
             </div>
           </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            


            {/* Weekly Updates / Content */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">Weekly Updates & Resources</h2>
              </div>
              
              {/* Progress Tracker Widget */}
              {modules.length > 0 && (
                <Card className="mb-6 overflow-hidden border-0 shadow-sm bg-indigo-50/50 border-l-4 border-l-indigo-500">
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-indigo-100"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={213.6}
                          strokeDashoffset={213.6 - (213.6 * progress) / 100}
                          className="text-indigo-600 transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-black text-indigo-700 text-lg">
                        {progress}%
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-black text-indigo-900 text-lg mb-1 leading-tight">Curriculum Milestone</h3>
                      <p className="text-indigo-600/70 text-sm font-medium">
                        You've completed {completedModules.length} out of {modules.length} key learning blocks. 
                        Keep going to master your skills!
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Curriculum Grid */}
              {modules.length > 0 && (
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map((module) => (
                      <CurriculumModuleItem 
                        key={module.moduleNumber} 
                        module={module}
                        isCompleted={completedModules.includes(module.moduleNumber)}
                        onToggle={toggleModule}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white group">
                {content.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                       <BookOpen size={32} className="text-gray-300" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">No Updates Yet</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                      Your instructors haven't posted any updates yet. Check back soon!
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    <Accordion type="single" collapsible className="space-y-2">
                      {content.map((item) => (
                        <AccordionItem
                          key={item.id}
                          value={item.id}
                          className="border border-gray-100 rounded-xl overflow-hidden data-[state=open]:shadow-md data-[state=open]:border-blue-100 transition-all duration-300"
                        >
                          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50/80 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4 text-left w-full">
                              {item.weekNumber ? (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
                                  <div className="text-center leading-none">
                                    <span className="text-[10px] uppercase opacity-80 block">Week</span>
                                    <span className="text-lg">{item.weekNumber}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-500">
                                   <Calendar size={20} />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-base">{item.title}</h4>
                                {item.description && (
                                  <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-5 pt-2 bg-white">
                            <hr className="mb-4 border-gray-100" />
                            {/* Content */}
                            {item.content ? (
                              <div className={`prose prose-sm prose-blue max-w-none mb-6 ${!isPaid ? "blur-sm select-none" : ""}`}>
                                <div
                                  className="whitespace-pre-wrap leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                              </div>
                            ) : !isPaid ? (
                              <div className="mb-6 relative overflow-hidden rounded-xl bg-gray-50/50 p-6 border border-gray-100">
                                <div className="filter blur-sm select-none text-gray-400 space-y-3">
                                  <p>Welcome to this week's module. We will cover advanced topics in software engineering.</p>
                                  <p>Ensure you have completed the prerequisites before starting this lesson.</p>
                                  <div className="h-32 bg-gray-200/50 rounded-lg w-full"></div>
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
                                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-3">
                                     <Lock className="text-amber-500" size={20} />
                                  </div>
                                  <p className="font-bold text-gray-900">Premium Content</p>
                                </div>
                              </div>
                            ) : null}

                            {/* Resources */}
                            {item.resources && item.resources.length > 0 && (
                              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <h5 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                                  <FileText size={14} />
                                  Attached Resources
                                </h5>
                                <div className="grid grid-cols-1 gap-2">
                                  {item.resources.map((resource: ProgramResource, idx: number) => (
                                    <div key={idx} className="group/res">
                                      <ResourceItem
                                        resource={resource}
                                        isBlurred={!isPaid}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Payment CTA for unpaid users */}
                            {!isPaid && (
                              <button
                                onClick={() => setShowPaymentGuide(true)}
                                className="w-full mt-6 group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-1 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] hover:border-blue-100"
                              >
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 p-8">
                                  <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Lock size={120} />
                                  </div>
                                  
                                  <div className="flex flex-col items-center justify-center relative z-10 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                      <Lock size={28} className="text-white" />
                                    </div>
                                    
                                    <h4 className="text-xl font-extrabold text-slate-800 mb-2">
                                      Unlock Full Access
                                    </h4>
                                    <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
                                      Subscribe for <span className="text-blue-600 font-bold">10,000 XAF/mo</span> to access all video lessons, source code, and tutoring.
                                    </p>
                                    
                                    <div className="px-8 py-3 bg-white rounded-xl font-bold text-sm text-slate-800 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300">
                                      Upgrade Now
                                    </div>
                                  </div>
                                </div>
                              </button>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* Payment Status Card */}
            {!isPaid ? (
               <div className="lg:sticky lg:top-8 transition-all duration-500">
                  <div className="relative group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute inset-0 bg-blue-200 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl" />
                    <PaymentGuide />
                  </div>
               </div>
            ) : (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                   <CheckCircle2 size={120} />
                </div>
                <div className="p-8 text-center relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/20">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 tracking-tight">Access Unlocked!</h3>
                  <p className="text-blue-100 text-sm leading-relaxed font-medium opacity-90 mb-6">
                    You have full access to all materials. Download your official receipt below.
                  </p>
                  
                  <Button 
                    asChild
                    variant="secondary" 
                    className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold gap-2 py-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <a 
                      href={`/api/programs/${id}/receipt?print=true`} 
                      target="_blank" 
                      onClick={() => {
                        toast.success("Preparing your receipt...", {
                          description: "Your official receipt will open in a new tab.",
                          icon: "📄"
                        });
                      }}
                    >
                      <Download size={18} />
                      Download Receipt
                    </a>
                  </Button>
                </div>
              </Card>
            )}

            {/* Program Info */}
            <Card className="border-0 shadow-md p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 pb-3 border-b border-gray-100">
                <Users size={18} className="text-blue-600" />
                Quick Info
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center group cursor-default">
                  <span className="text-gray-500">Organization</span>
                  <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{enrollment.companyName}</span>
                </div>
                {enrollment.startDate && (
                  <div className="flex justify-between items-center group cursor-default">
                    <span className="text-gray-500">Started</span>
                    <span className="font-medium bg-gray-50 px-2 py-1 rounded-md text-gray-700 group-hover:bg-blue-50 transition-colors">
                      {new Date(enrollment.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-50 mt-2">
                   <Link href={`/programs/${id}`} className="block w-full text-center py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all cursor-pointer text-xs">
                      View Full Details
                   </Link>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* Payment Guide Modal for Mobile/Desktop */}
      {showPaymentGuide && !isPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowPaymentGuide(false)} />
          <div className="w-full max-w-md relative animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            <PaymentGuide 
              onClose={() => setShowPaymentGuide(false)} 
              className="max-h-[85vh] shadow-2xl ring-1 ring-white/20"
            />
          </div>
        </div>
      )}

      {/* Crew Modal */}
      <CrewModal 
        isOpen={showCrewModal}
        onClose={() => setShowCrewModal(false)}
        members={crew.members}
        programTitle={enrollment?.programTitle || "Program"}
      />
    </div>
  );
}
