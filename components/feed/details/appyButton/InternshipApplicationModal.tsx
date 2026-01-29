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
  { id: 1, title: "Personal Info", icon: User, description: "Tell us about yourself" },
  { id: 2, title: "Career Goals", icon: Target, description: "Your aspirations & skills" },
  { id: 3, title: "Confirmation", icon: Shield, description: "Review & submit" }
];

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

const FormField = ({ label, required, error, children, hint }: FormFieldProps) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="text-rose-500 text-xs">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-xs text-slate-400 italic">{hint}</p>
    )}
    {error && (
      <p className="text-xs text-rose-500 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const inputBaseClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 transition-all duration-300 outline-none text-slate-900 font-medium placeholder:text-slate-400";
const labelBaseClass = "block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 ml-1";
const helperTextClass = "mt-2 text-[11px] text-slate-400 font-medium flex items-center gap-1.5 ml-1";

const selectBaseClass = `
  ${inputBaseClass}
  appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M10%2012.5l-5-5h10l-5%205z%22/%3E%3C/svg%3E')]
  bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10
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

  // Validate individual fields
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case "full_name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Name must be at least 3 characters";
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return "Name contains invalid characters";
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
        if (age < 13) return "Applicants must be at least 13 years old.";
        if (age > 80) return "Please enter a valid date of birth.";
        return "";
      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 5) return "Please provide a more detailed address";
        return "";
      case "domain":
        return !value ? "Please select a domain" : "";
      case "duration":
        return !value ? "Please select your preferred duration" : "";
      case "experience_level":
        return !value ? "Please select your experience level" : "";
      case "reason":
        if (!value.trim()) return "Motivation is required";
        if (value.trim().length < 30) return `At least 30 characters required (${value.trim().length}/30)`;
        return "";
      case "expectations":
        if (!value.trim()) return "Expectations are required";
        if (value.trim().length < 20) return `At least 20 characters required (${value.trim().length}/20)`;
        return "";
      case "is_paid_acknowledgement":
        return !value ? "You must acknowledge the terms" : "";
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

  // Validation per step
  const step1Fields = ["full_name", "school", "school_level", "date_of_birth", "address"];
  const step2Fields = ["domain", "duration", "experience_level", "reason", "expectations"];
  const step3Fields = ["is_paid_acknowledgement"];

  const validateStep = (stepNum: number): boolean => {
    const fields = stepNum === 1 ? step1Fields : stepNum === 2 ? step2Fields : step3Fields;
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    
    let isValid = true;
    fields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const isStepValid = useMemo(() => {
    const fieldsToCheck = step === 1 ? step1Fields : step === 2 ? step2Fields : step3Fields;
    return fieldsToCheck.every(field => !validateField(field, formData[field as keyof typeof formData]));
  }, [formData, step]);

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
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

      const result = await response.json();

      if (!response.ok) {
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
      // Reset after animation
      setTimeout(() => {
        setStep(1);
        setErrors({});
        setTouched({});
        setSuccess(false);
        setSubmitError(null);
        setFormData({
          full_name: "", school: "", school_level: "", date_of_birth: "", address: "",
          domain: "", duration: "", experience_level: "", reason: "", expectations: "",
          is_paid_acknowledgement: false, comment: ""
        });
      }, 300);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSubmitting]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  // Success State
  if (success) {
    return createPortal(
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 z-[9999] p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Main Content */}
          <div className="relative z-10 px-8 py-12 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-emerald-100/50 rounded-[2rem] animate-ping opacity-20" />
              <CheckCircle2 size={48} className="text-emerald-500 relative z-10" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Application Successful!
            </h3>
            <p className="text-slate-600 text-lg max-w-md mx-auto leading-relaxed font-medium">
              We've received your application for <span className="text-[#155DFC] font-bold">{internshipTitle}</span>. 
              Our team will review it and get back to you within 3-5 business days.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-slate-500">
                We'll notify you via email about the next steps.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
              Close
            </Button>
          </div>
        </motion.div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300 p-4 z-[9999]">
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Premium Header */}
        <div className="relative bg-gradient-to-br from-[#155DFC] via-[#174EDD] to-[#1A3CB9] text-white p-6 shrink-0 shadow-lg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl -ml-12 -mb-12" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight leading-tight">Apply for Internship</h2>
                <p className="text-blue-100/80 text-sm font-medium mt-1 flex items-center gap-2">
                  <Building2 size={16} />
                  {internshipTitle}
                </p>
              </div>
            </div>
            <button 
              onClick={handleClose} 
              className="p-2.5 hover:bg-white/10 rounded-2xl transition-all duration-300 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="mt-6 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300",
                  step === s.id ? "bg-white/20 backdrop-blur-sm" : step > s.id ? "opacity-60" : "opacity-40"
                )}>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                    step === s.id ? "bg-white text-slate-900" : step > s.id ? "bg-[#155DFC] text-white" : "bg-white/20"
                  )}>
                    {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                  </div>
                  <span className="text-sm font-medium hidden md:block">{s.title}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 rounded-full transition-all duration-500",
                    step > s.id ? "bg-[#155DFC]" : "bg-white/20"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {submitError && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-50 border-b border-rose-100 overflow-hidden"
            >
              <div className="px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-rose-900 text-sm">Something went wrong</p>
                  <p className="text-rose-700 text-xs">{submitError}</p>
                </div>
                <button onClick={() => setSubmitError(null)} className="p-1.5 hover:bg-rose-100 rounded-lg">
                  <X size={16} className="text-rose-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar"
          style={{ scrollbarGutter: 'stable' }}
        >
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step Header */}
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                      <User className="w-6 h-6 text-[#155DFC]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Details</h3>
                      <p className="text-[13px] text-slate-500 font-medium">Professional identity and contact</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField label="Full Name" required error={touched.full_name ? errors.full_name : undefined}>
                      <input
                        className={cn(inputBaseClass, errors.full_name && touched.full_name && "border-rose-300 focus:border-rose-500 focus:ring-rose-100")}
                        placeholder="As on your ID card"
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
                    <FormField label="School / Institution" required error={touched.school ? errors.school : undefined}>
                      <select
                        className={cn(selectBaseClass, errors.school && touched.school && "border-rose-300")}
                        value={formData.school}
                        onChange={(e) => handleInputChange("school", e.target.value)}
                        onBlur={() => handleBlur("school")}
                      >
                        <option value="">Select your school</option>
                        {SCHOOL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </FormField>

                    <FormField label="Current Level" required error={touched.school_level ? errors.school_level : undefined}>
                      <select
                        className={cn(selectBaseClass, errors.school_level && touched.school_level && "border-rose-300")}
                        value={formData.school_level}
                        onChange={(e) => handleInputChange("school_level", e.target.value)}
                        onBlur={() => handleBlur("school_level")}
                      >
                        <option value="">Select your level</option>
                        {LEVEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Current Address" required error={touched.address ? errors.address : undefined} hint="City and neighborhood">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        className={cn(inputBaseClass, "pl-11", errors.address && touched.address && "border-rose-300")}
                        placeholder="e.g. Mile 4, Limbe"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        onBlur={() => handleBlur("address")}
                      />
                    </div>
                  </FormField>
                </motion.div>
              )}

              {/* Step 2: Career Goals */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Step Header */}
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                      <Target className="w-6 h-6 text-[#155DFC]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Career Goals</h3>
                      <p className="text-[13px] text-slate-500 font-medium">Your aspirations and objectives</p>
                    </div>
                  </div>

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
                        <option value="">Select duration</option>
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
                        <option value="">Your level</option>
                        {EXPERIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </FormField>
                  </div>

                  <FormField 
                    label={`Why do you want to intern at ${companyName}?`} 
                    required 
                    error={touched.reason ? errors.reason : undefined}
                    hint="Be specific about what attracts you to this opportunity"
                  >
                    <textarea
                      className={cn(inputBaseClass, "h-28 resize-none", errors.reason && touched.reason && "border-rose-300")}
                      placeholder="Tell us what motivates you and why you're a great fit..."
                      value={formData.reason}
                      onChange={(e) => handleInputChange("reason", e.target.value)}
                      onBlur={() => handleBlur("reason")}
                    />
                    <div className="flex justify-end">
                      <span className={cn(
                        "text-xs font-medium",
                        formData.reason.length < 30 ? "text-slate-400" : "text-emerald-500"
                      )}>
                        {formData.reason.length}/30 min
                      </span>
                    </div>
                  </FormField>

                  <FormField 
                    label="What do you expect to achieve?" 
                    required 
                    error={touched.expectations ? errors.expectations : undefined}
                    hint="Skills, knowledge, or career milestones"
                  >
                    <textarea
                      className={cn(inputBaseClass, "h-28 resize-none", errors.expectations && touched.expectations && "border-rose-300")}
                      placeholder="What skills do you hope to gain? Where do you see this leading?"
                      value={formData.expectations}
                      onChange={(e) => handleInputChange("expectations", e.target.value)}
                      onBlur={() => handleBlur("expectations")}
                    />
                    <div className="flex justify-end">
                      <span className={cn(
                        "text-xs font-medium",
                        formData.expectations.length < 20 ? "text-slate-400" : "text-emerald-500"
                      )}>
                        {formData.expectations.length}/20 min
                      </span>
                    </div>
                  </FormField>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
                      <Shield className="w-6 h-6 text-[#155DFC]" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirmation</h3>
                      <p className="text-[13px] text-slate-500 font-medium">Final review and data verification</p>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />
                    <h4 className="text-[11px] font-black text-[#155DFC] uppercase tracking-widest mb-6 relative z-10">
                      Internship Request Details
                    </h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm relative z-10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Name</span>
                        <p className="font-bold text-slate-900 leading-tight">{formData.full_name || "—"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Current Institution</span>
                        <p className="font-bold text-slate-900 leading-tight">{formData.school} ({formData.school_level})</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Domain</span>
                        <p className="font-bold text-slate-900 leading-tight">{formData.domain || "—"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Engagement Duration</span>
                        <p className="font-bold text-slate-900 leading-tight">{formData.duration || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Acknowledgement */}
                  <div className={cn(
                    "p-5 rounded-2xl border-2 transition-all duration-200",
                    formData.is_paid_acknowledgement 
                      ? "bg-emerald-50 border-emerald-200" 
                      : errors.is_paid_acknowledgement && touched.is_paid_acknowledgement
                        ? "bg-rose-50 border-rose-200"
                        : "bg-amber-50 border-amber-200"
                  )}>
                    <label className="flex items-start gap-4 cursor-pointer">
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.is_paid_acknowledgement}
                          onChange={(e) => {
                            handleInputChange("is_paid_acknowledgement", e.target.checked);
                            setTouched(prev => ({ ...prev, is_paid_acknowledgement: true }));
                          }}
                        />
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                          formData.is_paid_acknowledgement 
                            ? "bg-emerald-500 border-emerald-500" 
                            : "bg-white border-slate-300"
                        )}>
                          {formData.is_paid_acknowledgement && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                      </div>
                      <div>
                        <p className={cn(
                          "font-semibold",
                          formData.is_paid_acknowledgement ? "text-emerald-900" : "text-amber-900"
                        )}>
                          I understand and acknowledge the terms
                        </p>
                        <p className={cn(
                          "text-sm mt-1",
                          formData.is_paid_acknowledgement ? "text-emerald-700" : "text-amber-700"
                        )}>
                          I confirm that all information provided is accurate and I understand this may be a paid internship with financial commitments.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Additional Comments */}
                  <FormField label="Additional Comments" hint="Optional - Any questions or special requests?">
                    <textarea
                      className={cn(inputBaseClass, "h-24 resize-none")}
                      placeholder="Anything else you'd like us to know?"
                      value={formData.comment}
                      onChange={(e) => handleInputChange("comment", e.target.value)}
                    />
                  </FormField>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={isSubmitting}
              className="h-12 px-6 rounded-xl border-slate-200 hover:bg-slate-100 font-semibold"
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button 
              onClick={nextStep}
              disabled={!isStepValid}
              className={cn(
                "h-12 px-8 rounded-xl font-bold shadow-lg transition-all duration-300",
                isStepValid 
                  ? "bg-primary hover:bg-primary/90 shadow-primary/25" 
                  : "bg-slate-300 cursor-not-allowed"
              )}
            >
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.is_paid_acknowledgement}
              className={cn(
                "h-12 px-8 rounded-xl font-bold shadow-lg transition-all duration-300",
                formData.is_paid_acknowledgement && !isSubmitting
                  ? "bg-[#155DFC] hover:bg-[#1A3CB9] shadow-blue-500/20"
                  : "bg-slate-300 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
