import { Button } from "@/app/_components/ui/Button";
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
    <header className="bg-white/60 backdrop-blur-sm border-b border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your Internship Postings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
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
        <div>
          <Link href="/admin/postings/new" passHref>
            <Button variant="orange" className="flex items-center gap-2">
              <Plus size={18} />
              <span>Post New Internship</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
