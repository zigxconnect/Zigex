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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Daily Report</h2>
                <p className="text-xs text-blue-200">Document your progress</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[55vh] overflow-y-auto custom-scrollbar">
           
          {/* Learning Log Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <MessageSquare size={12} className="text-blue-500" />
              What did you learn today?
            </label>
            <Textarea 
              value={learningLog}
              onChange={(e) => setLearningLog(e.target.value)}
              placeholder="Share your key takeaways, concepts mastered, or challenges..."
              className="min-h-[100px] rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Tasks Completed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <CheckSquare size={12} className="text-blue-500" />
                Tasks Completed
              </label>
              <Button 
                type="button" 
                onClick={handleAddTask}
                variant="ghost" 
                size="sm"
                className="text-blue-600 font-semibold text-[10px] h-7 px-2 hover:bg-blue-50 rounded-lg"
              >
                <Plus size={12} className="mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <Input 
                  key={idx}
                  value={task}
                  onChange={(e) => handleTaskChange(idx, e.target.value)}
                  placeholder={`Task ${idx + 1}...`}
                  className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              ))}
            </div>
          </div>

          {/* Experience Rating */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <Star size={12} className="text-blue-500" />
              Today's Experience
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all",
                    rating >= s 
                      ? "bg-amber-400 text-white shadow-sm" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {s}
                </button>
              ))}
              <span className="ml-3 text-xs text-slate-500 font-medium">
                {rating === 5 ? "Excellent!" : rating >= 4 ? "Great" : rating >= 3 ? "Good" : "Okay"}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex gap-3">
          <Button 
            type="button" 
            onClick={onClose}
            variant="outline" 
            className="flex-1 rounded-xl h-11 font-semibold text-xs border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={14} className="mr-1.5" />
                Submit Report
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
