import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, MessageSquare, ChevronRight, Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArtifactData {
  type: "opportunity_list" | "scholarship_list" | "code_snippet" | "general_content";
  title: string;
  data: any;
}

interface ArtifactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: ArtifactData | null;
}

export function ArtifactPanel({ isOpen, onClose, artifact }: ArtifactPanelProps) {
  const [chatInput, setChatInput] = useState("");

  if (!artifact) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 right-0 w-full md:w-[450px] lg:w-[500px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                    {artifact.type === "opportunity_list" ? <Briefcase size={18} /> : 
                     artifact.type === "scholarship_list" ? <GraduationCap size={18} /> : 
                     <MessageSquare size={18} />}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">{artifact.title}</h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">generated artifact</span>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
            >
                <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
            {renderArtifactContent(artifact)}
          </div>

          {/* Artifact Chat / Actions */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="relative">
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about these results..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button 
                    disabled={!chatInput.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function renderArtifactContent(artifact: ArtifactData) {
    if (artifact.type === "opportunity_list" || artifact.type === "scholarship_list") {
        const items = Array.isArray(artifact.data) ? artifact.data : [];
        if (items.length === 0) return <div className="text-gray-500 text-center py-10">No results found.</div>;

        return (
            <div className="space-y-4">
                {items.map((item: any, idx: number) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <h4 className="font-semibold text-gray-900 mb-1 active:text-blue-600 group-hover:text-blue-600 transition-colors">
                            <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                                {item.title || "Untitled Opportunity"}
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </h4>
                        <p className="text-sm text-gray-500 mb-3 lines-clamp-2">{item.content || item.description || "No description available."}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                {item.score ? `${Math.round(item.score * 100)}% Match` : "Opportunity"}
                            </span>
                            <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                                View Details
                            </a>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="prose prose-sm max-w-none text-gray-600">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(artifact.data, null, 2)}</code>
            </pre>
        </div>
    );
}
