// app/admin/postings/page.tsx

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PostingsTable } from "@/components/sections/admin/PostingsTable"; // Adjust path
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

// Helper function to format dates nicely
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default async function PostingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 1. Get the current logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // This should be handled by your layout, but it's good practice
    return <p>Please sign in to view postings.</p>;
  }

  // 2. Get the company profile associated with this user
  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!companyProfile) {
    return <p>Could not find a company profile for this user.</p>;
  }

  // 3. THE CRITICAL FIX: Fetch internships where the `company_id` matches the logged-in company's ID.
  const { data: internships, error } = await supabase
    .from("internships")
    .select(`*`)
    .eq("company_id", companyProfile.id) // <-- This line ensures you only get YOUR internships
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error fetching internships:", error.message);
    return <p className="p-4">Error: Could not fetch internship postings.</p>;
  }

  if (!internships || internships.length === 0) {
    return <EmptyStatePostings />;
  }
  
  // 4. Fetch application counts (this logic is efficient and correct)
  const internshipIds = internships.map((i) => i.id);
  const { data: applicationCounts } = await supabase
    .from("applications")
    .select("internship_id")
    .in("internship_id", internshipIds);

  const countsMap = applicationCounts?.reduce((acc, app) => {
    acc[app.internship_id] = (acc[app.internship_id] || 0) + 1;
    return acc;
  }, {});

  // 5. Format the data for the table component
  const formattedPostings = internships.map((internship) => ({
    id: internship.id,
    title: internship.title,
    datePosted: formatDate(internship.created_at),
    status: new Date(internship.deadline) < new Date() ? "Closed" : "Active",
    applications: countsMap?.[internship.id] || 0,
  }));

  return <PostingsTable initialPostings={formattedPostings} />;
}


// A component for when there are no postings
const EmptyStatePostings = () => (
    <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800">No Internship Postings Yet</h3>
        <p className="mt-2 text-gray-500">Get started by creating your first internship posting.</p>
        <Button asChild className="mt-6">
            <Link href="/admin/postings/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Posting
            </Link>
        </Button>
    </div>
);