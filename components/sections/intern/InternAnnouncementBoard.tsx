"use client";

import React from "react";
import { Pin, Megaphone, Building2, Bell, Share2, MessageCircle, Heart, MoreHorizontal, Globe, Trophy, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Announcement {
    id: string;
    title: string;
    content: string;
    is_pinned: boolean;
    created_at: string;
    image_url?: string;
    author: {
        full_name: string;
        avatar_url: string;
    } | null;
    company: {
        company_name: string;
        logo_url: string;
    } | null;
    tagged_student?: {
        full_name: string;
        avatar_url: string;
    } | null;
}

interface InternAnnouncementBoardProps {
    announcements: Announcement[];
}

export function InternAnnouncementBoard({ announcements }: InternAnnouncementBoardProps) {
    if (announcements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center shadow-sm">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center mb-6 text-blue-500">
                    <Megaphone size={36} className="animate-bounce" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">All Quiet on the Feed</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-xs font-medium">
                    Check back later for new updates from your company and the ZIGEX team.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                        <Bell className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Timeline</h2>
                        <p className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Latest Updates</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Globe size={18} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {announcements.map((announcement, index) => (
                        <motion.div
                            key={announcement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "group relative bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden hover:border-blue-200 dark:hover:border-slate-700 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/5",
                                announcement.is_pinned && "border-blue-100 bg-blue-50/20"
                            )}
                        >
                            {/* Pinned Label */}
                            {announcement.is_pinned && (
                                <div className="px-6 pt-3 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                    <Pin size={10} className="rotate-45 fill-blue-600" />
                                    <span>Pinned by Admin</span>
                                </div>
                            )}

                            <div className="p-4 sm:p-5 sm:p-7 flex gap-3 sm:gap-4">
                                {/* Left: Avatar/Logo */}
                                <div className="shrink-0 pt-1">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800 shadow-sm border border-slate-100">
                                        {announcement.company?.logo_url ? (
                                            <img src={announcement.company.logo_url} alt={announcement.company.company_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-black italic">
                                                Z
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                                {announcement.company?.company_name || "Zigex Global"}
                                            </span>
                                            {announcement.company && (
                                                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                </div>
                                            )}
                                            <span className="text-slate-400 text-xs truncate">
                                                @{announcement.company?.company_name?.toLowerCase().replace(/\s/g, '') || "zigex"} • {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <button className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>

                                    <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">
                                        {announcement.title}
                                    </h3>

                                    <div 
                                        className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-medium prose prose-sm max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-xl prose-img:max-w-full prose-headings:text-slate-900 dark:prose-headings:text-white dark:prose-p:text-slate-400"
                                        dangerouslySetInnerHTML={{ __html: announcement.content }}
                                    />

                                    {/* Tagged student: Intern of the Week */}
                                    {announcement.tagged_student && (
                                        <motion.div 
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="mb-6 p-4 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-900">
                                                        <img 
                                                            src={announcement.tagged_student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(announcement.tagged_student.full_name)}&background=random`} 
                                                            alt={announcement.tagged_student.full_name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1 rounded-lg">
                                                        <Trophy size={12} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-black uppercase text-amber-600 tracking-wider flex items-center gap-1">
                                                            <Sparkles size={12} /> Intern of the Week
                                                        </span>
                                                    </div>
                                                    <h4 className="font-black text-slate-900 dark:text-white leading-none mt-1">
                                                        {announcement.tagged_student.full_name}
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block text-[10px] font-black uppercase text-amber-500/50 mr-2">
                                                Congratulations!
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Media Preview */}
                                    {announcement.image_url && (
                                        <div className="relative rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 mb-4 aspect-[16/9] group/img">
                                            <img 
                                                src={announcement.image_url} 
                                                alt={announcement.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                        </div>
                                    )}

                                    {/* Engagement Bar (Purely Visual for Premium Feel) */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/50">
                                        <div className="flex gap-6">
                                            <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors group/btn">
                                                <div className="p-2 rounded-full group-hover/btn:bg-blue-50 dark:group-hover/btn:bg-blue-900/20">
                                                    <MessageCircle size={16} />
                                                </div>
                                                <span className="text-[10px] font-bold">2</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors group/btn">
                                                <div className="p-2 rounded-full group-hover/btn:bg-rose-50 dark:group-hover/btn:bg-rose-900/20">
                                                    <Heart size={16} />
                                                </div>
                                                <span className="text-[10px] font-bold">12</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-slate-400 hover:text-green-500 transition-colors group/btn">
                                                <div className="p-2 rounded-full group-hover/btn:bg-green-50 dark:group-hover/btn:bg-green-900/20">
                                                    <Share2 size={16} />
                                                </div>
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {[1,2,3].map(i => (
                                                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                                                        <div className="w-full h-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">
                                                            {i}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold">Seen by 42 others</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
