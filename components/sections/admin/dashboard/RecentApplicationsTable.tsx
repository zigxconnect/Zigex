"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Inbox, MoreHorizontal, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const EmptyTableState = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
      <Inbox className="h-8 w-8 text-gray-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500 max-w-sm">{message}</p>
  </div>
);

type Application = {
  id: string | number;
  name: string;
  field: string;
  status: string;
  appliedDate?: string; // Assuming this might be available or added later
};

type ApplicationsData = {
  hasData: boolean;
  data?: Application[];
  emptyState?: { title: string; message: string };
};

export const RecentApplicationsTable = ({
  applicationsData,
}: {
  applicationsData: ApplicationsData;
}) => {
  const router = useRouter();

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "reviewed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Recent Applications
          </h3>
          <p className="text-sm text-gray-500">Latest candidates to review</p>
        </div>
        <Link href="/admin/applicants">
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2">
            View All
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {!applicationsData.hasData ? (
        <EmptyTableState
          title={applicationsData.emptyState?.title ?? "No Applications"}
          message={
            applicationsData.emptyState?.message ??
            "There are no applications to display at the moment."
          }
        />
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(applicationsData.data ?? []).map((app) => (
                <tr
                  key={app.id}
                  onClick={() =>
                    router.push(`/admin/applicants?selected=${app.id}`)
                  }
                  className="group hover:bg-blue-50/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm ring-2 ring-white shadow-sm">
                        {app.name?.charAt(0) ?? "?"}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {app.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Applied recently
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 font-medium">{app.field}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        getStatusStyles(app.status)
                      )}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                      <MoreHorizontal size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
