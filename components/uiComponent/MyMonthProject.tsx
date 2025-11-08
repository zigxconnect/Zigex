"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ContributeModal from "./ContributeModal";
// import ContributeModal from "./ContributeModal";

type Avatar = { src?: string | null; name?: string };

type Project = {
  title?: string;
  description?: string;
  mainImage?: string | null;
  thumbnails?: Array<string | null>;
  githubUrl?: string | null;
  developers?: Avatar[];
};

interface Props {
  user?: {
    id?: string;
    full_name?: string;
    avatar_url?: string | null;
    github_url?: string | null;
  } | null;
  project?: Project | null;
}

export default function MyMonthProject({ user, project }: Props) {
  const [open, setOpen] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);

  // lock body scroll when open on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const original = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Fallback demo project if none provided
  const demo: Project = {
    title: "AI Tutor — Monthly Sprint",
    description:
      "Designing an intelligent study assistant that creates personalized micro-lessons and generates practice problems based on student progress. Focus this month: adaptive question generation and hinting system.",
    mainImage: project?.mainImage || "/n8.png",
    thumbnails: project?.thumbnails || ["/z3.png", "/n8.png", "/z3.png", "/n8.png"],
    githubUrl: project?.githubUrl || user?.github_url || "#",
    developers: project?.developers || [
      { src: user?.avatar_url || "/z3.png", name: user?.full_name || "You" },
      { src: "/z3.png", name: "Alex" },
      { src: "/z3.png", name: "Sam" },
    ],
  };

  const p = project ? { ...demo, ...project } : demo;

  return (
    <div>
      {/* Mobile: floating toggle button */}
      <button
        aria-expanded={open}
        aria-controls="my-month-project-panel"
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-4 bottom-6 z-50 inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-full shadow-lg border border-blue-700 hover:bg-blue-700 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
        <span className="text-sm font-medium">See month project</span>
      </button>

      {/* Overlay for mobile when open */}
      {open && <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-40" />}

      {/* Desktop aside (visible on md+) */}
      <aside id="my-month-project-panel" className="fixed right-6 top-32 w-72 lg:w-80 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hidden md:block">
        <div className="relative h-36 w-full bg-gray-100">
          <Image src={"/projects.png"} alt={p.title || "Project"} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          <div className="absolute left-4 bottom-3">
            <h4 className="text-white text-sm font-semibold drop-shadow">{p.title}</h4>
            <p className="text-xs text-white/90 drop-shadow">Monthly highlight</p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h5 className="text-sm font-bold text-gray-900">{p.title}</h5>
              <p className="mt-1 text-xs text-gray-600 line-clamp-3">{p.description}</p>
            </div>

            <div className="flex-shrink-0">
              <Link href={p.githubUrl || '#'} target="_blank" className="inline-flex items-center justify-center w-9 h-9 bg-gray-50 rounded-lg border border-gray-200 hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                  <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.6-3.37-1.34-3.37-1.34-.45-1.17-1.11-1.48-1.11-1.48-.91-.62.07-.61.07-.61 1.01.07 1.55 1.04 1.55 1.04.9 1.55 2.36 1.1 2.94.84.09-.66.35-1.1.63-1.35-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.84c.85.004 1.71.115 2.51.337 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.6 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(p.thumbnails || []).slice(0,4).map((t, i) => (
              <div key={i} className="h-12 w-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                {t ? (
                  <Image src={t} alt={`thumb-${i}`} width={48} height={48} className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
            ))}
          </div>

          {/* Developers (overlapping avatars) */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-3">
              {(p.developers || []).slice(0,5).map((d, i) => (
                <div key={i} className="w-8 h-8 rounded-full ring-2 ring-white overflow-hidden shadow-sm bg-white">
                  {d?.src ? (
                    <img src={d.src} alt={d.name || 'dev'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">{(d?.name || "").split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-600">
              <div className="font-semibold text-gray-900">{(p.developers || []).length} contributors</div>
              <div>Active this month</div>
            </div>
          </div>

          {/* Contribute Button */}
          <button
            onClick={() => setShowContributeModal(true)}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-md font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Contribute to this project
          </button>
        </div>
      </aside>

      {/* Mobile sliding panel - slides in from left */}
      <aside
        className={
          "md:hidden fixed top-0 left-0 h-full z-50 w-72 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 " + (open ? "translate-x-0" : "-translate-x-full")
        }
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md overflow-hidden bg-gray-100">
              {p.mainImage ? (
                <Image src={p.mainImage} alt={p.title || "Project"} width={36} height={36} className="object-cover" />
              ) : null}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{p.title}</div>
              <div className="text-xs text-gray-500">Monthly highlight</div>
            </div>
          </div>

          <button 
            onClick={() => setOpen(false)} 
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Close panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full pb-20">
          <div className="relative h-36 w-full bg-gray-100 rounded-md overflow-hidden">
            <Image src={p.mainImage || "/n8.png"} alt={p.title || "Project"} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          </div>

          <div className="mt-4">
            <h5 className="text-sm font-bold text-gray-900">{p.title}</h5>
            <p className="mt-1 text-xs text-gray-600">{p.description}</p>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {(p.thumbnails || []).slice(0,4).map((t, i) => (
              <div key={i} className="h-12 w-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                {t ? (
                  <img src={t} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-3">
              {(p.developers || []).slice(0,5).map((d, i) => (
                <div key={i} className="w-8 h-8 rounded-full ring-2 ring-white overflow-hidden shadow-sm bg-white">
                  {d?.src ? (
                    <img src={d.src} alt={d.name || 'dev'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-semibold">{(d?.name || "").split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-600">
              <div className="font-semibold text-gray-900">{(p.developers || []).length} contributors</div>
              <div>Active this month</div>
            </div>
          </div>

          <Link 
            href={p.githubUrl || '#'} 
            target="_blank"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.6-3.37-1.34-3.37-1.34-.45-1.17-1.11-1.48-1.11-1.48-.91-.62.07-.61.07-.61 1.01.07 1.55 1.04 1.55 1.04.9 1.55 2.36 1.1 2.94.84.09-.66.35-1.1.63-1.35-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.84c.85.004 1.71.115 2.51.337 1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.6 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.86 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
            </svg>
            View on GitHub
          </Link>

          {/* Contribute Button for Mobile */}
          <button
            onClick={() => setShowContributeModal(true)}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-md font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Contribute to this project
          </button>
        </div>
      </aside>

      {/* Contribute Modal */}
      <ContributeModal 
        isOpen={showContributeModal} 
        onClose={() => setShowContributeModal(false)}
        projectTitle={p.title}
        githubUrl={p.githubUrl}
      />
    </div>
  );
}