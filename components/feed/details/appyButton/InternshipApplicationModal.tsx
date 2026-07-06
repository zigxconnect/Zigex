"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Briefcase,
  Loader2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Building2,
  Calendar,
  MapPin,
  GraduationCap,
  User,
  Target,
  MessageSquare,
  Shield,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface InternshipApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId: string;
  internshipTitle: string;
  companyName?: string;
}

const SCHOOL_OPTIONS = ["NAHPI", "COLTECH", "NPUI", "CATUC", "Professional", "Other"];
const LEVEL_OPTIONS = ["200", "300", "400", "500", "Masters", "PhD", "Other"];
const DOMAIN_OPTIONS = [
  "Frontend Web Dev",
  "Backend",
  "Mobile Dev",
  "Machine Learning/AI",
  "Cybersecurity",
  "Product Design (UI/UX)",
  "Embedded Systems & IoT",
  "Project Management",
  "Product Management",
  "Other"
];
const DURATION_OPTIONS = ["1 month", "2 months", "3 months", "4 months", "5 months", "Other"];
const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Expert", "No Idea"];

const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Career Goals", icon: Target },
  { id: 3, title: "Confirmation", icon: Shield }
];

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

const FormField = ({ label, required, error, children, hint }: FormFieldProps) => (
  <div className="space-y-2 relative group">
    <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 transition-colors group-focus-within:text-[#155DFC]">
      {label}
      {required && <span className="text-[#155DFC] text-[10px]">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">{hint}</p>
    )}
    {error && (
      <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-left-2">
        <AlertCircle size={14} /> {error}
      </p>
    )}
  </div>
);

const inputBaseClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/20 transition-all duration-300 outline-none text-slate-900 font-bold placeholder:text-slate-400 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_4px_12px_-3px_rgba(6,81,237,0.1)] focus:shadow-[0_4px_15px_-3px_rgba(6,81,237,0.15)]";
const selectBaseClass = `
  ${inputBaseClass}
  appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%23155DFC%22%20d%3D%22M10%2012.5l-5-5h10l-5%205z%22/%3E%3C/svg%3E')]
  bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-12
`;

export default function InternshipApplicationModal({
  isOpen,
  onClose,
  internshipId,
  internshipTitle,
  companyName = "the company"
}: InternshipApplicationModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    school: "",
    school_level: "",
    date_of_birth: "",
    address: "",
    domain: "",
    duration: "",
    experience_level: "",
    reason: "",
    expectations: "",
    is_paid_acknowledgement: false,
    comment: ""
  });

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case "full_name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Name must be at least 3 characters";
        return "";
      case "school":
        return !value ? "Please select your school" : "";
      case "school_level":
        return !value ? "Please select your level" : "";
      case "date_of_birth":
        if (!value) return "Date of birth is required";
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 13) return "Applicants must be at least 13 years old to apply.";
        if (age > 85) return "Please enter a valid date of birth.";
        return "";
      case "address":
        if (!value.trim()) return "Address is required";
        return "";
      case "domain":
        return !value ? "Please select a domain" : "";
      case "duration":
        return !value ? "Please select duration" : "";
      case "experience_level":
        return !value ? "Please select experience" : "";
      case "reason":
        if (!value.trim()) return "Motivation is required";
        if (value.trim().length < 30) return `Motivation is too short (${value.trim().length}/30)`;
        return "";
      case "expectations":
        if (!value.trim()) return "Expectations are required";
        if (value.trim().length < 20) return `Expectations too short (${value.trim().length}/20)`;
        return "";
      case "is_paid_acknowledgement":
        return !value ? "Acknowledgment required" : "";
      default:
        return "";
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name as keyof typeof formData]) }));
  };

  const step1Fields = ["full_name", "school", "school_level", "date_of_birth", "address"];
  const step2Fields = ["domain", "duration", "experience_level", "reason", "expectations"];
  const step3Fields = ["is_paid_acknowledgement"];

  const isStepValid = useMemo(() => {
    const fieldsToCheck = step === 1 ? step1Fields : step === 2 ? step2Fields : step3Fields;
    return fieldsToCheck.every(field => !validateField(field, formData[field as keyof typeof formData]));
  }, [formData, step]);

  const nextStep = () => {
    const fields = step === 1 ? step1Fields : step2Fields;
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    let isValid = true;

    fields.forEach(f => {
      newTouched[f] = true;
      const err = validateField(f, formData[f as keyof typeof formData]);
      if (err) { newErrors[f] = err; isValid = false; }
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (isValid) {
      setStep(prev => Math.min(prev + 1, 3));
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!isStepValid) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/students/applications/internship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internship_id: internshipId,
          ...formData
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Submission failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setTimeout(() => {
        setStep(1);
        setSuccess(false);
        setFormData({
          full_name: "", school: "", school_level: "", date_of_birth: "", address: "",
          domain: "", duration: "", experience_level: "", reason: "", expectations: "",
          is_paid_acknowledgement: false, comment: ""
        });
        setErrors({});
        setTouched({});
        setSubmitError(null);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-0 sm:p-4 z-[9999]">
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden h-[95vh] sm:h-auto sm:max-h-[90vh]"
      >
        {/* Premium Header */}
        <div className="relative bg-[#155DFC] text-white p-8 shrink-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl -ml-20 -mb-20" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black tracking-tight leading-tight truncate">Internship Portal</h2>
                <div className="flex items-center gap-2 text-blue-100 text-sm font-bold mt-1.5 uppercase tracking-widest opacity-90">
                  <span className="truncate max-w-[200px]">{internshipTitle}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="p-3 hover:bg-white/15 rounded-2xl transition-all duration-300 group"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* New Clean Step Progress */}
          <div className="mt-10 flex items-center gap-3">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-500",
                    step === s.id ? "bg-white text-[#155DFC] shadow-lg shadow-white/20 scale-110" : step > s.id ? "bg-white/30 text-white" : "bg-white/10 text-blue-100/40"
                  )}>
                    {step > s.id ? <CheckCircle2 size={18} /> : s.id}
                  </div>
                  <span className={cn(
                    "text-xs font-black uppercase tracking-widest hidden sm:block",
                    step === s.id ? "text-white" : "text-white/40"
                   )}>{s.title}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 max-w-[40px] rounded-full",
                    step > s.id ? "bg-white/40" : "bg-white/10"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain bg-white">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-blue-50 flex items-center justify-center mb-8 shadow-inner">
                  <Rocket size={48} className="text-[#155DFC]" />
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Application Success!</h3>
                <p className="text-slate-600 text-lg max-w-sm font-medium leading-relaxed">
                  Your application for <span className="text-[#155DFC] font-bold">{internshipTitle}</span> has been received. 
                  Check your email for further instructions.
                </p>
                <Button onClick={handleClose} className="mt-10 w-full h-14 rounded-2xl bg-[#155DFC] hover:bg-[#1A3CB9] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20">
                  Return to Dashboard
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-8 space-y-8"
              >
                {/* Step Header Block */}
                <div className="flex items-center gap-5 p-6 bg-blue-50/40 rounded-3xl border border-blue-100/50">
                  <div className="w-14 h-14 rounded-2xl bg-[#155DFC] flex items-center justify-center shadow-lg shadow-blue-500/15">
                    {React.createElement(STEPS[step-1].icon, { className: "w-7 h-7 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{STEPS[step-1].title}</h3>
                    <p className="text-sm text-slate-500 font-medium">Please complete the required information below.</p>
                  </div>
                </div>

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField label="Full Name" required error={touched.full_name ? errors.full_name : undefined}>
                        <input
                          className={cn(inputBaseClass, errors.full_name && touched.full_name && "border-rose-300")}
                          placeholder="As on your Birth Certificate"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange("full_name", e.target.value)}
                          onBlur={() => handleBlur("full_name")}
                        />
                      </FormField>

                      <FormField label="Date of Birth" required error={touched.date_of_birth ? errors.date_of_birth : undefined}>
                        <input
                          type="date"
                          className={cn(inputBaseClass, errors.date_of_birth && touched.date_of_birth && "border-rose-300")}
                          value={formData.date_of_birth}
                          onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                          onBlur={() => handleBlur("date_of_birth")}
                        />
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField label="Institution" required error={touched.school ? errors.school : undefined}>
                        <select
                          className={cn(selectBaseClass, errors.school && touched.school && "border-rose-300")}
                          value={formData.school}
                          onChange={(e) => handleInputChange("school", e.target.value)}
                          onBlur={() => handleBlur("school")}
                        >
                          <option value="">Select school</option>
                          {SCHOOL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FormField>

                      <FormField label="Academic Level" required error={touched.school_level ? errors.school_level : undefined}>
                        <select
                          className={cn(selectBaseClass, errors.school_level && touched.school_level && "border-rose-300")}
                          value={formData.school_level}
                          onChange={(e) => handleInputChange("school_level", e.target.value)}
                          onBlur={() => handleBlur("school_level")}
                        >
                          <option value="">Select level</option>
                          {LEVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FormField>
                    </div>

                    <FormField label="Contact Address" required error={touched.address ? errors.address : undefined}>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#155DFC]" />
                        <input
                          className={cn(inputBaseClass, "pl-11", errors.address && touched.address && "border-rose-300")}
                          placeholder="City, Neighborhood"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          onBlur={() => handleBlur("address")}
                        />
                      </div>
                    </FormField>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label="Preferred Domain" required error={touched.domain ? errors.domain : undefined}>
                        <select
                          className={cn(selectBaseClass, errors.domain && touched.domain && "border-rose-300")}
                          value={formData.domain}
                          onChange={(e) => handleInputChange("domain", e.target.value)}
                          onBlur={() => handleBlur("domain")}
                        >
                          <option value="">Select domain</option>
                          {DOMAIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FormField>

                      <FormField label="Duration" required error={touched.duration ? errors.duration : undefined}>
                        <select
                          className={cn(selectBaseClass, errors.duration && touched.duration && "border-rose-300")}
                          value={formData.duration}
                          onChange={(e) => handleInputChange("duration", e.target.value)}
                          onBlur={() => handleBlur("duration")}
                        >
                          <option value="">Months</option>
                          {DURATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FormField>

                      <FormField label="Experience" required error={touched.experience_level ? errors.experience_level : undefined}>
                        <select
                          className={cn(selectBaseClass, errors.experience_level && touched.experience_level && "border-rose-300")}
                          value={formData.experience_level}
                          onChange={(e) => handleInputChange("experience_level", e.target.value)}
                          onBlur={() => handleBlur("experience_level")}
                        >
                          <option value="">Level</option>
                          {EXPERIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </FormField>
                    </div>

                    <FormField label="Motivation Statement" required error={touched.reason ? errors.reason : undefined} hint="Min 30 characters">
                      <textarea
                        className={cn(inputBaseClass, "h-28 resize-none", errors.reason && touched.reason && "border-rose-300")}
                        placeholder="Why do you want to join this program?"
                        value={formData.reason}
                        onChange={(e) => handleInputChange("reason", e.target.value)}
                        onBlur={() => handleBlur("reason")}
                      />
                    </FormField>

                    <FormField label="Expectations" required error={touched.expectations ? errors.expectations : undefined} hint="Min 20 characters">
                      <textarea
                        className={cn(inputBaseClass, "h-28 resize-none", errors.expectations && touched.expectations && "border-rose-300")}
                        placeholder="What skills do you hope to acquire?"
                        value={formData.expectations}
                        onChange={(e) => handleInputChange("expectations", e.target.value)}
                        onBlur={() => handleBlur("expectations")}
                      />
                    </FormField>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#155DFC]/5 rounded-full -mr-16 -mt-16" />
                      <h4 className="text-[11px] font-black text-[#155DFC] uppercase tracking-widest mb-6 relative z-10">Application Summary</h4>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm relative z-10 font-bold text-slate-900 leading-tight">
                        <div><span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Name</span>{formData.full_name}</div>
                        <div><span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Institution</span>{formData.school}</div>
                        <div><span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Domain</span>{formData.domain}</div>
                        <div><span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Duration</span>{formData.duration}</div>
                      </div>
                    </div>

                    <div className={cn(
                      "p-6 rounded-3xl border-2 transition-all duration-300",
                      formData.is_paid_acknowledgement ? "bg-blue-50/50 border-[#155DFC]/30" : "bg-slate-50 border-slate-200"
                    )}>
                      <label className="flex items-start gap-4 cursor-pointer">
                        <div className="relative mt-1">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={formData.is_paid_acknowledgement}
                            onChange={(e) => handleInputChange("is_paid_acknowledgement", e.target.checked)}
                          />
                          <div className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                            formData.is_paid_acknowledgement ? "bg-[#155DFC] border-[#155DFC]" : "bg-white border-slate-300"
                          )}>
                            {formData.is_paid_acknowledgement && <CheckCircle2 size={16} className="text-white" />}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 tracking-tight">Terms and Conditions</p>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            I confirm that the information provided is accurate and I understand this is a professional application.
                          </p>
                        </div>
                      </label>
                    </div>

                    <FormField label="Additional Comments (Optional)">
                      <textarea
                        className={cn(inputBaseClass, "h-24 resize-none")}
                        placeholder="Anything else?"
                        value={formData.comment}
                        onChange={(e) => handleInputChange("comment", e.target.value)}
                      />
                    </FormField>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!success && (
          <div className="shrink-0 p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <Button 
              variant="ghost" 
              onClick={step === 1 ? handleClose : prevStep}
              className="px-6 h-12 rounded-xl font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              {step === 1 ? "Cancel" : <><ChevronLeft className="w-4 h-4 mr-2" /> Back</>}
            </Button>

            <Button 
              onClick={step === 3 ? handleSubmit : nextStep}
              disabled={isSubmitting || !isStepValid}
              className={cn(
                "h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300",
                isStepValid 
                  ? "bg-[#155DFC] hover:bg-[#1A3CB9] text-white shadow-xl shadow-blue-500/20 active:scale-95" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                step === 3 ? "Submit Application" : "Continue"
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
