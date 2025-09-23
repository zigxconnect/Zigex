import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PostingsListClient } from "@/components/sections/admin/postings/PostingsListClient";
import {
  getAuthenticatedCompanyProfile,
  getAllCompanyPostings,
} from "@/lib/data/postings";
import { redirect } from "next/navigation";

export default async function PostingsPage() {
  const companyProfile = await getAuthenticatedCompanyProfile();
  if (!companyProfile) {
    redirect("/sign-in");
  }

  const postingsData = await getAllCompanyPostings(companyProfile.id);

  if (!postingsData.hasData) {
    return <EmptyStatePostings />;
  }

  return <PostingsListClient initialPostings={postingsData.postings} />;
}

const EmptyStatePostings = () => (
  <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100">
    <h3 className="text-xl font-semibold text-gray-800">No Postings Yet</h3>
    <p className="mt-2 text-gray-500">
      Get started by creating your first posting.
    </p>
    <Button asChild className="mt-6">
      <Link href="/admin/postings/new">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Posting
      </Link>
    </Button>
  </div>
);
