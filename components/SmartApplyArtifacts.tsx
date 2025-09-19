"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, X, Edit, Save, Send, GripVertical } from "lucide-react";

interface SmartApplyArtifactProps {
  title: string;
  initialContent: string;
  onClose: () => void;
  onSend: (finalContent: string) => void;
  isGenerating: boolean;
}

export default function SmartApplyArtifact({
  title,
  initialContent,
  onClose,
  onSend,
  isGenerating,
}: SmartApplyArtifactProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  
  // State and ref for resizable functionality
  const [width, setWidth] = useState(480); // Default width in pixels
  const artifactRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  useEffect(() => {
    setContent(initialContent);
    setIsEditing(false); // Reset editing state when new content arrives
  }, [initialContent]);

  const handleSend = () => {
    // In a real app, this would trigger an API call to send the application
    console.log("--- SENDING APPLICATION ---");
    console.log(content);
    onSend(content);
    onClose();
  };

  // Mouse move handler for resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !artifactRef.current) return;
    
    // Calculate new width based on mouse position from the right edge of the screen
    const newWidth = window.innerWidth - e.clientX;
    
    // Enforce min and max width constraints
    if (newWidth >= 320 && newWidth <= 900) {
      setWidth(newWidth);
    }
  }, []);

  // Mouse up handler to stop resizing
  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    // Optional: add a class to the body to prevent text selection during resize
    document.body.style.userSelect = ""; 
  }, [handleMouseMove]);
  
  // Mouse down handler to initiate resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
  };
  
  return (
    <div
      ref={artifactRef}
      style={{ width: `${width}px` }}
      className="absolute top-0 right-0 h-full bg-white z-40 border-l border-gray-200 shadow-2xl flex flex-col transition-opacity duration-300"
    >
      {/* Resizer Handle */}
      <div 
        onMouseDown={handleMouseDown}
        className="absolute top-0 left-0 h-full w-2 cursor-col-resize flex items-center justify-center group"
      >
        <div className="w-[2px] h-8 bg-gray-300 rounded-full group-hover:bg-blue-500 transition-colors"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 pl-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
          title="Close Artifact"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="mt-4 text-gray-600">Generating your draft...</p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
          </div>
        ) : isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-3 border border-blue-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-gray-50"
          />
        ) : (
          <div
            className="prose prose-sm max-w-none whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: content.replace(/\n/g, "<br />"),
            }}
          />
        )}
      </div>

      {/* Footer with Actions */}
      <div className="flex items-center justify-end gap-3 p-4 pl-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-95"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" /> Save
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" /> Edit
            </>
          )}
        </button>
        <button
          onClick={handleSend}
          disabled={isGenerating || isEditing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
          Send Application
        </button>
      </div>
    </div>
  );
}