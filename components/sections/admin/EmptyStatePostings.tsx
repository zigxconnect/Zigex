import { Button } from "@/app/_components/ui/Button";
import { Plus, Trophy } from "lucide-react";
import Link from "next/link";

export const EmptyStatePostings = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full -mt-16">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
        <Trophy size={40} className="text-slate-400" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-gray-900">
        You haven&apos;t posted any internships yet
      </h2>
      <p className="mt-2 max-w-md text-gray-600">
        Start building your talent pipeline by creating your first internship
        posting. Attract the best candidates and grow your team with fresh
        perspectives.
      </p>
      <div className="mt-8">
        <Link href="/admin/postings/new" passHref>
          <Button variant="orange" className="flex items-center gap-2">
            <Plus size={18} />
            <span>Post Your First Internship</span>
          </Button>
        </Link>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Need help getting started?{" "}
        <Link
          href="/posting-guide"
          className="font-medium text-orange-500 hover:underline"
        >
          View our posting guide
        </Link>
      </p>
    </div>
  );
};
