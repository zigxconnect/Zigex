"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Globe, Zap, Lightbulb, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCommandDockProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tool: string) => void;
}

const tools = [
  { id: "Opportunity Finder", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-50", desc: "Find Jobs" },
  { id: "Deep Research", icon: Globe, color: "text-violet-500", bg: "bg-violet-50", desc: "Web Search" },
  { id: "Project Review", icon: Zap, color: "text-amber-500", bg: "bg-amber-50", desc: "Code Audit" },
  { id: "Scholarship Search", icon: Lightbulb, color: "text-pink-500", bg: "bg-pink-50", desc: "Funding" },
  { id: "Upload CV", icon: Plus, color: "text-blue-500", bg: "bg-blue-50", desc: "Add File" },
];

export function ToolCommandDock({ isOpen, onClose, onSelect }: ToolCommandDockProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[90%] max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-blue-900/10 p-2 z-50 flex flex-col gap-2 origin-bottom"
        >
            <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100/50 pb-2 mb-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Function</span>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                    <X size={14} />
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => (
                    <motion.button
                        key={tool.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(tool.id)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/80 border border-transparent hover:border-gray-100 transition-all shadow-sm hover:shadow-md bg-gray-50/50"
                    >
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", tool.bg, tool.color)}>
                            <tool.icon size={16} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-sm font-semibold text-gray-800">{tool.id}</span>
                            <span className="text-[10px] text-gray-500 font-medium">{tool.desc}</span>
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
