"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Briefcase,
  Calendar,
  Zap,
  Edit,
  Trash2,
  LucideIcon,
  Users,
  Clock,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// The data type remains the same
export type FormattedPosting = {
  id: string;
  title: string;
  type: "Internship" | "Event" | "Program";
  status: "Active" | "Expired";
  createdAt: string;
  applicantCount: number;
  imageUrl?: string;
};

interface PostingCardProps {
  posting: FormattedPosting;
  onDelete: (id: string) => void;
}

// Color schemes
const statusStyles: Record<string, string> = {
  Active: "bg-green-500/10 text-green-700 border-green-200/50",
  Expired: "bg-gray-500/10 text-gray-600 border-gray-200/50",
};

const typeDetails: Record<
  string,
  { icon: LucideIcon; label: string; endpoint: string; colors: string }
> = {
  Internship: {
    icon: Briefcase,
    label: "Applicants",
    endpoint: "/api/companies/internships",
    colors: "bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700",
  },
  Event: {
    icon: Calendar,
    label: "Registrations",
    endpoint: "/api/companies/events",
    colors: "bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700",
  },
  Program: {
    icon: Zap,
    label: "Applicants",
    endpoint: "/api/companies/programs",
    colors: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700",
  },
};

export const PostingCard = ({ posting, onDelete }: PostingCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const Icon = typeDetails[posting.type].icon;
  const applicantLabel = typeDetails[posting.type].label;
  const typeColors = typeDetails[posting.type].colors;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const apiEndpoint = typeDetails[posting.type].endpoint;

      // --- APPLIED DIFF: Robust fetch with timeout and error handling ---
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

      const response = await fetch(apiEndpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: posting.id }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear the timeout if the request completes in time

      if (!response.ok) {
        let errorData;
        try {
          // Try to parse a JSON error response from the server
          errorData = await response.json();
        } catch {
          // If the response is not JSON (e.g., an HTML error page), throw a generic error
          throw new Error(`Request failed with status ${response.status}`);
        }
        throw new Error(errorData.error || "Failed to delete the posting.");
      }
      // --- END OF APPLIED DIFF ---

      toast.success(`'${posting.title}' was deleted successfully.`);
      onDelete(posting.id);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        toast.error("Deletion timed out", {
          description: "The server did not respond in time. Please try again.",
        });
      } else {
        toast.error("Deletion failed", {
          description: (error as Error).message,
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <article className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-indigo-100/50 shadow-xl shadow-indigo-100/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group overflow-hidden h-full flex flex-col">
        {/* --- Image Section --- */}
        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
          <Link
            href={`/admin/postings/${posting.id}`}
            className="block w-full h-full"
          >
            {posting.imageUrl && !imageError ? (
              <Image
                src={posting.imageUrl}
                alt={posting.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <Icon className="h-16 w-16 text-slate-200" />
              </div>
            )}
            <div
              className={cn(
                "absolute top-4 right-4 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl backdrop-blur-md border shadow-lg",
                posting.status === 'Active' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-500 text-white border-slate-400'
              )}
            >
              {posting.status}
            </div>
          </Link>
        </div>

        {/* --- Content & Stats Section --- */}
        <div className="p-8 flex-grow flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={cn(
                "rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
                typeColors
              )}
            >
              {posting.type}
            </span>
          </div>
          
          <h3 className="font-heading font-black text-xl text-slate-900 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-tight tracking-tighter">
            <Link href={`/admin/postings/${posting.id}`}>{posting.title}</Link>
          </h3>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2" title="Date Posted">
              <Clock size={14} className="text-primary/60" />
              <span>{posting.createdAt}</span>
            </div>
            <div
              className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"
              title={`${posting.applicantCount} ${applicantLabel}`}
            >
              <Users size={14} className="text-primary" />
              <span className="font-black text-slate-900">
                {posting.applicantCount}
              </span>
            </div>
          </div>
        </div>

        {/* --- Actions Footer --- */}
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-2xl h-10 px-5 border-slate-200 bg-white hover:bg-slate-50 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm" disabled={isDeleting}>
            <Link
              href={`/admin/postings/${posting.id}/edit`}
              className="flex items-center gap-2"
            >
              <Edit size={14} /> Edit
            </Link>
          </Button>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-2xl h-10 px-5 bg-rose-600 hover:bg-rose-700 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-100"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              <span>{isDeleting ? "Deleting" : "Delete"}</span>
            </Button>
          </AlertDialogTrigger>
        </div>

        {/* AlertDialog Content */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-base py-2">
              This will permanently delete the <strong>{posting.title}</strong>{" "}
              posting and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && (
                <Loader2 size={16} className="animate-spin mr-2" />
              )}
              Confirm & Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </article>
    </AlertDialog>
  );
};
