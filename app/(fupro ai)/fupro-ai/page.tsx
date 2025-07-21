"use client";
import { PromptCard } from "@/app/_components/sections/fupro ai/PromptCard";
import { Bot, FileText, Building, MessageSquare } from "lucide-react";
import React from "react";
import { useAiContext } from "../AiContext";

const prompts = [
  {
    icon: Bot,
    title: "Tech Internships",
    description: "Help me find tech internships in Bamenda",
  },
  {
    icon: FileText,
    title: "Application Letters",
    description: "How do I write a compelling internship application letter?",
  },
  {
    icon: Building,
    title: "Companies Directory",
    description: "What companies in Bamenda offer student internships?",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    description: "Prepare me for internship interviews in Bamenda",
  },
];

export default function FuproAiPage() {
  const { setInputValue } = useAiContext();

  const handleCardClick = (description: string) => {
    setInputValue(description);
  };

  return (
    <div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center">
      <div className="text-center animate-fade-in-up">
        <h1 className="text-5xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent animate-gradient-shift">
          FuproAI
        </h1>
        <p className="mt-2 text-lg text-gray-600 animate-fade-in-up delay-200">
          Your intelligent AI assistant for finding internships in Bamenda
        </p>

        <div className="mt-4 flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 w-full max-w-3xl">
        {prompts.map((prompt, index) => (
          <div
            key={prompt.title}
            className="animate-fade-in-up"
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <PromptCard
              {...prompt}
              onClick={() => handleCardClick(prompt.description)}
            />
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-400 animate-pulse">
        Click a card to get started or type your question below
      </div>
    </div>
  );
}