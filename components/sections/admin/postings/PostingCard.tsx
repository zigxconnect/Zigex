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
      <article className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden h-full">
        {/* --- Image Section --- */}
        <div className="relative aspect-video bg-slate-100 overflow-hidden">
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
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <Icon className="h-12 w-12 text-gray-300" />
              </div>
            )}
            <div
              className={`absolute top-3 right-3 px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-md bg-white/60 border ${statusStyles[posting.status]}`}
            >
              {posting.status}
            </div>
          </Link>
        </div>

        {/* --- Content & Stats Section --- */}
        <div className="p-5 flex-grow flex flex-col">
          <span
            className={`inline-block self-start rounded-full px-3 py-1 text-xs font-bold ${typeColors}`}
          >
            {posting.type}
          </span>
          <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mt-2 flex-grow">
            <Link href={`/admin/postings/${posting.id}`}>{posting.title}</Link>
          </h3>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2" title="Date Posted">
              <Clock size={16} className="text-gray-400" />
              <span>{posting.createdAt}</span>
            </div>
            <div
              className="flex items-center gap-2"
              title={`${posting.applicantCount} ${applicantLabel}`}
            >
              <Users size={16} className="text-gray-400" />
              <span className="font-semibold text-gray-800">
                {posting.applicantCount}
              </span>
            </div>
          </div>
        </div>

        {/* --- Actions Footer --- */}
        <div className="p-3 bg-slate-50/70 border-t flex justify-end items-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={isDeleting}>
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
              className="flex items-center gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              {isDeleting ? "Deleting" : "Delete"}
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
