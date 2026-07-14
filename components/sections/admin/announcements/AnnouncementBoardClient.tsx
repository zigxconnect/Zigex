"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { MoreVertical, Pin, PinOff, Trash2, Megaphone, Plus, AlertCircle, Building2, Trophy, Sparkles } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";

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

interface AnnouncementBoardClientProps {
    announcements: Announcement[];
    companies?: { id: string; company_name: string; logo_url: string; }[];
    students?: { user_id: string; full_name: string; avatar_url: string; }[];
    /** 
     * SECURITY: When true, the user is restricted to their own company.
     * The 'Publish As' dropdown will be hidden and posts will automatically
     * be attributed to their defaultCompanyId.
     */
    isCompanyUser?: boolean;
    defaultCompanyId?: string;
}

export function AnnouncementBoardClient({ 
    announcements, 
    companies = [], 
    students = [],
    isCompanyUser = false,
    defaultCompanyId
}: AnnouncementBoardClientProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(defaultCompanyId || "");
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Update selected company if defaultCompanyId changes
    useEffect(() => {
        if (defaultCompanyId) {
            setSelectedCompanyId(defaultCompanyId);
        }
    }, [defaultCompanyId]);

    const handleCreate = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            let imageUrl = undefined;

            if (imageFile) {
                const supabase = createClient();
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('announcements')
                    .upload(filePath, imageFile);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                     // If bucket doesn't exist or RLS issue, we might want to continue without image or warn
                     // But for now let's warn
                     toast.warning("Failed to upload image. Posting without it.");
                } else {
                     const { data: { publicUrl } } = supabase.storage.from('announcements').getPublicUrl(filePath);
                     imageUrl = publicUrl;
                }
            }

            const res = await createAnnouncement({
                title,
                content,
                company_id: selectedCompanyId || undefined,
                tagged_student_id: selectedStudentId || undefined,
                image_url: imageUrl
            });

            if (res.success) {
                toast.success("Announcement posted successfully");
                setIsCreateOpen(false);
                setTitle("");
                setContent("");
                setSelectedCompanyId("");
                setSelectedStudentId("");
                setImageFile(null);
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
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Announcement</DialogTitle>
                            <DialogDescription>
                                Post a new update to the internship community.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            {/* 
                            SECURITY: Company selector is ONLY shown if isCompanyUser is false.
                            For company admins and supervisors, they can ONLY post as their own company.
                            The defaultCompanyId is automatically used on the server-side as a fallback.
                        */}
                        {!isCompanyUser && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Publish As</label>
                                <select 
                                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={selectedCompanyId}
                                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                                >
                                    {/* Only show companies the user has access to */}
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.company_name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {isCompanyUser && companies.length > 0 && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-700 font-medium">
                                    Posting as: <span className="font-bold">{companies[0]?.company_name}</span>
                                </p>
                            </div>
                        )}
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
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Write your announcement here..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center justify-between">
                                    <span>Intern of the Week?</span>
                                    <span className="text-[10px] text-amber-600 font-bold uppercase ring-1 ring-amber-100 px-2 py-0.5 rounded-full bg-amber-50">Award Badge</span>
                                </label>
                                <select 
                                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                >
                                    <option value="">No Intern Selection</option>
                                    {students.map(s => (
                                        <option key={s.user_id} value={s.user_id}>{s.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Attachment (Optional)</label>
                                <div className="flex items-center gap-4">
                                    <Input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                        className="cursor-pointer text-xs"
                                    />
                                </div>
                                {imageFile && (
                                    <p className="text-xs text-green-600 flex items-center mt-1">
                                        <CheckCircle2 className="w-3 h-3 mr-1"/> Selected: {imageFile.name}
                                    </p>
                                )}
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
                            "transition-all duration-200 hover:shadow-md overflow-hidden",
                            announcement.is_pinned && "border-blue-200 bg-blue-50/30"
                        )}>
                            {announcement.image_url && (
                                <div className="w-full h-48 sm:h-64 relative bg-slate-100">
                                    <img 
                                        src={announcement.image_url} 
                                        alt={announcement.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {announcement.is_pinned && (
                                            <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
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
                                        {announcement.tagged_student && (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Trophy className="h-3 w-3" /> Intern of the Week
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
                                <div 
                                    className="text-sm leading-relaxed text-slate-600 prose prose-sm max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-xl prose-img:shadow-md"
                                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                                />
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
