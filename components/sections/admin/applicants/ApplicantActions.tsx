"use client"

import { useState } from "react"
import { Applicant, ApplicantStatus } from "@/lib/types/applicants"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, ThumbsUp, PartyPopper, Calendar, Loader2, Send, Zap, MessageCircle, Mail } from "lucide-react"
import { toast } from "sonner"

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

  const handleStatusUpdate = async (newStatus: ApplicantStatus) => {
      setIsSubmittingUpdate(true)
      try {
          await onUpdateStatus(newStatus)
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

  const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/GzXpExampleLink"; // Define your actual link here

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

  const ActionWrapper = ({ children, title, subtitle, icon: Icon }: { children: React.ReactNode, title: string, subtitle: string, icon?: any }) => (
      <div className="space-y-6">
          <div className="text-center space-y-1">
              {Icon && <div className="flex justify-center mb-2"><Icon size={24} className="text-primary/40" /></div>}
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</h4>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{subtitle}</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
              {children}
          </div>
      </div>
  )

  const renderActions = () => {
    switch (status) {
      case "pending":
        return (
          <ActionWrapper title="Screening Phase" subtitle="Verify candidate fit" icon={Zap}>
              <Button
                onClick={() => handleStatusUpdate("reviewed")}
                disabled={isSubmittingUpdate}
                variant="outline"
                className="rounded-xl h-12 px-6 border-slate-200"
              >
                {isSubmittingUpdate ? <Loader2 className="animate-spin mr-2" size={16} /> : <Eye className="mr-2 h-4 w-4" />}
                Move to Review
              </Button>
              <Button
                onClick={() => handleStatusUpdate("rejected")}
                disabled={isSubmittingUpdate}
                variant="destructive"
                className="rounded-xl h-12 px-6"
              >
                Reject
              </Button>
          </ActionWrapper>
        )

      case "reviewed":
        return (
          <ActionWrapper title="Final Evaluation" subtitle="Select your decision" icon={ThumbsUp}>
              <Button
                onClick={() => handleStatusUpdate("accepted")}
                disabled={isSubmittingUpdate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-8 shadow-lg shadow-emerald-200"
              >
                {isSubmittingUpdate ? <Loader2 className="animate-spin mr-2" size={16} /> : <Check className="mr-2 h-4 w-4" />}
                Accept & Invite
              </Button>
              <Button
                onClick={() => setIsScheduling(true)}
                variant="outline"
                className="rounded-xl h-12 px-6 border-slate-200"
              >
                <Calendar className="mr-2 h-4 w-4" /> Schedule
              </Button>
              <Button
                onClick={handleEmailSend}
                disabled={isSubmittingUpdate}
                variant="outline"
                className="rounded-xl h-12 px-6 border-slate-200"
              >
                <Mail className="mr-2 h-4 w-4" /> Email
              </Button>
              <Button
                onClick={() => handleStatusUpdate("rejected")}
                disabled={isSubmittingUpdate}
                variant="destructive"
                className="rounded-xl h-12 px-6"
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
          >
              <Button
                onClick={handleEmailSend}
                disabled={isSubmittingUpdate}
                className="bg-primary text-white rounded-xl h-12 px-6 shadow-lg shadow-blue-100"
              >
                <Mail className="mr-2 h-4 w-4" /> Send Email
              </Button>
              <Button
                onClick={handleWhatsAppInvite}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl h-12 px-6 border-none shadow-lg shadow-green-100"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Invite
              </Button>
              <Button
                onClick={handleSMSInvite}
                variant="outline"
                className="rounded-xl h-12 px-6 border-slate-200 bg-white"
              >
                <Send className="mr-2 h-4 w-4" /> Send SMS Alert
              </Button>
              <Button
                onClick={() => handleStatusUpdate("reviewed")}
                disabled={isSubmittingUpdate}
                variant="ghost"
                className="rounded-xl h-12 px-6 text-slate-400 text-xs hover:bg-slate-100"
              >
                Revert to Review
              </Button>
          </ActionWrapper>
        )

      case "rejected":
        return (
          <div className="flex flex-col items-center gap-2 py-4 animate-in fade-in slide-in-from-top-4">
            <X className="text-rose-500" size={32} />
            <p className="text-xs font-black text-rose-900 uppercase tracking-widest">Application Declined</p>
            <Button onClick={() => handleStatusUpdate("pending")} variant="ghost" className="text-[10px] text-slate-400 font-bold uppercase mt-2">Re-open Application</Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-dashed border-slate-200/60 min-h-[140px] flex flex-col justify-center relative overflow-hidden">
      {renderActions()}
      
      {/* Scheduling Interactive Overlay (Simulation) */}
      {isScheduling && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
              <h4 className="text-sm font-black text-slate-900 uppercase">Interview Setup</h4>
              <p className="text-[10px] text-slate-500 mb-6">Select preferred slot for {applicant.name}</p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-xs mb-6">
                 {['Monday 10AM', 'Tuesday 2PM', 'Wed 11AM', 'Friday 4PM'].map(slot => (
                     <button key={slot} onClick={() => handleScheduleInterview(slot)} className="p-2 border border-slate-100 rounded-xl text-[10px] font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50" disabled={isSubmittingUpdate}>
                        {slot}
                     </button>
                 ))}
              </div>
              <div className="flex gap-2">
                 <Button onClick={() => setIsScheduling(false)} variant="ghost" className="rounded-xl">Cancel</Button>
              </div>
          </div>
      )}
    </div>
  )
}
