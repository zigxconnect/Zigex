"use client";

import { useState, useEffect } from "react";
import {
  X,
  Send,
  Loader2,
  BookOpen,
  FileText,
  Link2,
  Calendar,
  Video,
  Github,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ProgramContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any; // Using any for simplicity in form handling, but strongly typed props passed in
  programId: string;
  onSave: (data: any) => void;
}

export function ProgramContentEditor({
  isOpen,
  onClose,
  initialData,
  programId,
  onSave,
}: ProgramContentEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [contentType, setContentType] = useState<string>("lesson");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weekNumber, setWeekNumber] = useState<string>("");
  const [dateDue, setDateDue] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [googleDocsUrl, setGoogleDocsUrl] = useState("");
  const [assignmentDetails, setAssignmentDetails] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<string>("0");
  const [paymentRequired, setPaymentRequired] = useState(false);

  // Initialize form when opening/editing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setContentType(initialData.content_type || "lesson");
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setWeekNumber(initialData.week_number?.toString() || "");
        setDateDue(initialData.date_due ? new Date(initialData.date_due).toISOString().slice(0, 16) : "");
        setVideoUrl(initialData.video_url || "");
        setGithubUrl(initialData.github_url || "");
        setGoogleDocsUrl(initialData.google_docs_url || "");
        setAssignmentDetails(initialData.assignment_details || "");
        setContentUrl(initialData.content_url || "");
        setDisplayOrder(initialData.display_order?.toString() || "0");
        setPaymentRequired(!!initialData.payment_required);
      } else {
        // Reset for create
        setContentType("lesson");
        setTitle("");
        setDescription("");
        setWeekNumber("");
        setDateDue("");
        setVideoUrl("");
        setGithubUrl("");
        setGoogleDocsUrl("");
        setAssignmentDetails("");
        setContentUrl("");
        setDisplayOrder("0");
        setPaymentRequired(false);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (!title) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        program_id: programId,
        title,
        description,
        content_type: contentType,
        week_number: weekNumber ? parseInt(weekNumber) : null,
        date_due: dateDue || null,
        video_url: videoUrl || null,
        github_url: githubUrl || null,
        google_docs_url: googleDocsUrl || null,
        assignment_details: assignmentDetails || null,
        content_url: contentUrl || null,
        display_order: displayOrder ? parseInt(displayOrder) : 0,
        payment_required: paymentRequired,
      };

      let response;
      if (initialData?.id) {
        // Update
        response = await fetch(`/api/companies/programs/content?id=${initialData.id}`, {
          method: "PUT", // Ensure your API supports PUT or PATCH
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: initialData.id, ...payload }),
        });
      } else {
        // Create
        response = await fetch("/api/companies/programs/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Operation failed");
      }

      const savedData = await response.json();
      onSave(savedData);
    } catch (error: any) {
      toast.error(error.message || "Failed to save content");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasResources = videoUrl || githubUrl || googleDocsUrl || contentUrl;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto sm:rounded-3xl border-0 shadow-2xl p-0 gap-0 bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${initialData ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {initialData ? <FileText size={24} /> : <BookOpen size={24} />}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {initialData ? "Edit Content" : "Create New Content"}
                </DialogTitle>
                <p className="text-sm text-slate-500 font-medium">
                  {initialData ? "Update existing curriculum details" : "Add a lesson, assignment, or resource"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
        </div>

        <div className="p-6 space-y-6">
            {/* Top Row: Type & Title */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl border-slate-100">
                    <SelectItem value="lesson">📚 Lesson</SelectItem>
                    <SelectItem value="resource">📦 Resource</SelectItem>
                    <SelectItem value="assignment">✏️ Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Content Title</Label>
                <Input
                  placeholder="e.g., Introduction to React"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 focus:ring-blue-500 text-base font-medium"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</Label>
               <Textarea
                 placeholder="Brief overview of what this content covers..."
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 rows={3}
                 className="rounded-xl border-slate-200 focus:ring-blue-500 resize-none text-base"
               />
            </div>

            {/* Scheduling */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Week Number</Label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Week</span>
                   <Input
                    type="number"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                    min="1"
                    className="pl-14 h-11 rounded-xl border-slate-200 focus:ring-blue-500"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Due Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={dateDue}
                  onChange={(e) => setDateDue(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Resources Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
               <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                 Resources & Links
               </h3>
               <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <Label className="text-xs font-semibold text-slate-500">Video URL</Label>
                       <div className="relative">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500"><Video size={16} /></div>
                         <Input 
                           value={videoUrl} 
                           onChange={e => setVideoUrl(e.target.value)} 
                           placeholder="YouTube / Vimeo link" 
                           className="pl-9 h-10 rounded-lg bg-white border-slate-200"
                         />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <Label className="text-xs font-semibold text-slate-500">GitHub Repo</Label>
                       <div className="relative">
                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700"><Github size={16} /></div>
                         <Input 
                           value={githubUrl} 
                           onChange={e => setGithubUrl(e.target.value)} 
                           placeholder="Repository link" 
                           className="pl-9 h-10 rounded-lg bg-white border-slate-200"
                         />
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-500">Additional Resource / Doc</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"><Link2 size={16} /></div>
                      <Input 
                        value={contentUrl || googleDocsUrl} 
                        onChange={e => {
                           setContentUrl(e.target.value);
                           setGoogleDocsUrl(e.target.value); // Syncing for now to match backend
                        }} 
                        placeholder="Link to PDF, Google Doc, or external resource" 
                        className="pl-9 h-10 rounded-lg bg-white border-slate-200"
                      />
                    </div>
                 </div>
               </div>
            </div>

            {/* Assignments Specifics */}
            {contentType === "assignment" && (
               <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
                  <h3 className="text-sm font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <FileText size={16} /> Assignment Instructions
                  </h3>
                  <Textarea
                    value={assignmentDetails}
                    onChange={e => setAssignmentDetails(e.target.value)}
                    placeholder="Enter detailed instructions for this assignment..."
                    className="bg-white border-orange-200 min-h-[100px] resize-none focus:ring-orange-500"
                  />
               </div>
            )}

            {/* Settings */}
            <div className="flex flex-col sm:flex-row gap-6 pt-2">
               <div className="flex-1 space-y-2">
                 <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sort Order</Label>
                 <Input
                   type="number"
                   value={displayOrder}
                   onChange={e => setDisplayOrder(e.target.value)}
                   className="h-10 w-24 rounded-lg border-slate-200"
                 />
                 <p className="text-[10px] text-slate-400">Higher numbers appear later</p>
               </div>
               
               <div className="flex-1 flex items-center justify-start sm:justify-end">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Switch
                       id="premium"
                       checked={paymentRequired}
                       onCheckedChange={setPaymentRequired}
                       className="data-[state=checked]:bg-blue-600"
                    />
                    <div>
                       <Label htmlFor="premium" className="block text-sm font-bold text-slate-900 cursor-pointer">Premium Access</Label>
                       <p className="text-[10px] text-slate-500 font-medium">Require payment to view?</p>
                    </div>
                  </div>
               </div>
            </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex justify-end gap-3 z-10">
           <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="rounded-xl h-11 px-6 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
             Cancel
           </Button>
           <Button 
             onClick={handleSubmit} 
             disabled={isSubmitting}
             className="rounded-xl h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50 transition-all active:scale-95"
           >
             {isSubmitting ? (
               <>
                 <Loader2 size={18} className="animate-spin mr-2" />
                 Saving...
               </>
             ) : (
               <>
                 <CheckCircle2 size={18} className="mr-2" />
                 {initialData ? "Save Changes" : "Create Content"}
               </>
             )}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
