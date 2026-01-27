"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Pin, PinOff, Trash2, Megaphone, Plus, AlertCircle, Building2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createAnnouncement, deleteAnnouncement, togglePinAnnouncement } from "@/lib/actions/announcement.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Announcement {
    id: string;
    title: string;
    content: string;
    is_pinned: boolean;
    created_at: string;
    author: {
        full_name: string;
        avatar_url: string;
    } | null;
    company: {
        company_name: string;
        logo_url: string;
    } | null;
}

interface AnnouncementBoardClientProps {
    announcements: Announcement[];
}

export function AnnouncementBoardClient({ announcements }: AnnouncementBoardClientProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isGlobal, setIsGlobal] = useState(true); // Default to Zigex Global? Depending on actual use case. Assuming admin context.

    const handleCreate = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const res = await createAnnouncement({
                title,
                content,
                // If isGlobal is false, we might want to attach current company ID if available in context, 
                // but for now let's keep it simple: null = global.
                company_id: undefined // undefined means global in our action for now unless we pass specific ID
            });

            if (res.success) {
                toast.success("Announcement posted successfully");
                setIsCreateOpen(false);
                setTitle("");
                setContent("");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to post announcement");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        
        const res = await deleteAnnouncement(id);
        if (res.success) {
            toast.success("Announcement deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete");
        }
    };

    const handleTogglePin = async (id: string, currentStatus: boolean) => {
        const res = await togglePinAnnouncement(id, currentStatus);
        if (res.success) {
            toast.success(currentStatus ? "Unpinned announcement" : "Pinned announcement");
            router.refresh();
        } else {
            toast.error("Failed to update pin status");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
                    <p className="text-muted-foreground">Manage company-wide updates and alerts.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-blue-500/20">
                            <Plus className="mr-2 h-4 w-4" /> New Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Announcement</DialogTitle>
                            <DialogDescription>
                                Post a new update to the internship community.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input 
                                    placeholder="e.g. Schedule Update for Sprint Review" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea 
                                    placeholder="Write your announcement here..." 
                                    className="min-h-[120px]"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={isLoading}>
                                {isLoading ? "Posting..." : "Post Announcement"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {announcements.length === 0 ? (
                    <Card className="bg-slate-50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Megaphone className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No announcements yet</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                Start communicating with your team by creating the first announcement.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    announcements.map((announcement) => (
                        <Card key={announcement.id} className={cn(
                            "transition-all duration-200 hover:shadow-md",
                            announcement.is_pinned && "border-blue-200 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-900/10"
                        )}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {announcement.is_pinned && (
                                            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Pin className="h-3 w-3" /> Pinned
                                            </span>
                                        )}
                                        {announcement.company ? (
                                            <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Building2 className="h-3 w-3" /> {announcement.company.company_name}
                                            </span>
                                        ) : (
                                            <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Megaphone className="h-3 w-3" /> Zigex Global
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg font-bold pt-1">
                                        {announcement.title}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 text-xs">
                                        <span>Posted by {announcement.author?.full_name || "Admin"}</span>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</span>
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleTogglePin(announcement.id, announcement.is_pinned)}>
                                            {announcement.is_pinned ? (
                                                <><PinOff className="mr-2 h-4 w-4" /> Unpin</>
                                            ) : (
                                                <><Pin className="mr-2 h-4 w-4" /> Pin to Top</>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                            onClick={() => handleDelete(announcement.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                                    {announcement.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
