import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PostInternshipForm } from "@/components/sections/admin/PostInternshipForm";

export default async function EditPostingPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: internship, error } = await supabase
    .from("internships")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !internship) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Edit Internship Posting
      </h1>
      <PostInternshipForm initialData={internship} />
    </div>
  );
}
