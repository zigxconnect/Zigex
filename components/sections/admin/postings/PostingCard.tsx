"use client";

import Link from "next/link";
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
} from "lucide-react";

export type FormattedPosting = {
  id: string;
  title: string;
  type: "Internship" | "Event" | "Program";
  status: "Active" | "Expired";
  createdAt: string;
  applicantCount: number;
};

const statusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Expired: "bg-red-100 text-red-800",
};

const typeDetails: Record<string, { icon: LucideIcon; label: string }> = {
  Internship: { icon: Briefcase, label: "Applicants" },
  Event: { icon: Calendar, label: "Registrations" },
  Program: { icon: Zap, label: "Applicants" },
};

export const PostingCard = ({ posting }: { posting: FormattedPosting }) => {
  const Icon = typeDetails[posting.type].icon;
  const applicantLabel = typeDetails[posting.type].label;

  const handleDeleteClick = () => {
    toast.info("Delete functionality is not yet implemented.");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
      <Link href={`/admin/postings/${posting.id}`} className="flex-grow">
        <div className="p-4 border-b flex justify-between items-start gap-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 transition-colors">
              {posting.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Icon className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-gray-600">{posting.type}</p>
            </div>
          </div>
          <div
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              statusStyles[posting.status]
            }`}
          >
            {posting.status}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock size={16} className="text-gray-400" />
            <span>Posted: {posting.createdAt}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Users size={16} className="text-gray-400" />
            <span>
              {posting.applicantCount} {applicantLabel}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
        <span className="text-xs text-gray-500">
          ID: ...{posting.id.slice(-6)}
        </span>
        <div className="flex items-center gap-2">
          <Link href={`/admin/postings/${posting.id}/edit`} passHref>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit size={14} /> Edit
            </Button>
          </Link>
          <Button
            variant="destructiveOutline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleDeleteClick}
          >
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
