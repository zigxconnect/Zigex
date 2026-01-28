"use client";

import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  Star,
  Clock,
  Calendar,
  Loader2,
  User
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { reviewInternshipLog } from "@/lib/actions/supervisor.actions";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: any;
}

export function LogReviewModal({ isOpen, onClose, log }: LogReviewModalProps) {
  const [feedback, setFeedback] = useState(log?.supervisor_feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (!isOpen || !log) return null;

  const student = Array.isArray(log.student) ? log.student[0] : log.student;

  const handleReview = async (status: "approved" | "rejected") => {
    setIsSubmitting(true);
    try {
      const result = await reviewInternshipLog(log.id, status, feedback);
      if (result.success) {
        toast.success(`Report ${status === "approved" ? "confirmed" : status} successfully`);
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/20">
                <Image 
                  src={student?.avatar_url || "/default-avatar.svg"} 
                  alt={student?.full_name || "Student"} 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">{student?.full_name || "Student"}</h3>
                <p className="text-xs text-blue-200 flex items-center gap-1">
                  <Calendar size={10} />
                  {format(new Date(log.log_date), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[50vh] custom-scrollbar">
          
          {/* Report Content */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Daily Report</label>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {log.learning_log || "No content provided."}
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mb-1">Rating</p>
              <div className="flex items-center gap-1.5">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="font-bold text-slate-900 dark:text-white">{log.experience_rating}/5</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider mb-1">Check-in</p>
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-blue-500" />
                <span className="font-bold text-slate-900 dark:text-white">
                  {log.check_in ? format(new Date(log.check_in), "HH:mm") : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Tasks */}
          {log.tasks_completed && log.tasks_completed.length > 0 && (
            <div>
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Tasks Completed</label>
              <div className="flex flex-wrap gap-2">
                {log.tasks_completed.map((task: string, i: number) => (
                  <Badge key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-0 font-medium text-xs px-3 py-1 rounded-lg">
                    {task}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Input */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare size={12} className="text-blue-500" />
              Your Feedback
            </label>
            <Textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback or guidance..."
              className="min-h-[80px] rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3">
          <Button 
            onClick={() => handleReview("rejected")}
            disabled={isSubmitting}
            variant="outline"
            className="flex-1 rounded-xl h-11 font-semibold text-xs border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <XCircle size={14} className="mr-1.5" />
            Reject
          </Button>
          <Button 
            onClick={() => handleReview("approved")}
            disabled={isSubmitting}
            className="flex-[2] rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-1.5" size={14} />
            ) : (
              <CheckCircle2 size={14} className="mr-1.5" />
            )}
            Approve Report
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
