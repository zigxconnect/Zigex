"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { 
  Play, 
  FileText, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  ExternalLink,
  Globe,
  Lock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateSubmissionStatusAction, scheduleMeetingAction, toggleProjectVisibilityAction } from "@/lib/actions/company.actions";
import { toast } from "sonner";

interface InboxProps {
  submissions: any[];
}

export default function CompanyInboxClient({ submissions: initialSubmissions }: InboxProps) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  // Meeting Modal State
  const [meetingModal, setMeetingModal] = useState<{ open: boolean; submissionId: string | null }>({ open: false, submissionId: null });
  const [meetingForm, setMeetingForm] = useState({ date: "", time: "", link: "", notes: "" });

  const filtered = submissions.filter(sub => {
    const matchesSearch = sub.project.title.toLowerCase().includes(search.toLowerCase()) || 
                          sub.project.owner.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || sub.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'reviewing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'meeting_scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'sponsored': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: 'reviewing' | 'accepted' | 'rejected' | 'sponsored') => {
    startTransition(async () => {
      const result = await updateSubmissionStatusAction(submissionId, newStatus);
      if (result.success) {
        toast.success(`Status updated to "${newStatus}"!`);
        // Optimistically update UI
        setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, status: newStatus } : s));
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleScheduleMeeting = async () => {
    if (!meetingModal.submissionId) return;
    if (!meetingForm.date || !meetingForm.time || !meetingForm.link) {
      toast.error("Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      const result = await scheduleMeetingAction(meetingModal.submissionId!, meetingForm);
      if (result.success) {
        toast.success("Meeting scheduled! Founder has been notified.");
        setSubmissions(prev => prev.map(s => s.id === meetingModal.submissionId ? { ...s, status: 'meeting_scheduled' } : s));
        setMeetingModal({ open: false, submissionId: null });
        setMeetingForm({ date: "", time: "", link: "", notes: "" });
      } else {
        toast.error(result.error || "Failed to schedule meeting");
      }
    });
  };

  const handleToggleVisibility = async (submissionId: string, currentlyPublic: boolean) => {
    const newVisibility = !currentlyPublic;
    startTransition(async () => {
      const result = await toggleProjectVisibilityAction(submissionId, newVisibility);
      if (result.success) {
        toast.success(newVisibility ? "Project is now PUBLIC! 🌍" : "Project is now PRIVATE 🔒");
        // Optimistically update UI
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, project: { ...s.project, is_published: newVisibility } } 
            : s
        ));
      } else {
        toast.error(result.error || "Failed to update visibility");
      }
    });
  };


  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Impact Inbox</h1>
            <p className="text-slate-500 font-medium">Review and manage incoming project pitches.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-slate-100">
               <span className="text-blue-600">{submissions.length}</span> Total Pitches
            </div>
            <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-slate-100">
               <span className="text-yellow-600">{submissions.filter(s => s.status === 'pending').length}</span> Pending
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
           <div className="relative flex-1 w-full">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
              type="text" 
              placeholder="Search by project or founder..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
             />
           </div>
           
           <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
             {['all', 'pending', 'reviewing', 'meeting_scheduled', 'accepted', 'sponsored', 'rejected'].map(s => (
               <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === s 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
               >
                 {s.replace('_', ' ')}
               </button>
             ))}
           </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4">
           {filtered.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No pitches found</h3>
                <p className="text-slate-500">Try adjusting your filters or wait for new submissions.</p>
             </div>
           ) : (
             filtered.map((sub) => (
               <div key={sub.id} className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Timestamp & Status (Mobile) */}
                    <div className="flex lg:hidden justify-between items-center mb-2">
                       <Badge variant="outline" className={`${getStatusColor(sub.status)} border-0 font-bold uppercase`}>
                          {sub.status.replace('_', ' ')}
                       </Badge>
                       <span className="text-xs text-slate-400 font-medium">
                         {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                       </span>
                    </div>

                    {/* Left: Video Thumbnail / Action */}
                    <div className="relative w-full lg:w-48 h-32 rounded-xl bg-slate-900 flex-shrink-0 overflow-hidden cursor-pointer group/video" onClick={() => setSelectedVideo(sub.project.video_url)}>
                      {sub.project.cover_images?.[0] ? (
                        <img src={sub.project.cover_images[0]} alt="cover" className="w-full h-full object-cover opacity-60 group-hover/video:opacity-40 transition-opacity" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover/video:scale-110 transition-transform">
                           <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-md text-[10px] text-white font-bold">
                        PITCH
                      </div>
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1 min-w-0">
                       <div className="flex items-start justify-between">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-slate-900 truncate pr-4">{sub.project.title}</h3>
                              <Badge variant="outline" className={`hidden lg:inline-flex ${getStatusColor(sub.status)} border-0 font-bold uppercase text-[10px]`}>
                                {sub.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3 max-w-2xl">
                              {sub.project.tagline}
                            </p>
                         </div>
                         <div className="hidden lg:block text-xs text-slate-400 font-bold uppercase tracking-wider">
                            {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                         </div>
                       </div>

                       <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                             <img 
                               src={sub.project.owner.avatar_url || "https://github.com/shadcn.png"} 
                               alt="owner" 
                               className="w-6 h-6 rounded-full border border-white shadow-sm"
                             />
                             <span className="text-xs font-bold text-slate-700">{sub.project.owner.full_name}</span>
                          </div>
                          <div className="w-px h-3 bg-slate-200" />
                          <span className="text-xs font-medium text-slate-500">{sub.project.category}</span>
                       </div>
                       
                       <div className="flex flex-wrap gap-1.5 mt-3">
                          {sub.project.tech_stack?.slice(0, 4).map((tech: string) => (
                             <span key={tech} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[10px] font-bold uppercase border border-slate-100">
                                {tech}
                             </span>
                          ))}
                       </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row lg:flex-col items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                       {/* Quick Action Buttons based on status */}
                       {sub.status === 'pending' && (
                         <>
                           <Button 
                             size="sm" 
                             onClick={() => handleStatusUpdate(sub.id, 'reviewing')}
                             disabled={isPending}
                             className="w-full lg:w-auto h-9 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700"
                           >
                             {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3 mr-1" />}
                             Start Review
                           </Button>
                         </>
                       )}

                       {sub.status === 'reviewing' && (
                         <>
                           <Button 
                             size="sm" 
                             onClick={() => setMeetingModal({ open: true, submissionId: sub.id })}
                             className="w-full lg:w-auto h-9 text-xs font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-700"
                           >
                             <Calendar className="w-3 h-3 mr-1" />
                             Schedule Meet
                           </Button>
                           <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(sub.id, 'accepted')}
                                disabled={isPending}
                                className="h-8 px-3 text-xs font-bold text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(sub.id, 'rejected')}
                                disabled={isPending}
                                className="h-8 px-3 text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                           </div>
                         </>
                       )}

                       {sub.status === 'meeting_scheduled' && (
                         <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(sub.id, 'accepted')}
                              disabled={isPending}
                              className="h-9 text-xs font-bold uppercase bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(sub.id, 'rejected')}
                              disabled={isPending}
                              className="h-9 text-xs font-bold text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                         </div>
                       )}

                       {sub.status === 'accepted' && (
                         <Button 
                           size="sm" 
                           onClick={() => handleStatusUpdate(sub.id, 'sponsored')}
                           disabled={isPending}
                           className="w-full lg:w-auto h-9 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700"
                         >
                           <Sparkles className="w-3 h-3 mr-1" />
                           Sponsor Project
                         </Button>
                       )}

                       {(sub.status === 'sponsored' || sub.status === 'rejected') && (
                          <Badge variant="outline" className={`${getStatusColor(sub.status)} border text-xs font-bold uppercase`}>
                             {sub.status}
                          </Badge>
                       )}

                       {/* Common actions */}
                       <div className="flex flex-wrap gap-1 mt-2">
                          {/* Visibility Toggle - FR-06 */}
                          <Button 
                            size="sm" 
                            variant={sub.project.is_published ? "default" : "outline"}
                            onClick={() => handleToggleVisibility(sub.id, sub.project.is_published)}
                            disabled={isPending}
                            className={`h-8 px-3 text-xs font-bold ${
                              sub.project.is_published 
                                ? "bg-green-600 hover:bg-green-700 text-white" 
                                : "text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {sub.project.is_published ? (
                              <>
                                <Globe className="w-3 h-3 mr-1" />
                                Public
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                Private
                              </>
                            )}
                          </Button>
                          
                          <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-bold text-slate-500" asChild>
                             <Link href={`/admin/pitches/${sub.project.id}`}>
                               <ExternalLink className="w-3 h-3 mr-1" />
                               Details
                             </Link>
                          </Button>
                          {sub.project.pitch_deck_url && (
                            <Button size="sm" variant="ghost" className="h-8 px-3 text-xs font-bold text-slate-500" asChild>
                               <a href={sub.project.pitch_deck_url} target="_blank" rel="noopener noreferrer">
                                 <FileText className="w-3 h-3 mr-1" />
                                 Deck
                               </a>
                            </Button>
                          )}
                       </div>
                    </div>
                  </div>
               </div>
             ))
           )}
        </div>

        {/* Video Modal */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-none">
            {selectedVideo && (
               <video 
                 src={selectedVideo} 
                 controls 
                 className="w-full h-auto max-h-[80vh]" 
                 autoPlay
               />
            )}
          </DialogContent>
        </Dialog>

        {/* Schedule Meeting Modal */}
        <Dialog open={meetingModal.open} onOpenChange={(open) => setMeetingModal({ open, submissionId: open ? meetingModal.submissionId : null })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Schedule a Meeting
              </DialogTitle>
              <DialogDescription>
                Send the founder a meeting invitation. They'll be notified immediately.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date *</label>
                  <input 
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Time *</label>
                  <input 
                    type="time"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Meeting Link *</label>
                <input 
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={meetingForm.link}
                  onChange={(e) => setMeetingForm(p => ({ ...p, link: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Notes (Optional)</label>
                <textarea 
                  placeholder="Agenda, things to prepare..."
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none resize-none"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setMeetingModal({ open: false, submissionId: null })}>
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleMeeting} 
                disabled={isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
