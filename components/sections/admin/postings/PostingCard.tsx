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
  MoreVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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

const typeDetails: Record<
  string,
  { icon: LucideIcon; label: string; endpoint: string; color: string; bgColor: string }
> = {
  Internship: {
    icon: Briefcase,
    label: "Applicants",
    endpoint: "/api/companies/internships",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  Event: {
    icon: Calendar,
    label: "Registrations",
    endpoint: "/api/companies/events",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  Program: {
    icon: Zap,
    label: "Applicants",
    endpoint: "/api/companies/programs",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
};

export const PostingCard = ({ posting, onDelete }: PostingCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { icon: Icon, label: applicantLabel, color, bgColor } = typeDetails[posting.type];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const apiEndpoint = typeDetails[posting.type].endpoint;

      // --- Robust fetch with timeout and error handling ---
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
      <article className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full">
        {/* --- Image Section --- */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
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
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <Icon className="h-12 w-12 text-gray-300" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-md border shadow-sm",
                posting.status === "Active" 
                  ? "bg-white/90 text-green-700 border-green-200" 
                  : "bg-white/90 text-gray-600 border-gray-200"
              )}>
                {posting.status}
              </span>
            </div>
          </Link>

          {/* Action Menu */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white">
                  <MoreVertical size={14} className="text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/postings/${posting.id}/edit`} className="flex items-center">
                    <Edit size={14} className="mr-2" /> Edit
                  </Link>
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">
                    <Trash2 size={14} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* --- Content Section --- */}
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className={cn("p-1.5 rounded-lg", bgColor)}>
              <Icon size={14} className={color} />
            </div>
            <span className={cn("text-xs font-semibold uppercase tracking-wider", color)}>
              {posting.type}
            </span>
          </div>

          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-4 flex-grow">
            <Link href={`/admin/postings/${posting.id}`}>{posting.title}</Link>
          </h3>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <Clock size={14} />
              <span>{posting.createdAt}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full">
              <Users size={14} />
              <span>{posting.applicantCount} {applicantLabel}</span>
            </div>
          </div>
        </div>

        {/* AlertDialog Content */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Posting?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{posting.title}</strong> and all associated data.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </article>
    </AlertDialog>
  );
};
