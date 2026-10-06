"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Linkedin, MessageCircle, Mail, X, Users, AtSign, ArrowRight, CheckCircle2, ChevronRight, Inbox } from "lucide-react";
import StackedAvatars from "./StackedAvatars";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import DeveloperAvatarOverlap from "@/components/ui/DeveloperAvatarOverlap";
import { slugifyUsername, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SimilarStudent {
  id: string;
  username?: string;
  full_name: string | null;
  avatar_url?: string | null;
  university?: string | null;
  linkedin_url?: string | null;
  phone?: string | null;
  email?: string | null;
  hard_skills?: string[] | null;
  soft_skills?: string[] | null;
}

export default function SimilarStudentsSidebar({
  students,
}: {
  students: SimilarStudent[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const avatarFallback = "https://i.ibb.co/8n8d37H4/white-logo-4x.png";

  return (
    <>
      {/* Mobile Trigger (Stacked Avatars) */}
      <div className="lg:hidden">
        {students && students.length > 0 ? (
          <StackedAvatars
            avatars={students.map(s => ({ src: s.avatar_url || avatarFallback, name: s.full_name }))}
            maxVisible={3}
            moreCount={students.length > 3 ? students.length - 3 : 0}
            onClick={() => setOpen(true)}
          />
        ) : null}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
             <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border shadow-2xl overflow-y-auto custom-scrollbar"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 dark:bg-blue-600/20 rounded-2xl flex items-center justify-center text-white dark:text-blue-400 shadow-lg shadow-blue-100 dark:shadow-none">
                      <AtSign size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">Peer Network</h3>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Connect with explorers</p>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} className="p-3 bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {students.map((s, index) => (
                    <motion.article
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setOpen(false);
                        router.push(`/dashboard/student/${slugifyUsername(s.username || s.id)}`);
                      }}
                      className="group flex flex-col p-6 rounded-[2rem] border border-border bg-slate-50/20 dark:bg-slate-900/10 hover:bg-card hover:border-[#155DFC]/20 hover:shadow-xl hover:shadow-blue-50/50 dark:hover:shadow-none transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-blue-600 border-2 border-white dark:border-slate-850 shadow-md">
                          <Image
                            src={s.avatar_url || avatarFallback}
                            alt={s.full_name || "S"}
                            fill
                            className={cn("object-cover", !s.avatar_url && "p-2")}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-black text-slate-900 dark:text-white truncate tracking-tight">{s.full_name || 'Unnamed'}</span>
                            <div className="bg-blue-600 rounded-full p-0.5"><CheckCircle2 size={8} className="text-white fill-current" /></div>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{s.university || "Zigex Voyager"}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(s.hard_skills || []).slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-card border border-border rounded-lg text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block space-y-8 h-fit">
        <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100 dark:shadow-none">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1">Recommended</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">People you may know</p>
              </div>
            </div>
            <Link href="/dashboard/student" title="View All" className="p-2.5 bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white rounded-xl transition-all">
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="space-y-2">
            {students.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                <p className="text-[10px] font-black uppercase tracking-widest">Finding matches...</p>
              </div>
            )}

            {students.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(`/dashboard/student/${slugifyUsername(s.username || s.id)}`)}
                className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all duration-300 cursor-pointer relative"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-blue-600 border border-border shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src={s.avatar_url || avatarFallback}
                    alt={s.full_name || "S"}
                    fill
                    className={cn("object-cover", !s.avatar_url && "p-2")}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-black text-sm text-slate-900 dark:text-white truncate tracking-tight group-hover:text-blue-600 transition-colors">
                      {s.full_name || 'Unnamed'}
                    </span>
                    <CheckCircle2 size={10} className="text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{s.university || "Global Voyager"}</p>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  <ChevronRight size={16} className="text-blue-600" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Link href="/dashboard/student" className="w-full h-12 rounded-2xl border border-border flex items-center justify-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all duration-300">
              Discover More Peers
            </Link>
          </div>
        </div>

        {/* Exclusive Mentorship Promo Block */}

      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}</style>
    </>
  );
}
