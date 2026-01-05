"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Send,
  FileText,
  Github,
  Video,
  Link2,
  BookOpen,
  Loader2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Program {
  id: string;
  title: string;
}

interface ProgramContentFormProps {
  programs: Program[];
  onSuccess?: () => void;
}

export function ProgramContentForm({ programs, onSuccess }: ProgramContentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  
  // Form state
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [programTitle, setProgramTitle] = useState<string>("");
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

  const handleProgramSelect = (value: string) => {
    setSelectedProgram(value);
    const program = programs.find(p => p.id === value);
    if (program) setProgramTitle(program.title);
  };

  const handleSubmit = async () => {
    if (!selectedProgram || !title || !contentType) {
      toast.error("Missing Required Fields", {
        description: "Please select a program, enter a title, and select a content type.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        program_id: selectedProgram,
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

      const response = await fetch("/api/companies/programs/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create content");
      }

      // Show success modal
      setSuccessData({
        title: title,
        program: programTitle,
        contentType: contentType,
        weekNumber: weekNumber || 'N/A',
      });
      setShowSuccess(true);

      // Reset form
      setSelectedProgram("");
      setProgramTitle("");
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

      // Close dialog after short delay
      setTimeout(() => {
        setIsOpen(false);
      }, 500);
      
      onSuccess?.();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Failed to create content", { 
        description: error.message || "Please try again later." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasResources = videoUrl || githubUrl || googleDocsUrl || contentUrl;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-xl h-11 px-6 gap-2 shadow-lg shadow-primary/30 font-semibold transition-all active:scale-95">
            <Plus size={16} />
            Add Program Content
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto sm:rounded-3xl border-slate-200">
          <DialogHeader className="pb-4 border-b border-slate-200">
            <DialogTitle className="text-2xl font-heading font-bold flex items-center gap-3 text-slate-900">
              <div className="p-3 bg-primary/10 rounded-xl">
                <BookOpen size={24} className="text-primary" />
              </div>
              <div>
                <h2>Create Program Content</h2>
                <p className="text-sm font-normal text-slate-500 mt-1">Add lessons, assignments, resources, and more</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Program & Content Type - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Program *</Label>
                <Select value={selectedProgram} onValueChange={handleProgramSelect}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-base">
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] max-h-[240px] rounded-xl">
                    {programs.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500 text-center">No programs available</div>
                    ) : (
                      programs.map((program) => (
                        <SelectItem key={program.id} value={program.id} className="cursor-pointer">
                          {program.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Content Type *</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] rounded-xl">
                    <SelectItem value="lesson" className="cursor-pointer">📚 Lesson</SelectItem>
                    <SelectItem value="resource" className="cursor-pointer">📦 Resource</SelectItem>
                    <SelectItem value="assignment" className="cursor-pointer">✏️ Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Content Title *</Label>
              <Input
                placeholder="e.g., React Hooks Deep Dive"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-base placeholder:text-slate-400"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Description</Label>
              <Textarea
                placeholder="What will students learn from this content? What are the key takeaways?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="rounded-xl border-slate-200 focus:ring-primary focus:border-primary resize-none text-base placeholder:text-slate-400"
              />
            </div>

            {/* Week & Due Date - Side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Week Number</Label>
                <Input
                  type="number"
                  placeholder="e.g., 1, 2, 3..."
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                  min="1"
                  className="h-12 rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-base placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={16} /> Due Date
                </Label>
                <Input
                  type="datetime-local"
                  value={dateDue}
                  onChange={(e) => setDateDue(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-base"
                />
              </div>
            </div>

            {/* Resources Section - Beautiful Card */}
            <Card className="p-6 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-50/50 rounded-2xl">
              <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText size={18} className="text-primary" />
                </span>
                Learning Resources
              </h3>

              <div className="space-y-4">
                {/* Video URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Video size={16} className="text-primary" /> Video URL
                  </Label>
                  <Input
                    placeholder="https://youtube.com/... or https://vimeo.com/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 focus:ring-primary focus:border-primary placeholder:text-slate-400"
                  />
                </div>

                {/* GitHub URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Github size={16} className="text-slate-700" /> GitHub Repository
                  </Label>
                  <Input
                    placeholder="https://github.com/username/repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 focus:ring-primary focus:border-primary placeholder:text-slate-400"
                  />
                </div>

                {/* Google Docs URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" /> Google Docs/PDF
                  </Label>
                  <Input
                    placeholder="https://docs.google.com/document/... or PDF link"
                    value={googleDocsUrl}
                    onChange={(e) => setGoogleDocsUrl(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 focus:ring-primary focus:border-primary placeholder:text-slate-400"
                  />
                </div>

                {/* General Content URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Link2 size={16} className="text-orange-600" /> Other Resources
                  </Label>
                  <Input
                    placeholder="Any other useful link (blog, tutorial, documentation, etc.)"
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    className="h-11 rounded-xl border-slate-200 focus:ring-primary focus:border-primary placeholder:text-slate-400"
                  />
                </div>
              </div>
            </Card>

            {/* Assignment Section */}
            {contentType === "assignment" && (
              <Card className="p-6 border-orange-200 bg-orange-50/50 rounded-2xl border-2">
                <h3 className="font-bold text-lg text-orange-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <BookOpen size={18} className="text-orange-600" />
                  </span>
                  Assignment Details
                </h3>

                <Textarea
                  placeholder="Instructions, requirements, submission guidelines, grading criteria, etc."
                  value={assignmentDetails}
                  onChange={(e) => setAssignmentDetails(e.target.value)}
                  rows={4}
                  className="rounded-xl border-orange-200 focus:ring-orange-500 focus:border-orange-500 resize-none placeholder:text-orange-700/50"
                />
              </Card>
            )}

            {/* Display Order & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Display Order</Label>
                <Input
                  type="number"
                  placeholder="0 = first, 1 = second, etc."
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  min="0"
                  className="h-12 rounded-xl border-slate-200 focus:ring-primary focus:border-primary text-base"
                />
              </div>

              <div className="flex items-end">
                <div className="w-full space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Access Control</Label>
                  <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl hover:bg-slate-150 transition">
                    <Switch
                      id="payment"
                      checked={paymentRequired}
                      onCheckedChange={setPaymentRequired}
                      className="data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="payment" className="cursor-pointer font-medium text-slate-700 text-sm">
                      Paid content
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Summary */}
            {hasResources && (
              <Card className="p-4 bg-emerald-50 border-emerald-200 rounded-xl">
                <p className="text-sm font-semibold text-emerald-900">
                  ✓ {[videoUrl, githubUrl, googleDocsUrl, contentUrl].filter(Boolean).length} resource(s) will be attached
                </p>
              </Card>
            )}

            {/* Submit Section */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl border-slate-200 h-12 px-8 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedProgram || !title || !contentType}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-xl h-12 px-8 gap-2 font-semibold shadow-lg shadow-primary/30 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Create Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md sm:rounded-3xl border-0 shadow-2xl">
          <div className="text-center py-8">
            {/* Success Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={56} className="text-emerald-500 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-2">Content Created!</h2>
            <p className="text-slate-600 mb-6">Your content has been successfully uploaded.</p>

            {/* Content Details */}
            {successData && (
              <Card className="p-4 bg-slate-50 border-slate-200 rounded-2xl mb-6 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Title</p>
                    <p className="text-sm font-bold text-slate-900">{successData.title}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg size={18} className="text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Program</p>
                    <p className="text-sm font-bold text-slate-900">{successData.program}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold text-sm">
                      {successData.contentType === "lesson" ? "📚" : successData.contentType === "assignment" ? "✏️" : "📦"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Type</p>
                    <p className="text-sm font-bold text-slate-900 capitalize">{successData.contentType}</p>
                  </div>
                </div>

                {successData.weekNumber !== 'N/A' && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase">Week</p>
                      <p className="text-sm font-bold text-slate-900">Week {successData.weekNumber}</p>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white rounded-xl h-12 font-semibold shadow-lg shadow-primary/30"
              >
                <CheckCircle2 size={18} className="mr-2" />
                Awesome!
              </Button>
              <p className="text-xs text-slate-500">
                Students will see this content in their program updates
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
