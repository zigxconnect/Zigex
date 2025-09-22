"use client";

import React, { useState, useEffect, useRef, KeyboardEvent, useLayoutEffect, useCallback } from "react";
import {
  History, Wrench, Send, Sparkles, User, Loader2, Phone,
  Square, Trash2, FileText, Eye, X, Target
} from "lucide-react";
import Image from "next/image";
import SmartApplyArtifact from "@/components/SmartApplyArtifacts"; // Assumes the component is in this path

// --- HOOK FOR RESPONSIVENESS ---
const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() { setSize([window.innerWidth, window.innerHeight]); }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return { width: size[0], height: size[1] };
};

// --- TYPE DEFINITIONS ---
interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; artifact?: ArtifactData; }
interface ArtifactData { id: string; title: string; content: string; }
interface UserProfile { full_name: string; university: string; hard_skills: string[]; }
interface Company { id: string; name: string; logo: string; }

// --- CONSTANTS ---
const initialTools = [
  { id: "smartapply", name: "SmartApply", icon: "🎯", isPro: true, description: "AI-powered application optimization...", price: 2000, currency: "XAF", billingCycle: "monthly" },
  { id: "jobguru", name: "JobGuru", icon: "💼", isPro: true, description: "Advanced company insights...", price: 5000, currency: "XAF", billingCycle: "monthly" }
];
const quickPrompts = [ "Find tech internships in Bamenda", "Help me write an application letter", "Start a SmartApply draft" ];
const getTimeBasedGreeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const getTimeEmoji = () => { const h = new Date().getHours(); return h < 12 ? "🌅" : h < 17 ? "☀️" : "🌆"; };

// --- MAIN PAGE COMPONENT ---
export default function FuproAiPage() {
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;

  // --- STATE MANAGEMENT ---
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscribedToolIds, setSubscribedToolIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showArtifact, setShowArtifact] = useState(false);
  const [artifactWidth, setArtifactWidth] = useState(480);
  const [showArtifactHistory, setShowArtifactHistory] = useState(false);
  const [artifactMode, setArtifactMode] = useState<'companySelection' | 'generating' | 'display'>('companySelection');
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [suggestedCompanies, setSuggestedCompanies] = useState<Company[]>([]);
  const [artifactHistory, setArtifactHistory] = useState<ArtifactData[]>([]);
  const [showProModal, setShowProModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedProTool, setSelectedProTool] = useState<(typeof initialTools[0]) | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const isProcessing = isThinking;

  // --- EFFECTS ---
  useEffect(() => {
    setShowArtifact(false);
    const welcomeMessage: ChatMessage = { id: `msg-init-${Date.now()}`, role: 'assistant', content: "Hello! I'm your Bamenda Internship Connect assistant. How can I help?", timestamp: new Date() };
    setMessages([welcomeMessage]);
    const savedArtifacts = localStorage.getItem('fupro-artifact-history');
    if (savedArtifacts) setArtifactHistory(JSON.parse(savedArtifacts));
    
    setTimeout(() => {
      const profile: UserProfile = { full_name: "Gita Sharma", university: "University of Buea", hard_skills: ["React", "Node.js", "Python", "Cloud Computing"] };
      setUserProfile(profile);
      setUserName(profile.full_name.split(' ')[0]);
    }, 1000);
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isThinking]);
  useEffect(() => { if (artifactHistory.length > 0) localStorage.setItem('fupro-artifact-history', JSON.stringify(artifactHistory)); }, [artifactHistory]);
  useEffect(() => { if (showArtifact && artifactMode === 'companySelection' && suggestedCompanies.length === 0) fetchSuggestedCompanies(); }, [showArtifact, artifactMode, suggestedCompanies.length]);

  // --- CORE API LOGIC ---
  const fetchSuggestedCompanies = async () => {
    try {
      const response = await fetch('/api/fupro-ai/company');
      if (!response.ok) throw new Error('Failed to fetch suggested companies.');
      const data = await response.json();
      setSuggestedCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      // Optionally, add an error message to the chat
      setMessages(prev => [...prev, { id: `err-comp-${Date.now()}`, role: 'assistant', content: 'Sorry, I couldn\'t load company suggestions right now.', timestamp: new Date() }]);
    }
  };

  const sendNormalChatMessage = async (input: string) => {
    setIsThinking(true);
    const controller = new AbortController();
    setAbortController(controller);
    const historyForApi = messages.slice(1).map(msg => ({ role: msg.role === 'user' ? 'user' as const : 'model' as const, parts: [{ text: msg.content }] }));
    let fullResponse = "";
    const assistantMessageId = `msg-asst-${Date.now()}`;
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: "", timestamp: new Date() }]);

    try {
      const response = await fetch('/api/fupro-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ query: input, history: historyForApi }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error('Network response was not ok.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') { setIsThinking(false); return; }
            const parsed = JSON.parse(data);
            if (parsed.type === 'response') {
              fullResponse = parsed.answer;
              setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg));
            } else if (parsed.type === 'error') { throw new Error(parsed.error); }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') { setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: "Sorry, an error occurred. Please try again." } : msg)); }
    } finally { setIsThinking(false); setAbortController(null); }
  };

  const generateArtifactForCompany = async (companyName: string) => {
    if (!userProfile) { setMessages(prev => [...prev, { id: `err-prof-${Date.now()}`, role: 'assistant', content: 'Profile data is not available yet.', timestamp: new Date() }]); return; }
    setArtifactMode('generating');
    const newArtifact: ArtifactData = { id: `artifact-${Date.now()}`, title: `Draft for ${companyName}`, content: '' };
    setCurrentArtifact(newArtifact);
    try {
      const response = await fetch('/api/smartApply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, userProfile: { name: userProfile.full_name, university: userProfile.university, skills: userProfile.hard_skills } }),
      });
      if (!response.ok || !response.body) throw new Error("Artifact generation failed.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedContent += decoder.decode(value, { stream: true });
        setCurrentArtifact({ ...newArtifact, content: accumulatedContent });
      }
      const finalArtifact: ArtifactData = { ...newArtifact, content: accumulatedContent };
      setArtifactHistory(prev => [finalArtifact, ...prev]);
      setMessages(prev => [...prev, { id: `msg-art-${Date.now()}`, role: 'assistant', content: `Created a draft for **${companyName}**. It's now in your artifacts.`, timestamp: new Date(), artifact: finalArtifact }]);
      setArtifactMode('display');
    } catch (error) { setMessages(prev => [...prev, { id: `err-gen-${Date.now()}`, role: 'assistant', content: `Sorry, could not generate a draft for ${companyName}. Please try again.`, timestamp: new Date() }]); handleCloseArtifact(); }
  };

  // --- MASTER SEND HANDLER ---
  const handleSend = async () => {
    if (!message.trim() || isProcessing) return;
    const currentInput = message;
    setMessage("");
    const userMessage: ChatMessage = { id: `msg-user-${Date.now()}`, role: 'user', content: currentInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    if (activeTool === 'smartapply' && artifactMode === 'companySelection') { await generateArtifactForCompany(currentInput); }
    else if (currentInput.toLowerCase().trim() === 'start a smartapply draft') { openSmartApplyArtifact(); }
    else { await sendNormalChatMessage(currentInput); }
  };

  // --- STABLE CALLBACKS & UI HANDLERS ---
  const handleCloseArtifact = useCallback(() => { setShowArtifact(false); setActiveTool(null); }, []);
  const activateSmartApplyFlow = useCallback(() => { setActiveTool('smartapply'); setArtifactMode('companySelection'); setShowArtifact(true); }, []);
  const openSmartApplyArtifact = useCallback(() => {
    if (activeTool === 'smartapply') { setShowArtifact(true); return; }
    if (subscribedToolIds.includes('smartapply')) { activateSmartApplyFlow(); }
    else { triggerSubscriptionModal(); }
  }, [activeTool, subscribedToolIds, activateSmartApplyFlow]);
  
  const triggerSubscriptionModal = () => {
    const tool = initialTools.find(t => t.id === 'smartapply');
    if (tool) {
      setSelectedProTool(tool);
      setShowProModal(true);
    }
  };

  const handleSubscribe = () => {
    if (!phoneNumber.trim() || !selectedProTool) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      const toolId = selectedProTool.id;
      setSubscribedToolIds(prev => [...prev, toolId]);
      setShowPhoneModal(false);
      setShowProModal(false);
      setPhoneNumber("");
      if (toolId === 'smartapply') {
        activateSmartApplyFlow();
      }
    }, 2000);
  };
  const handleViewArtifactFromHistory = (artifact: ArtifactData) => { setCurrentArtifact(artifact); setArtifactMode('display'); setShowArtifactHistory(false); setActiveTool('smartapply'); setShowArtifact(true); };
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setMessage(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; };
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  // --- RENDER LOGIC ---
  const chatContainerStyle = { marginRight: !isMobile && showArtifact ? `${artifactWidth}px` : '0px' };
  const SkeletonLoader = () => ( <div className="flex gap-3 justify-start animate-fade-in"><div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div><div className="w-full max-w-[80%] rounded-2xl p-4 bg-gray-100"><div className="space-y-3"><div className="h-3 bg-gray-200 rounded-full w-3/4 animate-pulse"></div><div className="h-3 bg-gray-200 rounded-full w-1/2 animate-pulse"></div></div></div></div> );
  const ArtifactStubCard = ({ artifact }: { artifact: ArtifactData }) => ( <div className="flex gap-3 justify-start"><div className="w-8 h-8 flex-shrink-0"><Image src="/ai.png" alt="Assistant" className="rounded-full" width={32} height={32} /></div><div className="max-w-[80%] w-full rounded-2xl p-4 bg-gray-50 border shadow-sm animate-fade-in"><div className="flex items-start gap-3"><div className="flex-shrink-0 text-blue-600 bg-blue-100 p-2 rounded-lg"><FileText className="w-5 h-5" /></div><div className="flex-1"><p className="font-semibold text-gray-800 text-sm">{artifact.title}</p><p className="text-xs text-gray-500">Artifact generated.</p></div></div><button onClick={() => handleViewArtifactFromHistory(artifact)} className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border rounded-lg hover:bg-gray-100"><Eye className="w-4 h-4" />View Artifact</button></div></div> );

  return (
    <div className="flex flex-row h-[70vh] bg-white relative overflow-hidden">
      <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out" style={chatContainerStyle}>
        {/* --- MAIN CHAT UI & INPUT --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {messages.length <= 1 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-1">{getTimeBasedGreeting()}, {userName}! {getTimeEmoji()}</h2>
              <p className="text-lg text-gray-700">How can I help you today?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                {quickPrompts.map(p => <button key={p} onClick={() => setMessage(p)} className="p-4 text-left bg-gray-50 hover:bg-blue-50 rounded-xl border transition-colors"><p className="text-sm font-medium text-gray-900">{p}</p></button>)}
                <button onClick={triggerSubscriptionModal} className="sm:col-span-2 p-4 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center justify-center gap-2"> <Sparkles className="w-5 h-5 text-blue-600" /> <p className="text-sm font-semibold text-blue-800">Unlock SmartApply Pro</p> </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 max-w-4xl mx-auto">
              {messages.map((msg) => msg.artifact ? <ArtifactStubCard key={msg.id} artifact={msg.artifact} /> : ( <div key={msg.id} className={`flex gap-3 items-end ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}> {msg.role === 'assistant' && (<div className="w-8 h-8 flex-shrink-0"><Image src="/ai.png" alt="Assistant" className="rounded-full" width={32} height={32} /></div>)} <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}> {msg.content ? <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} /> : <Loader2 className="w-5 h-5 animate-spin" />} <p className="text-xs opacity-70 mt-2 text-right">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p> </div> {msg.role === 'user' && (<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 text-white" /></div>)} </div> ))}
              {isThinking && messages.length > 0 && messages[messages.length - 1].role === 'user' && <SkeletonLoader />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-white">
          <div className="max-w-4xl mx-auto">
            {activeTool === 'smartapply' && ( <div className="flex justify-between items-center bg-blue-50 border-blue-200 text-blue-800 text-sm font-medium px-4 py-2 mb-3 rounded-lg animate-fade-in"> <span>🎯 SmartApply Mode: Enter a company name.</span> <button onClick={handleCloseArtifact} className="p-1 rounded-full hover:bg-blue-200"><X className="w-4 h-4" /></button> </div> )}
            <div className="relative flex items-end gap-2 bg-gray-50 rounded-2xl p-2 border focus-within:border-blue-400">
              <button onClick={openSmartApplyArtifact} className="p-2 rounded-lg text-gray-400 hover:text-blue-600"><Target className="w-5 h-5" /></button>
              <button onClick={() => setShowArtifactHistory(true)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600"><FileText className="w-5 h-5" /></button>
              <textarea ref={textareaRef} value={message} onChange={handleTextareaChange} onKeyDown={handleKeyPress} placeholder={activeTool === 'smartapply' ? "Enter company name..." : "Ask me anything..."} className={`flex-1 bg-transparent border-none outline-none resize-none transition-all placeholder:text-gray-400 ${!message ? 'text-center' : 'text-left'}`} rows={1}/>
              <button onClick={handleSend} disabled={!message.trim() || isProcessing} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"><Send className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

      {showArtifact && ( <SmartApplyArtifact mode={artifactMode} companies={suggestedCompanies} title={currentArtifact?.title || "SmartApply"} content={currentArtifact?.content || ""} onClose={handleCloseArtifact} onCompanySelect={generateArtifactForCompany} onSend={(finalContent) => { setMessages(prev => [...prev, { id: `msg-sent-${Date.now()}`, role: 'assistant', content: `Success! Application for **${currentArtifact?.title.replace('Draft for ', '')}** sent.`, timestamp: new Date() }]); handleCloseArtifact(); }} userProfile={userProfile} width={artifactWidth} onWidthChange={setArtifactWidth} isMobile={isMobile}/> )}
      
      {showArtifactHistory && ( <div className="absolute top-0 right-0 h-full bg-white z-40 border-l shadow-2xl flex flex-col w-full max-w-[380px] animate-slide-in-from-right"> <div className="flex items-center justify-between p-4 border-b"> <h3 className="font-medium text-gray-800">My Artifacts</h3> <button onClick={() => setShowArtifactHistory(false)} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5"/></button> </div> <div className="p-2 space-y-1 overflow-y-auto flex-grow"> {artifactHistory.length > 0 ? artifactHistory.map((item) => ( <button key={item.id} onClick={() => handleViewArtifactFromHistory(item)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3"> <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" /> <span className="truncate text-sm font-medium">{item.title}</span> </button> )) : ( <div className="text-center p-8 text-sm text-gray-500"> <p>No artifacts generated yet.</p> <p className="mt-1">Use SmartApply to create one!</p> </div> )} </div> {artifactHistory.length > 0 && ( <div className="p-4 border-t"> <button onClick={() => { setArtifactHistory([]); localStorage.removeItem('fupro-artifact-history'); }} className="w-full flex items-center justify-center gap-1.5 text-sm text-red-600 hover:bg-red-50 p-2 rounded-lg"> <Trash2 className="w-4 h-4"/> Clear History </button> </div> )} </div> )}

      {showProModal && selectedProTool && ( <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"> <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center animate-scale-in"> <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-4"/> <h3 className="text-xl font-bold">{selectedProTool.name}</h3> <p className="text-sm text-gray-600 my-4">{selectedProTool.description}</p> <div className="my-5 p-4 bg-blue-50 rounded-lg"> <p className="text-2xl font-bold">{selectedProTool.price} {selectedProTool.currency}</p> <p className="text-xs uppercase">{selectedProTool.billingCycle}</p> </div> <button onClick={() => { setShowProModal(false); setShowPhoneModal(true); }} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg">Subscribe</button> <button onClick={() => setShowProModal(false)} className="mt-3 text-sm text-gray-500">Maybe later</button> </div> </div> )}
      
      {showPhoneModal && selectedProTool && ( <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"> <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-scale-in"> <div className="text-center mb-4"> <Phone className="w-6 h-6 text-blue-600 mx-auto mb-3"/> <h3>Confirm Subscription</h3> <p className="text-sm text-gray-500 mt-1">Enter phone number for {selectedProTool.name}.</p> </div> <div className="relative mb-4"> <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">+237</span> <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="670 000 000" className="w-full pl-12 pr-4 py-2 border rounded-md"/> </div> <button onClick={handleSubscribe} disabled={isSubscribing || phoneNumber.length < 9} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-md disabled:bg-gray-400 flex justify-center"> {isSubscribing ? <Loader2 className="animate-spin" /> : `Subscribe for ${selectedProTool.price} ${selectedProTool.currency}`} </button> <button onClick={() => setShowPhoneModal(false)} className="mt-2 w-full text-center text-sm text-gray-500">Cancel</button> </div> </div> )}
    </div>
  );
}