"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { History, Wrench, Send, Sparkles, User, Loader2, Phone } from "lucide-react";
import React from "react";
import Image from "next/image";

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
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  
  // States for the subscription simulation
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribedToolIds, setSubscribedToolIds] = useState<string[]>([]);
  const [tools, setTools] = useState(initialTools);
  const [selectedProTool, setSelectedProTool] = useState<(typeof initialTools[0]) | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    setTimeEmoji(getTimeEmoji());
    setUserName("Gita");
    
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello! I'm your Bamenda Internship Connect assistant. I'm here to help you find personalized internship opportunities in Bamenda, Cameroon.

I can help you with:
- Finding internships that match your skills
- Discovering companies in Bamenda
- Tailoring opportunities to your background
- Providing direct application links

What kind of internship are you looking for today?`,
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
    if (!message.trim() || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', content: message, timestamp: new Date() };
    const historyForApi = messages.slice(1).map(msg => ({ role: msg.role === 'user' ? 'user' as const : 'model' as const, parts: [{ text: msg.content }] }));
    setMessages(prev => [...prev, userMessage]);
    const currentInput = message;
    setMessage("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const response = await fetch('/api/fupro-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentInput, history: historyForApi }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get a response.');
      }
      const data = await response.json();
      if (data.userProfile && !userProfile) setUserProfile(data.userProfile);
      setIsLoading(false);
      streamResponse(data.answer);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
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
      setSubscribedToolIds(prev => [...prev, selectedProTool.id]);
      setShowPhoneModal(false);
      setPhoneNumber("");
      setSelectedTool(selectedProTool.id);
    }, 2500);
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleHistoryClick = (item: string) => {
    setMessage(item);
    setShowHistory(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const recentHistory = messages.filter(msg => msg.role === 'user').slice(-5).map(msg => msg.content).reverse();
  const hasMessages = messages.length > 1;

  return (
    <div className="flex flex-col h-screen bg-white relative overflow-hidden">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className={`fixed top-[5rem] right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-200 ${showHistory ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'} lg:top-[6rem] lg:right-6 ${recentHistory.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={recentHistory.length === 0}
      >
        <History className="w-5 h-5" />
      </button>

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${showHistory ? 'lg:mr-80' : ''}`}>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!hasMessages ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 h-full">
                <div className="text-center max-w-md mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                      {greeting} {userName}! {timeEmoji}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-700 mb-2">Welcome to FuproAI</p>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">
                    Your intelligent assistant for finding internships in Bamenda. Ask me anything or try one of these prompts.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-2">
                  {quickPrompts.map((prompt, index) => (
                    <button key={index} onClick={() => handlePromptClick(prompt)} className="p-3 sm:p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center text-sm flex-shrink-0">💡</div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{prompt}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Image src="/ai.png" alt="FuproAI Assistant" className="rounded-full" width={32} height={32} />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-900'}`}>
                        <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">$1</a>') }} />
                        <div className="text-xs opacity-70 mt-2">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isStreaming && streamingMessage && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                         <Image src="/ai.png" alt="FuproAI Assistant" className="rounded-full" width={32} height={32} />
                      </div>
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-900">
                        <div className="text-sm leading-relaxed">{streamingMessage}<span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse rounded-sm"></span></div>
                      </div>
                    </div>
                  )}
                  {isLoading && !isStreaming && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                         <Image src="/ai.png" alt="FuproAI Assistant" className="rounded-full" width={32} height={32} />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
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
              <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-2 sm:p-3 border border-blue-500 focus-within:border-blue-300 focus-within:bg-white transition-all">
                <div className="relative">
                  <button onClick={() => setShowTools(!showTools)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors flex-shrink-0" disabled={isLoading || isStreaming}>
                    <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  {showTools && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-blue-700 py-2 min-w-[140px] z-10">
                      {tools.map((tool) => {
                        const isSubscribed = subscribedToolIds.includes(tool.id);
                        return (
                          <button
                            key={tool.id}
                            onClick={() => {
                              if (tool.isPro && !isSubscribed) {
                                setSelectedProTool(tool);
                                setShowProModal(true);
                                setShowTools(false);
                              } else {
                                setSelectedTool(tool.id);
                                setShowTools(false);
                              }
                            }}
                            className="w-full cursor-pointer border-b border-blue-300 flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors relative"
                          >
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
                <textarea ref={textareaRef} value={message} onChange={handleTextareaChange} onKeyDown={handleKeyPress} placeholder={hasMessages ? "Ask follow-up questions..." : `${greeting} ${userName}! Ask me about internships...`} className="flex-1 bg-transparent border-nones outline-none resize-none text-gray-900 placeholder-gray-500 max-h-[120px] min-h-[40px] text-sm sm:text-base" rows={1} disabled={isLoading || isStreaming} />
                <button onClick={handleSend} disabled={!message.trim() || isLoading || isStreaming} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 transform hover:scale-105 active:scale-95">
                  {isLoading || isStreaming ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>
            {hasMessages && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {['Ask about requirements', 'Application tips', 'Company info'].map((suggestion) => (
                  <button key={suggestion} onClick={() => setMessage(suggestion)} disabled={isLoading || isStreaming} className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 text-center mt-2">FuproAI can make mistakes. Consider checking important information.</p>
          </div>
        </div>
      </div>

      {showHistory && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setShowHistory(false)} />
            <div className={`fixed lg:absolute top-0 right-0 h-full w-full sm:w-80 bg-white z-40 transform transition-transform duration-300 ${showHistory ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:border-l lg:border-gray-100 lg:bg-gray-50`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:justify-center">
                <h3 className="font-medium text-gray-900">Recent Conversations</h3>
                <button onClick={() => setShowHistory(false)} className="p-1 text-gray-400 hover:text-gray-600 lg:hidden">×</button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar" style={{ height: 'calc(100% - 73px)' }}>
                {recentHistory.length > 0 ? (
                  recentHistory.map((item, index) => (
                    <button key={index} onClick={() => handleHistoryClick(item)} className="w-full text-left p-3 rounded-lg hover:bg-white lg:hover:bg-gray-100 transition-colors text-sm text-gray-700 hover:text-gray-900 border border-transparent hover:border-gray-200">
                      <div className="truncate">{item}</div>
                    </button>
                  ))
                ) : (
                  <div className="text-center text-gray-500 text-sm mt-8">
                    <Image src="/ai.png" alt="FuproAI Assistant" className="w-8 h-8 mx-auto mb-2 opacity-50" width={32} height={32} />
                    <p>No conversations yet</p>
                    <p className="text-xs mt-1">Start chatting to see your history here</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      {showProModal && selectedProTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowProModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full transform transition-all duration-200 scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-4 pb-0">
              <button onClick={() => setShowProModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="px-6 pb-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-2xl">{selectedProTool.icon}</span></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedProTool.name}</h3>
                <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>PRO</div>
              </div>
              <p className="text-gray-600 text-center mb-6 leading-relaxed">{selectedProTool.description}</p>
              <div className="space-y-3">
                <button onClick={handleUpgradeClick} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                  Upgrade for {selectedProTool.price}{selectedProTool.currency}/{selectedProTool.billingCycle}
                </button>
                <button onClick={() => setShowProModal(false)} className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors">Continue with free version</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPhoneModal && selectedProTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 transform transition-all duration-300 animate-splash-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Complete Your Subscription</h3>
              <p className="text-sm text-gray-500 mt-2">Enter your phone number to activate the <span className="font-semibold text-gray-700">{selectedProTool.name}</span> tool.</p>
            </div>
            <div className="mt-6">
              <label htmlFor="phone" className="text-xs font-medium text-gray-600">Phone Number</label>
              <div className="relative mt-1">
                <input type="tel" id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g., 670 00 00 00" className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" disabled={isSubscribing} />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">+237</span>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={handleSubscribe} disabled={!phoneNumber.trim() || isSubscribing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-wait flex items-center justify-center">
                {isSubscribing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Subscribing...</>
                ) : (
                  `Subscribe (${selectedProTool.price}${selectedProTool.currency})`
                )}
              </button>
              <button onClick={() => setShowPhoneModal(false)} disabled={isSubscribing} className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors disabled:opacity-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}