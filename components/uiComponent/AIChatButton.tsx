
"use client";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function AIChatButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Open ZigAgent AI Chat"
      onClick={() => router.push("/dashboard/zigagent-ai")}
      className="fixed bottom-6 right-6 cursor-pointer z-50 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg px-5 py-4 flex items-center gap-2 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{ boxShadow: "0 4px 24px rgba(30, 64, 175, 0.15)" }}
    >
      {/* <Sparkles className="w-6 h-6" /> */}
      <span className="font-semibold text-base  sm:inline">AI</span>
    </button>
  );
}

