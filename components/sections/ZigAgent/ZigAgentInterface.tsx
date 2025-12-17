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
  X,
  StopCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/app/types/type";
import Image from "next/image";
import { TypingText } from "./ui/TypingText";
import { AgentLoader } from "./ui/AgentLoader";
import { ToolCommandDock } from "./ui/ToolCommandDock";
// @ts-ignore
import { ArtifactPanel } from "./ui/ArtifactPanel";

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
  const [loadingTool, setLoadingTool] = useState<string | null>(null);
  
  // Artifact Statex
  const [activeArtifact, setActiveArtifact] = useState<any | null>(null);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(0); // Track panel width for responsive chat

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

  // Stop response generation
  const handleStopResponse = () => {
    setIsThinking(false);
    setLoadingTool(null);
    // Add a system message indicating response was stopped
    const stopMsg: Message = {
      id: Date.now().toString(),
      role: "ai",
      content: "_Response stopped by user._",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, stopMsg]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedTool) return;

    if (!hasStarted) setHasStarted(true);

    const activeTool = selectedTool; // Capture current tool
    setLoadingTool(activeTool); // Set for loading state

    const fullContent = activeTool ? `Using ${activeTool}: ${inputValue}` : inputValue;
    const userMessage = inputValue; // Store before clearing

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: fullContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    // DON'T clear selectedTool - keep it persistent
    // setSelectedTool(null); // REMOVED - tool stays selected
    setIsThinking(true);
    
    // Open panel immediately if tool is selected
    if (activeTool) {
      setActiveArtifact({
        type: "general_content",
        title: `${activeTool} - Discovering...`,
        data: { loading: true, message: userMessage }
      });
      setIsArtifactOpen(true);
    }

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }));

      const aiMessageId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMessageId,
        role: "ai",
        content: "",
        timestamp: new Date(),
      };

      let response;
      const backendUrl = "http://127.0.0.1:8000/api/agent";
      const userId = user?.id || "user123";

      const toolPayload = {
          user_id: userId,
          query: userMessage,
          topic: userMessage, // For deep research
          description: userMessage, // For project review
          context: { history: conversationHistory }
      };

      if (activeTool === "Deep Research") {
          response = await fetch(`${backendUrl}/tools/deep-research`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...toolPayload, depth: 2 }),
          });
      } else if (activeTool === "Opportunity Finder") {
           response = await fetch(`${backendUrl}/tools/opportunity-finder`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify(toolPayload),
          });
      } else if (activeTool === "Project Review") {
           response = await fetch(`${backendUrl}/tools/project-review`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify(toolPayload),
          });
      } else if (activeTool === "Scholarship Search") {
           response = await fetch(`${backendUrl}/tools/scholarship-search`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify(toolPayload),
          });
      } else {
           response = await fetch(`${backendUrl}/chat`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  message: userMessage,
                  user_id: userId,
                  tool: activeTool 
              }),
          });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Backend error");
      }

      const aiContent = data.content || "I couldn't generate a response.";
      
      setMessages((prev) => [...prev, { ...aiMsg, content: aiContent }]);
      
      // Handle Artifact Data
      if (data.artifact_data) {
          setActiveArtifact(data.artifact_data);
          setIsArtifactOpen(true);
      } else if (activeTool) {
          // Tool was used but no artifact data - close panel
          setIsArtifactOpen(false);
      }

      setIsThinking(false);
      setLoadingTool(null);

    } catch (error: any) {
      console.error('Error sending message:', error);
      setIsThinking(false);
      setLoadingTool(null);
      
      const errorMessage = error?.message || "Unknown error";

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `I apologize, but I encountered an error connecting to my brain. Details: ${errorMessage}. Please try again.`,
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
    
    // For Upload CV tool, open panel immediately with upload interface
    if (toolName === "Upload CV") {
      setActiveArtifact({
        type: "cv_upload",
        title: "CV Upload & Editor",
        data: { ready: true }
      });
      setIsArtifactOpen(true);
    }
    
    if(textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div className="flex bg-white h-full relative isolate z-0 overflow-hidden">
        {/* Main Chat Area */}
        <div 
          className="flex-1 flex flex-col h-full transition-all duration-300 relative"
          style={{ 
            marginRight: isArtifactOpen && panelWidth > 0 ? `${panelWidth}px` : '0px',
            maxWidth: isArtifactOpen && panelWidth > 0 ? `calc(100% - ${panelWidth}px)` : '100%'
          }}
        >
          {/* Background Gradients */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none -z-10" />

          {/* Header - Minimalist */}
          <header className="flex-none flex items-center justify-between px-6 py-4 z-20 sticky top-0">
            <div className="flex items-center gap-2">
                 {/* Only show logo if started, but clean, no text */}
                 {hasStarted && (
                     <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] shadow-sm">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <BrainCircuit size={18} className="text-blue-600" />
                            </div>
                         </div>
                     </motion.div>
                 )}
            </div>
            
            <div className="flex items-center gap-4">
                {/* Real Time Toggle */}
                <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setIsRealTime(!isRealTime)}>
                     <span className={cn("text-xs font-medium transition-colors duration-300", isRealTime ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500")}>
                        Fast Mode
                    </span>
                    <div className={cn("w-9 h-5 rounded-full relative transition-colors duration-300 border", isRealTime ? "bg-blue-600 border-blue-600" : "bg-gray-100 border-gray-200")}>
                        <div className={cn("absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full shadow-sm transition-all duration-300 bg-white", isRealTime ? "translate-x-4" : "translate-x-0")} />
                    </div>
                </div>
            </div>
          </header>

          {/* Chat Content */}
          <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
             
             {/* Chat Messages */}
            {hasStarted && (
                 <div 
                    className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 sm:px-6 pb-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-200/50 transition-colors"
                    ref={scrollRef}
                >
                    <div className="pt-8 pb-32">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("flex w-full mb-8", msg.role === "user" ? "justify-end" : "justify-start")}
                            >
                                <div className={cn("flex gap-4 max-w-[95%] md:max-w-[85%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                                    <div className="flex-shrink-0 mt-1">
                                        {msg.role === "ai" ? (
                                            <div className="w-8 h-8 rounded-full bg-blue-50/50 border border-blue-100 flex items-center justify-center shadow-sm">
                                                <BrainCircuit size={16} className="text-blue-600" />
                                            </div>
                                        ) : (
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={user?.avatarUrl || user?.profile?.avatar_url} className="object-cover"/>
                                                <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">ME</AvatarFallback>
                                            </Avatar>
                                        )} 
                                    </div>

                                    <div className="group relative">
                                        <div className={cn("px-5 py-3.5 text-[15px] leading-relaxed shadow-sm", msg.role === "user" ? "bg-blue-600 text-white rounded-[20px] rounded-tr-md" : "bg-white border border-gray-100 text-gray-800 rounded-[20px] rounded-tl-md")}>
                                            {msg.role === "ai" ? <TypingText content={msg.content} /> : <span>{msg.content}</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            ))}

                            {isThinking && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full justify-start mb-6">
                                    <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-blue-50/50 border border-blue-100 flex items-center justify-center shadow-sm">
                                         <BrainCircuit size={16} className="text-blue-600 animate-pulse" />
                                    </div>
                                        <div className="flex items-center h-10 pl-1">
                                            <AgentLoader toolName={loadingTool} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className={cn(
                "ease-[cubic-bezier(0.25,0.1,0.25,1)] duration-700 flex flex-col items-center justify-center transition-all",
                 hasStarted ? "absolute bottom-0 left-0 right-0 p-4 pb-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-12" : "flex-1 pb-[15vh]"
            )}>
                 {!hasStarted && (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-10 text-center px-4 flex flex-col items-center">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6 relative">
                             <Avatar className="w-20 h-20 ring-4 ring-white shadow-xl">
                                <AvatarImage src={user?.avatarUrl || user?.profile?.avatar_url} className="object-cover"/>
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">{user?.first_name?.charAt(0) || "ME"}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full p-1.5 shadow-md flex items-center justify-center">
                                <BrainCircuit size={16} className="text-blue-600" />
                            </div>
                        </motion.div>

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                            {greeting}, <span className="text-blue-600">{user?.profile?.first_name || user?.name || "Friend"}</span>.
                        </h2>
                        <p className="text-gray-500 text-base max-w-lg mx-auto">
                            I'm ready to help you research, build, and explore.
                        </p>
                     </motion.div>
                 )}

                 <motion.div layout className={cn("relative w-full transition-all duration-700", hasStarted ? "max-w-3xl mb-4" : "w-[94%] md:max-w-xl")}>
                        <ToolCommandDock isOpen={isToolsOpen} onClose={() => setIsToolsOpen(false)} onSelect={handleToolSelect} />

                    <div className={cn("relative group rounded-[26px] transition-all duration-300 flex items-end overflow-hidden border bg-white hover:border-blue-300/50", hasStarted ? "shadow-2xl shadow-blue-900/5 border-gray-200" : "shadow-xl shadow-gray-200/50 border-gray-100")}>
                        <div className="flex items-end flex-1 pl-3 pr-3 py-3 gap-3">
                             <button className={cn("flex-shrink-0 mb-1.5 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600", isToolsOpen ? "rotate-45 bg-gray-100 text-gray-900" : "")} onClick={() => setIsToolsOpen(!isToolsOpen)} title="Tools">
                                <Plus size={20} strokeWidth={2.5} />
                             </button>

                             <div className="flex-1 flex flex-col justify-center min-w-0">
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={inputValue}
                                    onChange={handleInput}
                                    onKeyDown={handleKeyDown}
                                    disabled={isThinking}
                                    placeholder={selectedTool ? `Enter details for ${selectedTool}...` : "Type a message..."}
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 px-0 py-2.5 text-[16px] resize-none max-h-[200px] min-h-[50px] scrollbar-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {selectedTool && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: -5 }} 
                                      animate={{ opacity: 1, y: 0 }} 
                                      className="flex items-center gap-2 self-start mb-1.5"
                                    >
                                      <button
                                        onClick={() => setIsArtifactOpen(!isArtifactOpen)}
                                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                                        title="Click to toggle panel"
                                      >
                                        <span className="text-xs font-semibold">{selectedTool}</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedTool(null);
                                          setIsArtifactOpen(false);
                                          setActiveArtifact(null);
                                        }}
                                        className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-colors"
                                        title="Remove tool"
                                      >
                                        <X size={14} />
                                      </button>
                                    </motion.div>
                                )}
                             </div>

                            <div className="pb-1.5 flex gap-2">
                                 {isThinking ? (
                                    <motion.button 
                                      initial={{ scale: 0.8, opacity: 0 }} 
                                      animate={{ scale: 1, opacity: 1 }} 
                                      onClick={handleStopResponse} 
                                      className="p-2.5 bg-red-500 text-white hover:bg-red-600 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg shadow-red-500/20"
                                      title="Stop response"
                                    >
                                        <StopCircle size={18} className="stroke-[3px]" />
                                    </motion.button>
                                 ) : inputValue.trim() || selectedTool ? (
                                    <motion.button 
                                      initial={{ scale: 0.8, opacity: 0 }} 
                                      animate={{ scale: 1, opacity: 1 }} 
                                      onClick={handleSendMessage} 
                                      className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-full transition-all duration-200 flex items-center justify-center shadow-lg shadow-blue-600/20"
                                    >
                                        <ArrowUp size={18} className="stroke-[3px]" />
                                    </motion.button>
                                 ) : (
                                    <button className="p-2.5 rounded-full bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Mic size={20} strokeWidth={2} />
                                    </button>
                                 )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
          </div>
        </div>

        {/* Artifact Panel - Slide Out */}
        <ArtifactPanel 
          isOpen={isArtifactOpen} 
          onClose={() => setIsArtifactOpen(false)} 
          artifact={activeArtifact}
          onWidthChange={setPanelWidth}
        />
    </div>
  );
}
