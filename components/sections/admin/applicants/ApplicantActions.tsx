"use client"

import { useState } from "react"
import { Applicant, ApplicantStatus } from "@/lib/types/applicants"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, ThumbsUp, PartyPopper, Calendar, Loader2, Send, Zap, MessageCircle, Mail, RotateCcw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type ApplicantActionsProps = {
  applicant: Applicant
  onUpdateStatus: (newStatus: ApplicantStatus) => void
}

export const ApplicantActions = ({
  applicant,
  onUpdateStatus,
}: ApplicantActionsProps) => {
  const { status } = applicant
  const [isScheduling, setIsScheduling] = useState(false)
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [showRevertConfirm, setShowRevertConfirm] = useState(false)

  const handleStatusUpdate = async (newStatus: ApplicantStatus) => {
      setIsSubmittingUpdate(true)
      try {
          await onUpdateStatus(newStatus)
          setShowRejectConfirm(false)
          setShowRevertConfirm(false)
      } finally {
          setIsSubmittingUpdate(false)
      }
  }

  const handleScheduleInterview = async (date: string) => {
      setIsSubmittingUpdate(true)
      try {
          const response = await fetch(`/api/companies/applications/${applicant.id}/schedule`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ date }),
          })

          if (!response.ok) throw new Error('Failed to schedule')

          toast.success(`Interview invitation sent for ${date}`)
          onUpdateStatus("reviewed") // Progress status to reviewed
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

  const ActionWrapper = ({ children, title, subtitle, icon: Icon, colorClass = "text-primary" }: { children: React.ReactNode, title: string, subtitle: string, icon?: any, colorClass?: string }) => (
      <div className="space-y-6 w-full">
          <div className="text-center space-y-1">
              {Icon && (
                <div className="flex justify-center mb-2">
                    <div className={cn("p-2 rounded-xl bg-slate-100/50", colorClass)}>
                        <Icon size={20} />
                    </div>
                </div>
              )}
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</h4>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{subtitle}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
              {children}
          </div>
      </div>
  )

  const renderActions = () => {
    switch (status) {
      case "pending":
        return (
          <ActionWrapper title="Screening Phase" subtitle="Verify candidate fit" icon={Zap} colorClass="text-amber-500">
              <Button
                onClick={() => handleStatusUpdate("reviewing")}
                disabled={isSubmittingUpdate}
                variant="outline"
                className="rounded-2xl h-12 px-6 border-slate-200 hover:bg-slate-50 transition-all font-bold group"
              >
                {isSubmittingUpdate ? <Loader2 className="animate-spin mr-2" size={16} /> : <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />}
                Start Review
              </Button>
              <Button
                onClick={() => setShowRejectConfirm(true)}
                disabled={isSubmittingUpdate}
                variant="ghost"
                className="rounded-2xl h-12 px-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-bold"
              >
                Reject
              </Button>
          </ActionWrapper>
        )

      case "reviewing":
      case "reviewed":
        return (
          <ActionWrapper title="Final Evaluation" subtitle="Select your decision" icon={ThumbsUp} colorClass="text-indigo-500">
              <Button
                onClick={() => handleStatusUpdate("accepted")}
                disabled={isSubmittingUpdate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-8 shadow-lg shadow-emerald-100 border-none font-bold group"
              >
                {isSubmittingUpdate ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />}
                Accept & Invite
              </Button>

              <div className="flex gap-2">
                  <Button
                    onClick={() => setIsScheduling(true)}
                    variant="outline"
                    className="rounded-2xl h-12 px-5 border-slate-200 font-bold"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-slate-400" /> Schedule
                  </Button>
                  <Button
                    onClick={handleEmailSend}
                    disabled={isSubmittingUpdate}
                    variant="outline"
                    className="rounded-2xl h-12 px-5 border-slate-200 font-bold"
                  >
                    <Mail className="mr-2 h-4 w-4 text-slate-400" /> Email
                  </Button>
              </div>
              <Button
                onClick={() => setShowRejectConfirm(true)}
                disabled={isSubmittingUpdate}
                variant="ghost"
                className="rounded-2xl h-12 px-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-bold"
              >
                Decline
              </Button>
          </ActionWrapper>
        )

      case "accepted":
      case "rsvp_confirmed":
        return (
          <ActionWrapper 
            title={status === "accepted" ? "Awaiting RSVP" : "Participation Confirmed"} 
            subtitle="Engage with the candidate directly"
            icon={PartyPopper}
            colorClass="text-emerald-500"
          >
              <Button
                onClick={handleEmailSend}
                disabled={isSubmittingUpdate}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold border-none"
              >
                <Mail className="mr-2 h-4 w-4" /> Send Email
              </Button>
              <Button
                onClick={handleWhatsAppInvite}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl h-12 px-6 border-none shadow-lg shadow-green-100 font-bold"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Invite
              </Button>
              <Button
                onClick={handleSMSInvite}
                variant="outline"
                className="rounded-2xl h-12 px-6 border-slate-200 bg-white font-bold hover:bg-slate-50"
              >
                <Send className="mr-2 h-4 w-4 text-slate-400" /> Send SMS Alert
              </Button>
              
              <div className="w-full flex justify-center gap-4 mt-2">
                  <Button
                    onClick={() => setShowRevertConfirm(true)}
                    disabled={isSubmittingUpdate}
                    variant="ghost"
                    className="rounded-xl h-10 px-4 text-slate-400 text-[10px] uppercase tracking-widest font-black hover:bg-slate-100"
                  >
                    <RotateCcw className="mr-2 h-3 w-3" /> Revert to Review
                  </Button>
                  <Button
                    onClick={() => setShowRejectConfirm(true)}
                    disabled={isSubmittingUpdate}
                    variant="ghost"
                    className="rounded-xl h-10 px-4 text-slate-300 hover:text-rose-400 text-[10px] uppercase tracking-widest font-black hover:bg-rose-50/50"
                  >
                    <X className="mr-2 h-3 w-3" /> Decline
                  </Button>
              </div>
          </ActionWrapper>
        )

      case "rejected":
        return (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-500 mb-2">
                <X size={32} />
            </div>
            <p className="text-xs font-black text-rose-900 uppercase tracking-widest">Application Declined</p>
            <Button 
                onClick={() => handleStatusUpdate("pending")} 
                variant="outline" 
                className="text-[10px] text-slate-500 font-bold uppercase mt-4 rounded-xl border-slate-200 px-6 h-10"
            >
                Re-open Application
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-dashed border-slate-200/60 min-h-[140px] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500">
      <AnimatePresence mode="wait">
          <motion.div
            key={status + (showRejectConfirm ? '-rejecting' : '') + (showRevertConfirm ? '-reverting' : '') + (isScheduling ? '-scheduling' : '')}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full flex flex-col items-center"
          >
            {showRejectConfirm ? (
                <div className="flex flex-col items-center text-center space-y-6 py-4">
                    <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900 uppercase">Confirm Rejection</h4>
                        <p className="text-[10px] text-slate-500 max-w-[200px]">This will mark the application as declined. You can undo this later.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setShowRejectConfirm(false)}
                            variant="outline"
                            className="rounded-2xl h-11 px-6 border-slate-200 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleStatusUpdate("rejected")}
                            disabled={isSubmittingUpdate}
                            variant="destructive"
                            className="rounded-2xl h-11 px-8 font-bold shadow-lg shadow-rose-100"
                        >
                            {isSubmittingUpdate ? <Loader2 className="animate-spin" /> : "Confirm Reject"}
                        </Button>
                    </div>
                </div>
            ) : showRevertConfirm ? (
                <div className="flex flex-col items-center text-center space-y-6 py-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                        <RotateCcw size={32} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900 uppercase">Revert to Review?</h4>
                        <p className="text-[10px] text-slate-500 max-w-[200px]">Moves the candidate back to evaluation phase. No emails will be sent.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setShowRevertConfirm(false)}
                            variant="outline"
                            className="rounded-2xl h-11 px-6 border-slate-200 font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleStatusUpdate("reviewed")}
                            disabled={isSubmittingUpdate}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-8 font-bold shadow-lg shadow-indigo-100 border-none"
                        >
                            {isSubmittingUpdate ? <Loader2 className="animate-spin" /> : "Confirm Revert"}
                        </Button>
                    </div>
                </div>
            ) : isScheduling ? (
                <div className="flex flex-col items-center text-center space-y-6 py-4">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                        <Calendar size={32} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900 uppercase">Schedule Interview</h4>
                        <p className="text-[10px] text-slate-500">Pick a starting point for {applicant.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                        {['Monday 10AM', 'Tuesday 2PM', 'Wed 11AM', 'Friday 4PM'].map(slot => (
                            <button 
                                key={slot} 
                                onClick={() => handleScheduleInterview(slot)} 
                                className="p-3 border border-slate-100 bg-white rounded-xl text-[10px] font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all disabled:opacity-50" 
                                disabled={isSubmittingUpdate}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                    <Button 
                        onClick={() => setIsScheduling(false)} 
                        variant="ghost" 
                        className="rounded-xl text-[10px] font-black uppercase text-slate-400"
                    >
                        Back to Evaluation
                    </Button>
                </div>
            ) : (
                renderActions()
            )}
          </motion.div>
      </AnimatePresence>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
    </div>
  )
}

