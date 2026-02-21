"use client";

import React, { useState } from "react";
import { 
  X, 
  Send, 
  Star, 
  CheckSquare, 
  MessageSquare,
  Loader2,
  Plus,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { submitInternshipLog } from "@/lib/actions/intenship.actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  internshipId: string;
}

export function DailyReportModal({ isOpen, onClose, internshipId }: DailyReportModalProps) {
  const [learningLog, setLearningLog] = useState("");
  const [rating, setRating] = useState(5);
  const [tasks, setTasks] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddTask = () => setTasks([...tasks, ""]);
  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningLog.trim()) {
      toast.error("Please provide a learning log.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitInternshipLog({
        internship_id: internshipId,
        log_date: new Date().toISOString().split("T")[0],
        learning_log: learningLog,
        tasks_completed: tasks.filter(t => t.trim() !== ""),
        experience_rating: rating,
      });

      if (result.success) {
        toast.success("Daily report submitted successfully!");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to submit report.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                <FileText size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight uppercase">Daily Briefing</h2>
                <p className="text-xs text-blue-100 font-bold uppercase tracking-[0.2em] opacity-80">Mission Documentation</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
           
          {/* Learning Log Section */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">
              <MessageSquare size={14} className="text-blue-600" />
              Strategic Insights
            </label>
            <Textarea 
              value={learningLog}
              onChange={(e) => setLearningLog(e.target.value)}
              placeholder="What core concepts did you master today?"
              className="min-h-[120px] rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium resize-none shadow-sm p-4"
            />
          </div>

          {/* Tasks Completed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">
                <CheckSquare size={14} className="text-blue-600" />
                Objectives Secured
              </label>
              <Button 
                type="button" 
                onClick={handleAddTask}
                variant="ghost" 
                size="sm"
                className="text-blue-600 font-black text-[10px] h-8 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl uppercase tracking-widest"
              >
                <Plus size={12} className="mr-1.5" strokeWidth={3} /> Add Step
              </Button>
            </div>
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div key={idx} className="relative group">
                  <Input 
                    value={task}
                    onChange={(e) => handleTaskChange(idx, e.target.value)}
                    placeholder={`Objective ${idx + 1}...`}
                    className="h-12 pl-12 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-[10px] font-black text-blue-600">{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Rating */}
          <div className="space-y-4 pb-4">
            <label className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">
              <Star size={14} className="text-blue-600" />
              Impact Status
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-sm",
                    rating >= s 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" 
                      : "bg-white dark:bg-slate-950 text-slate-400 border border-slate-100 dark:border-slate-800 hover:border-blue-200"
                  )}
                >
                  {s}
                </button>
              ))}
              <div className="ml-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Status</p>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">
                  {rating === 5 ? "Elite" : rating >= 4 ? "Optimal" : rating >= 3 ? "Standard" : "Baseline"}
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex gap-4 shrink-0">
          <Button 
            type="button" 
            onClick={onClose}
            variant="outline" 
            className="flex-1 rounded-2xl h-14 font-black text-[11px] uppercase tracking-widest border-slate-100 dark:border-slate-800 shadow-sm"
          >
            Abort
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] rounded-2xl bg-blue-600 hover:bg-blue-700 text-white h-14 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Transmit Briefing
              </>
            )}
          </Button>
        </div>

      </motion.div>
    </div>
  );
}
