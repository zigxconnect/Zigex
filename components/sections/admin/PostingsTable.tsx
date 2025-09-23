"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/uiComponent/StatusBadge";
import { FilePenLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Posting = {
  id: string;
  title: string;
  datePosted: string;
  status: "Active" | "Closed" | "Draft";
  applications: number;
};

export const PostingsTable = ({
  initialPostings,
}: {
  initialPostings: Posting[];
}) => {
  // Use state to manage the list, allowing us to remove items on delete
  const [postings, setPostings] = useState(initialPostings);

  // This ensures that if the server data changes (e.g., on a page refresh), the table updates
  useEffect(() => {
    setPostings(initialPostings);
  }, [initialPostings]);

  const handleDelete = async (postingId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this posting? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/companies/internships", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postingId }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete posting.");
      }

      // On successful deletion, update the UI by filtering out the deleted item
      setPostings((prevPostings) =>
        prevPostings.filter((p) => p.id !== postingId)
      );
      toast.success("Posting deleted successfully.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 text-left font-medium text-gray-600">
              Internship Title
            </th>
            <th className="p-4 text-left font-medium text-gray-600">
              Date Posted
            </th>
            <th className="p-4 text-left font-medium text-gray-600">Status</th>
            <th className="p-4 text-left font-medium text-gray-600">
              Applications
            </th>
            <th className="p-4 text-left font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {postings.map((posting) => (
            <tr
              key={posting.id}
              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
            >
              <td className="p-4 font-medium text-gray-800">{posting.title}</td>
              <td className="p-4 text-gray-600">{posting.datePosted}</td>
              <td className="p-4">
                <StatusBadge status={posting.status} />
              </td>
              <td className="p-4 font-medium text-gray-800 text-center">
                {posting.applications}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/postings/edit/${posting.id}`} passHref>
                    <button
                      className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      aria-label="Edit Posting"
                    >
                      <FilePenLine size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(posting.id)}
                    className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    aria-label="Delete Posting"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
