"use client";

import React, { useState, useEffect } from "react";
import { Loader2, X, Edit, Save, Send } from "lucide-react";

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

  useEffect(() => {
    setContent(initialContent);
    setIsEditing(false);
  }, [initialContent]);

  const handleSend = () => {
    // In a real app, this would trigger an email API
    console.log("--- SENDING APPLICATION ---");
    console.log(content);
    onSend(content);
    onClose();
  };

  return (
    <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-white z-40 border-l border-gray-200 shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* live weather */}

      {/* Content Area */}
      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        {isGenerating ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="ml-3 text-gray-600">Generating your draft...</p>
          </div>
        ) : isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-2 border border-blue-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
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
      <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
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
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
        >
          <Send className="w-4 h-4" />
          Send Application
        </button>
      </div>
    </div>
  );
}
