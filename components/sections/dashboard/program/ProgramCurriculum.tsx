"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { 
  BookOpen, 
  Lock, 
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  FileText, 
  Github, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Video,
  Clock,
  Users,
  GraduationCap,
  Linkedin,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Globe,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Wallet
} from "lucide-react";
import { getProgramCurriculum, MOBILE_MONEY_PAYMENT_INFO, formatXAF } from "@/lib/data/program-curriculum";
import type { CurriculumModule, ProgramCurriculum as ProgramCurriculumType } from "@/lib/types/program-lms";

interface ProgramContent {
  id: string;
  title: string;
  content_type: "lesson" | "resource";
  description?: string;
  content_url?: string;
  resource_type?: "pdf" | "github" | "video" | "assignment" | "document";
  payment_required?: boolean;
  display_order?: number;
}

interface ProgramCurriculumProps {
  programId: string;
  isPaid: boolean;
  paymentCompleted: boolean;
  programTitle: string;
  isAdmin?: boolean;
  onPaymentNeeded?: () => void;
}

// Blurred content overlay component
const BlurredContent = ({ children, onUnlock }: { children: React.ReactNode; onUnlock?: () => void }) => (
  <div className="relative">
    <div className="blur-sm pointer-events-none select-none">
      {children}
    </div>
    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
      <div className="text-center p-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-semibold text-gray-900">Payment Required</p>
        <p className="text-xs text-gray-600 mt-1">Complete payment to access tutor contacts</p>
        {onUnlock && (
          <Button 
            onClick={onUnlock} 
            size="sm" 
            className="mt-3 bg-primary hover:bg-primary/90 text-white"
          >
            <CreditCard size={14} className="mr-1" />
            Verify Payment
          </Button>
        )}
      </div>
    </div>
  </div>
);

// Module Card Component
const ModuleCard = ({ 
  module, 
  isExpanded, 
  onToggle, 
  paymentCompleted,
  onPaymentNeeded 
}: { 
  module: CurriculumModule; 
  isExpanded: boolean;
  onToggle: () => void;
  paymentCompleted: boolean;
  onPaymentNeeded?: () => void;
}) => (
  <Card className="overflow-hidden border border-gray-200 hover:border-primary/30 transition-all duration-300 hover:shadow-md">
    <button
      onClick={onToggle}
      className="w-full p-5 text-left hover:bg-gray-50/50 transition-colors flex items-start gap-4"
    >
      {/* Module Number Badge */}
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20">
        {module.moduleNumber}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-base">{module.title}</h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 mt-1 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
        
        {/* Quick Info */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <Clock size={12} />
            {module.durationWeeks} {module.durationWeeks === 1 ? 'Week' : 'Weeks'}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
            <BookOpen size={12} />
            {module.topics.length} Topics
          </span>
        </div>
      </div>
    </button>

    {/* Expanded Content */}
    {isExpanded && (
      <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
        {/* Topics */}
        <div className="p-5 border-b border-gray-100">
          <h5 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <GraduationCap size={16} className="text-primary" />
            Topics Covered
          </h5>
          <div className="grid gap-2">
            {module.topics.map((topic, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={14} className="text-primary" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tutor Info */}
        <div className="p-5">
          <h5 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <Users size={16} className="text-primary" />
            Module Tutor
          </h5>
          
          <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
            {/* Tutor Avatar */}
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex-shrink-0">
              {module.tutor.avatarUrl ? (
                <Image
                  src={module.tutor.avatarUrl}
                  alt={module.tutor.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users size={24} className="text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h6 className="font-bold text-gray-900">{module.tutor.name}</h6>
              <p className="text-sm text-primary font-medium">{module.tutor.title}</p>
              
              {/* Contact Links - Blurred for non-paid users */}
              {paymentCompleted ? (
                <div className="space-y-3 mt-3">
                  {/* Contact Info */}
                  <div className="flex flex-col gap-2">
                    {module.tutor.phone && (
                      <a 
                        href={`https://wa.me/${module.tutor.phone.replace(/\s+/g, '').replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                          <Phone size={14} className="text-green-600" />
                        </div>
                        <span className="font-medium">{module.tutor.phone}</span>
                        <span className="text-xs text-green-600 font-semibold">(WhatsApp)</span>
                      </a>
                    )}
                    {module.tutor.email && (
                      <a 
                        href={`mailto:${module.tutor.email}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Mail size={14} className="text-primary" />
                        </div>
                        <span className="font-medium">{module.tutor.email}</span>
                      </a>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    {module.tutor.linkedinUrl && (
                      <Link 
                        href={module.tutor.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0077b5]/10 text-[#0077b5] rounded-lg text-xs font-semibold hover:bg-[#0077b5]/20 transition-colors"
                      >
                        <Linkedin size={14} />
                        LinkedIn Profile
                      </Link>
                    )}
                    {module.tutor.phone && (
                      <a 
                        href={`https://wa.me/${module.tutor.phone.replace(/\s+/g, '').replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <BlurredContent onUnlock={onPaymentNeeded}>
                  <div className="space-y-3 mt-3">
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                          <Phone size={14} className="text-green-600" />
                        </div>
                        <span className="font-medium">+237 6XX XXX XXX</span>
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Mail size={14} className="text-primary" />
                        </div>
                        <span className="font-medium">tutor@zigexconnect.com</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0077b5]/10 text-[#0077b5] rounded-lg text-xs font-semibold">
                        <Linkedin size={14} />
                        LinkedIn
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                        <MessageCircle size={14} />
                        WhatsApp
                      </span>
                    </div>
                  </div>
                </BlurredContent>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </Card>
);

// Payment Info Modal Component
const PaymentInfoSection = ({ onClose }: { onClose?: () => void }) => (
  <Card className="p-6 bg-gradient-to-br from-primary/5 via-white to-primary/5 border-primary/20">
    <div className="flex items-start gap-4 mb-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
        <Wallet className="w-7 h-7 text-white" />
      </div>
      <div>
        <h3 className="font-black text-xl text-gray-900">Complete Your Payment</h3>
        <p className="text-gray-600 mt-1">
          Pay <span className="font-bold text-primary">{formatXAF(10000)}</span> to unlock all tutor contacts and premium resources
        </p>
      </div>
    </div>

    {/* Payment Methods */}
    <div className="space-y-4">
      {MOBILE_MONEY_PAYMENT_INFO.map((payment) => (
        <div 
          key={payment.provider}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              payment.provider === 'MTN' ? 'bg-yellow-100' : 'bg-orange-100'
            }`}>
              <Phone className={`w-5 h-5 ${
                payment.provider === 'MTN' ? 'text-yellow-600' : 'text-orange-600'
              }`} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{payment.provider} Mobile Money</h4>
              <p className="text-sm text-gray-600">Send to: <span className="font-medium">{payment.phoneNumber}</span></p>
            </div>
          </div>
          
          <div className="space-y-2">
            {payment.steps.slice(0, 3).map((step) => (
              <div key={step.stepNumber} className="flex items-start gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.stepNumber}
                </span>
                <span className="text-gray-600">{step.description}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-gray-900">After Payment</p>
          <p className="text-gray-600 mt-1">
            After completing your payment, contact the program administrator with your transaction ID for verification.
          </p>
        </div>
      </div>
    </div>
  </Card>
);

export function ProgramCurriculum({
  programId,
  isPaid,
  paymentCompleted,
  programTitle,
  isAdmin = false,
  onPaymentNeeded,
}: ProgramCurriculumProps) {
  const [content, setContent] = useState<ProgramContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModuleId, setExpandedModuleId] = useState<number | null>(null);
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  // Get local curriculum data - use program title for better matching
  const curriculum = getProgramCurriculum(programId, programTitle) || getProgramCurriculum('weekend-of-code');

  useEffect(() => {
    fetchContent();
  }, [programId]);

  const fetchContent = async () => {
    try {
      const response = await fetch(
        `/api/programs/${programId}/content`
      );
      if (response.ok) {
        const data = await response.json();
        setContent(data.content || []);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Separate content by whether it requires payment
  const freeContent = content.filter((c) => !c.payment_required);
  const paidContent = content.filter((c) => c.payment_required);

  const handlePaymentNeeded = () => {
    setShowPaymentInfo(true);
    onPaymentNeeded?.();
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center border-0 shadow-none bg-transparent">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary mx-auto" />
        <p className="text-gray-500 text-sm mt-3">Loading curriculum...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-primary to-primary/60" />
            Program Curriculum
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {curriculum?.totalWeeks} weeks • {curriculum?.modules.length} modules
          </p>
        </div>
        
        {isPaid && !paymentCompleted && (
          <Button 
            onClick={handlePaymentNeeded}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <CreditCard size={16} className="mr-2" />
            Complete Payment
          </Button>
        )}
      </div>

      {/* Payment Status Banner */}
      {isPaid && !paymentCompleted && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900">Tutor Contacts Locked</h4>
              <p className="text-sm text-amber-800 mt-1">
                Complete your payment of <span className="font-bold">{formatXAF(10000)}</span> to unlock tutor contacts and premium resources.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Completed Banner */}
      {paymentCompleted && (
        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900">Full Access Unlocked</h4>
              <p className="text-sm text-emerald-800 mt-1">
                You have full access to all curriculum content and can contact tutors directly.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Curriculum Modules */}
      {curriculum && curriculum.modules.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            Course Modules
          </h4>
          <div className="space-y-3">
            {curriculum.modules.map((module) => (
              <ModuleCard
                key={module.moduleNumber}
                module={module}
                isExpanded={expandedModuleId === module.moduleNumber}
                onToggle={() => setExpandedModuleId(
                  expandedModuleId === module.moduleNumber ? null : module.moduleNumber
                )}
                paymentCompleted={paymentCompleted}
                onPaymentNeeded={handlePaymentNeeded}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Content from Database */}
      {freeContent.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            Course Materials
          </h4>
          <div className="space-y-2">
            {freeContent.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
              >
                <button
                  onClick={() => setExpandedContentId(expandedContentId === item.id ? null : item.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedContentId === item.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedContentId === item.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    {item.description && (
                      <p className="text-sm text-gray-700 mb-4">{item.description}</p>
                    )}
                    {item.content_url && (
                      <a
                        href={item.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                      >
                        <FileText size={16} />
                        View Content
                      </a>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Premium Content Section - Payment Required */}
      {paidContent.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Premium Resources
            {isPaid && !paymentCompleted && (
              <span className="ml-2 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                Requires Payment
              </span>
            )}
          </h4>

          {isPaid && !paymentCompleted ? (
            <BlurredContent onUnlock={handlePaymentNeeded}>
              <div className="space-y-2">
                {paidContent.slice(0, 2).map((item) => (
                  <Card key={item.id} className="p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                        <Github size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </BlurredContent>
          ) : (
            <div className="space-y-2">
              {paidContent.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
                >
                  <button
                    onClick={() => setExpandedContentId(expandedContentId === item.id ? null : item.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        {item.resource_type === "pdf" && <FileText size={18} className="text-purple-600" />}
                        {item.resource_type === "github" && <Github size={18} className="text-purple-600" />}
                        {item.resource_type === "video" && <Video size={18} className="text-purple-600" />}
                        {!item.resource_type && <FileText size={18} className="text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{item.description}</p>
                        )}
                        {item.resource_type && (
                          <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded mt-2 inline-block font-medium">
                            {item.resource_type.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedContentId === item.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedContentId === item.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      {item.description && (
                        <p className="text-sm text-gray-700 mb-4">{item.description}</p>
                      )}
                      {item.content_url && (
                        <a
                          href={item.content_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                        >
                          <Github size={16} />
                          Open Resource
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!curriculum && content.length === 0 && (
        <Card className="p-8 text-center border border-dashed border-gray-300">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            {isAdmin ? "No content yet. Add some to get started!" : "Content coming soon!"}
          </p>
        </Card>
      )}

      {/* Payment Info Modal */}
      {showPaymentInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="relative">
              <button
                onClick={() => setShowPaymentInfo(false)}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center hover:bg-gray-50 z-10"
              >
                <span className="text-gray-500 text-lg">&times;</span>
              </button>
              <PaymentInfoSection onClose={() => setShowPaymentInfo(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold text-gray-900">About Access Levels</p>
            <p className="mt-1">
              <strong className="text-primary">Curriculum:</strong> Visible to all accepted students
            </p>
            <p>
              <strong className="text-primary">Tutor Contacts:</strong> Available after payment verification ({formatXAF(10000)})
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
