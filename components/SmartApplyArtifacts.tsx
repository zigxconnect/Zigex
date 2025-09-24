"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import {
  Loader2, X, Edit, Save, Send, Sparkles, Building, AlertTriangle
} from "lucide-react";
import Image from 'next/image';

// --- TYPE DEFINITIONS ---
type ArtifactMode = 'companySelection' | 'generating' | 'display';

interface Company {
  id: string;
  name: string;
  logo: string;
}

interface UserProfile {
  full_name: string;
  university: string;
  hard_skills: string[];
}

interface SmartApplyArtifactProps {
  mode: ArtifactMode;
  onClose: () => void;
  onSend: (finalContent: string) => void;
  companies?: Company[];
  onCompanySelect?: (companyName: string) => void;
  title?: string;
  content?: string;
  userProfile: UserProfile | null;
  width: number;
  onWidthChange: (newWidth: number) => void;
  isMobile: boolean;
}

// --- MAIN COMPONENT ---
export default function SmartApplyArtifact({
  mode,
  onClose = () => console.error("onClose prop is missing from parent!"),
  onSend,
  companies = [],
  onCompanySelect = () => {},
  title = "SmartApply",
  content = "",
  userProfile,
  width,
  onWidthChange = () => console.error("onWidthChange prop is missing from parent!"),
  isMobile,
}: SmartApplyArtifactProps) {

  // --- STATE AND REFS ---
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(content);
  const [correctionQuery, setCorrectionQuery] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const correctionInputRef = useRef<HTMLInputElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null); // Ref for the drag handle

  useEffect(() => {
    setEditableContent(content);
    setIsEditing(false); // Reset editing mode when new content arrives
  }, [content]);

  // --- RESIZING LOGIC (DESKTOP ONLY) ---
  useEffect(() => {
    const resizer = resizerRef.current;
    if (!resizer || isMobile) return; // Don't attach listeners on mobile or if ref is not ready

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 340 && newWidth <= 900) { // Clamp width
        onWidthChange(newWidth);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const newWidth = window.innerWidth - e.touches[0].clientX;
        if (newWidth >= 340 && newWidth <= 900) {
          onWidthChange(newWidth);
        }
      }
    };
    
    const stopResizing = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopResizing);
      document.body.style.userSelect = 'auto'; // Re-enable text selection
    };

    const startMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      document.body.style.userSelect = 'none'; // Prevent text selection during drag
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
    };

    const startTouch = (e: TouchEvent) => {
      document.body.style.userSelect = 'none';
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', stopResizing);
    };

    // Attach event listeners to the resizer handle
    resizer.addEventListener('mousedown', startMouseDown);
    resizer.addEventListener('touchstart', startTouch, { passive: true });

    // Cleanup function: remove listeners when the component unmounts
    return () => {
      resizer.removeEventListener('mousedown', startMouseDown);
      resizer.removeEventListener('touchstart', startTouch);
      stopResizing(); // Also clean up global listeners in case of unmount during drag
    };
  }, [onWidthChange, isMobile]);

  // --- EVENT HANDLERS ---
  const handleSend = () => onSend(editableContent);
  const handleCloseClick = () => onClose();

  const handleCorrection = async () => {
    if (!correctionQuery.trim() || isCorrecting || !userProfile) return;
    setIsCorrecting(true);
    setCorrectionError(null);
    let accumulatedCorrection = "";

    try {
      const response = await fetch('/api/internship-agent/correct-artifact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentContent: editableContent,
          correctionInstruction: correctionQuery,
          userProfile: userProfile,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedCorrection += decoder.decode(value, { stream: true });
        setEditableContent(accumulatedCorrection);
      }
      setCorrectionQuery("");

    } catch (error) {
      console.error("Correction API error:", error);
      setCorrectionError("Sorry, I couldn't make that correction. Please try again.");
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleCorrectionKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCorrection(); }
  };
  
  // --- UI RENDER LOGIC ---
  const renderContent = () => {
    switch (mode) {
      case 'companySelection':
        return (
          <div className="p-6">
            <h4 className="text-lg font-bold text-center text-gray-800">Choose Your Target</h4>
            <p className="text-sm text-center text-gray-500 mb-6">Select a company to generate a tailored application.</p>
            {companies.length === 0 ? (
              <div className="text-center text-gray-400 py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto"/><p className="text-sm mt-2">Loading companies...</p></div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {companies.map((company) => (
                  <button key={company.id} onClick={() => onCompanySelect && onCompanySelect(company.name)} className="p-4 border rounded-xl text-center hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all group">
                    <Image src={company.logo} alt={`${company.name} Logo`} width={40} height={40} className="mx-auto mb-2 opacity-80 group-hover:opacity-100"/>
                    <p className="font-semibold text-sm text-gray-700">{company.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case 'generating':
        return ( <div className="flex flex-col items-center justify-center h-full text-center p-6"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /><p className="mt-4 text-lg font-semibold text-gray-700">Drafting Application...</p><p className="text-sm text-gray-500">The AI is tailoring your skills to {title.replace('Draft for ', '')}.</p></div> );
      case 'display':
        return isEditing ? (
          <textarea value={editableContent} onChange={(e) => setEditableContent(e.target.value)} className="w-full h-full p-6 border-none resize-none focus:outline-none text-sm font-mono bg-gray-50" />
        ) : (
          <div className="prose prose-sm max-w-none p-6 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: editableContent.replace(/\n/g, "<br />") }} />
        );
      default: return null;
    }
  };
  
  const containerClasses = isMobile
    ? "fixed inset-0 z-50 flex flex-col bg-white animate-slide-in-from-bottom"
    : "absolute top-0 right-0 h-full bg-white z-40 border-l border-gray-200 shadow-2xl flex flex-col animate-slide-in-from-right";

  return (
    <div style={!isMobile ? { width: `${width}px` } : {}} className={containerClasses}>
      {!isMobile && (
        <div ref={resizerRef} className="absolute top-0 left-0 h-full w-2.5 cursor-col-resize flex items-center justify-center group">
          <div className="w-[3px] h-10 bg-gray-300 rounded-full group-hover:bg-blue-500 transition-colors"></div>
        </div>
      )}
      <div className="flex items-center justify-between p-4 pl-8 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <Building className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
        </div>
        <button onClick={handleCloseClick} className="p-2 rounded-full text-gray-500 hover:bg-gray-200" title="Close Artifact"><X className="w-5 h-5" /></button>
      </div>
      
      <div className="flex-grow overflow-y-auto custom-scrollbar">{renderContent()}</div>
      
      {mode === 'display' && (
        <>
          <div className="p-4 pl-8 border-t bg-white">
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mb-2"><Sparkles className="w-4 h-4 text-blue-500"/> Ask AI to Revise</label>
            <div className="flex items-center gap-2">
              <input ref={correctionInputRef} type="text" value={correctionQuery} onChange={(e) => setCorrectionQuery(e.target.value)} onKeyDown={handleCorrectionKeyPress} placeholder="e.g., 'Make it more professional'" className="w-full px-3 py-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" disabled={isCorrecting} />
              <button onClick={handleCorrection} disabled={!correctionQuery.trim() || isCorrecting} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400" title="Apply Correction">
                {isCorrecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
            </div>
            {correctionError && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/>{correctionError}</p>}
          </div>
          <div className="flex items-center justify-end gap-3 p-4 pl-8 border-t bg-gray-50 flex-shrink-0">
            <button onClick={() => setIsEditing(!isEditing)} disabled={isCorrecting} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">
              {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit className="w-4 h-4" /> Edit Manually</>}
            </button>
            <button onClick={handleSend} disabled={isEditing || isCorrecting} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
              <Send className="w-4 h-4" /> Send Application
            </button>
          </div>
        </>
      )}
    </div>
  );
}