"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Mic,
  Copy,
  RefreshCw,
  Search,
  Briefcase,
  Lightbulb,
  BrainCircuit,
  Plus,
  Globe,
  Zap,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/app/types/type";
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


// --- Types ---
interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ZigAgentInterfaceProps {
    user?: UserProfile | null;
}

export function ZigAgentInterface({ user }: ZigAgentInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRealTime, setIsRealTime] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Time-based Greeting Logic
  useEffect(() => {
    const hour = new Date().getHours();
    let greet = "Hello";
    if (hour < 12) greet = "Good morning";
    else if (hour < 18) greet = "Good afternoon";
    else greet = "Good evening";
    
    setGreeting(greet);
  }, []);

  // Close tools menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-resize textarea logic
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  // Reset height on send
  useEffect(() => {
    if (!inputValue && textareaRef.current) {
        textareaRef.current.style.height = "56px";
    }
  }, [inputValue]);

  // Smooth scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, hasStarted]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedTool) return;

    if (!hasStarted) setHasStarted(true);

    const fullContent = selectedTool ? `Using ${selectedTool}: ${inputValue}` : inputValue;
    const userMessage = inputValue; // Store before clearing

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: fullContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setSelectedTool(null);
    setIsThinking(true);

    try {
      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }));

      // Create AI message placeholder for streaming
      const aiMessageId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMessageId,
        role: "ai",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);

      // Call streaming endpoint
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.error) {
                console.error('Stream error:', parsed.error);
                break;
              }

              if (parsed.text) {
                accumulatedText += parsed.text;
                
                // Update the AI message with accumulated text
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsThinking(false);
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToolSelect = (toolName: string) => {
    setIsToolsOpen(false);
    setSelectedTool(toolName);
    if(textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 relative overflow-hidden font-sans">
      {/* Background Gradients - Subtle Blue & White */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none" />

      {/* --- Header --- */}
      <header className="flex-none flex items-center justify-between px-6 py-4 z-20 bg-white/80 backdrop-blur-md sticky top-0 border-b border-gray-100/50">
        <div className="flex items-center gap-2">
           {hasStarted && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    {/* Compact AI Brain in Header when Chat Started */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] shadow-sm">
                       <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                           <Image 
                                src="/zigagent-brain.png" 
                                alt="AI" 
                                width={32} 
                                height={32} 
                                className="object-cover scale-110"
                            />
                       </div>
                    </div>

                    <div className="flex flex-col leading-none">
                        <span className="text-gray-900 font-bold text-base tracking-tight flex items-center gap-2">
                            ZigAgent
                             <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold uppercase tracking-wide">
                                2.0
                            </span>
                        </span>
                        <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Research Assistant</span>
                    </div>
                </motion.div>
           )}
        </div>

        {/* Real-time Toggle */}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setIsRealTime(!isRealTime)}>
                 <span className={cn("text-xs font-medium transition-colors duration-300", isRealTime ? "text-blue-600" : "text-gray-500 group-hover:text-gray-400")}>
                    Fast Mode
                </span>
                <div 
                    className={cn(
                        "w-9 h-5 rounded-full relative transition-colors duration-300 ease-in-out border",
                        isRealTime ? "bg-blue-600 border-blue-600" : "bg-gray-200 border-gray-200 group-hover:bg-gray-300"
                    )}
                >
                    <div className={cn(
                        "absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full shadow-sm transition-all duration-300 ease-in-out bg-white",
                        isRealTime ? "translate-x-4" : "translate-x-0"
                    )} />
                </div>
            </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
        
        {/* Chat List (Only visible if started) - Strict containment */}
        {hasStarted && (
             <div 
                className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 sm:px-6 pb-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-blue-100 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-200"
                ref={scrollRef}
            >
                <div className="pt-8 pb-32">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                            "flex w-full mb-8",
                            msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn("flex gap-4 max-w-[95%] md:max-w-[85%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                            
                            {/* Avatar */}
                            <div className="flex-shrink-0 mt-1">
                                {msg.role === "ai" ? (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-white shadow-sm ring-1 ring-blue-50 p-1 flex items-center justify-center overflow-hidden">
                                        <Image 
                                            src="/zigagent-brain.png" 
                                            alt="AI" 
                                            width={40} 
                                            height={40} 
                                            className="object-cover scale-110"
                                        />
                                    </div>
                                ) : (
                                    <Avatar className="w-10 h-10 ring-2 ring-white shadow-sm">
                                        <AvatarImage src={user?.avatarUrl || user?.profile?.avatar_url || "/placeholder-user.jpg"} className="object-cover"/>
                                        <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                                            {user?.profile?.first_name?.charAt(0) || user?.initials?.charAt(0) || "ME"}
                                        </AvatarFallback>
                                    </Avatar>
                                )} 
                            </div>

                            {/* Message Bubble */}
                            <div className="group relative">
                                <div
                                    className={cn(
                                    "px-6 py-4 text-[15px] md:text-[16px] leading-relaxed shadow-sm",
                                    msg.role === "user" 
                                        ? "bg-blue-600 text-white rounded-[24px] rounded-tr-md shadow-blue-200" 
                                        : "bg-white border border-gray-100 text-gray-800 rounded-[24px] rounded-tl-md shadow-sm"
                                    )}
                                >
                                    {msg.role === "ai" ? (
                                      <div className="prose prose-sm max-w-none
                                          prose-headings:font-bold prose-headings:text-gray-900
                                          prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                                          prose-p:text-gray-800 prose-p:leading-relaxed prose-p:my-2
                                          prose-strong:text-gray-900 prose-strong:font-semibold
                                          prose-em:text-gray-700
                                          prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
                                          prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4
                                          prose-li:text-gray-800 prose-li:my-1
                                          prose-code:bg-gray-100 prose-code:text-blue-600 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                                          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700
                                          prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-700
                                          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            // Custom rendering for code blocks
                                            code: ({node, inline, className, children, ...props}: any) => {
                                              return inline ? (
                                                <code className="bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                                  {children}
                                                </code>
                                              ) : (
                                                <code className={className} {...props}>
                                                  {children}
                                                </code>
                                              );
                                            },
                                            // Make links open in new tab
                                            a: ({node, children, href, ...props}: any) => (
                                              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                                                {children}
                                              </a>
                                            ),
                                          }}
                                        >
                                          {msg.content}
                                        </ReactMarkdown>
                                      </div>
                                    ) : (
                                      <span>{msg.content}</span>
                                    )}
                                </div>

                                {/* AI Actions */}
                                {msg.role === "ai" && (
                                    <div className="flex items-center gap-3 mt-2 pl-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Copy">
                                            <Copy size={15} />
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Regenerate">
                                            <RefreshCw size={15} />
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
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-white shadow-sm ring-1 ring-blue-50 p-1 flex items-center justify-center overflow-hidden">
                                            <Image 
                                                src="/zigagent-brain.png" 
                                                alt="AI" 
                                                width={40} 
                                                height={40} 
                                                className="object-cover scale-110 animate-pulse"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 h-10 pl-1">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </AnimatePresence>
                </div>
            </div>
        )}

        {/* --- Hero / Input Section --- */}
        <div className={cn(
            "ease-[cubic-bezier(0.25,0.1,0.25,1)] duration-700 flex flex-col items-center justify-center transition-all",
             hasStarted 
                ? "absolute bottom-0 left-0 right-0 p-4 pb-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-12" 
                : "flex-1 pb-[15vh]"
        )}>
             {!hasStarted && (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-10 text-center px-4 flex flex-col items-center"
                 >
                    {/* User Avatar in Hero */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 relative"
                    >
                         <Avatar className="w-20 h-20 ring-4 ring-white shadow-xl">
                            <AvatarImage src={user?.avatarUrl || user?.profile?.avatar_url || "/placeholder-user.jpg"} className="object-cover"/>
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                                {user?.first_name?.charAt(0) || "ME"}
                            </AvatarFallback>
                        </Avatar>
                        
                        {/* Brain Badge */}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full p-1 shadow-md flex items-center justify-center">
                            <BrainCircuit size={18} className="text-blue-600" />
                        </div>
                    </motion.div>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        {greeting}, <span className="text-blue-600">{user?.profile?.first_name || user?.name || "Agent"}</span>.
                    </h2>
                    <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
                        Ready to unlock new research opportunities today?
                    </p>
                 </motion.div>
             )}

             <motion.div 
                layout 
                className={cn(
                    "relative w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                    // Mobile: 94% width. Desktop: standard max-width.
                    hasStarted ? "max-w-3xl mb-4 md:mb-6" : "w-[94%] md:max-w-xl lg:max-w-2xl"
                )}
             >
                    {/* Tool Menu Popover - Moved outside to avoid overflow clipping */}
                    <AnimatePresence>
                         {isToolsOpen && (
                             <motion.div
                                ref={toolsMenuRef}
                                initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute bottom-full left-0 mb-3 w-[280px] bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-blue-900/10 p-1.5 z-50 overflow-hidden transform origin-bottom-left"
                             >
                                <div className="space-y-0.5">
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group/item" onClick={() => handleToolSelect("Upload CV/Resume")}>
                                        <div className="text-blue-500"><Plus size={18} /></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700">Add CV or Transcript</span>
                                        </div>
                                    </button>
                                     
                                    <div className="h-px bg-gray-100 my-1 mx-2" />

                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group/item" onClick={() => handleToolSelect("Opportunity Finder")}>
                                         <div className="text-emerald-500"><Briefcase size={18} /></div>
                                         <span className="text-sm font-medium text-gray-700">Opportunity Finder</span>
                                    </button>

                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group/item" onClick={() => handleToolSelect("Deep Research")}>
                                         <div className="text-violet-500"><Globe size={18} /></div>
                                         <span className="text-sm font-medium text-gray-700">Deep Research</span>
                                    </button>
                                    
                                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group/item" onClick={() => handleToolSelect("Project Review")}>
                                         <div className="text-amber-500"><Zap size={18} /></div>
                                         <span className="text-sm font-medium text-gray-700">Project Review</span>
                                    </button>

                                     <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group/item" onClick={() => handleToolSelect("Scholarship Search")}>
                                         <div className="text-pink-500"><Lightbulb size={18} /></div>
                                         <span className="text-sm font-medium text-gray-700">Scholarship Search</span>
                                    </button>

                                    <div className="h-px bg-gray-100 my-1 mx-2" />

                                    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group/item">
                                         <div className="flex items-center gap-3">
                                            <div className="text-gray-400"><BrainCircuit size={18} /></div>
                                            <span className="text-sm font-medium text-gray-700">More tools</span>
                                         </div>
                                         <ChevronRight size={14} className="text-gray-400" />
                                    </button>
                                </div>
                             </motion.div>
                         )}
                    </AnimatePresence>

                <div className={cn(
                    "relative group rounded-[32px] transition-all duration-300 flex items-end overflow-hidden border",
                    "bg-white hover:border-blue-300/50", 
                    hasStarted ? "shadow-2xl shadow-blue-900/5 border-gray-200" : "shadow-xl shadow-gray-200/50 border-gray-100"
                )}>

                    {/* Input Inner Wrapper */}
                    <div className="flex items-end flex-1 pl-3 pr-3 py-3 gap-3">
                         
                         {/* Tools Button */}
                         <button 
                            className={cn(
                                "flex-shrink-0 mb-1.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                                isToolsOpen ? "bg-gray-100 text-gray-900 rotate-45" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            )}
                            onClick={() => setIsToolsOpen(!isToolsOpen)}
                            title="Tools"
                         >
                            <Plus size={22} strokeWidth={2.5} />
                         </button>

                         {/* Input Field & Selected Tool Badge */}
                         <div className="flex-1 flex flex-col justify-center min-w-0">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={inputValue}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 px-0 py-2.5 text-[17px] leading-[1.6] resize-none max-h-[200px] min-h-[52px] scrollbar-none font-medium"
                                style={{ boxShadow: 'none' }} // Force no shadow
                            />
                            
                            {selectedTool && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 self-start bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md mb-1.5"
                                >
                                    <span className="text-xs font-semibold">Using {selectedTool}</span>
                                    <button 
                                        onClick={() => setSelectedTool(null)}
                                        className="hover:text-blue-900 transition-colors"
                                    >
                                        <Plus size={14} className="rotate-45" />
                                    </button>
                                </motion.div>
                            )}
                         </div>

                        {/* Send / Mic Button */}
                        <div className="pb-1.5 flex gap-2">
                             {inputValue.trim() || selectedTool ? (
                                <motion.button 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    onClick={handleSendMessage}
                                    className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg shadow-blue-600/20"
                                >
                                    <ArrowUp size={20} className="stroke-[2.5px]" />
                                </motion.button>
                             ) : (
                                <button className="p-2.5 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                    <Mic size={22} strokeWidth={2} />
                                </button>
                             )}
                        </div>
                    </div>
                </div>
            </motion.div>
             
             {/* suggestion chips - only show in hero state */}
             {!hasStarted && (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex mt-8 gap-3 flex-wrap justify-center w-full px-4"
                 >
                    {[
                        { icon: Search, text: "Find research opportunities" },
                        { icon: Briefcase, text: "Explore career paths" },
                        { icon: Lightbulb, text: "Draft a project proposal" }
                    ].map((item) => (
                        <button 
                            key={item.text}
                            onClick={() => { setInputValue(item.text); }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all duration-200 border border-gray-100 shadow-sm"
                        >
                            <item.icon size={14} className="opacity-70" />
                            {item.text}
                        </button>
                    ))}
                 </motion.div>
             )}
        </div>
      </div>
    </div>
  );
}
