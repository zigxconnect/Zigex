"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { 
  History, Wrench, Send, Sparkles, User, Loader2, Phone, 
  Square, Trash2, FileText, Eye, X 
} from "lucide-react";
import Image from "next/image";
import SmartApplyArtifact from "@/components/SmartApplyArtifacts"; // Ensure this component path is correct

// --- TYPE DEFINITIONS ---

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  artifact?: ArtifactData;
}

interface ArtifactData {
  id: string;
  title: string;
  content: string;
}

interface UserProfile {
  name: string;
  university: string;
  skills: string[];
}

// --- CONSTANTS ---

const initialTools = [
  { id: "smartapply", name: "SmartApply", icon: "🎯", isPro: true, description: "AI-powered application optimization that tailors your resume and cover letter...", price: 2000, currency: "XAF", billingCycle: "monthly" },
  { id: "jobguru", name: "JobGuru", icon: "💼", isPro: true, description: "Advanced company insights and interview preparation with real-time market data...", price: 5000, currency: "XAF", billingCycle: "monthly" },
];

const quickPrompts = [
  "Find tech internships in Bamenda",
  "Help me write an application letter",
];

// --- HELPER FUNCTIONS ---

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
};

const getTimeEmoji = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "🌅";
  if (hour >= 12 && hour < 17) return "☀️";
  return "🌆";
};


// --- MAIN PAGE COMPONENT ---

export default function FuproAiPage() {
  // --- STATE MANAGEMENT ---

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  
  const [userName, setUserName] = useState("Gita");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Tools & Pro Features
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showTools, setShowTools] = useState(false);
  const [subscribedToolIds, setSubscribedToolIds] = useState<string[]>([]);
  const [showProModal, setShowProModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedProTool, setSelectedProTool] = useState<(typeof initialTools[0]) | null>(null);

  // Side Panels & Artifacts
  const [showHistory, setShowHistory] = useState(false);
  const [showArtifact, setShowArtifact] = useState(false);
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [isGeneratingArtifact, setIsGeneratingArtifact] = useState(false);

  // History
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  // General UI
  const [greeting, setGreeting] = useState("");
  const [timeEmoji, setTimeEmoji] = useState("");
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isProcessing = isThinking || isStreaming || isGeneratingArtifact;
  const hasMessages = messages.length > 1;

  // --- EFFECTS ---

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, streamingMessage]);

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    setTimeEmoji(getTimeEmoji());
    
    const welcomeMessage: ChatMessage = {
      id: `msg-${Date.now()}`, role: 'assistant',
      content: "Hello! I'm your Bamenda Internship Connect assistant. How can I help you find your next opportunity today?",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    
    const savedHistory = localStorage.getItem('fupro-chat-history');
    if (savedHistory) setChatHistory(JSON.parse(savedHistory));
  }, []);

  // --- CORE LOGIC ---

  const saveToHistory = (userMessage: string) => {
    const newHistory = [userMessage, ...chatHistory.filter(h => h !== userMessage)].slice(0, 15);
    setChatHistory(newHistory);
    localStorage.setItem('fupro-chat-history', JSON.stringify(newHistory));
  };

  const streamResponse = (text: string) => {
    setIsStreaming(true);
    setStreamingMessage("");
    let accumulatedText = "";
    const words = text.split(' ');
    let wordIndex = 0;
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        accumulatedText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        setStreamingMessage(accumulatedText);
        wordIndex++;
      } else {
        clearInterval(interval);
        const finalMessage: ChatMessage = { id: `msg-final-${Date.now()}`, role: 'assistant', content: accumulatedText, timestamp: new Date() };
        setMessages(prev => [...prev, finalMessage]);
        setStreamingMessage("");
        setIsStreaming(false);
      }
    }, 50);
  };
  
  const handleSend = async () => {
    if (!message.trim() || isProcessing) return;

    const currentInput = message;
    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', content: currentInput, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMessage]);
    saveToHistory(currentInput);
    setMessage("");

    // --- SmartApply Tool Logic (uses mock API for now) ---
    if (selectedTool === 'smartapply' && subscribedToolIds.includes('smartapply')) {
        setIsGeneratingArtifact(true);
        const companyName = currentInput.trim();
        const newArtifact: ArtifactData = { id: `art-${Date.now()}`, title: `Draft for ${companyName}`, content: '' };
        setCurrentArtifact(newArtifact);
        setShowArtifact(true);
        
        try {
            // In a real app, you would fetch from your `/api/smartApply` endpoint.
            const response = await new Promise<any>(res => setTimeout(() => res({ coverLetterText: `This is a generated draft for ${companyName}...` }), 2000));
            const finalArtifact: ArtifactData = { ...newArtifact, content: response.coverLetterText };
            setCurrentArtifact(finalArtifact);
            setMessages(prev => [...prev, { id: `msg-art-${Date.now()}`, role: 'assistant', content: `Here is the draft for **${companyName}**.`, timestamp: new Date(), artifact: finalArtifact }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: "Sorry, I couldn't generate the draft.", timestamp: new Date() }]);
            setShowArtifact(false);
        } finally {
            setIsGeneratingArtifact(false);
            setSelectedTool(null);
        }
        return;
    }

    // --- REAL DATA FETCHING LOGIC ---
    setIsThinking(true);
    const controller = new AbortController();
    setAbortController(controller);

    const historyForApi = messages.slice(1).map(msg => ({ 
      role: msg.role === 'user' ? 'user' as const : 'model' as const, 
      parts: [{ text: msg.content }] 
    }));

    try {
      const response = await fetch('/api/fupro-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ query: currentInput, history: historyForApi }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Network response was not ok.');
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get readable stream.');
      
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
              setIsThinking(false);
              return;
            }
            const parsed = JSON.parse(data);
            switch (parsed.type) {
              case 'thinking_start':
                setIsThinking(true);
                break;
              case 'response':
                setIsThinking(false);
                if (parsed.userProfile && !userProfile) setUserProfile(parsed.userProfile);
                streamResponse(parsed.answer);
                break;
              case 'error':
                throw new Error(parsed.error);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: "Sorry, an error occurred. Please try again.", timestamp: new Date() }]);
      }
    } finally {
      setIsThinking(false);
      setAbortController(null);
    }
  };

  // --- UI HANDLERS ---

  const stopGeneration = () => {
    if (abortController) abortController.abort();
    setIsThinking(false);
    setIsStreaming(false);
    setIsGeneratingArtifact(false);
  };
  
  const handleViewArtifact = (artifact: ArtifactData) => {
    setCurrentArtifact(artifact);
    setShowArtifact(true);
    setShowHistory(false);
  };
  
  const handleUpgradeClick = () => { setShowProModal(false); setShowPhoneModal(true); };
  const handleSubscribe = () => { if (!phoneNumber.trim() || !selectedProTool) return; setIsSubscribing(true); setTimeout(() => { setIsSubscribing(false); const toolId = selectedProTool.id; setSubscribedToolIds(prev => [...prev, toolId]); setShowPhoneModal(false); setPhoneNumber(""); if (toolId === 'smartapply') { setSelectedTool('smartapply'); const prompt: ChatMessage = { id: `msg-tool-${Date.now()}`, role: 'assistant', content: "Excellent! **SmartApply is now active.**\n\nJust type the name of the company you want to apply for.", timestamp: new Date() }; setMessages(prev => [...prev, prompt]); textareaRef.current?.focus(); } }, 2000); };
  const handlePromptClick = (prompt: string) => { setMessage(prompt); textareaRef.current?.focus(); };
  const handleHistoryClick = (item: string) => { setMessage(item); setShowHistory(false); textareaRef.current?.focus(); };
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setMessage(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; };
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const clearHistory = () => { setChatHistory([]); localStorage.removeItem('fupro-chat-history'); };


  // --- RENDER COMPONENTS ---

  const SkeletonLoader = () => (
    <div className="flex gap-3 justify-start animate-fade-in"><div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"></div><div className="w-full max-w-[80%] rounded-2xl p-4 bg-gray-100"><div className="space-y-3"><div className="h-3 bg-gray-200 rounded-full w-3/4 animate-pulse"></div><div className="h-3 bg-gray-200 rounded-full w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }}></div></div></div></div>
  );

  const ArtifactStubCard = ({ artifact }: { artifact: ArtifactData }) => (
    <div className="flex gap-3 justify-start"><div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Image src="/ai.png" alt="Assistant" className="rounded-full" width={32} height={32} /></div><div className="max-w-[80%] w-full rounded-2xl p-4 bg-gray-50 border border-gray-200 shadow-sm animate-fade-in"><div className="flex items-start gap-3"><div className="flex-shrink-0 text-blue-600 bg-blue-100 p-2 rounded-lg"><FileText className="w-5 h-5" /></div><div className="flex-1"><p className="font-semibold text-gray-800 text-sm">{artifact.title}</p><p className="text-xs text-gray-500">Artifact generated.</p></div></div><button onClick={() => handleViewArtifact(artifact)} className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all active:scale-95"><Eye className="w-4 h-4" />View Artifact</button></div></div>
  );

  return (
    <div className="flex flex-row h-[70vh] bg-white relative overflow-hidden">
      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${showArtifact || showHistory ? 'lg:mr-[380px]' : 'mr-0'}`}>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!hasMessages ? (
            <div className="flex flex-col items-center justify-center p-4 h-full">
              <div className="text-center max-w-md mb-8">
                <h2 className="text-4xl font-semibold text-gray-900 mb-1">{greeting} {userName}! {timeEmoji}</h2>
                <p className="text-lg text-gray-700">Welcome to FuproAI</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {quickPrompts.map((prompt) => (
                  <button key={prompt} onClick={() => handlePromptClick(prompt)} className="p-4 text-left bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200"><p className="text-sm font-medium text-gray-900">{prompt}</p></button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-5 max-w-4xl mx-auto">
              {messages.map((msg) => msg.artifact ? <ArtifactStubCard key={msg.id} artifact={msg.artifact} /> : (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Image src="/ai.png" alt="Assistant" className="rounded-full" width={32} height={32} /></div>)}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}><p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} /><p className="text-xs opacity-70 mt-2 text-right">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div>
                  {msg.role === 'user' && (<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-white" /></div>)}
                </div>
              ))}
              {isThinking && <SkeletonLoader />}
              {isStreaming && <div className="flex gap-3 justify-start"><div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><Image src="/ai.png" alt="Assistant" className="rounded-full" width={32} height={32} /></div><div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100"><p className="text-sm">{streamingMessage}<span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse"></span></p></div></div>}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white">
          <div className="max-w-4xl mx-auto">
            {isProcessing && <div className="mb-3 flex justify-center"><button onClick={stopGeneration} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200"><Square className="w-4 h-4" /> Stop generating</button></div>}
            <div className="relative">
              <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200 focus-within:border-blue-400">
                <div className="relative">
                  <button onClick={() => setShowTools(!showTools)} className={`p-2 rounded-lg ${showTools ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-blue-600'}`} disabled={isProcessing}><Wrench className="w-5 h-5" /></button>
                  {showTools && <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border z-10 w-48">{initialTools.map(tool => (<button key={tool.id} onClick={() => { if (tool.isPro && !subscribedToolIds.includes(tool.id)) { setSelectedProTool(tool); setShowProModal(true); } else { setSelectedTool(tool.id); } setShowTools(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50">{tool.icon} <span className="text-sm">{tool.name}</span> {tool.isPro && !subscribedToolIds.includes(tool.id) && <span className="ml-auto text-xs font-bold text-yellow-500">PRO</span>}</button>))}</div>}
                </div>
                <textarea ref={textareaRef} value={message} onChange={handleTextareaChange} onKeyDown={handleKeyPress} placeholder={selectedTool === 'smartapply' ? "Enter company name..." : "Ask me about internships..."} className="flex-1 bg-transparent border-none outline-none resize-none" rows={1} disabled={isProcessing} />
                <button onClick={handleSend} disabled={!message.trim() || isProcessing} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 h-full w-[380px] z-30 pointer-events-none">
        <div className={`absolute inset-0 transition-transform duration-300 ${showArtifact ? 'translate-x-0' : 'translate-x-full'} pointer-events-auto`}>{currentArtifact && <SmartApplyArtifact title={currentArtifact.title} initialContent={currentArtifact.content} isGenerating={isGeneratingArtifact} onClose={() => setShowArtifact(false)} onSend={(finalContent) => { setMessages(prev => [...prev, { id: `msg-sent-${Date.now()}`, role: 'assistant', content: `Your application for **${currentArtifact.title.replace('Draft for ', '')}** has been sent.`, timestamp: new Date() }]); }} />}</div>
        <div className={`absolute inset-0 transition-transform duration-300 ${showHistory ? 'translate-x-0' : 'translate-x-full'} pointer-events-auto bg-white border-l flex flex-col`}>
          <div className="flex items-center justify-between p-4 border-b"><h3 className="font-medium">Recent History</h3><button onClick={() => setShowHistory(false)} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5"/></button></div>
          <div className="p-2 space-y-1 overflow-y-auto flex-grow">{chatHistory.length > 0 ? chatHistory.map((item, index) => (<button key={index} onClick={() => handleHistoryClick(item)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100"><p className="truncate">{item}</p></button>)) : (<div className="text-center p-8"><p>No recent history.</p></div>)}</div>
          <div className="p-4 border-t"><button onClick={clearHistory} className="w-full flex items-center justify-center gap-1.5 text-sm text-red-600 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-4 h-4"/> Clear History</button></div>
        </div>
      </div>

      {showProModal && selectedProTool && ( <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center"><Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-4"/> <h3 className="text-xl font-bold">{selectedProTool.name}</h3><p className="text-sm text-gray-600 my-4">{selectedProTool.description}</p><div className="my-5 p-4 bg-blue-50 rounded-lg"><p className="text-2xl font-bold">{selectedProTool.price} {selectedProTool.currency}</p><p className="text-xs uppercase">{selectedProTool.billingCycle}</p></div><button onClick={handleUpgradeClick} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg">Subscribe</button><button onClick={() => setShowProModal(false)} className="mt-3 text-sm text-gray-500">Maybe later</button></div></div> )}
      {showPhoneModal && selectedProTool && ( <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6"><div className="text-center mb-4"><Phone className="w-6 h-6 text-blue-600 mx-auto mb-3"/> <h3>Confirm Subscription</h3><p>Enter phone number for {selectedProTool.name}.</p></div><div className="relative mb-4"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">+237</span><input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="670 000 000" className="w-full pl-12 pr-4 py-2 border rounded-md"/></div><button onClick={handleSubscribe} disabled={isSubscribing || phoneNumber.length < 9} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md disabled:bg-gray-400 flex justify-center">{isSubscribing ? <Loader2 className="animate-spin" /> : `Subscribe for ${selectedProTool.price} ${selectedProTool.currency}`}</button><button onClick={() => setShowPhoneModal(false)} className="mt-2 w-full text-center text-sm text-gray-500">Cancel</button></div></div> )}
    </div>
  );
}