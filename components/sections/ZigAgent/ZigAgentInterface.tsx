"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  Lock,
  Sparkles,
  MoreHorizontal,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types ---
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* --- Header --- */}
      <header className="flex-none flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 z-20">
        <div className="flex items-center gap-2">
            <h1 className="text-gray-900 font-bold text-lg tracking-tight">ZigAgent</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide">
                Beta
            </span>
        </div>

        {/* Real-time Toggle */}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsRealTime(!isRealTime)}>
                 <span className={cn("text-xs font-medium transition-colors", isRealTime ? "text-blue-600" : "text-gray-500")}>
                    Real-Time
                </span>
                <div 
                    className={cn(
                        "w-8 h-4 rounded-full relative transition-colors duration-300 ease-in-out",
                        isRealTime ? "bg-blue-600" : "bg-gray-200"
                    )}
                >
                    <div className={cn(
                        "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out",
                        isRealTime ? "translate-x-4" : "translate-x-0"
                    )} />
                </div>
            </div>
            
             {!isRealTime && (
                <div className="flex items-center gap-1 text-gray-400">
                    <Lock size={14} />
                </div>
            )}
        </div>
      </header>

      {/* --- Chat Area --- */}
      <div 
        className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-32 scroll-smooth"
        ref={scrollRef}
      >
        <AnimatePresence initial={false}>
            {messages.map((msg) => (
            <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                "flex w-full mb-6",
                msg.role === "user" ? "justify-end" : "justify-start"
                )}
            >
                <div className={cn("flex gap-3 max-w-[85%] md:max-w-[80%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                    {msg.role === "ai" ? (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
                            <Sparkles size={14} className="text-white" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-600 font-bold">ME</span>
                        </div>
                    )}
                </div>

                {/* Message Bubble */}
                <div className="group relative">
                    <div
                        className={cn(
                        "px-5 py-3.5 text-[15px] leading-relaxed shadow-sm",
                        msg.role === "ai"
                            ? "bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none"
                            : "bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-blue-600/20"
                        )}
                    >
                        {msg.content}
                    </div>

                    {/* AI Actions */}
                    {msg.role === "ai" && (
                        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pl-1">
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Copy">
                                <Copy size={14} />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Regenerate">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    )}
                </div>
                </div>
            </motion.div>
            ))}

            {isThinking && (
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex w-full justify-start mb-6"
                 >
                    <div className="flex gap-3 max-w-[85%]">
                        <div className="flex-shrink-0 mt-1">
                             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
                                <Sparkles size={14} className="text-white animate-pulse" />
                            </div>
                        </div>
                        <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                             <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                             <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                 </motion.div>
            )}

        </AnimatePresence>
      </div>

      {/* --- Input Area --- */}
      <div className="flex-none fixed bottom-0 left-0 lg:left-0 w-full bg-white z-30 pb-6 pt-2">
         {/* Gradient Fade Top */}
         <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
         
        <div className="max-w-3xl mx-auto px-4 sm:px-6"> 
            <div className="relative group bg-gray-50 border border-gray-200 rounded-[26px] hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 focus-within:shadow-xl focus-within:shadow-blue-500/10">
                <div className="flex items-end pl-4 pr-3 py-3 gap-3">
                     {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message ZigAgent..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 p-0 text-base resize-none max-h-[200px] py-1.5"
                        style={{ minHeight: "24px" }}
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2 pb-0.5">
                         {inputValue.trim() ? (
                            <button 
                                onClick={handleSendMessage}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all duration-200 transform active:scale-95"
                            >
                                <Send size={18} />
                            </button>
                         ) : (
                            <button className={cn(
                                "p-2 rounded-full transition-all duration-200",
                                isRealTime ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700"
                            )}
                            title={isRealTime ? "Listening..." : "Voice Mode"}
                            >
                                <Mic size={20} className={isRealTime ? "animate-pulse" : ""} />
                            </button>
                         )}
                    </div>
                </div>
            </div>
            
            <p className="text-center text-[11px] text-gray-400 font-medium mt-3">
                ZigAgent can make mistakes. Consider checking important information.
            </p>
        </div>
      </div>
    </div>
  );
}
