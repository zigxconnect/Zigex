"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { 
  X, ExternalLink, MessageSquare, ChevronRight, Briefcase, 
  GraduationCap, Sparkles, Copy, Check, Calendar, MapPin,
  TrendingUp, Award, Clock, GripVertical, Maximize2, Minimize2,
  Upload, FileText, CheckCircle2, Globe, Zap, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArtifactData {
  type: "opportunity_list" | "scholarship_list" | "deep_research" | "project_review" | "cv_upload" | "general_content";
  title: string;
  data: any;
}

interface ArtifactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: ArtifactData | null;
  onWidthChange?: (width: number) => void;
}

export function ArtifactPanel({ isOpen, onClose, artifact, onWidthChange }: ArtifactPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [panelWidth, setPanelWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const [mobileView, setMobileView] = useState<'chat' | 'results'>('results');
  const [isMaximized, setIsMaximized] = useState(false);
  
  // CV Upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const resizeRef = useRef<HTMLDivElement>(null);

  // Handle resize
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const clampedWidth = Math.max(300, Math.min(900, newWidth));
      setPanelWidth(clampedWidth);
      onWidthChange?.(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  // Notify parent of width changes
  useEffect(() => {
    if (isOpen) {
      onWidthChange?.(isMaximized ? window.innerWidth : panelWidth);
    } else {
      onWidthChange?.(0);
    }
  }, [isOpen, panelWidth, isMaximized, onWidthChange]);

  // Handle mobile swipe to close
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100 || info.velocity.x > 500) {
      onClose();
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simulate file upload
  const handleFileUpload = (file: File) => {
    setUploadFile(file);
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  if (!artifact) return null;

  const isCVUpload = artifact.type === "cv_upload";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Mobile Only */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ width: isMaximized ? '100%' : `${panelWidth}px` }}
            className={cn(
              "fixed inset-y-0 right-0 z-50 flex flex-col",
              "w-full md:w-auto",
              "bg-white shadow-2xl",
              "md:border-l md:border-gray-200",
              isResizing && "select-none"
            )}
          >
            {/* Resize Handle - Desktop Only */}
            <div
              ref={resizeRef}
              onMouseDown={startResize}
              className={cn(
                "hidden md:block absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/20 transition-colors group",
                isResizing && "bg-blue-500/30"
              )}
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
                  <GripVertical size={16} />
                </div>
              </div>
            </div>

            {/* Mobile Drag Indicator */}
            <div className="md:hidden flex justify-center pt-3 pb-2 bg-gray-50">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex-none px-3 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20"
                  >
                    {isCVUpload ? <Upload size={20} /> :
                     artifact.type === "opportunity_list" ? <Briefcase size={20} /> : 
                     artifact.type === "scholarship_list" ? <GraduationCap size={20} /> : 
                     <Sparkles size={20} />}
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm md:text-lg">{artifact.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-medium">
                        {isCVUpload ? "Upload Interface" : "AI Generated"}
                      </span>
                      {!isCVUpload && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-[10px] md:text-xs text-blue-600 font-medium">
                            {Array.isArray(artifact.data) ? `${artifact.data.length} Results` : "1 Result"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="hidden md:block p-2 hover:bg-gray-200/70 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700"
                  >
                    {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200/70 rounded-xl transition-all duration-200 text-gray-500 hover:text-gray-700 active:scale-95 touch-manipulation"
                  >
                    <X size={20} className="md:w-5 md:h-5 w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="md:hidden flex border-b border-gray-200 bg-white sticky top-0 z-10">
              <button
                onClick={() => setMobileView('results')}
                className={cn(
                  "flex-1 py-4 text-sm font-semibold transition-all touch-manipulation",
                  mobileView === 'results' 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-500"
                )}
              >
                Results
              </button>
              <button
                onClick={() => setMobileView('chat')}
                className={cn(
                  "flex-1 py-4 text-sm font-semibold transition-all touch-manipulation",
                  mobileView === 'chat' 
                    ? "text-blue-600 border-b-2 border-blue-600" 
                    : "text-gray-500"
                )}
              >
                Ask About
              </button>
            </div>

            {/* Content Area */}
            <div className={cn(
              "flex-1 overflow-y-auto overscroll-contain",
              mobileView === 'chat' && "md:hidden hidden"
            )}>
              <div className="p-3 md:p-6">
                {isCVUpload ? (
                  <CVUploadContent 
                    file={uploadFile}
                    progress={uploadProgress}
                    status={uploadStatus}
                    onFileSelect={handleFileUpload}
                  />
                ) : (
                  renderArtifactContent(artifact, copiedIndex, copyToClipboard)
                )}
              </div>
            </div>

            {/* Footer - Ask About Results */}
            <div className={cn(
              "flex-none p-3 md:p-5 border-t border-gray-100 bg-white safe-area-inset-bottom",
              mobileView === 'results' && "md:block hidden"
            )}>
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about these results..."
                  className="w-full pl-4 pr-12 py-3.5 md:py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 touch-manipulation"
                />
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  disabled={!chatInput.trim()}
                  className="absolute right-2 top-2 p-2.5 md:p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 disabled:hover:shadow-none touch-manipulation"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// CV Upload Component
function CVUploadContent({ 
  file, 
  progress, 
  status,
  onFileSelect 
}: { 
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  onFileSelect: (file: File) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [cvContent, setCvContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [aiAction, setAiAction] = useState<'improve' | 'create' | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx') || droppedFile.name.endsWith('.doc'))) {
      onFileSelect(droppedFile);
      // Simulate file content extraction
      setTimeout(() => {
        setCvContent(`JOHN DOE
Software Engineer

CONTACT
Email: john.doe@email.com
Phone: +1 234 567 8900
Location: New York, NY

SUMMARY
Experienced software engineer with 5+ years in full-stack development. Specialized in React, Node.js, and cloud technologies.

EXPERIENCE
Senior Software Engineer | Tech Corp
Jan 2021 - Present
• Led development of microservices architecture
• Improved system performance by 40%
• Mentored junior developers

Software Engineer | StartupXYZ
Jun 2018 - Dec 2020
• Built responsive web applications
• Implemented CI/CD pipelines
• Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014 - 2018

SKILLS
• JavaScript, TypeScript, Python
• React, Node.js, Express
• AWS, Docker, Kubernetes
• Git, CI/CD, Agile`);
      }, 1000);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
      // Simulate file content extraction
      setTimeout(() => {
        setCvContent(`JOHN DOE
Software Engineer

CONTACT
Email: john.doe@email.com
Phone: +1 234 567 8900
Location: New York, NY

SUMMARY
Experienced software engineer with 5+ years in full-stack development.`);
      }, 1000);
    }
  };

  const handleAIImprove = () => {
    setAiAction('improve');
    // Simulate AI improvement
    setTimeout(() => {
      setCvContent(prevContent => prevContent + "\n\n[AI IMPROVED VERSION]\n• Enhanced professional summary\n• Optimized keywords for ATS\n• Improved formatting and structure");
      setAiAction(null);
    }, 2000);
  };

  const handleCreateNew = () => {
    setAiAction('create');
    // Simulate AI creation
    setTimeout(() => {
      setCvContent(`JANE SMITH
Full-Stack Developer

[AI GENERATED CV]
Professional with expertise in modern web technologies...`);
      setAiAction(null);
    }, 2000);
  };

  const handleDownloadPDF = () => {
    // Simulate PDF download
    alert("PDF download functionality - would generate and download CV as PDF");
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {status === 'idle' && !cvContent && (
        <>
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
              "border-2 border-dashed rounded-xl md:rounded-2xl p-6 md:p-8 text-center transition-all duration-200",
              isDragging ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300 bg-gray-50/50"
            )}
          >
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <motion.div 
                animate={isDragging ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
                className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center"
              >
                <Upload size={28} className="text-blue-600 md:w-8 md:h-8" />
              </motion.div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Drop your CV here</h4>
                <p className="text-xs md:text-sm text-gray-500">or click to browse</p>
              </div>
              
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
                id="cv-upload"
              />
              <label
                htmlFor="cv-upload"
                className="px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm md:text-base font-semibold cursor-pointer hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 touch-manipulation"
              >
                Choose File
              </label>
              <p className="text-[10px] md:text-xs text-gray-400">Supports PDF, DOC, DOCX (Max 5MB)</p>
            </div>
          </div>
        </>
      )}

      {status === 'uploading' && (
        <div className="space-y-2 md:space-y-3 p-4 md:p-6 bg-blue-50/50 rounded-xl md:rounded-2xl border border-blue-200">
          <div className="flex items-center gap-2 md:gap-3">
            <FileText size={18} className="text-blue-600 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-medium text-gray-700 flex-1 truncate">{file?.name}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
            />
          </div>
          <p className="text-xs md:text-sm text-gray-600">{progress}% uploaded</p>
        </div>
      )}

      {(status === 'success' || cvContent) && (
        <div className="space-y-3 md:space-y-4">
          {/* CV Preview/Editor */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 md:px-4 py-2.5 md:py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-600 md:w-[18px] md:h-[18px]" />
                <span className="font-semibold text-gray-900 text-xs md:text-sm">CV Document</span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-2.5 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation"
              >
                {isEditing ? "Preview" : "Edit"}
              </button>
            </div>
            
            <div className="p-3 md:p-4 max-h-64 md:max-h-96 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={cvContent}
                  onChange={(e) => setCvContent(e.target.value)}
                  className="w-full min-h-[200px] md:min-h-[300px] p-3 md:p-4 border border-gray-200 rounded-lg font-mono text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 touch-manipulation"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-xs md:text-sm text-gray-700 leading-relaxed">
                  {cvContent}
                </pre>
              )}
            </div>
          </div>

          {/* AI Actions */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <button
              onClick={handleAIImprove}
              disabled={aiAction !== null}
              className="flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2.5 md:px-4 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs md:text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
            >
              {aiAction === 'improve' ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles size={16} className="md:w-[18px] md:h-[18px]" />
                  </motion.div>
                  <span>Improving...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="md:w-[18px] md:h-[18px]" />
                  <span>Improve CV</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleCreateNew}
              disabled={aiAction !== null}
              className="flex items-center justify-center gap-1.5 md:gap-2 px-3 py-2.5 md:px-4 md:py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl text-xs md:text-sm font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
            >
              {aiAction === 'create' ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles size={16} className="md:w-[18px] md:h-[18px]" />
                  </motion.div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FileText size={16} className="md:w-[18px] md:h-[18px]" />
                  <span>Create New</span>
                </>
              )}
            </button>
          </div>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-xs md:text-sm font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all touch-manipulation active:scale-95"
          >
            <Upload size={16} className="rotate-180 md:w-[18px] md:h-[18px]" />
            <span>Download as PDF</span>
          </button>

          {/* Upload Another */}
          <button
            onClick={() => {
              setCvContent("");
              setIsEditing(false);
            }}
            className="w-full text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium py-2 touch-manipulation"
          >
            Upload another CV
          </button>
        </div>
      )}
    </div>
  );
}

function renderArtifactContent(
  artifact: ArtifactData, 
  copiedIndex: number | null,
  copyToClipboard: (text: string, index: number) => void
) {
  // Loading state
  if (artifact.data?.loading) {
    // Determine which icon to show based on artifact title
    const getToolIcon = () => {
      const title = artifact.title.toLowerCase();
      if (title.includes('opportunity')) return Briefcase;
      if (title.includes('scholarship')) return GraduationCap;
      if (title.includes('research')) return Globe;
      if (title.includes('project')) return Zap;
      if (title.includes('cv') || title.includes('upload')) return Upload;
      return Sparkles;
    };

    const ToolIcon = getToolIcon();
    
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        {/* Pulsing icon with glow effect */}
        <div className="relative mb-6">
          {/* Outer glow ring */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-xl"
          />
          
          {/* Main icon container */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50"
          >
            <ToolIcon size={36} className="text-white" strokeWidth={2} />
          </motion.div>
        </div>

        {/* Text content */}
        <motion.h4 
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-gray-900 font-bold text-xl mb-2"
        >
          Discovering...
        </motion.h4>
        <p className="text-gray-600 text-sm text-center max-w-sm leading-relaxed">
          {artifact.data.message || "Searching for the best results for you"}
        </p>
        
        {/* Loading dots */}
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }
  
  if (artifact.type === "opportunity_list" || artifact.type === "scholarship_list") {
    const items = Array.isArray(artifact.data) ? artifact.data : [];
    
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={28} className="text-gray-400" />
          </div>
          <h4 className="text-gray-900 font-semibold text-lg mb-2">No Results Found</h4>
          <p className="text-gray-500 text-sm text-center max-w-sm">
            Try adjusting your search criteria or ask me to help you find something specific.
          </p>
        </div>
      );
    }

    const isScholarship = artifact.type === "scholarship_list";

    return (
      <div className="space-y-3">
        {items.map((item: any, idx: number) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: idx * 0.08,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            key={idx} 
            className="group relative bg-white border border-gray-200 rounded-2xl p-4 md:p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
          >
            {/* Score Badge */}
            {item.score && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full">
                  <TrendingUp size={12} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">
                    {Math.round(item.score * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Title */}
            <h4 className="font-bold text-gray-900 mb-2 pr-16 text-base md:text-lg group-hover:text-blue-600 transition-colors">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-start gap-2"
              >
                <span className="flex-1">{item.title || "Untitled Opportunity"}</span>
                <ExternalLink 
                  size={16} 
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" 
                />
              </a>
            </h4>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
              {item.content || item.description || "No description available."}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {item.published_date && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar size={14} />
                  <span>{new Date(item.published_date).toLocaleDateString()}</span>
                </div>
              )}
              {isScholarship && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                  <Award size={12} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">Scholarship</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 active:scale-95"
              >
                View Details
              </a>
              <button
                onClick={() => copyToClipboard(item.url, idx)}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors active:scale-95"
              >
                {copiedIndex === idx ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} className="text-gray-600" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Fallback for other types
  return (
    <div className="bg-gray-900 rounded-2xl p-4 md:p-6 overflow-x-auto">
      <pre className="text-gray-100 text-xs md:text-sm">
        <code>{JSON.stringify(artifact.data, null, 2)}</code>
      </pre>
    </div>
  );
}
