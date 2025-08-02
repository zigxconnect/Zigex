"use client";

import { useState, useEffect } from "react";
import { Bot, History, Wrench, Send, Sparkles } from "lucide-react";
import React from "react";

const tools = [
  { id: "smartapply", name: "SmartApply", icon: "🎯" },
  { id: "jobguru", name: "JobGuru", icon: "💼" },
];

const quickPrompts = [
  "Find tech internships in Bamenda",
  "Help me write an application letter",
  // "What companies offer internships?",
  // "Prepare me for interviews",
];

const recentHistory = [
  "Tech internships in Bamenda",
  "Application letter tips",
  "Interview preparation guide",
  "Company research methods",
];

// Function to get greeting based on time of day
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "Good evening";
  } else {
    return "Good night";
  }
};

// Function to get appropriate emoji for time of day
const getTimeEmoji = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "🌅";
  } else if (hour >= 12 && hour < 17) {
    return "☀️";
  } else if (hour >= 17 && hour < 22) {
    return "🌆";
  } else {
    return "🌙";
  }
};

export default function FuproAiPage() {
  const [message, setMessage] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [timeEmoji, setTimeEmoji] = useState("");
  const [userName, setUserName] = useState(""); // You can get this from your auth context or props

  useEffect(() => {
    // Set the greeting and emoji when component mounts
    setGreeting(getTimeBasedGreeting());
    setTimeEmoji(getTimeEmoji());
    
    // Get user name from your authentication system
    // For now, I'll use a placeholder. Replace this with your actual user data
    // Example: const user = useAuth(); setUserName(user?.name || "there");
    setUserName("Gita"); // Replace with actual user name from your auth system
    
    // Optional: Update greeting every minute to keep it current
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
      setTimeEmoji(getTimeEmoji());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      // Handle message sending logic here
      console.log("Sending:", message, "with tool:", selectedTool);
      setMessage("");
      setSelectedTool(null);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      {/* <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">FuproAI</h1>
            <p className="text-sm text-gray-500">AI Assistant for Internships</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <History className="w-5 h-5" />
        </button>
      </div> */}

      {/* Chat Area */}
      <div className="flex-1 flex">
        {/* Main Chat */}
        <div className="flex-1 flex flex-col">
          {/* Welcome State */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-md mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              {/* Dynamic Greeting */}
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  {greeting} {userName}! {timeEmoji}
                </h2>
                <p className="text-lg text-gray-700 mb-2">
                  Welcome to FuproAI
                </p>
              </div>
              
              <p className="text-gray-600">
                Your intelligent assistant for finding internships in Bamenda. Ask me anything or try one of these prompts.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-sm">
                      💡
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {prompt}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100">
            <div className="max-w-4xl mx-auto">
              {/* Selected Tool Indicator */}
              {selectedTool && (
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Using tool:</span>
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                    <span>{tools.find(t => t.id === selectedTool)?.icon}</span>
                    <span>{tools.find(t => t.id === selectedTool)?.name}</span>
                    <button
                      onClick={() => setSelectedTool(null)}
                      className="ml-1 text-blue-400 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Input Container */}
              <div className="relative">
                <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-3 border border-gray-200 focus-within:border-blue-300 focus-within:bg-white transition-all">
                  {/* Tools Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowTools(!showTools)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Wrench className="w-5 h-5" />
                    </button>
                    
                    {/* Tools Dropdown */}
                    {showTools && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[140px]">
                        {tools.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => {
                              setSelectedTool(tool.id);
                              setShowTools(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                          >
                            <span>{tool.icon}</span>
                            <span className="text-sm text-gray-700">{tool.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text Input */}
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`${greeting} ${userName}! Ask me about internships, companies, or application tips...`}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500 max-h-32 min-h-[24px]"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Footer Text */}
              <p className="text-xs text-gray-400 text-center mt-2">
                FuproAI can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="w-80 border-l border-gray-100 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Recent Conversations</h3>
            </div>
            <div className="p-4 space-y-2">
              {recentHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMessage(item);
                    setShowHistory(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-white transition-colors text-sm text-gray-700 hover:text-gray-900"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}