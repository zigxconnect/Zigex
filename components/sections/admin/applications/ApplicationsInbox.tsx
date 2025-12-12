"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MoreHorizontal, Mail, Phone, Calendar, Download, ExternalLink, CheckCircle2, XCircle, Clock, ChevronRight, ArrowLeft, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Applicant } from "@/lib/types/applicants";
import { toast } from "sonner";

type ApplicationsInboxProps = {
  initialData: Applicant[];
  onStatusChange: (applicantId: string, newStatus: string) => Promise<{ success: boolean; error?: string }>;
};

export const ApplicationsInbox = ({ initialData, onStatusChange }: ApplicationsInboxProps) => {
  const [applicants, setApplicants] = useState<Applicant[]>(initialData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Sync with server data when it changes (e.g. after revalidatePath)
  useEffect(() => {
    setApplicants(initialData);
  }, [initialData]);

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    // Optimistic update
    setApplicants(prev => prev.map(app => 
      app.id === applicantId ? { ...app, status: newStatus } : app
    ));

    try {
      const result = await onStatusChange(applicantId, newStatus);
      if (!result.success) {
        // Revert on failure
        setApplicants(initialData);
        toast.error("Failed to update status");
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      setApplicants(initialData);
      toast.error("An error occurred");
    }
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedApplicant = applicants.find((app) => app.id === selectedId);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied": return "bg-blue-100 text-blue-700 border-blue-200";
      case "reviewed": return "bg-purple-100 text-purple-700 border-purple-200";
      case "interview": return "bg-orange-100 text-orange-700 border-orange-200";
      case "accepted": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
      {/* Left Sidebar: Applicant List */}
      <div className={cn(
        "flex flex-col border-r border-gray-100 bg-gray-50/30 transition-all duration-300 absolute inset-0 z-10 md:static md:w-[400px] md:z-0",
        selectedId ? "-translate-x-full md:translate-x-0" : "translate-x-0"
      )}>
        <div className="p-4 space-y-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search candidates..." 
              className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["all", "applied", "reviewed", "interview", "accepted"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                  statusFilter === status 
                    ? "bg-gray-900 text-white border-gray-900" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col p-2 gap-1">
            {filteredApplicants.map((applicant) => (
              <motion.div
                key={applicant.id}
                layoutId={applicant.id}
                onClick={() => setSelectedId(applicant.id)}
                className={cn(
                  "p-3 rounded-xl cursor-pointer transition-all border",
                  selectedId === applicant.id
                    ? "bg-white border-blue-200 shadow-md ring-1 ring-blue-50"
                    : "bg-transparent border-transparent hover:bg-white hover:border-gray-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-gray-100">
                    <AvatarImage src={applicant.avatarUrl} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-xs">
                      {applicant.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className={cn(
                        "font-semibold text-sm truncate",
                        selectedId === applicant.id ? "text-gray-900" : "text-gray-700"
                      )}>
                        {applicant.name}
                      </h4>
                      <span className="text-[10px] text-gray-400">
                        {new Date(applicant.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-2">{applicant.internshipTitle}</p>
                    <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-5 border", getStatusColor(applicant.status))}>
                      {applicant.status}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredApplicants.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                No applicants found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Pane: Applicant Details */}
      <div className={cn(
        "flex-1 bg-white flex flex-col min-w-0 absolute inset-0 z-20 md:static transition-transform duration-300",
        selectedId ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        {selectedApplicant ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedApplicant.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row items-start justify-between bg-white sticky top-0 z-10 gap-4">
                <div className="flex items-start gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden -ml-2"
                    onClick={() => setSelectedId(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-4 border-white shadow-lg ring-1 ring-gray-100">
                      <AvatarImage src={selectedApplicant.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl">
                        {selectedApplicant.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedApplicant.name}</h2>
                      <p className="text-sm sm:text-base text-gray-500 font-medium">{selectedApplicant.internshipTitle}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {selectedApplicant.email && (
                          <a href={`mailto:${selectedApplicant.email}`} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <Mail size={14} /> {selectedApplicant.email}
                          </a>
                        )}
                        {selectedApplicant.phone && (
                          <a href={`tel:${selectedApplicant.phone}`} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <Phone size={14} /> {selectedApplicant.phone}
                          </a>
                        )}
                        {selectedApplicant.location && (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600">
                            <MapPin size={14} /> {selectedApplicant.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 text-xs sm:text-sm">
                        Status <ChevronRight size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleStatusChange(selectedApplicant.id, "interview")}>
                        Move to Interview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(selectedApplicant.id, "accepted")} className="text-green-600">
                        <CheckCircle2 size={14} className="mr-2" /> Accept Candidate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange(selectedApplicant.id, "rejected")} className="text-red-600">
                        <XCircle size={14} className="mr-2" /> Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="default" className="bg-gray-900 text-white hover:bg-gray-800 text-xs sm:text-sm">
                    Schedule
                  </Button>
                </div>
              </div>

              {/* Content Scroll Area */}
              <ScrollArea className="flex-1">
                <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
                  {/* Status Banner */}
                  <div className={cn("p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center gap-3", getStatusColor(selectedApplicant.status))}>
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span className="font-medium">Current Status: {selectedApplicant.status}</span>
                    </div>
                    <span className="sm:ml-auto text-sm opacity-80">Applied {new Date(selectedApplicant.appliedDate).toLocaleDateString()}</span>
                  </div>

                  {/* Application Details */}
                  <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 space-y-4">
                    <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                      {selectedApplicant.applicationType === 'internship' && <Briefcase size={18} />}
                      {selectedApplicant.applicationType === 'program' && <GraduationCap size={18} />}
                      {selectedApplicant.applicationType === 'event' && <Calendar size={18} />}
                      {selectedApplicant.applicationType ? selectedApplicant.applicationType.charAt(0).toUpperCase() + selectedApplicant.applicationType.slice(1) : 'Application'} Details
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {selectedApplicant.duration && (
                        <div>
                          <span className="text-gray-500 block text-xs uppercase tracking-wide">Duration</span>
                          <span className="font-medium text-gray-900">{selectedApplicant.duration}</span>
                        </div>
                      )}
                      {selectedApplicant.department && (
                        <div>
                          <span className="text-gray-500 block text-xs uppercase tracking-wide">Department</span>
                          <span className="font-medium text-gray-900">{selectedApplicant.department}</span>
                        </div>
                      )}
                      {selectedApplicant.workMode && (
                        <div>
                          <span className="text-gray-500 block text-xs uppercase tracking-wide">Work Mode</span>
                          <span className="font-medium text-gray-900 capitalize">{selectedApplicant.workMode}</span>
                        </div>
                      )}
                      {selectedApplicant.level && (
                        <div>
                          <span className="text-gray-500 block text-xs uppercase tracking-wide">Experience Level</span>
                          <span className="font-medium text-gray-900 capitalize">{selectedApplicant.level}</span>
                        </div>
                      )}
                       {selectedApplicant.applicationType === 'event' && selectedApplicant.rsvpStatus !== undefined && (
                        <div>
                          <span className="text-gray-500 block text-xs uppercase tracking-wide">RSVP Status</span>
                          <Badge variant={selectedApplicant.rsvpStatus ? "default" : "destructive"}>
                            {selectedApplicant.rsvpStatus ? "Confirmed" : "Declined"}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {selectedApplicant.expectations && (
                      <div className="pt-2 border-t border-blue-100/50">
                        <span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Expectations</span>
                        <p className="text-gray-700 leading-relaxed">{selectedApplicant.expectations}</p>
                      </div>
                    )}
                    
                    {selectedApplicant.comments && (
                      <div className="pt-2 border-t border-blue-100/50">
                        <span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Additional Comments</span>
                        <p className="text-gray-700 leading-relaxed">{selectedApplicant.comments}</p>
                      </div>
                    )}
                  </div>

                  {/* About Section */}
                  {selectedApplicant.about && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedApplicant.about}
                      </p>
                    </div>
                  )}

                  {/* Education Section */}
                  {(selectedApplicant.university || selectedApplicant.degree) && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Education</h3>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{selectedApplicant.university}</h4>
                            <p className="text-sm text-gray-600">
                              {selectedApplicant.degree}
                              {selectedApplicant.fieldOfStudy && ` • ${selectedApplicant.fieldOfStudy}`}
                            </p>
                          </div>
                          {selectedApplicant.graduationYear && (
                            <Badge variant="secondary" className="bg-white border-gray-200">
                              Class of {selectedApplicant.graduationYear}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills Section */}
                  {(selectedApplicant.hardSkills?.length || selectedApplicant.softSkills?.length) && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Skills & Languages</h3>
                      <div className="space-y-4">
                        {selectedApplicant.hardSkills && selectedApplicant.hardSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hard Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedApplicant.hardSkills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedApplicant.softSkills && selectedApplicant.softSkills.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Soft Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedApplicant.softSkills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                         {selectedApplicant.languages && selectedApplicant.languages.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Languages</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedApplicant.languages.map((lang) => (
                                <Badge key={lang} variant="outline" className="text-gray-600">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Documents Section (Internships Only) */}
                  {selectedApplicant.applicationType === 'internship' && (
                    <>
                      {/* Cover Letter */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Cover Letter</h3>
                        {selectedApplicant.coverLetter ? (
                          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed">
                            <p className="italic text-gray-500 mb-4">Preview not available for this document type.</p>
                            <Button variant="outline" size="sm" asChild>
                              <a href={selectedApplicant.coverLetter} target="_blank" rel="noopener noreferrer" className="gap-2 w-full sm:w-auto justify-center">
                                <ExternalLink size={14} /> Open Full Document
                              </a>
                            </Button>
                          </div>
                        ) : (
                          <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-gray-500">
                            No cover letter provided.
                          </div>
                        )}
                      </div>

                      {/* Resume & Documents */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Documents</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedApplicant.resumeUrl ? (
                            <div className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer relative">
                              <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                  <Download size={20} />
                                </div>
                                <ExternalLink size={16} className="text-gray-300 group-hover:text-blue-400" />
                              </div>
                              <h4 className="font-semibold text-gray-900">Resume.pdf</h4>
                              <p className="text-xs text-gray-500">Click to view or download</p>
                              <a href={selectedApplicant.resumeUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center text-gray-500 text-sm flex items-center justify-center">
                              No resume uploaded
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Mail size={32} className="opacity-20" />
            </div>
            <p>Select a candidate to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
