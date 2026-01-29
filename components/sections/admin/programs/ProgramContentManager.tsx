"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  FileText,
  Video,
  Github,
  Link2,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import { ProgramContentEditor } from "./ProgramContentEditor";

interface ProgramContent {
  id: string;
  program_id: string;
  title: string;
  description?: string;
  content_type: "lesson" | "resource" | "assignment";
  week_number?: number;
  date_due?: string;
  video_url?: string;
  github_url?: string;
  google_docs_url?: string;
  content_url?: string;
  assignment_details?: string;
  display_order: number;
  payment_required: boolean;
  published: boolean;
  created_at: string;
}

interface ProgramContentManagerProps {
  program: {
    id: string;
    title: string;
  };
  initialContent: ProgramContent[];
}

export function ProgramContentManager({ program, initialContent }: ProgramContentManagerProps) {
  const router = useRouter();
  const [content, setContent] = useState<ProgramContent[]>(initialContent);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProgramContent | null>(null);
  
  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Group content by week
  const groupedContent = content
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || item.content_type === typeFilter;
      return matchesSearch && matchesType;
    })
    .reduce((acc, item) => {
      const week = item.week_number || 0;
      if (!acc[week]) acc[week] = [];
      acc[week].push(item);
      return acc;
    }, {} as Record<number, ProgramContent[]>);

  // Sort weeks
  const sortedWeeks = Object.keys(groupedContent)
    .map(Number)
    .sort((a, b) => a - b);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/companies/programs/content?id=${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete content");

      setContent(content.filter(item => item.id !== deleteId));
      toast.success("Content deleted successfully");
    } catch (error) {
      toast.error("Failed to delete content");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (item: ProgramContent) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleSave = (savedItem: ProgramContent) => {
    if (editingItem) {
      // Update
      setContent(content.map(item => item.id === savedItem.id ? savedItem : item));
      toast.success("Content updated successfully");
    } else {
      // Create
      setContent([...content, savedItem]);
      toast.success("Content created successfully");
    }
    setIsEditorOpen(false);
    setEditingItem(null);
    router.refresh();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lesson": return <BookOpen size={16} className="text-blue-500" />;
      case "assignment": return <FileText size={16} className="text-orange-500" />;
      case "resource": return <Link2 size={16} className="text-emerald-500" />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Link 
            href="/admin/programs/content" 
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-2 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Programs
          </Link>
          <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
            {program.title}
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
             Manage curriculum content, assignments and resources
          </p>
        </div>
        
        <Button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl px-6 h-11 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Add Content
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-slate-200 bg-white shadow-sm rounded-2xl sticky top-4 z-20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search content..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
             <Button 
               variant={typeFilter === "all" ? "default" : "outline"}
               onClick={() => setTypeFilter("all")}
               className={`rounded-xl px-4 h-11 ${typeFilter === "all" ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}
             >
               All
             </Button>
             <Button 
               variant={typeFilter === "lesson" ? "default" : "outline"}
               onClick={() => setTypeFilter("lesson")}
               className={`rounded-xl px-4 h-11 gap-2 ${typeFilter === "lesson" ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}
             >
               <BookOpen size={16} /> Lessons
             </Button>
             <Button 
               variant={typeFilter === "assignment" ? "default" : "outline"}
               onClick={() => setTypeFilter("assignment")}
               className={`rounded-xl px-4 h-11 gap-2 ${typeFilter === "assignment" ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}
             >
               <FileText size={16} /> Assignments
             </Button>
             <Button 
               variant={typeFilter === "resource" ? "default" : "outline"}
               onClick={() => setTypeFilter("resource")}
               className={`rounded-xl px-4 h-11 gap-2 ${typeFilter === "resource" ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" : "text-slate-600 border-slate-200 hover:bg-slate-50"}`}
             >
               <Link2 size={16} /> Resources
             </Button>
          </div>
        </div>
      </Card>

      {/* Content List */}
      <div className="space-y-8">
        {content.length === 0 ? (
          <div className="text-center py-20 px-4 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <BookOpen size={32} />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">No Content Yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">Start building your curriculum by adding lessons, assignments, or resources.</p>
            <Button onClick={handleCreate} variant="outline" className="border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50">
              Create First Item
            </Button>
          </div>
        ) : sortedWeeks.map((week) => (
          <div key={week} className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-4 sticky top-24 z-10 py-2 bg-gray-50/95 backdrop-blur-sm pr-4 rounded-r-xl w-fit">
              <div className="px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                {week === 0 ? "General" : `Week ${week}`}
              </div>
              <div className="h-px bg-slate-200 flex-1 min-w-[100px]" />
            </div>

            <div className="grid gap-4">
              {groupedContent[week]?.map((item) => (
                <Card 
                  key={item.id} 
                  className="p-5 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Drag Handle / Order */}
                    <div className="hidden sm:flex flex-col items-center justify-center gap-1 text-slate-300 pt-1 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors">
                      <MoreVertical size={14} />
                      <MoreVertical size={14} className="-mt-1" />
                    </div>

                    {/* Icon */}
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm
                      ${item.content_type === 'lesson' ? 'bg-blue-50' : 
                        item.content_type === 'assignment' ? 'bg-orange-50' : 'bg-emerald-50'}
                    `}>
                      {getTypeIcon(item.content_type)}
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-2 mb-1.5">
                         <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors line-clamp-1">
                           {item.title}
                         </h3>
                         {item.payment_required && (
                           <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-2 h-5">
                             Premium
                           </Badge>
                         )}
                       </div>
                       
                       <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium">
                          {item.date_due && (
                            <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                              <Calendar size={12} />
                              Due: {new Date(item.date_due).toLocaleDateString()}
                            </span>
                          )}
                          
                          <div className="flex gap-3">
                             {item.video_url && (
                               <a href={item.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors" title="Video Link">
                                 <Video size={12} /> Video
                               </a>
                             )}
                             {item.github_url && (
                               <a href={item.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-slate-900 transition-colors" title="GitHub Repo">
                                 <Github size={12} /> Code
                               </a>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                        <DropdownMenuItem onClick={() => handleEdit(item)} className="cursor-pointer font-medium text-slate-700">
                           <Pencil size={14} className="mr-2 text-blue-500" /> Edit Content
                        </DropdownMenuItem>
                         {/* Removed Toggle Publish for simplicity OR add logic later 
                         <DropdownMenuItem onClick={() => handleTogglePublish(item)} className="cursor-pointer font-medium text-slate-700">
                           <Eye size={14} className="mr-2 text-slate-500" /> {item.published ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem> 
                        */}
                        <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="cursor-pointer font-medium text-red-600 focus:text-red-700 focus:bg-red-50">
                           <Trash2 size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      <ProgramContentEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialData={editingItem}
        programId={program.id}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Delete Content?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This action cannot be undone. This will permanently remove this content from the curriculum.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDelete(); }} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-200"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
