"use client";

import { useState } from "react";
import { X, Mail, Loader2, CheckCircle2 } from "lucide-react";

interface WaitingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityTitle: string;
  opportunityType: string;
}

export function WaitingListModal({
  isOpen,
  onClose,
  opportunityTitle,
  opportunityType,
}: WaitingListModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send email directly from client using EmailJS
      const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_WAITLIST_TEMPLATE_ID;
      const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error("EmailJS not configured");
      }

      const templateParams = {
        to_email: email,
        opportunity_title: opportunityTitle,
        user_email: email,
        year: new Date().getFullYear(),
      };

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: templateParams,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send email: ${errorText}`);
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setEmail("");
      }, 2000);
    } catch (err) {
      console.error("Email error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-[95vw] sm:max-w-md bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 sm:top-6 sm:right-6 h-10 w-10 sm:h-10 sm:w-10 rounded-full z-[100] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg touch-manipulation"
        >
          <X className="h-5 w-5 sm:h-5 sm:w-5" />
        </button>

        {/* Header with Gradient */}
        <div className="bg-primary px-5 py-8 sm:px-8 sm:py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full -ml-10 sm:-ml-12 -mb-10 sm:-mb-12" />
          
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
              <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase mb-2">
              Waitlist
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">
              Smart Apply Preview
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {!isSuccess ? (
            <>
              <div className="mb-5 sm:mb-6">
                <p className="text-xs sm:text-sm text-center text-muted-foreground leading-relaxed font-medium">
                  Smart Apply for <span className="font-black text-foreground uppercase tracking-tight">{opportunityTitle}</span> is coming soon. 
                  Join our waitlist to be notified!
                </p>
              </div>

              {/* Benefits */}
              <div className="bg-muted/50 border border-border rounded-2xl sm:rounded-[1.5rem] p-5 mb-6">
                <h3 className="font-black text-[9px] sm:text-[10px] text-primary uppercase tracking-widest mb-3">
                  Benefits
                </h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {[
                    "AI-optimized applications",
                    "Priority review",
                    "Early access"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="font-black uppercase tracking-tight text-[10px] sm:text-xs">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                    Your Email
                  </label>
                  <div className="relative">
                    <input

                    
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full h-12 px-10 rounded-2xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 bg-muted/20 font-medium text-sm transition-all outline-none"
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  </div>
                  {error && (
                    <p className="text-[10px] text-destructive font-black uppercase tracking-tight ml-1">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </button>
              </form>

              <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-tight mt-4">
                Notification only
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">
                Confirmed
              </h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                You're on the list
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
