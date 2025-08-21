// import { StatusBadge } from "@/app/_components/ui/StatusBadge";
import { StatusBadge } from "@/components/uiComponenet/StatusBadge";
import { FilePenLine, Trash2 } from "lucide-react";
import Link from "next/link";

// Define a type for a single posting for better code quality and safety
type Posting = {
  title: string;
  datePosted: string;
  status: "Active" | "Closed" | "Draft";
  applications: number;
};

// Mock data that matches the design provided
const postingsData: Posting[] = [
  {
    title: "Software Development Intern",
    datePosted: "Jan 14, 2024",
    status: "Active",
    applications: 24,
  },
  {
    title: "Marketing Assistant",
    datePosted: "Jan 11, 2024",
    status: "Active",
    applications: 18,
  },
  {
    title: "Finance Intern",
    datePosted: "Jan 9, 2024",
    status: "Closed",
    applications: 31,
  },
  {
    title: "Data Analyst Trainee",
    datePosted: "Jan 7, 2024",
    status: "Active",
    applications: 15,
  },
  {
    title: "HR Assistant",
    datePosted: "Jan 4, 2024",
    status: "Draft",
    applications: 0,
  },
  {
    title: "Graphic Design Intern",
    datePosted: "Jan 2, 2024",
    status: "Active",
    applications: 22,
  },
];

export const PostingsTable = () => {
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
          {postingsData.map((posting, index) => (
            <tr
              key={index}
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
                  <Link href={`/admin/postings/edit/${index}`} passHref>
                    <button
                      className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      aria-label="Edit Posting"
                    >
                      <FilePenLine size={16} />
                    </button>
                  </Link>
                  <button
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
