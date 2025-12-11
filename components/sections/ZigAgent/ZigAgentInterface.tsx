"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Plus,
  Mic,
  Search,
  Zap,
  Lock,
  Sparkles,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Globe,
  Code,
  Plane,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types ---
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

// --- Components ---

const SuggestionChip = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all text-sm text-white/90 whitespace-nowrap"
  >
    <Icon size={14} className="text-blue-300" />
    {label}
  </button>
);

export function ZigAgentInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm ZigAgent. I can help you research projects, find opportunities, or brainstorm ideas. What's on your mind today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRealTime, setIsRealTime] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      setIsThinking(false);
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "That's an interesting topic! I'm researching relevant projects and opportunities for you. Here are a few improved concepts based on our database...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newAiMsg]);
    }, 2000);
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] overflow-hidden flex flex-col">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* --- Header --- */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/5 backdrop-blur-lg border-b border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-[#0f172a]"></span>
            </span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg tracking-tight">ZigAgent</h1>
            <p className="text-blue-300/80 text-xs font-medium">AI Research Assistant</p>
          </div>
        </div>

        {/* Real-time Toggle */}
        <div className="flex items-center gap-3">
            <span className={cn("text-xs font-medium transition-colors", isRealTime ? "text-blue-400" : "text-gray-400")}>
                Real-Time
            </span>
            <button
                onClick={() => setIsRealTime(!isRealTime)} // In real app, trigger payment modal if !paid
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0f172a] bg-gray-700"
                style={{ backgroundColor: isRealTime ? '#3b82f6' : '#374151' }}
            >
                <span
                    className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm",
                        isRealTime ? "translate-x-6" : "translate-x-1"
                    )}
                />
            </button>
             {!isRealTime && (
                <div className="flex items-center px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider gap-1">
                    <Lock size={10} />
                    PRO
                </div>
            )}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <MoreHorizontal size={20} />
            </button>
        </div>
      </header>

      {/* --- Chat Area --- */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth z-10"
      >
        <AnimatePresence initial={false}>
            {messages.map((msg) => (
            <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={cn(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
                )}
            >
                <div className={cn("flex gap-3 max-w-[85%] sm:max-w-[75%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                    {msg.role === "ai" ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Sparkles size={14} className="text-white" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-white font-bold">ME</span>
                        </div>
                    )}
                </div>

                {/* Message Bubble */}
                <div className="group relative">
                    <div
                        className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-md",
                        msg.role === "ai"
                            ? "bg-white/10 text-gray-100 border border-white/10 rounded-tl-none"
                            : "bg-blue-600 text-white rounded-tr-none shadow-blue-600/20"
                        )}
                    >
                        {msg.content}
                    </div>

                    {/* AI Actions */}
                    {msg.role === "ai" && (
                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pl-1">
                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Copy">
                                <Copy size={14} />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Regenerate">
                                <RefreshCw size={14} />
                            </button>
                            <div className="h-4 w-[1px] bg-white/10 mx-1" />
                            <button className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-full transition-colors">
                                <ThumbsUp size={14} />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors">
                                <ThumbsDown size={14} />
                            </button>
                        </div>
                    )}
                </div>
                </div>
            </motion.div>
            ))}

            {isThinking && (
                 <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex w-full justify-start"
                 >
                    <div className="flex gap-3 max-w-[85%] sm:max-w-[75%]">
                        <div className="flex-shrink-0 mt-1">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Sparkles size={14} className="text-white animate-pulse" />
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/10 border border-white/10 rounded-tl-none backdrop-blur-md flex items-center gap-2">
                             <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                             <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                             <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                 </motion.div>
            )}

        </AnimatePresence>
        
        {/* Spacer for bottom input */}
        <div className="h-32" />
      </div>

      {/* --- Input Area --- */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#0f172a] to-transparent z-20">
        <div className="max-w-4xl mx-auto space-y-4">
            
            {/* Quick Suggestions */}
            {messages.length < 3 && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-image-linear-to-r"
                 >
                    <SuggestionChip icon={Lightbulb} label="Design Ideas" onClick={() => setInputValue("Give me some design ideas for...")} />
                    <SuggestionChip icon={Code} label="Generate Code" onClick={() => setInputValue("Write a React component for...")} />
                    <SuggestionChip icon={Globe} label="Research Trends" onClick={() => setInputValue("What are the latest trends in...")} />
                    <SuggestionChip icon={Plane} label="Project Plans" onClick={() => setInputValue("Create a roadmap for...")} />
                 </motion.div>
            )}

            {/* Input Bar */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
                <div className="relative flex items-center bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
                    <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <Plus size={20} />
                    </button>
                    
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Ask ZigAgent about projects, code, or ideas..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 px-4 py-2 text-base"
                    />

                    <div className="flex items-center gap-2">
                         {inputValue.trim() ? (
                            <button 
                                onClick={handleSendMessage}
                                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                         ) : (
                            <button className={cn(
                                "p-2 rounded-xl transition-all duration-200 border border-transparent",
                                isRealTime ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                            )}>
                                <Mic size={20} className={isRealTime ? "animate-pulse" : ""} />
                            </button>
                         )}
                    </div>
                </div>
            </div>
            
            <p className="text-center text-xs text-gray-500 font-medium">
                ZigAgent uses AI and may generate inaccurate information.
            </p>
        </div>
      </div>
    </div>
  );
}
