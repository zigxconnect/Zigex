"use client";

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  useLayoutEffect,
  useCallback,
} from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  History,
  Wrench,
  Send,
  Sparkles,
  User,
  Loader2,
  Phone,
  Square,
  Trash2,
  FileText,
  Eye,
  X,
  Target,
  ArrowUp,
  LoaderPinwheel,
  ExternalLink,
  BookOpen,
  Briefcase,
  Calendar,
  Users,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import SmartApplyArtifact from "@/components/SmartApplyArtifacts";

// --- HOOK FOR RESPONSIVENESS ---
const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return { width: size[0], height: size[1] };
};

// --- TYPE DEFINITIONS ---
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  artifact?: ArtifactData;
  sources?: SourceData[];
  platformData?: PlatformData;
}

interface ArtifactData {
  id: string;
  title: string;
  content: string;
}

interface SourceData {
  type: 'internship' | 'event' | 'program' | 'web';
  title: string;
  url?: string;
  company?: string;
  location?: string;
  date?: string;
}

interface PlatformData {
  counts?: {
    internships: number;
    events: number;
    programs: number;
  };
  topInternships?: any[];
  topPrograms?: any[];
  topEvents?: any[];
}

interface UserProfile {
  full_name: string;
  university: string;
  hard_skills: string[];
}

interface Company {
  id: string;
  name: string;
  logo: string;
}

// --- CONSTANTS ---
const initialTools = [
  {
    id: "smartapply",
    name: "SmartApply",
    icon: "🎯",
    isPro: true,
    description: "AI-powered application optimization for internships",
    price: 2000,
    currency: "XAF",
    billingCycle: "monthly",
  },
  {
    id: "jobguru",
    name: "JobGuru",
    icon: "💼",
    isPro: true,
    description: "Advanced company insights and career guidance",
    price: 5000,
    currency: "XAF",
    billingCycle: "monthly",
  },
];

const quickPrompts = [
  "Find tech internships in Bamenda",
  "Show me upcoming bootcamps and events",
  "Help me improve my career skills",
  "Connect me with mentorship programs",
];

const getTimeBasedGreeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const getTimeEmoji = () => {
  const h = new Date().getHours();
  return h < 12 ? "🌅" : h < 17 ? "☀️" : "🌆";
};

// --- MAIN PAGE COMPONENT ---
export default function FuproAiPage() {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const isMobile = windowWidth < 768;

  // --- STATE MANAGEMENT ---
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [currentThinkingStep, setCurrentThinkingStep] = useState(0);
  const [userName, setUserName] = useState("User");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [localProfile, setLocalProfile] = useState<{ name: string; avatarUrl?: string }>({
    name: 'You',
    avatarUrl: ''
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [subscribedToolIds, setSubscribedToolIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showArtifact, setShowArtifact] = useState(false);
  const [artifactWidth, setArtifactWidth] = useState(480);
  const [showArtifactHistory, setShowArtifactHistory] = useState(false);
  const [artifactMode, setArtifactMode] = useState<
    "companySelection" | "generating" | "display"
  >("companySelection");
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactData | null>(null);
  const [suggestedCompanies, setSuggestedCompanies] = useState<Company[]>([]);
  const [artifactHistory, setArtifactHistory] = useState<ArtifactData[]>([]);
  const [showProModal, setShowProModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedProTool, setSelectedProTool] = useState<(typeof initialTools)[0] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const isProcessing = isThinking;

  // --- EFFECTS ---
  useEffect(() => {
    setShowArtifact(false);
    const welcomeMessage: ChatMessage = {
      id: `msg-init-${Date.now()}`,
      role: "assistant",
      content: "Hello! I'm your Zigex assistant, here to help you find internships, bootcamps, mentorship programs, and support your personal growth journey in Bamenda. How can I help you today?",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    const savedArtifacts = localStorage.getItem("fupro-artifact-history");
    if (savedArtifacts) setArtifactHistory(JSON.parse(savedArtifacts));

    setTimeout(() => {
      const profile: UserProfile = {
        full_name: "Gita Sharma",
        university: "University of Buea",
        hard_skills: ["React", "Node.js", "Python", "Cloud Computing"],
      };
      setUserProfile(profile);
      setUserName(profile.full_name.split(" ")[0]);
    }, 1000);

    const savedLocal = localStorage.getItem('fupro-local-profile');
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        setLocalProfile({ name: parsed.name || 'You', avatarUrl: parsed.avatarUrl || '' });
        if (parsed.name) setUserName(parsed.name.split(' ')[0]);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    if (artifactHistory.length > 0)
      localStorage.setItem("fupro-artifact-history", JSON.stringify(artifactHistory));
  }, [artifactHistory]);

  useEffect(() => {
    if (showArtifact && artifactMode === "companySelection" && suggestedCompanies.length === 0)
      fetchSuggestedCompanies();
  }, [showArtifact, artifactMode, suggestedCompanies.length]);

  // --- CORE API LOGIC ---
  const fetchSuggestedCompanies = async () => {
    try {
      const response = await fetch("/api/fupro-ai/company");
      if (!response.ok) throw new Error("Failed to fetch suggested companies.");
      const data = await response.json();
      setSuggestedCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-comp-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't load company suggestions right now.",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const sendNormalChatMessage = async (input: string) => {
    setIsThinking(true);
    setThinkingSteps([]);
    setCurrentThinkingStep(0);

    const controller = new AbortController();
    setAbortController(controller);

    const historyForApi = messages
      .slice(1)
      .map((msg) => ({
        role: msg.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: msg.content }],
      }));

    const assistantMessageId = `msg-asst-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      },
    ]);

    try {
      const response = await fetch("/api/fupro-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ query: input, history: historyForApi }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) throw new Error("Network response was not ok.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";
      let wordQueue: string[] = [];
      let wordTimer: any = null;
      let currentSources: SourceData[] = [];
      let currentPlatformData: PlatformData | null = null;

      const startWordAnimation = () => {
        if (wordTimer) return;

        wordTimer = setInterval(() => {
          if (wordQueue.length === 0) {
            if (wordTimer) {
              clearInterval(wordTimer);
              wordTimer = null;
            }
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: accumulatedText,
                      sources: currentSources.length > 0 ? currentSources : undefined,
                      platformData: currentPlatformData || undefined,
                    }
                  : msg
              )
            );
            return;
          }

          const nextWord = wordQueue.shift()!;
          accumulatedText = accumulatedText ? `${accumulatedText} ${nextWord}` : nextWord;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedText }
                : msg
            )
          );
        }, 50);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          if (data === "[DONE]") {
            setIsThinking(false);
            setThinkingSteps([]);
            setCurrentThinkingStep(0);
            return;
          }

          const parsed = JSON.parse(data);

          if (parsed.type === "thinking_start") {
            setThinkingSteps(parsed.steps || []);
            setCurrentThinkingStep(0);
          } else if (parsed.type === "thinking_step") {
            setCurrentThinkingStep(parsed.step);
          } else if (parsed.type === "thinking_complete") {
            setCurrentThinkingStep(thinkingSteps.length);
          } else if (parsed.type === "response") {
            setIsThinking(false);
            setThinkingSteps([]);

            if (parsed.sseAvatar || parsed.userProfile?.full_name) {
              try {
                const existing = JSON.parse(localStorage.getItem('fupro-local-profile') || '{}');
                const updated = {
                  ...(existing || {}),
                  avatarUrl: parsed.sseAvatar || existing?.avatarUrl,
                  name: parsed.userProfile?.full_name || existing?.name
                };
                localStorage.setItem('fupro-local-profile', JSON.stringify(updated));
                setLocalProfile({ name: updated.name || 'You', avatarUrl: updated.avatarUrl });
              } catch (e) {}
            }

            if (parsed.platformData) {
              currentPlatformData = parsed.platformData;

              const sources: SourceData[] = [];

              if (parsed.platformData.topInternships) {
                parsed.platformData.topInternships.forEach((internship: any) => {
                  sources.push({
                    type: 'internship',
                    title: internship.title,
                    company: internship.company,
                    location: internship.location,
                    url: `/internships/${internship.id}`,
                  });
                });
              }

              if (parsed.platformData.topEvents) {
                parsed.platformData.topEvents.forEach((event: any) => {
                  sources.push({
                    type: 'event',
                    title: event.title,
                    company: event.company,
                    date: event.start_date,
                    url: `/events/${event.id}`,
                  });
                });
              }

              if (parsed.platformData.topPrograms) {
                parsed.platformData.topPrograms.forEach((program: any) => {
                  sources.push({
                    type: 'program',
                    title: program.title,
                    company: program.organizer,
                    date: program.start_date,
                    url: `/programs/${program.id}`,
                  });
                });
              }

              currentSources = sources;
            }

            const text = parsed.answer || "";
            wordQueue = text.split(/\s+/).filter(Boolean);
            accumulatedText = "";
            startWordAnimation();
          } else if (parsed.type === "error") {
            throw new Error(parsed.error);
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "Sorry, an error occurred while processing your request. Please try again.",
                }
              : msg
          )
        );
      }
    } finally {
      setIsThinking(false);
      setThinkingSteps([]);
      setAbortController(null);
    }
  };

  const generateArtifactForCompany = async (companyName: string) => {
    if (!userProfile) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-prof-${Date.now()}`,
          role: "assistant",
          content: "Profile data is not available yet.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setArtifactMode("generating");
    const newArtifact: ArtifactData = {
      id: `artifact-${Date.now()}`,
      title: `Application for ${companyName}`,
      content: "",
    };
    setCurrentArtifact(newArtifact);

    try {
      const response = await fetch("/api/smartApply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          userProfile: {
            name: userProfile.full_name,
            university: userProfile.university,
            skills: userProfile.hard_skills,
          },
        }),
      });

      if (!response.ok || !response.body)
        throw new Error("Artifact generation failed.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedContent += decoder.decode(value, { stream: true });
        setCurrentArtifact({ ...newArtifact, content: accumulatedContent });
      }

      const finalArtifact: ArtifactData = {
        ...newArtifact,
        content: accumulatedContent,
      };

      setArtifactHistory((prev) => [finalArtifact, ...prev]);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-art-${Date.now()}`,
          role: "assistant",
          content: `✅ I've created a personalized application draft for **${companyName}**. You can view and edit it in the artifacts panel.`,
          timestamp: new Date(),
          artifact: finalArtifact,
        },
      ]);
      setArtifactMode("display");
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-gen-${Date.now()}`,
          role: "assistant",
          content: `Sorry, I couldn't generate an application for ${companyName}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
      handleCloseArtifact();
    }
  };

  // --- MASTER SEND HANDLER ---
  const handleSend = async () => {
    if (!message.trim() || isProcessing) return;

    const currentInput = message;
    setMessage("");

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: currentInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    if (activeTool === "smartapply" && artifactMode === "companySelection") {
      await generateArtifactForCompany(currentInput);
    } else if (currentInput.toLowerCase().includes("smartapply") ||
               currentInput.toLowerCase().includes("application draft")) {
      openSmartApplyArtifact();
    } else {
      await sendNormalChatMessage(currentInput);
    }
  };

  // --- STABLE CALLBACKS & UI HANDLERS ---
  const handleCloseArtifact = useCallback(() => {
    setShowArtifact(false);
    setActiveTool(null);
  }, []);

  const activateSmartApplyFlow = useCallback(() => {
    setActiveTool("smartapply");
    setArtifactMode("companySelection");
    setShowArtifact(true);
  }, []);

  const openSmartApplyArtifact = useCallback(() => {
    if (activeTool === "smartapply") {
      setShowArtifact(true);
      return;
    }
    if (subscribedToolIds.includes("smartapply")) {
      activateSmartApplyFlow();
    } else {
      triggerSubscriptionModal();
    }
  }, [activeTool, subscribedToolIds, activateSmartApplyFlow]);

  const triggerSubscriptionModal = () => {
    const tool = initialTools.find((t) => t.id === "smartapply");
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
      setSubscribedToolIds((prev) => [...prev, toolId]);
      setShowPhoneModal(false);
      setShowProModal(false);
      setPhoneNumber("");
      if (toolId === "smartapply") {
        activateSmartApplyFlow();
      }
    }, 2000);
  };

  const handleViewArtifactFromHistory = (artifact: ArtifactData) => {
    setCurrentArtifact(artifact);
    setArtifactMode("display");
    setShowArtifactHistory(false);
    setActiveTool("smartapply");
    setShowArtifact(true);
  };

const handleTextareaChange = (e) => {
  setMessage(e.target.value);
  
  // Auto-resize textarea
  const textarea = textareaRef.current;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }
};
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- RENDER COMPONENTS ---
  const BreathingOrbLoader = () => (
    <div className="flex items-center justify-center w-5 h-5">
      <div className="breathing-orb"></div>
    </div>
  );

  const ThinkingAnimation = () => (
    <div className="flex gap-3 justify-start items-start animate-fade-in">
      <div className="w-8 h-8 flex-shrink-0">
        <Image src="/z3.png" alt="Assistant" className="rounded-full" width={32} height={32} />
      </div>
      <div className="flex-1 max-w-[80%] rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
        <div className="space-y-3">
          {thinkingSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 transition-all duration-300 ${
                index < currentThinkingStep
                  ? "opacity-100"
                  : index === currentThinkingStep
                  ? "opacity-100 animate-pulse"
                  : "opacity-30"
              }`}
            >
              {index < currentThinkingStep ? (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : index === currentThinkingStep ? (
                <LoaderPinwheel className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
              )}
              <span className="text-sm text-gray-700 font-medium">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SourceCard = ({ source }: { source: SourceData }) => {
    const getIcon = () => {
      switch (source.type) {
        case 'internship':
          return <Briefcase className="w-4 h-4" />;
        case 'event':
          return <Calendar className="w-4 h-4" />;
        case 'program':
          return <BookOpen className="w-4 h-4" />;
        default:
          return <ExternalLink className="w-4 h-4" />;
      }
    };

    const getColor = () => {
      switch (source.type) {
        case 'internship':
          return 'bg-blue-50 border-blue-200 text-blue-700';
        case 'event':
          return 'bg-purple-50 border-purple-200 text-purple-700';
        case 'program':
          return 'bg-green-50 border-green-200 text-green-700';
        default:
          return 'bg-gray-50 border-gray-200 text-gray-700';
      }
    };

    return (
      <a
        href={source.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${getColor()}`}
      >
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate">{source.title}</h4>
          <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
            {source.company && <span>{source.company}</span>}
            {source.location && <span>• {source.location}</span>}
            {source.date && <span>• {source.date}</span>}
          </div>
        </div>
        <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
      </a>
    );
  };

  const SourcesSection = ({ sources }: { sources: SourceData[] }) => {
      const [isOpen, setIsOpen] = useState(false);
      if (!sources || sources.length === 0) return null;

      return (
          <div className="mt-4 border-t border-gray-200 pt-4">
              <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full flex justify-between items-center text-left"
              >
                  <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-800">
                          Sources from Zigex Platform ({sources.length})
                      </h3>
                  </div>
                  <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                          isOpen ? "transform rotate-180" : ""
                      }`}
                  />
              </button>
              {isOpen && (
                  <div className="mt-3 grid grid-cols-1 gap-2 animate-fade-in">
                      {sources.map((source, index) => (
                          <SourceCard key={index} source={source} />
                      ))}
                  </div>
              )}
          </div>
      );
  };

  const ArtifactStubCard = ({ artifact }: { artifact: ArtifactData }) => (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 flex-shrink-0">
        <Image src="/z3.png" alt="Assistant" className="rounded-full" width={32} height={32} />
      </div>
      <div className="max-w-[80%] w-full rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-blue-600 bg-blue-100 p-2 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">{artifact.title}</p>
            <p className="text-xs text-gray-600 mt-1">Your personalized application is ready!</p>
          </div>
        </div>
        <button
          onClick={() => handleViewArtifactFromHistory(artifact)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Application
        </button>
      </div>
    </div>
  );

  // --- CALCULATE DYNAMIC HEIGHTS ---
  const inputAreaHeight = 140;
  const availableHeight = windowHeight - inputAreaHeight;
  const chatContainerStyle = {
    marginRight: !isMobile && showArtifact ? `${artifactWidth}px` : "0px",
    height: `${availableHeight}px`,
  };

  return (
    <div className="w-full h-screen flex flex-row bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      <div
        className="flex flex-col flex-1 transition-all duration-300 ease-in-out"
        style={{ marginRight: chatContainerStyle.marginRight }}
      >
        {/* --- CHAT MESSAGES AREA --- */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{ height: chatContainerStyle.height }}
        >
          <div className="p-4 md:p-6">
            {messages.length <= 1 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 min-h-[400px]">
                <div className="mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    {getTimeBasedGreeting()}, {userName}! {getTimeEmoji()}
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Welcome to <span className="font-semibold text-blue-600">Zigex</span> - Your gateway to internships, growth, and experience in Bamenda
                  </p>
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Edit Profile
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl mt-6">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setMessage(prompt);
                        // Focus the textarea after setting the message
                        textareaRef.current?.focus();
                      }}
                      className="group p-4 text-left bg-white hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                    >
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                        {prompt}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-6 w-full max-w-3xl">
                  <button
                    onClick={triggerSubscriptionModal}
                    className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    {/* <Sparkles className="w-5 h-5" /> */}
                    Unlock SmartApply Pro
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center flex-wrap gap-4 sm:gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Internships</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Events</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Programs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Growth</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto pb-6">
                {messages.slice(1).map((msg) =>
                  msg.artifact ? (
                    <ArtifactStubCard key={msg.id} artifact={msg.artifact} />
                  ) : (
                    <div
                      key={msg.id}
                      className={`flex gap-3 items-start ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 flex-shrink-0">
                          <Image
                            src="/z3.png"
                            alt="Assistant"
                            className="rounded-full"
                            width={32}
                            height={32}
                          />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-900 border border-gray-200"
                        }`}
                      >
                        {msg.content ? (
                          <>
                            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                            
                            {msg.sources && msg.sources.length > 0 && (
                              <SourcesSection sources={msg.sources} />
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <BreathingOrbLoader />
                            <span className="text-sm text-gray-600">Thinking...</span>
                          </div>
                        )}
                        
                        <p
                          className={`text-xs mt-2 text-right ${
                            msg.role === "user" ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {msg.role === "user" && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm"
                          style={{
                            background: localProfile.avatarUrl ? "transparent" : "#0ea5e9",
                          }}
                        >
                          {localProfile.avatarUrl ? (
                            <img
                              src={localProfile.avatarUrl}
                              alt={localProfile.name}
                              className="w-8 h-8 object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 flex items-center justify-center text-white font-semibold text-sm">
                              {(localProfile.name || "You")
                                .split(" ")
                                .map((n: any) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {isThinking && thinkingSteps.length > 0 && <ThinkingAnimation />}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* --- FIXED INPUT AREA AT BOTTOM --- */}
      



<div className="fixed lg:bottom-0 bottom-15 left-0 right-0 border-t bg-white z-20">
  <div className="w-full px-4 py-3 md:py-4 lg:pl-[22rem]" style={{
    paddingRight: !isMobile && showArtifact ? `${artifactWidth + 16}px` : '1rem'
  }}>
    <div className="max-w-4xl mx-auto">
      {activeTool === "smartapply" && (
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 text-sm font-medium px-4 py-2.5 mb-3 rounded-xl shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>🎯 SmartApply Mode: Enter a company name</span>
          </div>
          <button
            onClick={handleCloseArtifact}
            className="p-1 rounded-full hover:bg-blue-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="relative flex items-end gap-2 bg-blue-100 rounded-2xl p-2 border border-gray-300 hover:border-gray-400 focus-within:border-blue-500 transition-all shadow-sm">
        {/* Tool Buttons - Left Side */}
        <div className="flex items-center gap-1 pb-2 pl-1">
          <button
            onClick={openSmartApplyArtifact}
            className="group relative p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            title="SmartApply"
          >
            <Target className="w-5 h-5" />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              SmartApply
            </span>
          </button>

          <button
            onClick={() => setShowArtifactHistory(true)}
            className="group relative p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            title="My Artifacts"
          >
            <FileText className="w-5 h-5" />
            {artifactHistory.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {artifactHistory.length}
              </span>
            )}
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              My Artifacts
            </span>
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyPress}
          placeholder={
            activeTool === "smartapply"
              ? "Enter company name (e.g., Google, Microsoft)..."
              : "Ask about internships, events, or career growth..."
          }
          className="flex-1 bg-transparent border-none outline-none resize-none text-gray-900 placeholder:text-gray-400 px-2 py-3 max-h-[200px] overflow-y-auto"
          style={{ height: 'auto', minHeight: '40px' }}
          rows={1}
          disabled={isProcessing}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || isProcessing}
          className="group relative p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex-shrink-0 mb-1"
        >
          {isProcessing ? (
            <BreathingOrbLoader />
          ) : (
            <ArrowUp className="w-5 h-5" />
          )}
          <span className="absolute bottom-full mb-2 right-0 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Send (Enter)
          </span>
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Zigex AI can make mistakes. Please verify important information.
      </p>
    </div>
  </div>
</div>


      </div>

      {/* --- SIDE PANELS & MODALS --- */}
      
      {showArtifact && (
        <SmartApplyArtifact
          mode={artifactMode}
          companies={suggestedCompanies}
          title={currentArtifact?.title || "SmartApply"}
          content={currentArtifact?.content || ""}
          onClose={handleCloseArtifact}
          onCompanySelect={generateArtifactForCompany}
          onSend={() => {
            setMessages((prev) => [...prev, {
              id: `msg-sent-${Date.now()}`, role: "assistant",
              content: `✅ Success! Your application for **${currentArtifact?.title.replace("Application for ", "")}** has been prepared.`,
              timestamp: new Date(),
            }]);
            handleCloseArtifact();
          }}
          userProfile={userProfile}
          width={artifactWidth}
          onWidthChange={setArtifactWidth}
          isMobile={isMobile}
        />
      )}

      {showArtifactHistory && (
        <div className="fixed md:absolute top-0 right-0 h-full bg-white z-50 border-l shadow-2xl flex flex-col w-full max-w-md md:max-w-[380px] animate-slide-in-from-right">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">My Artifacts</h3>
            </div>
            <button onClick={() => setShowArtifactHistory(false)} className="p-1.5 rounded-full hover:bg-white transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="p-3 space-y-2 overflow-y-auto flex-grow">
            {artifactHistory.length > 0 ? (
              artifactHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleViewArtifactFromHistory(item)}
                  className="w-full text-left p-3 rounded-xl hover:bg-blue-50 flex items-center gap-3 border border-gray-100 hover:border-blue-200 transition-all group"
                >
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0"><span className="block truncate text-sm font-medium text-gray-900">{item.title}</span><span className="block text-xs text-gray-500 mt-0.5">Click to view</span></div>
                  <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </button>
              ))
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"><FileText className="w-8 h-8 text-gray-400" /></div>
                <p className="text-sm font-medium text-gray-900 mb-1">No artifacts yet</p>
                <p className="text-xs text-gray-500">Use SmartApply to create your first draft!</p>
              </div>
            )}
          </div>
          {artifactHistory.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear all artifacts?")) {
                    setArtifactHistory([]);
                    localStorage.removeItem("fupro-artifact-history");
                  }
                }}
                className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 p-3 rounded-xl transition-colors font-medium"
              ><Trash2 className="w-4 h-4" />Clear All History</button>
            </div>
          )}
        </div>
      )}

      {/* --- CORRECTED MODAL STRUCTURE --- */}
      {showProModal && selectedProTool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowProModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProTool.name}</h3>
            <p className="text-sm text-gray-600 mb-6">{selectedProTool.description}</p>
            <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="text-3xl font-bold text-blue-700 mb-1">{selectedProTool.price.toLocaleString()} {selectedProTool.currency}</p>
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">{selectedProTool.billingCycle}</p>
            </div>
            <button
              onClick={() => { setShowProModal(false); setShowPhoneModal(true); }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg mb-3"
            >Subscribe Now</button>
            <button onClick={() => setShowProModal(false)} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Maybe later</button>
          </div>
        </div>
      )}

      {showPhoneModal && selectedProTool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowPhoneModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center"><Phone className="w-6 h-6 text-blue-600" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Confirm Subscription</h3>
              <p className="text-sm text-gray-600">Enter your phone number to subscribe to {selectedProTool.name}</p>
            </div>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium">+237</span>
              <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} placeholder="670 000 000" maxLength={9} className="w-full pl-16 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl outline-none transition-colors" />
            </div>
            <button
              onClick={handleSubscribe}
              disabled={isSubscribing || phoneNumber.length !== 9}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 mb-3"
            >
              {isSubscribing ? (<><Loader2 className="w-5 h-5 animate-spin" />Processing...</>) : (`Subscribe for ${selectedProTool.price.toLocaleString()} ${selectedProTool.currency}`)}
            </button>
            <button onClick={() => { setShowPhoneModal(false); setPhoneNumber(""); }} disabled={isSubscribing} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Your Profile</h3>
            <p className="text-sm text-gray-600 mb-6">Personalize your Zigex experience by setting your name and avatar.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" value={localProfile.name} onChange={(e) => setLocalProfile((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl outline-none transition-colors" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL <span className="text-gray-400">(optional)</span></label>
                <input type="url" value={localProfile.avatarUrl || ""} onChange={(e) => setLocalProfile((p) => ({ ...p, avatarUrl: e.target.value }))} className="w-full px-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl outline-none transition-colors" placeholder="https://example.com/avatar.jpg" />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { localStorage.setItem("fupro-local-profile", JSON.stringify(localProfile)); setShowProfileModal(false); if (localProfile.name) setUserName(localProfile.name.split(" ")[0]); }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
              >Save Changes</button>
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-xl transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slide-in-from-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes breathing {
          0%, 100% { transform: scale(0.8); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        .breathing-orb {
          width: 12px; height: 12px;
          background-color: #3b82f6; /* blue-500 */
          border-radius: 50%;
          animation: breathing 2s ease-in-out infinite;
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-slide-in-from-right { animation: slide-in-from-right 0.3s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}