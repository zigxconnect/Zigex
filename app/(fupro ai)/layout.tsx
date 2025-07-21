'use client';

import { ChatInput } from "../_components/sections/fupro ai/ChatInput";
import { AiContextProvider } from "./AiContext";
import React from "react";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return (
    <AiContextProvider>
      <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 transition-all duration-500">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-orange-200/20 rounded-full blur-lg animate-bounce delay-1000"></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-purple-200/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
        </div>

        <main className="flex-1 overflow-y-auto relative z-10 animate-fade-in pb-[100px]">
          {children}
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4 shadow-lg animate-slide-up z-50 flex-shrink-0">
          <ChatInput />
        </div>
      </div>
    </AiContextProvider>
  );
}
