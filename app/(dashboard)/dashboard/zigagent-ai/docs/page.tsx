"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  MessageSquare,
  Search,
  FileText,
  Code2,
  Lightbulb,
  Shield,
  Zap,
  ArrowRight,
  ChevronRight,
  Terminal,
  BookOpen,
  Layers,
  Globe,
  Lock,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: MessageSquare,
    title: "Conversational AI",
    description:
      "Chat naturally with Zila to get instant answers about your internship, tasks, and career growth.",
    color: "text-blue-500",
    bg: "bg-blue-500/10 dark:bg-blue-500/5",
    border: "border-blue-500/20",
  },
  {
    icon: Search,
    title: "Deep Research",
    description:
      "Zila can perform multi-step research across the web and synthesize findings into clear reports.",
    color: "text-purple-500",
    bg: "bg-purple-500/10 dark:bg-purple-500/5",
    border: "border-purple-500/20",
  },
  {
    icon: FileText,
    title: "Document Analysis",
    description:
      "Upload documents and Zila will extract key insights, summarize content, and answer questions.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/5",
    border: "border-emerald-500/20",
  },
  {
    icon: Code2,
    title: "Code Assistant",
    description:
      "Get help with debugging, code reviews, and generating boilerplate for your project tasks.",
    color: "text-amber-500",
    bg: "bg-amber-500/10 dark:bg-amber-500/5",
    border: "border-amber-500/20",
  },
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    description:
      "Receive AI-powered recommendations for skill development, task approaches, and best practices.",
    color: "text-rose-500",
    bg: "bg-rose-500/10 dark:bg-rose-500/5",
    border: "border-rose-500/20",
  },
  {
    icon: Layers,
    title: "Context Awareness",
    description:
      "Zila understands your profile, active programs, and workspace to deliver personalized guidance.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 dark:bg-cyan-500/5",
    border: "border-cyan-500/20",
  },
];

const useCases = [
  {
    question: "How do I submit my monthly project?",
    answer:
      "Navigate to your workspace, click 'Post Project', fill in the title, mission, and upload your cover image and gallery.",
  },
  {
    question: "What skills should I learn next?",
    answer:
      "Based on your current profile and program, Zila recommends focusing on React, TypeScript, and API integration patterns.",
  },
  {
    question: "Help me debug this API error",
    answer:
      "Paste your error message and Zila will analyze the stack trace, identify the root cause, and suggest a fix.",
  },
];

export default function ZilaAIDocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-16">
      {/* Hero Section */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <Sparkles size={12} className="text-amber-500" />
          AI-Powered Assistant
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
            Meet{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Zila AI
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Your intelligent companion on the Zigex platform. Zila helps you
            navigate your internship journey, research topics, write code, and
            unlock your full potential.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/zigagent-ai"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all active:scale-95"
          >
            <Brain size={16} />
            Launch Zila AI
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>

      {/* Capabilities Grid */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-foreground tracking-tight uppercase">
            Capabilities
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Everything Zila can do for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className={cn(
                "bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all duration-300 group",
                `hover:${feature.border}`
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                  feature.bg
                )}
              >
                <feature.icon size={20} className={feature.color} />
              </div>
              <h3 className="text-sm font-black text-foreground tracking-tight mb-1.5">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-8"
      >
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-foreground tracking-tight uppercase">
            How It Works
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Three simple steps to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: Terminal,
              title: "Open Zila",
              desc: "Click the Zila AI button from your dashboard sidebar or navigate directly to the chat interface.",
            },
            {
              step: "02",
              icon: MessageSquare,
              title: "Ask Anything",
              desc: "Type your question, paste code, or describe what you need. Zila understands natural language.",
            },
            {
              step: "03",
              icon: Zap,
              title: "Get Results",
              desc: "Receive instant, contextual answers powered by advanced AI tailored to your Zigex experience.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              className="relative bg-card border border-border rounded-2xl p-6 text-center group hover:shadow-md transition-all"
            >
              <div className="text-[40px] font-black text-muted/50 dark:text-muted-foreground/10 absolute top-3 right-4 select-none">
                {item.step}
              </div>
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <item.icon
                  size={22}
                  className="text-foreground"
                />
              </div>
              <h3 className="text-sm font-black text-foreground mb-2 uppercase tracking-tight">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Example Conversations */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="space-y-6"
      >
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-foreground tracking-tight uppercase">
            Example Conversations
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            See what you can ask Zila
          </p>
        </div>

        <div className="space-y-4">
          {useCases.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-sm transition-all"
            >
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <MessageSquare size={14} className="text-foreground" />
                </div>
                <p className="text-xs font-black text-foreground uppercase tracking-tight">
                  {item.question}
                </p>
              </div>
              <div className="px-5 py-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Brain size={14} className="text-white" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Trust & Security */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-card border border-border rounded-2xl p-6 sm:p-8"
      >
        <div className="text-center space-y-1 mb-8">
          <h2 className="text-xl font-black text-foreground tracking-tight uppercase">
            Built with Trust
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Your data and privacy are our priority
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Secure by Design",
              desc: "All conversations are encrypted and never shared with third parties.",
            },
            {
              icon: Lock,
              title: "Privacy First",
              desc: "Zila processes queries without storing personal information beyond your session.",
            },
            {
              icon: Globe,
              title: "Always Available",
              desc: "Access Zila 24/7 from any device with your Zigex account.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center mx-auto">
                <item.icon size={22} className="text-emerald-500" />
              </div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-tight">
                {item.title}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center space-y-4 pb-8"
      >
        <p className="text-sm text-muted-foreground font-bold">
          Ready to experience the future of intern assistance?
        </p>
        <Link
          href="/dashboard/zigagent-ai"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-blue-500/10"
        >
          <Brain size={18} />
          Start Chatting with Zila
          <ChevronRight size={16} />
        </Link>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest pt-1">
          <Star size={10} className="inline text-amber-500 mr-1" />
          Free for all Zigex members
        </p>
      </motion.div>
    </div>
  );
}
