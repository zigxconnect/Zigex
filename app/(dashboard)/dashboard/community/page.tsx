"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  MessageCircle, Users, Shield, ExternalLink, RefreshCw, 
  Activity, Heart, Zap, ChevronRight, Globe, BookOpen, FileText,
  CheckCircle, Lock, UserPlus, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DiscordMember {
  id: string;
  username: string;
  avatar_url: string;
  status: string;
}

interface DiscordData {
  name: string;
  presence_count: number;
  instant_invite: string;
  channels?: Array<{ id: string; name: string }>;
  members: DiscordMember[];
}

// Storage key for persisting access state
const ACCESS_STORAGE_KEY = "zigex_community_access";

export default function CommunityPage() {
  const [discordData, setDiscordData] = useState<DiscordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "members" | "resources">("chat");
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Gated Access State
  const [hasAccess, setHasAccess] = useState(false);
  const [accessStep, setAccessStep] = useState<"initial" | "clicked" | "confirmed">("initial");
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Discord Configuration
  const GUILD_ID = "1454830922653368585";
  const PUBLIC_CHANNEL_ID = "1454830924004069568"; // Lounge - Public channel
  const DISCORD_INVITE = "https://discord.gg/wh46mteK";

  // Check if user already has access
  useEffect(() => {
    const checkAccess = () => {
      try {
        const stored = localStorage.getItem(ACCESS_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          // Access expires after 7 days
          const expiryTime = 7 * 24 * 60 * 60 * 1000;
          if (data.granted && Date.now() - data.timestamp < expiryTime) {
            setHasAccess(true);
          }
        }
      } catch (error) {
        console.error("Error checking access:", error);
      }
      setIsCheckingAccess(false);
    };
    
    checkAccess();
  }, []);

  // Fetch Discord data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`);
        if (res.ok) {
          const data = await res.json();
          setDiscordData(data);
        }
      } catch (error) {
        console.error("Failed to fetch Discord data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleInviteClick = () => {
    // Open Discord invite in new tab
    window.open(DISCORD_INVITE, "_blank");
    setAccessStep("clicked");
  };

  const handleConfirmJoined = () => {
    // Grant access and save to localStorage
    setAccessStep("confirmed");
    setTimeout(() => {
      setHasAccess(true);
      localStorage.setItem(ACCESS_STORAGE_KEY, JSON.stringify({
        granted: true,
        timestamp: Date.now()
      }));
    }, 1500);
  };

  const members = useMemo(() => discordData?.members || [], [discordData]);
  const onlineCount = discordData?.presence_count || 0;

  const tabs = [
    { id: "chat" as const, label: "Chat", icon: MessageCircle },
    { id: "members" as const, label: "Members", icon: Users },
    { id: "resources" as const, label: "Resources", icon: BookOpen },
  ];

  // Show loading while checking access
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Loading community...</p>
        </div>
      </div>
    );
  }

  // Gated Access Screen
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 px-8 py-10 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Join the Zigex Community
              </h1>
              <p className="text-blue-100 mt-2 max-w-md mx-auto">
                Connect with fellow students, developers, and mentors in our exclusive Discord community.
              </p>
            </div>

            {/* Steps */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {accessStep === "initial" && (
                  <motion.div
                    key="initial"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    {/* Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      {[
                        { icon: MessageCircle, label: "Real-time Chat", desc: "Connect instantly" },
                        { icon: Users, label: "Network", desc: "Meet developers" },
                        { icon: Zap, label: "Exclusive Content", desc: "Get early access" }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl">
                          <item.icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Online Members Preview */}
                    {members.length > 0 && (
                      <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="flex -space-x-2">
                          {members.slice(0, 5).map((m) => (
                            <img
                              key={m.id}
                              src={m.avatar_url}
                              alt={m.username}
                              className="w-8 h-8 rounded-full border-2 border-white object-cover"
                            />
                          ))}
                        </div>
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold text-green-600">{onlineCount}</span> members online now
                        </p>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={handleInviteClick}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                    >
                      <UserPlus className="w-5 h-5" />
                      Join Discord Server
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-xs text-slate-400 mt-4">
                      Free to join • No credit card required
                    </p>
                  </motion.div>
                )}

                {accessStep === "clicked" && (
                  <motion.div
                    key="clicked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-green-600">Step 1: Link Opened</span>
                      </div>
                      <div className="w-8 h-px bg-slate-200" />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">2</span>
                        </div>
                        <span className="text-sm font-medium text-slate-600">Confirm</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                      <h3 className="font-semibold text-slate-900 text-lg mb-2">
                        Did you accept the Discord invite?
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Click "Accept Invite" in the Discord popup, then come back here and confirm.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleConfirmJoined}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Yes, I've Joined!
                      </button>
                      
                      <button
                        onClick={handleInviteClick}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Invite Again
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-6">
                      Having trouble? Make sure you're logged into Discord.
                    </p>
                  </motion.div>
                )}

                {accessStep === "confirmed" && (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Welcome to the Community!</h3>
                    <p className="text-slate-500">Opening chat in a moment...</p>
                    <div className="mt-6">
                      <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Community Page (User has access)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Header */}
        <header className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Community</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Zigex Community Hub
              </h1>
              <p className="mt-2 text-slate-500 text-base lg:text-lg max-w-xl">
                Connect with fellow students, share ideas, and grow together in our global community.
              </p>
            </div>

            {/* Online Status Card */}
            <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((m) => (
                  <img
                    key={m.id}
                    src={m.avatar_url}
                    alt={m.username}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                ))}
                {onlineCount > 4 && (
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                    +{onlineCount - 4}
                  </div>
                )}
              </div>
              <div className="border-l border-slate-200 pl-4">
                <p className="text-xs text-slate-400 font-medium">Online Now</p>
                <p className="text-xl font-bold text-slate-900">{onlineCount}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Live Chat</p>
                          <p className="text-xs text-slate-400">General Channel</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRefreshKey((k) => k + 1);
                            setIsLoading(true);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        </button>
                        <a
                          href={DISCORD_INVITE}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Open Discord
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Chat Iframe */}
                    <div className="relative h-[500px] bg-slate-50">
                      {isLoading && (
                        <div className="absolute inset-0 z-10 bg-white flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                            <p className="mt-4 text-sm text-slate-500">Connecting to chat...</p>
                          </div>
                        </div>
                      )}
                      <iframe
                        key={refreshKey}
                        src={`https://e.widgetbot.io/channels/${GUILD_ID}/${PUBLIC_CHANNEL_ID}?color=2563EB&theme=light`}
                        className="w-full h-full border-none"
                        allow="clipboard-write; fullscreen"
                        onLoad={() => setIsLoading(false)}
                        title="Community Chat"
                      />
                    </div>

                    {/* Feature Tip */}
                    <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-700">
                          💡 <span className="font-medium">Tip:</span> For full features like image uploads, GIFs, and stickers, open Discord directly.
                        </p>
                        <a
                          href={DISCORD_INVITE}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                        >
                          Open Discord →
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "members" && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-bold text-slate-900">Active Members</h2>
                      <p className="text-slate-500 mt-1">Students currently online in the community</p>
                    </div>

                    {members.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex flex-col items-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="relative">
                              <img
                                src={member.avatar_url}
                                alt={member.username}
                                className="w-16 h-16 rounded-xl object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                            </div>
                            <p className="mt-3 text-sm font-medium text-slate-900 text-center truncate w-full">
                              {member.username}
                            </p>
                            <p className="text-xs text-slate-400">Online</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No members online right now</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "resources" && (
                  <motion.div
                    key="resources"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6"
                  >
                    <div className="text-center mb-8">
                      <h2 className="text-xl font-bold text-slate-900">Resources</h2>
                      <p className="text-slate-500 mt-1">Helpful materials for the community</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { title: "Getting Started Guide", desc: "Learn how to make the most of our community", icon: BookOpen },
                        { title: "Community Guidelines", desc: "Our standards for respectful interaction", icon: FileText },
                        { title: "Project Showcase", desc: "See what other students are building", icon: Zap },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{item.title}</p>
                              <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Community Stats</h3>
              <div className="space-y-4">
                {[
                  { label: "Online Now", value: onlineCount, icon: Activity, color: "text-green-600" },
                  { label: "Active Projects", value: "24", icon: Zap, color: "text-blue-600" },
                  { label: "Engagement", value: "98%", icon: Heart, color: "text-rose-500" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-sm text-slate-600">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Access Status */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Access Granted</h4>
                  <p className="text-sm text-green-700 mt-1">
                    You have full access to the community chat and features.
                  </p>
                </div>
              </div>
            </div>

            {/* Join CTA */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold text-lg">Open Full Discord</h3>
              <p className="text-blue-100 text-sm mt-2">
                Get the full experience with voice channels, exclusive content, and more.
              </p>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 bg-white text-blue-600 font-medium text-sm rounded-lg hover:bg-blue-50 transition-colors"
              >
                Open Discord
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
