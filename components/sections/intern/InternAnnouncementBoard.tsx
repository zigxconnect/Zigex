"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pin, Megaphone, Building2, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
}

interface InternAnnouncementBoardProps {
    announcements: Announcement[];
}

export function InternAnnouncementBoard({ announcements }: InternAnnouncementBoardProps) {
    if (announcements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-blue-500">
                    <Megaphone size={32} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Announcements Yet</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">
                    Stay tuned! Updates from your company and the Zigex team will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Bell className="text-white w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Announcements</h2>
                    <p className="text-sm text-slate-500">Latest news and updates for you</p>
                </div>
            </div>

            <div className="grid gap-4">
                <AnimatePresence>
                    {announcements.map((announcement, index) => (
                        <motion.div
                            key={announcement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={cn(
                                "border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-md overflow-hidden relative group",
                                announcement.is_pinned 
                                    ? "bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 border-blue-200 dark:border-blue-800"
                                    : "bg-white dark:bg-slate-900"
                            )}>
                                {announcement.image_url && (
                                    <div className="w-full h-48 sm:h-64 relative bg-slate-100 dark:bg-slate-800">
                                        <img 
                                            src={announcement.image_url} 
                                            alt={announcement.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                )}
                                
                                {announcement.is_pinned && (
                                    <div className="absolute top-0 right-0 p-3 z-10">
                                        <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
                                            <Pin className="w-3.5 h-3.5 text-blue-600 rotate-45 fill-blue-600/20" />
                                        </div>
                                    </div>
                                )}
                                
                                <CardHeader className="pb-3 relative">
                                    <div className="flex items-center gap-3 mb-2">
                                        {announcement.company ? (
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold px-2 py-1 rounded-md flex items-center gap-1.5 tracking-wider">
                                                <Building2 className="w-3 h-3" />
                                                {announcement.company.company_name}
                                            </span>
                                        ) : (
                                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] uppercase font-bold px-2 py-1 rounded-md flex items-center gap-1.5 tracking-wider">
                                                <Megaphone className="w-3 h-3" />
                                                Zigex Global
                                            </span>
                                        )}
                                        <span className="text-slate-400 text-xs flex items-center gap-1">
                                            • {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 transition-colors">
                                        {announcement.title}
                                    </CardTitle>
                                </CardHeader>
                                
                                <CardContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                        {announcement.content}
                                    </div>
                                    
                                    {announcement.author && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                {announcement.author.avatar_url ? (
                                                    <img src={announcement.author.avatar_url} alt={announcement.author.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {announcement.author.full_name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium">
                                                Posted by {announcement.author.full_name}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
