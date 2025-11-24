"use client";

import React from "react";
import Link from "next/link";

export default function FuproAiPage() {
  const team = [
    { id: 1, name: "Fonyuy Gita", avatar: "https://i.pravatar.cc/150?img=32", role: "ML Engineer" },
    { id: 2, name: "Leohnard Kwaleh", avatar: "https://i.pravatar.cc/150?img=12", role: "Product" },
    { id: 3, name: "Favour Deoum", avatar: "https://i.pravatar.cc/150?img=44", role: "Research" },
    { id: 4, name: "Maxwell", avatar: "https://i.pravatar.cc/150?img=56", role: "Frontend" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-3xl shadow-2xl p-6 sm:p-10 text-center transform-gpu transition-all duration-500 ease-out sm:scale-95 scale-100">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {/* Animated agentic icon */}
              <div className="w-32 h-32 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl transform transition-transform duration-500 hover:scale-105 active:scale-98 animate-float">
                <svg className="w-16 h-16 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
                  <path d="M8 12c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9.5 10h.01M14.5 10h.01" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <span className="absolute -bottom-2 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold bg-white rounded-full text-blue-600 shadow">beta</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Team is workin on the AI feature which is amazing</h1>
          <p className="text-sm text-slate-600 mb-6">We're building something powerful — join the team or follow progress as we bring AI to Zigex.</p>

          <div className="flex items-center justify-center gap-4 mb-6 overflow-x-auto no-scrollbar py-2">
            {team.map((m) => (
              <div key={m.id} className="flex flex-col items-center text-center min-w-[72px]">
                <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md" />
                <div className="text-xs text-slate-700 mt-2 font-medium">{m.name}</div>
                <div className="text-[10px] text-slate-400">{m.role}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/fupro-ai/join"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Join AI Team
            </Link>

            <a
              href="mailto:ai@zigex.example"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
            >
              Contact Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

  <style jsx>{`
    .animate-float { animation: float 4s ease-in-out infinite; }
    @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0); } }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>

