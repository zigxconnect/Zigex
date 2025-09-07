"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

type AdminHeaderProps = {
  stats: {
    total: number;
    active: number;
    applications: number;
  };
};

export const AdminHeader = ({ stats }: AdminHeaderProps) => {
  return (
    <header className="bg-white/60 backdrop-blur-sm border-b border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Your Internship Postings
          </h1>

          <div className="mt-2 sm:hidden">
            <div className="flex flex-col gap-1 text-sm text-gray-500">
              <div>
                Total Postings:{" "}
                <span className="font-semibold text-gray-700">
                  {stats.total}
                </span>
              </div>
              <div>
                Active:{" "}
                <span className="font-semibold text-green-600">
                  {stats.active}
                </span>
              </div>
              <div>
                Total Applications:{" "}
                <span className="font-semibold text-gray-700">
                  {stats.applications}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Total Postings:{" "}
            <span className="font-semibold text-gray-700">{stats.total}</span> ·
            Active:{" "}
            <span className="font-semibold text-green-600">{stats.active}</span>{" "}
            · Total Applications:{" "}
            <span className="font-semibold text-gray-700">
              {stats.applications}
            </span>
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link href="/admin/postings/new" passHref>
            <Button
              variant="orange"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Plus size={18} className="flex-shrink-0" />
              <span className="whitespace-nowrap">Post New Program</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
