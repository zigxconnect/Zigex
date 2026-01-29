import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProgramContentManager } from "@/components/sections/admin/programs/ProgramContentManager";

interface PageProps {
  params: Promise<{ programId: string }>;
}

export default async function ProgramContentManagePage({ params }: PageProps) {
  const { programId } = await params;
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

  if (!user) {
    redirect("/login");
  }

  // Get program details to verify ownership and getting title
  const { data: program } = await supabase
    .from("programs")
    .select("*, company_profiles!inner(user_id)")
    .eq("id", programId)
    .single();

  if (!program) {
    notFound();
  }

  // Verify ownership
  if (program.company_profiles.user_id !== user.id) {
    return (
      <div className="p-8 text-center text-red-500">
        Unauthorized access to this program.
      </div>
    );
  }

  // Fetch existing content
  const { data: content, error } = await supabase
    .from("program_content")
    .select("*")
    .eq("program_id", programId)
    .order("week_number", { ascending: true })
    .order("display_order", { ascending: true });
    
  if (error) {
      console.error("Error fetching content:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProgramContentManager 
        program={{ id: program.id, title: program.title }} 
        initialContent={content || []} 
      />
    </div>
  );
}
