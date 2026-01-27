"use client"

import { useState, useCallback } from "react"
import { Applicant, ApplicantStatus } from "@/lib/types/applicants"
import { Button } from "@/components/ui/button"
import { 
  Check, X, Eye, ThumbsUp, PartyPopper, Calendar, Loader2, Send, 
  Zap, MessageCircle, Mail, RotateCcw, AlertTriangle, Sparkles,
  ArrowRight, Clock, Shield, CheckCircle2, XCircle, Play
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { SupervisorAssignment } from "./SupervisorAssignment"

type ApplicantActionsProps = {
  applicant: Applicant
  companyId: string
  onUpdateStatus: (newStatus: ApplicantStatus) => void
}

export const ApplicantActions = ({
  applicant,
  companyId,
  onUpdateStatus,
}: ApplicantActionsProps) => {
  const { status } = applicant
  const [isScheduling, setIsScheduling] = useState(false)
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [showRevertConfirm, setShowRevertConfirm] = useState(false)

  // Memoized handler to prevent unnecessary re-renders and ensure state update completes
  const handleStatusUpdate = useCallback(async (newStatus: ApplicantStatus) => {
    if (isSubmittingUpdate) return; // Prevent double-clicks
    
    setIsSubmittingUpdate(true)
    try {
      await onUpdateStatus(newStatus)
      setShowRejectConfirm(false)
      setShowRevertConfirm(false)
      // Show success feedback
      const statusMessages: Record<string, string> = {
        reviewing: "Application moved to review phase",
        reviewed: "Candidate evaluated successfully",
        accepted: "Candidate accepted! Invitation sent",
        rejected: "Application declined",
        pending: "Application reopened"
      }
      toast.success(statusMessages[newStatus] || "Status updated")
    } catch (error) {
      toast.error("Failed to update status. Please try again.")
    } finally {
      setIsSubmittingUpdate(false)
    }
  }, [isSubmittingUpdate, onUpdateStatus])

  const handleScheduleInterview = async (date: string) => {
    if (isSubmittingUpdate) return;
    
    setIsSubmittingUpdate(true)
    try {
      const response = await fetch(`/api/companies/applications/${applicant.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })

      if (!response.ok) throw new Error('Failed to schedule')

      toast.success(`Interview scheduled for ${date}`)
      onUpdateStatus("reviewed")
      setIsScheduling(false)
    } catch (err) {
      toast.error("Failed to send invitation")
    } finally {
      setIsSubmittingUpdate(false)
    }
  }

  const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/DXYGLpny3DwGs5pkb1fPAr";

  const handleWhatsAppInvite = () => {
    const message = encodeURIComponent(`Hi ${applicant.name}, this is the ZIGEX recruitment team. Congratulations on your progress for the ${applicant.internshipTitle || 'opportunity'}! Join our official community here: ${WHATSAPP_GROUP_LINK}`);
    window.open(`https://wa.me/${applicant.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleEmailSend = async () => {
    if (isSubmittingUpdate) return;
    
    setIsSubmittingUpdate(true)
    try {
      const response = await fetch(`/api/companies/applications/${applicant.id}/email`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to send')
      toast.success("Professional follow-up email sent!")
    } catch (err) {
      toast.error("Failed to send email. Check your connection.")
    } finally {
      setIsSubmittingUpdate(false)
    }
  }

  const handleSMSInvite = () => {
    const message = encodeURIComponent(`Hi ${applicant.name}, welcome to ZIGEX! Your application for ${applicant.internshipTitle} is moving forward. Check your email for more details.`);
    window.open(`sms:${applicant.phone}?body=${message}`, '_self');
  };

  // Progress indicator for status flow
  const StatusProgress = () => {
    const stages = [
      { key: 'pending', label: 'Screening', icon: Clock },
      { key: 'reviewing', label: 'Reviewing', icon: Eye },
      { key: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    ]
    
    // Normalize 'reviewed' to 'reviewing' for UI stages
    const normalizedStatus = status === 'reviewed' ? 'reviewing' : status;
    const currentIndex = stages.findIndex(s => s.key === normalizedStatus);
    
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {stages.map((stage, idx) => {
          const Icon = stage.icon
          const isActive = stage.key === normalizedStatus
          const isPast = idx < currentIndex && currentIndex !== -1
          const isRejected = status === 'rejected'
          
          return (
            <div key={stage.key} className="flex items-center">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
                isRejected && stage.key === 'pending' ? "bg-rose-100 text-rose-600" :
                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" :
                isPast ? "bg-blue-100 text-blue-600" :
                "bg-slate-100 text-slate-400"
              )}>
                <Icon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{stage.label}</span>
              </div>
              {idx < stages.length - 1 && (
                <ArrowRight size={14} className={cn(
                  "mx-1",
                  isPast ? "text-blue-400" : "text-slate-200"
                )} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderActions = () => {
    switch (status) {
      case "pending":
        return (
          <div className="space-y-8 w-full">
            <StatusProgress />
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Awaiting Review</span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Begin the evaluation process to assess this candidate's qualifications
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <Button
                onClick={() => handleStatusUpdate("reviewing")}
                disabled={isSubmittingUpdate}
                className={cn(
                  "relative overflow-hidden rounded-2xl h-14 px-10 font-bold text-sm",
                  "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                  "text-white shadow-xl shadow-blue-200 border-none",
                  "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                  "group"
                )}
              >
                {isSubmittingUpdate ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" />
                )}
                <span>Start Review Process</span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              </Button>
              
              <Button
                onClick={() => setShowRejectConfirm(true)}
                disabled={isSubmittingUpdate}
                variant="ghost"
                className="rounded-xl h-10 px-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-medium text-sm"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Decline Application
              </Button>
            </div>
          </div>
        )

      case "reviewing":
      case "reviewed":
        return (
          <div className="space-y-8 w-full">
            <StatusProgress />
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <ThumbsUp size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Final Decision</span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Make your decision on this candidate's application
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Primary Action - Accept */}
              <Button
                onClick={() => handleStatusUpdate("accepted")}
                disabled={isSubmittingUpdate}
                className={cn(
                  "relative overflow-hidden rounded-2xl h-14 w-full font-bold text-sm",
                  "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800",
                  "text-white shadow-xl shadow-blue-200 border-none",
                  "transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]",
                  "group"
                )}
              >
                {isSubmittingUpdate ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <CheckCircle2 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                )}
                <span>Accept & Send Invitation</span>
                <Sparkles className="ml-2 h-4 w-4 opacity-60" />
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              </Button>
              
              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setIsScheduling(true)}
                  variant="outline"
                  className="rounded-xl h-12 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-medium transition-all"
                >
                  <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                  Schedule
                </Button>
                <Button
                  onClick={handleEmailSend}
                  disabled={isSubmittingUpdate}
                  variant="outline"
                  className="rounded-xl h-12 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-medium transition-all"
                >
                  <Mail className="mr-2 h-4 w-4 text-blue-500" />
                  Send Email
                </Button>
              </div>
              
              {/* Decline */}
              <Button
                onClick={() => setShowRejectConfirm(true)}
                disabled={isSubmittingUpdate}
                variant="ghost"
                className="rounded-xl h-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-medium text-sm"
              >
                <X className="mr-2 h-4 w-4" />
                Decline Application
              </Button>
            </div>
          </div>
        )

      case "accepted":
      case "rsvp_confirmed":
        return (
          <div className="space-y-8 w-full">
            {/* Success Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl shadow-blue-200">
              <div className="absolute top-0 right-0 -mr-8 -mt-8">
                <PartyPopper size={100} className="text-white/10" />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Candidate Accepted!</h4>
                  <p className="text-sm text-white/80">
                    {status === "rsvp_confirmed" ? "Participation confirmed" : "Awaiting RSVP confirmation"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Supervisor Assignment */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
               <SupervisorAssignment 
                  applicationId={applicant.id} 
                  currentSupervisorId={applicant.supervisorId} 
                  companyId={companyId}
               />
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500">Connect with your new team member</p>
            </div>
            
            {/* Communication Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={handleEmailSend}
                disabled={isSubmittingUpdate}
                className="rounded-xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium border-none shadow-lg shadow-blue-100 transition-all hover:scale-[1.02]"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                onClick={handleWhatsAppInvite}
                className="rounded-xl h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium border-none shadow-lg shadow-green-100 transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                onClick={handleSMSInvite}
                variant="outline"
                className="rounded-xl h-12 border-slate-200 hover:bg-slate-50 font-medium transition-all hover:scale-[1.02]"
              >
                <Send className="mr-2 h-4 w-4 text-slate-500" />
                SMS
              </Button>
            </div>
            
            {/* Management Actions */}
            <div className="flex justify-center gap-4 pt-4 border-t border-slate-100">
              <Button
                onClick={() => setShowRevertConfirm(true)}
                disabled={isSubmittingUpdate}
                variant="ghost"
                className="rounded-lg h-9 px-4 text-slate-400 text-xs uppercase tracking-wider font-bold hover:bg-slate-100"
              >
                <RotateCcw className="mr-2 h-3 w-3" />
                Revert
              </Button>
              <Button
                onClick={() => setShowRejectConfirm(true)}
                disabled={isSubmittingUpdate}
                variant="ghost"
                className="rounded-lg h-9 px-4 text-slate-300 hover:text-rose-500 text-xs uppercase tracking-wider font-bold hover:bg-rose-50"
              >
                <X className="mr-2 h-3 w-3" />
                Revoke
              </Button>
            </div>
          </div>
        )

      case "rejected":
        return (
          <div className="flex flex-col items-center gap-6 py-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center border border-rose-200">
              <XCircle size={36} className="text-rose-500" />
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-lg font-bold text-slate-900">Application Declined</h4>
              <p className="text-sm text-slate-500 max-w-xs">
                This application has been marked as declined
              </p>
            </div>
            <Button 
              onClick={() => handleStatusUpdate("pending")} 
              variant="outline" 
              className="rounded-xl h-12 px-8 border-slate-200 hover:border-blue-300 hover:bg-blue-50 font-medium transition-all"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reopen Application
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30 rounded-3xl" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-100/40 to-transparent rounded-full blur-3xl -ml-32 -mb-32" />
      
      <div className="relative z-10 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={status + (showRejectConfirm ? '-rejecting' : '') + (showRevertConfirm ? '-reverting' : '') + (isScheduling ? '-scheduling' : '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {showRejectConfirm ? (
              <div className="flex flex-col items-center text-center space-y-6 py-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center border border-rose-200">
                  <AlertTriangle size={36} className="text-rose-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-900">Confirm Decline</h4>
                  <p className="text-sm text-slate-500 max-w-xs">
                    This will mark the application as declined. A notification will be sent to the candidate.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowRejectConfirm(false)}
                    variant="outline"
                    className="rounded-xl h-12 px-8 border-slate-200 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("rejected")}
                    disabled={isSubmittingUpdate}
                    className="rounded-xl h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-lg shadow-rose-100 border-none"
                  >
                    {isSubmittingUpdate ? <Loader2 className="animate-spin mr-2" /> : <XCircle className="mr-2 h-4 w-4" />}
                    Confirm Decline
                  </Button>
                </div>
              </div>
            ) : showRevertConfirm ? (
              <div className="flex flex-col items-center text-center space-y-6 py-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200">
                  <RotateCcw size={36} className="text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-900">Revert to Review?</h4>
                  <p className="text-sm text-slate-500 max-w-xs">
                    This will move the candidate back to the evaluation phase. No notifications will be sent.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowRevertConfirm(false)}
                    variant="outline"
                    className="rounded-xl h-12 px-8 border-slate-200 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate("reviewed")}
                    disabled={isSubmittingUpdate}
                    className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-100 border-none"
                  >
                    {isSubmittingUpdate ? <Loader2 className="animate-spin mr-2" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                    Confirm Revert
                  </Button>
                </div>
              </div>
            ) : isScheduling ? (
              <div className="flex flex-col items-center text-center space-y-6 py-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center border border-blue-200">
                  <Calendar size={36} className="text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-900">Schedule Interview</h4>
                  <p className="text-sm text-slate-500">
                    Select a time slot for <span className="font-medium text-slate-700">{applicant.name}</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                  {['Monday 10AM', 'Tuesday 2PM', 'Wed 11AM', 'Friday 4PM'].map(slot => (
                    <button 
                      key={slot} 
                      onClick={() => handleScheduleInterview(slot)} 
                      disabled={isSubmittingUpdate}
                      className={cn(
                        "p-4 border-2 border-slate-100 bg-white rounded-xl text-sm font-medium",
                        "hover:bg-blue-600 hover:text-white hover:border-blue-600",
                        "transition-all duration-200 disabled:opacity-50"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={() => setIsScheduling(false)} 
                  variant="ghost" 
                  className="rounded-lg text-sm font-medium text-slate-400 hover:text-slate-600"
                >
                  Back to Evaluation
                </Button>
              </div>
            ) : (
              renderActions()
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
