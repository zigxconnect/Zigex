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
      <div className="relative w-full max-w-[95vw] sm:max-w-md bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-blue-50 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 sm:top-6 sm:right-6 h-10 w-10 sm:h-10 sm:w-10 rounded-full z-[100] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg touch-manipulation"
        >
          <X className="h-5 w-5 sm:h-5 sm:w-5" />
        </button>

        {/* Header with Gradient */}
        <div className="bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] px-5 py-8 sm:px-8 sm:py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full -ml-10 sm:-ml-12 -mb-10 sm:-mb-12" />
          
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
              <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight uppercase mb-1.5 sm:mb-2">
              Join the Waitlist
            </h2>
            <p className="text-[9px] sm:text-[10px] font-black text-blue-100 uppercase tracking-[0.2em]">
              Smart Apply Coming Soon
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {!isSuccess ? (
            <>
              <div className="mb-5 sm:mb-6">
                <p className="text-xs sm:text-sm text-center text-slate-600 leading-relaxed font-medium">
                  Smart Apply for <span className="font-bold text-slate-900">{opportunityTitle}</span> is currently in development. 
                  Join our waitlist to be notified when it launches!
                </p>
              </div>

              {/* Benefits */}
              <div className="bg-[#F6F8FF] border border-blue-100 rounded-2xl sm:rounded-[1.5rem] p-4 sm:p-5 mb-5 sm:mb-6">
                <h3 className="font-black text-[9px] sm:text-[10px] text-[#155DFC] uppercase tracking-wider mb-2.5 sm:mb-3">
                  What You'll Get
                </h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {[
                    "AI-powered application drafts",
                    "Priority review in 2 hours",
                    "Personalized recommendations",
                    "Early access to new features"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#155DFC] mt-0.5 flex-shrink-0" />
                      <span className="font-medium leading-tight">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1">
                    Your Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-11 sm:h-12 pl-9 sm:pl-10 pr-4 rounded-xl sm:rounded-2xl border-2 border-blue-50 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 bg-slate-50/50 font-medium text-sm transition-all outline-none"
                      required
                    />
                    <Mail className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  </div>
                  {error && (
                    <p className="text-xs text-red-600 font-medium ml-1">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-[0.15em] bg-[#155DFC] hover:bg-[#1A3CB9] text-white shadow-xl shadow-blue-200 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Joining...
                    </span>
                  ) : (
                    "Join Waitlist"
                  )}
                </button>
              </form>

              <p className="text-[9px] sm:text-[10px] text-center text-slate-400 font-medium mt-3 sm:mt-4">
                We'll notify you as soon as Smart Apply is ready
              </p>
            </>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
                You're on the list!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                We'll email you when Smart Apply launches
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
