import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PostingsListClient } from "@/components/sections/admin/postings/PostingsListClient";

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <p>Please sign in to view postings.</p>;

  const { data: companyProfile } = await supabase
    .from("company_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!companyProfile) {
    return <p>Could not find a company profile for this user.</p>;
  }

  // --- Fetch all posting types in parallel ---
  const [internshipsResult] = await Promise.all([
    supabase
      .from("internships")
      .select(`*`)
      .eq("company_id", companyProfile.id),
    // TODO: Add fetching for your 'events' and 'programs' tables here
  ]);

  const internships = internshipsResult.data || [];
  // const events = eventsResult.data || [];
  // const programs = programsResult.data || [];

  const allPostings = [
    ...internships.map((item) => ({ ...item, type: "Internship" as const })),
    // ...events.map(item => ({ ...item, type: 'Event' as const })),
    // ...programs.map(item => ({ ...item, type: 'Program' as const })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (allPostings.length === 0) {
    return <EmptyStatePostings />;
  }

  // --- Aggregate application counts for internships ---
  const internshipIds = internships.map((i) => i.id);
  const { data: applicationCounts } = await supabase
    .from("applications")
    .select("internship_id")
    .in("internship_id", internshipIds);

  const countsMap = applicationCounts?.reduce((acc, app) => {
    acc[app.internship_id] = (acc[app.internship_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // --- Format the combined data for the client ---
  const formattedPostings = allPostings.map((posting) => ({
    id: posting.id,
    title: posting.title,
    type: posting.type,
    createdAt: formatDate(posting.created_at),
    status: new Date(posting.deadline) < new Date() ? "Expired" : "Active",
    applicantCount:
      posting.type === "Internship" ? countsMap?.[posting.id] || 0 : 0,
  }));

  return <PostingsListClient initialPostings={formattedPostings} />;
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
