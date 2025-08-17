"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { History, Wrench, Send, Sparkles, User, Loader2, Phone, Brain } from "lucide-react";
import React from "react";
import Image from "next/image";
import SmartApplyArtifact from "@/components/SmartApplyArtifacts";
// ✨ NEW: Import the artifact component
// import SmartApplyArtifact from "@/components/SmartApplyArtifact"; 

// The tool configuration now includes pricing and subscription status
const initialTools = [
  { id: "smartapply", name: "SmartApply", icon: "🎯", isPro: true, description: "AI-powered application optimization that tailors your resume and cover letter for each specific internship, increasing your chances by 3x.", price: 2000, currency: "XAF", billingCycle: "monthly" },
  { id: "jobguru", name: "JobGuru", icon: "💼", isPro: true, description: "Advanced company insights and interview preparation with real-time market data, salary insights, and personalized coaching.", price: 5000, currency: "XAF", billingCycle: "monthly" },
];

const quickPrompts = [
  "Find tech internships in Bamenda",
  "Help me write an application letter",
];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UserProfile {
  name: string;
  university: string;
  skills: string[];
}

interface ThinkingState {
  isThinking: boolean;
  currentStep: number;
  totalSteps: number;
  currentMessage: string;
  steps: string[];
}

// Helper functions for time-based greetings
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 22) return "Good evening";
  return "Good night";
};

const getTimeEmoji = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅";
  if (hour >= 12 && hour < 17) return "☀️";
  if (hour >= 17 && hour < 22) return "🌆";
  return "🌙";
};

export default function FuproAiPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [timeEmoji, setTimeEmoji] = useState("");
  const [userName, setUserName] = useState("Gita"); // Hardcoded for now
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  
  const [thinkingState, setThinkingState] = useState<ThinkingState>({
    isThinking: false, currentStep: 0, totalSteps: 0, currentMessage: "", steps: []
  });
  
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribedToolIds, setSubscribedToolIds] = useState<string[]>([]);
  const [tools, setTools] = useState(initialTools);
  const [selectedProTool, setSelectedProTool] = useState<(typeof initialTools[0]) | null>(null);

  // ✨ NEW: State for the SmartApply Artifact
  const [showArtifact, setShowArtifact] = useState(false);
  const [artifactContent, setArtifactContent] = useState({ title: '', content: '' });
  const [isGeneratingArtifact, setIsGeneratingArtifact] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, thinkingState]);

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    setTimeEmoji(getTimeEmoji());
    
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello! I'm your Bamenda Internship Connect assistant. I'm here to help you find personalized internship opportunities in Bamenda, Cameroon.\n\nI can help you with:\n- Finding internships that match your skills\n- Discovering companies in Bamenda\n- Tailoring opportunities to your background\n- Providing direct application links\n\nWhat kind of internship are you looking for today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
      setTimeEmoji(getTimeEmoji());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const streamResponse = (text: string) => {
    setIsStreaming(true);
    setStreamingMessage("");
    const words = text.split(' ');
    let wordIndex = 0;
    const streamInterval = setInterval(() => {
      if (wordIndex < words.length) {
        setStreamingMessage(prev => prev + (wordIndex > 0 ? ' ' : '') + words[wordIndex]);
        wordIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        const assistantMessage: ChatMessage = { role: 'assistant', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, assistantMessage]);
        setStreamingMessage("");
      }
    }, 100);
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading || isGeneratingArtifact) return;

    const userMessage: ChatMessage = { role: 'user', content: message, timestamp: new Date() };

    // ✨ MODIFICATION: SmartApply tool logic is now handled here
    if (selectedTool === 'smartapply' && subscribedToolIds.includes('smartapply')) {
        const companyName = message.trim();
        setMessage("");
        
        setShowArtifact(true);
        setIsGeneratingArtifact(true);
        setArtifactContent({ title: `Application for ${companyName}`, content: '' });

        const thinkingMessage: ChatMessage = { role: 'assistant', content: `Creating a professional draft for **${companyName}**...`, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage, thinkingMessage]);

        try {
            const response = await fetch('/api/smartApply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    companyName, 
                    userProfile: { name: userName, university: "University of Bamenda", skills: ["React", "Node.js", "Team Collaboration"] }
                }),
            });

            if (!response.ok) throw new Error("Failed to generate application.");
            
            const data = await response.json();
            setArtifactContent(prev => ({ ...prev, content: data.coverLetterText }));
        } catch (error) {
            console.error(error);
            setArtifactContent(prev => ({ ...prev, content: "Sorry, I couldn't generate the draft. Please try again." }));
        } finally {
            setIsGeneratingArtifact(false);
            setSelectedTool(null); // Reset the tool after use
        }
        return;
    }

    // Original chat logic continues here
    const historyForApi = messages.slice(1).map(msg => ({ 
      role: msg.role === 'user' ? 'user' as const : 'model' as const, 
      parts: [{ text: msg.content }] 
    }));
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = message;
    setMessage("");
    setIsLoading(true);
    
    setThinkingState({ isThinking: false, currentStep: 0, totalSteps: 0, currentMessage: "", steps: [] });
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const response = await fetch('/api/fupro-ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ query: currentInput, history: historyForApi }),
      });

      if (!response.ok) throw new Error('Failed to get a response.');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              setThinkingState(prev => ({ ...prev, isThinking: false }));
              break;
            }
            try {
              const parsed = JSON.parse(data);
              switch (parsed.type) {
                case 'thinking_start':
                  setThinkingState({ isThinking: true, currentStep: 0, totalSteps: parsed.steps.length, currentMessage: parsed.steps[0] || "Starting...", steps: parsed.steps });
                  break;
                case 'thinking_step':
                  setThinkingState(prev => ({ ...prev, currentStep: parsed.step, currentMessage: parsed.message }));
                  break;
                case 'thinking_complete':
                  setThinkingState(prev => ({ ...prev, currentMessage: parsed.message }));
                  break;
                case 'response':
                  setThinkingState(prev => ({ ...prev, isThinking: false }));
                  if (parsed.userProfile && !userProfile) setUserProfile(parsed.userProfile);
                  setIsLoading(false);
                  streamResponse(parsed.answer);
                  break;
                case 'error':
                  setIsLoading(false);
                  setThinkingState(prev => ({ ...prev, isThinking: false }));
                  const errorMessage: ChatMessage = { role: 'assistant', content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() };
                  setMessages(prev => [...prev, errorMessage]);
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setThinkingState(prev => ({ ...prev, isThinking: false }));
      const errorMessage: ChatMessage = { role: 'assistant', content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleUpgradeClick = () => {
    setShowProModal(false);
    setShowPhoneModal(true);
  };

  const handleSubscribe = () => {
    if (!phoneNumber.trim() || !selectedProTool) return;
    setIsSubscribing(true);
    
    setTimeout(() => {
      setIsSubscribing(false);
      const toolId = selectedProTool.id;
      setSubscribedToolIds(prev => [...prev, toolId]);
      setShowPhoneModal(false);
      setPhoneNumber("");
      
      if (toolId === 'smartapply') {
        setSelectedTool('smartapply');
        const smartApplyPrompt: ChatMessage = {
          role: 'assistant',
          content: "Excellent! **SmartApply is now active.**\n\nJust type the name of the company you want to apply for, and I'll generate a professional draft for you.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, smartApplyPrompt]);
        textareaRef.current?.focus();
      } else {
        setSelectedTool(toolId);
      }
    }, 2500);
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  };

  const handleHistoryClick = (item: string) => {
    setMessage(item);
    setShowHistory(false);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const recentHistory = messages.filter(msg => msg.role === 'user').slice(-5).map(msg => msg.content).reverse();
  const hasMessages = messages.length > 1;

  const ThinkingComponent = () => {
    if (!thinkingState.isThinking) return null;
    const progress = thinkingState.totalSteps > 0 ? ((thinkingState.currentStep + 1) / thinkingState.totalSteps) * 100 : 0;
    return (
      <div className="flex gap-3 justify-start animate-fade-in">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="w-full max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 border border-blue-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex space-x-1"><div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div><div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div></div>
            <span className="text-sm font-semibold text-blue-900">Wait a deh find am..</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-3 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out relative" style={{ width: `${progress}%` }}><div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div></div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
            <span className="text-lg">{thinkingState.currentMessage.split(' ')[0]}</span>
            <span>{thinkingState.currentMessage.substring(thinkingState.currentMessage.indexOf(' ') + 1)}</span>
          </div>
          <div className="flex items-center justify-between"><div className="text-xs text-blue-600 font-medium">Step {thinkingState.currentStep + 1} of {thinkingState.totalSteps}</div><div className="text-xs text-blue-500">{Math.round(progress)}% complete</div></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-row h-[70vh] bg-white relative overflow-hidden">
        {/* Main Chat Panel */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ${showArtifact || showHistory ? 'mr-0 lg:mr-[32rem]' : 'mr-0'}`}>
            <button
                onClick={() => setShowHistory(!showHistory)}
                className={`fixed top-[5rem] right-4 z-20 p-3 rounded-full shadow-lg transition-all duration-200 ${showHistory ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'} lg:top-[6rem] lg:right-6 ${recentHistory.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={recentHistory.length === 0}
            >
                <History className="w-5 h-5" />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!hasMessages ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 h-full">
                <div className="text-center max-w-md mb-6 sm:mb-8">
                  <div className="mb-4">
                    <h2 className="text-4xl sm:text-4xl font-semibold text-gray-900 mb-1">{greeting} {userName}! {timeEmoji}</h2>
                    <p className="text-base sm:text-lg text-gray-700 mb-2">Welcome to FuproAI</p>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">Your intelligent assistant for finding internships in Bamenda. Ask me anything or try one of these prompts.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-2">
                  {quickPrompts.map((prompt, index) => (
                    <button key={index} onClick={() => handlePromptClick(prompt)} className="p-3 sm:p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors group">
                      <div className="flex items-start gap-3"><div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center text-sm flex-shrink-0">💡</div><div className="flex-1"><p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{prompt}</p></div></div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Image src="/ai.png" alt="FuproAI Assistant" className="rounded-full" width={32} height={32} /></div>)}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-900'}`}>
                        <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">$1</a>') }} />
                        <div className="text-xs opacity-70 mt-2">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {msg.role === 'user' && (<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-white" /></div>)}
                    </div>
                  ))}
                  <ThinkingComponent />
                  {isStreaming && streamingMessage && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Image src="/ai.png" alt="FuproAI Assistant" className="rounded-full" width={32} height={32} /></div>
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900"><div className="text-sm leading-relaxed">{streamingMessage}<span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse rounded-sm"></span></div></div>
                    </div>
                  )}
                  {isLoading && !isStreaming && !thinkingState.isThinking && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Image src="/ai.png" alt="FuproAI Assistant" className="rounded-full" width={32} height={32} /></div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3"><div className="flex items-center gap-2"><div className="flex space-x-1"><div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div><div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div></div><span className="text-sm text-gray-600">Processing...</span></div></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-100 bg-white">
                <div className="max-w-4xl mx-auto">
                    {selectedTool && (
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Using tool:</span>
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                        <span>{tools.find(t => t.id === selectedTool)?.icon}</span>
                        <span>{tools.find(t => t.id === selectedTool)?.name}</span>
                        <button onClick={() => setSelectedTool(null)} className="ml-1 text-blue-400 hover:text-blue-600">×</button>
                        </div>
                    </div>
                    )}
                    <div className="relative">
                        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-2 sm:p-3 border border-gray-200 focus-within:border-blue-300 focus-within:bg-white transition-all">
                            <div className="relative">
                            <button onClick={() => setShowTools(!showTools)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors flex-shrink-0" disabled={isLoading || isStreaming || thinkingState.isThinking || isGeneratingArtifact}>
                                <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            {showTools && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[140px] z-10">
                                {tools.map((tool) => {
                                    const isSubscribed = subscribedToolIds.includes(tool.id);
                                    return (
                                    <button key={tool.id} onClick={() => { if (tool.isPro && !isSubscribed) { setSelectedProTool(tool); setShowProModal(true); } else { setSelectedTool(tool.id); } setShowTools(false); }} className="w-full cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors relative">
                                        <span>{tool.icon}</span>
                                        <span className="text-sm text-gray-700">{tool.name}</span>
                                        {tool.isPro && !isSubscribed && (
                                        <div className="ml-auto flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                                            <span className="text-xs font-medium text-transparent bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text">PRO</span>
                                        </div>
                                        )}
                                    </button>
                                    );
                                })}
                                </div>
                            )}
                            </div>
                            <textarea ref={textareaRef} value={message} onChange={handleTextareaChange} onKeyDown={handleKeyPress} placeholder={selectedTool === 'smartapply' ? "Enter company name..." : "Ask me about internships..."} className="flex-1 bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500 max-h-[120px] min-h-[40px] text-sm sm:text-base" rows={1} disabled={isLoading || isStreaming || thinkingState.isThinking || isGeneratingArtifact} />
                            <button onClick={handleSend} disabled={!message.trim() || isLoading || isStreaming || thinkingState.isThinking || isGeneratingArtifact} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 transform hover:scale-105 active:scale-95">
                                {isLoading || isStreaming || thinkingState.isThinking || isGeneratingArtifact ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                        </div>
                    </div>
                    {hasMessages && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {['Ask about requirements', 'Application tips', 'Company info'].map((suggestion) => (
                        <button key={suggestion} onClick={() => setMessage(suggestion)} disabled={isLoading || isStreaming || thinkingState.isThinking || isGeneratingArtifact} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {suggestion}
                        </button>
                        ))}
                    </div>
                    )}
                    <p className="text-xs text-gray-400 text-center mt-2">FuproAI can make mistakes. Consider checking important information.</p>
                </div>
            </div>
        </div>

        {/* Sidebar Panels */}
        <div className="absolute top-0 right-0 h-full w-full max-w-lg z-40">
            {showArtifact && (
                <SmartApplyArtifact
                    title={artifactContent.title}
                    initialContent={artifactContent.content}
                    isGenerating={isGeneratingArtifact}
                    onClose={() => setShowArtifact(false)}
                    onSend={(finalContent) => {
                        const sentMessage: ChatMessage = {
                            role: 'assistant',
                            content: `Great! Your application for **${artifactContent.title.replace('Application for ', '')}** has been sent.`,
                            timestamp: new Date()
                        };
                        setMessages(prev => [...prev, sentMessage]);
                    }}
                />
            )}
            {showHistory && (
                <div className="h-full bg-white border-l border-gray-200 shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900">Recent Conversations</h3>
                        <button onClick={() => setShowHistory(false)} className="p-1 text-gray-400 hover:text-gray-600">×</button>
                    </div>
                    <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar flex-grow">
                        {recentHistory.length > 0 ? recentHistory.map((item, index) => (
                            <button key={index} onClick={() => handleHistoryClick(item)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-700">
                                <div className="truncate">{item}</div>
                            </button>
                        )) : (
                            <div className="text-center text-gray-500 text-sm mt-8">
                                <Image src="/ai.png" alt="FuproAI Assistant" className="w-8 h-8 mx-auto mb-2" width={32} height={32} />
                                <p>No recent history yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
        
        {/* Modals */}
        {showProModal && selectedProTool && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full transform p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-blue-600"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock {selectedProTool.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{selectedProTool.description}</p>
                    <div className="my-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-2xl font-bold text-blue-900">{selectedProTool.price} {selectedProTool.currency}</p>
                        <p className="text-xs text-blue-700 uppercase">{selectedProTool.billingCycle}</p>
                    </div>
                    <button onClick={handleUpgradeClick} className="w-full cursor-pointer bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 active:scale-95">
                        Subscribe Now
                    </button>
                    <button onClick={() => setShowProModal(false)} className="mt-3 cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        Maybe later
                    </button>
                </div>
            </div>
        )}

        {showPhoneModal && selectedProTool && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                    <div className="text-center mb-4">
                        <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                            <Phone className="w-6 h-6 text-blue-600"/>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Confirm Subscription</h3>
                        <p className="text-sm text-gray-500">Enter your phone number to subscribe to <span className="font-bold">{selectedProTool.name}</span>.</p>
                    </div>
                    <div className="relative mb-4">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">+237</span>
                        <input 
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="670 000 000"
                            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button 
                        onClick={handleSubscribe} 
                        disabled={isSubscribing || phoneNumber.length < 9}
                        className="w-full cursor-pointer bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
                    >
                        {isSubscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Subscribe for ${selectedProTool.price} ${selectedProTool.currency}`}
                    </button>
                    <button onClick={() => setShowPhoneModal(false)} className="mt-2 w-full text-center text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}