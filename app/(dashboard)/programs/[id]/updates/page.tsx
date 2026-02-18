// Program Updates Page - Server Component
import { Metadata } from "next";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProgramUpdatesClient from "./ProgramUpdatesClient";
import { getProgramContentCached, getStudentEnrollment } from "@/lib/actions/program-content.actions";
import { supabaseAdmin } from "@/lib/supabase/server";

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

// Helper to check if string is UUID
const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// Fetch accepted crew members for the program
async function getAcceptedCrewMembers(programId: string) {
  try {
    let actualId = programId;

    // If it's a slug, we need to find the actual UUID first
    if (!isUUID(programId)) {
      const { data: program } = await supabaseAdmin
        .from("programs")
        .select("id")
        .ilike("title", programId.replace(/-/g, ' '))
        .maybeSingle();
      
      if (program?.id) {
        actualId = program.id;
      } else {
        // console.log("[Crew] Program not found for slug:", programId);
        return { members: [], totalCount: 0 };
      }
    }

    // console.log("[Crew] Fetching members for program:", actualId);

    // Query applications with correct relation syntax
    const { data, error, count } = await supabaseAdmin
      .from("Applications")
      .select(`
        id,
        status,
        student_id,
        student:student_profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `, { count: "exact" })
      .eq("program_id", actualId)
      .eq("application_type", "program")
      .in("status", ["accepted", "rsvp_confirmed", "confirmed", "reviewed"])
      .order("updated_at", { ascending: false })
      .limit(50);

    // console.log("[Crew] Query result - Count:", count, "Error:", error?.message || "none");
    
    if (error) {
      console.error("[Crew] Error fetching crew members:", error);
      return { members: [], totalCount: 0 };
    }

    if (!data || data.length === 0) {
      // console.log("[Crew] No accepted applications found");
      return { members: [], totalCount: 0 };
    }

    // console.log("[Crew] Raw data sample:", JSON.stringify(data[0], null, 2));

    const members = data
      .filter((app: any) => {
        const student = Array.isArray(app.student) ? app.student[0] : app.student;
        return student && student.id;
      })
      .map((app: any) => {
        const student = Array.isArray(app.student) ? app.student[0] : app.student;
        return {
          id: app.student_id || student?.id,
          name: student?.full_name || student?.username || "Member",
          avatar: student?.avatar_url || null,
          username: student?.username || null,
        };
      });

    // console.log("[Crew] Processed members count:", members.length);

    return { members, totalCount: count || members.length };
  } catch (err) {
    console.error("[Crew] Error in getAcceptedCrewMembers:", err);
    return { members: [], totalCount: 0 };
  }
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

  // Parallel fetch: Content (Cached) + Enrollment (Dynamic) + Crew Members
  const [rawContent, enrollment, crewMembers] = await Promise.all([
    getProgramContentCached(id),
    getStudentEnrollment(id, user.id),
    getAcceptedCrewMembers(id)
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
       crew={crewMembers}
    />
  );
}
