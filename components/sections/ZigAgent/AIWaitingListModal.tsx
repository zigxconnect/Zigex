"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, CheckCircle2, Loader2 } from "lucide-react";

interface AIWaitingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string; // e.g., "ZigAgent AI", "Deep Research", etc.
}

export function AIWaitingListModal({
  isOpen,
  onClose,
  featureName,
}: AIWaitingListModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_AI_WAITLIST_TEMPLATE_ID;
      const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error("EmailJS not configured");
      }

      // console.log("Sending email with:", {
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        email,
        featureName
      });

      const templateParams = {
        to_email: email,
        feature_name: featureName,
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

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300" style={{ zIndex: 9999 }}>
      <div className="relative w-full max-w-[95vw] sm:max-w-md bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-2 border-blue-50 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 sm:top-6 sm:right-6 h-10 w-10 sm:h-10 sm:w-10 rounded-full z-[100] bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg touch-manipulation"
        >
          <X className="h-5 w-5 sm:h-5 sm:w-5" />
        </button>

        {isSuccess ? (
          // Success State
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] rounded-full flex items-center justify-center shadow-2xl shadow-blue-200">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">
              You're on the List!
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              We'll notify you when {featureName} launches.
            </p>
          </div>
        ) : (
          // Form State
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] px-6 sm:px-8 py-8 sm:py-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 uppercase tracking-tight">
                  Join the Waitlist
                </h2>
                <p className="text-blue-100 text-sm sm:text-base font-medium">
                  {featureName} is coming soon!
                </p>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="mb-6">
                <label className="block text-xs sm:text-sm font-black text-[#155DFC] uppercase tracking-wider mb-2">
                  Your Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl border-2 border-blue-50 bg-slate-50/50 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 transition-all duration-200 text-sm sm:text-base text-slate-900 placeholder-slate-400 font-medium"
                    disabled={isSubmitting}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 font-medium animate-in slide-in-from-top-2">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#155DFC] to-[#1A3CB9] text-white rounded-2xl font-black uppercase tracking-wider text-sm sm:text-base hover:shadow-2xl hover:shadow-blue-200 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Waitlist"
                )}
              </button>

              <p className="mt-4 text-xs sm:text-sm text-center text-slate-500 font-medium">
                We'll notify you as soon as {featureName} is ready
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
