// Program Updates Page - Server Component
import { Metadata } from "next";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProgramUpdatesClient from "./ProgramUpdatesClient";
import { getProgramContentCached, getStudentEnrollment } from "@/lib/actions/program-content.actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Program Updates | ZIGEX`,
    description: "View your program curriculum, weekly updates, and resources.",
  };
}

export default async function ProgramUpdatesPage({ params }: PageProps) {
  const { id } = await params;
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Parallel fetch: Content (Cached) + Enrollment (Dynamic)
  const [rawContent, enrollment] = await Promise.all([
    getProgramContentCached(id),
    getStudentEnrollment(id, user.id)
  ]);

  const hasAccess = enrollment?.status === 'accepted' && enrollment?.isPaid;

  // Process and sanitize content
  const processedContent = rawContent.map((item: any) => ({
      id: item.id,
      title: item.title,
      weekNumber: item.week_number,
      description: item.description,
      // Redact content if needed
      content: (!item.payment_required || hasAccess) ? item.assignment_details : null,
      resources: (item.resources || []).map((r: any) => ({
           ...r,
           // Redact URL if needed
           url: (!item.payment_required || hasAccess) ? r.url : '#',
      })),
      payment_required: item.payment_required
  }));
  
  return (
    <ProgramUpdatesClient 
       id={id} 
       initialContent={processedContent} 
       initialEnrollment={enrollment} 
    />
  );
}
