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

  // Case-insensitive status check
  const enrollmentStatus = enrollment?.status?.toLowerCase();
  // Broaden access: Any paid user who isn't rejected/pending should see content
  const isQualifiedStatus = ['accepted', 'rsvp_confirmed', 'reviewed'].includes(enrollmentStatus || '');
  const hasAccess = isQualifiedStatus && !!enrollment?.isPaid;

  // Process and sanitize content
  const processedContent = rawContent.map((item: any) => {
      const canView = !item.payment_required || hasAccess;
      
      // Handle resources: normalize from JSON or fallback columns
      let resources = [];
      try {
          resources = typeof item.resources === 'string' 
            ? JSON.parse(item.resources) 
            : (item.resources || []);
      } catch (e) {
          resources = [];
      }

      // Add specific URL fields to resources if they exist
      if (item.video_url) {
          resources.push({
              type: 'video',
              title: 'Class Video',
              url: item.video_url
          });
      }
      if (item.github_url) {
          resources.push({
              type: 'github',
              title: 'Source Code',
              url: item.github_url
          });
      }
      if (item.google_docs_url) {
          resources.push({
              type: 'pdf',
              title: 'Learning Document',
              url: item.google_docs_url
          });
      }
      if (item.content_url && !resources.some((r: any) => r.url === item.content_url)) {
          resources.push({
              type: item.resource_type || 'link',
              title: item.title || 'Other Resource',
              url: item.content_url
          });
      }

      // Map content: Combine all possible content fields to ensure nothing is missed
      const contentParts = [
          item.description,
          item.content,
          item.assignment_details ? `### Assignment Details\n${item.assignment_details}` : null
      ].filter(Boolean);
      
      const rawBody = contentParts.join('\n\n');

      return {
          id: item.id,
          title: item.title,
          weekNumber: item.week_number,
          description: item.description,
          content: canView ? rawBody : null,
          resources: resources.map((r: any) => ({
               ...r,
               url: canView ? r.url : '#',
          })),
          payment_required: !!item.payment_required
      };
  });
  
  return (
    <ProgramUpdatesClient 
       id={id} 
       initialContent={processedContent} 
       initialEnrollment={enrollment} 
    />
  );
}
