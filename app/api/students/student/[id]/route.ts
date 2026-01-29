import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/emailjs";
import { sendWhatsAppWelcomeInvite } from "@/lib/whatsapp";


async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          return (await cookieStore).get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            (await cookieStore).set({ name, value, ...options });
          } catch (error) { }
        },
        remove: async (name: string, options: CookieOptions) => {
          try {
            (await cookieStore).set({ name, value: "", ...options });
          } catch (error) { }
        },
      },
    }
  );
}

/**
 * Handles fetching a single student profile by their user ID.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Get the authenticated user securely to ensure the request is authorized.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Get the target user ID from the URL parameters.
    const { id } = await params;

    // 3. Authorization check: Only allow if requester is the profile owner or a company user
    if (id !== user.id) {
      // Only allow if requester is a company viewing candidates
      const { data: companyProfile } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!companyProfile) {
        return NextResponse.json(
          { error: "Forbidden: You can only view your own profile" },
          { status: 403 }
        );
      }
    }

    // 4. Fetch the user profile from the database using the user_id.
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", id)
      .single();

    if (error) {
      throw error;
    }

    // 5. Return the user profile data.
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API Route Error (GET):", error);
    return NextResponse.json(
      { error: "Profile not found or an error occurred." },
      { status: 404 }
    );
  }
}

/**
 * Handles updating a student's profile.
 * This is called by the multi-step form upon submission.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();

  try {
    // 1. Get the authenticated user securely.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Verify that the user is updating their own profile.
    const { id } = await params;
    if (id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update your own profile" },
        { status: 403 }
      );
    }

    // 3. Get the update data from the request body.
    const updates = await request.json();

    // Security: Filter updates to only allow permitted fields (prevent mass assignment)
    const allowedFields = [
      "first_name", "last_name", "username", "phone", "location", "about",
      "avatar_url", "cover_image",
      "university", "degree", "field_of_study", "graduation_year", "gpa",
      "hard_skills", "soft_skills", "languages", "portfolio_url", "github_url", "linkedin_url",
      "previous_roles", "preferred_industries", "work_mode",
      "interests", "achievements", "accommodations"
    ];

    const filteredUpdates: Record<string, any> = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Validate URLs if present
    if (filteredUpdates.avatar_url && !filteredUpdates.avatar_url.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
      // Optional: stricter check to ensure it points to your specific bucket
    }

    // Check if username is taken by another user
    if (filteredUpdates.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from("student_profiles")
        .select("user_id")
        .eq("username", filteredUpdates.username)
        .neq("user_id", id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking username:", checkError);
      }

      if (existingUser) {
        console.log(`[API] Username '${filteredUpdates.username}' is already taken by user ${existingUser.user_id}`);
        return NextResponse.json(
          { error: `Username '${filteredUpdates.username}' is already taken.` },
          { status: 409 }
        );
      }
    }

    // 4. Perform the update in the database.
    // 4. Perform the update or insert (upsert) in the database.
    const { data, error: updateError } = await supabase
      .from("student_profiles")
      .upsert(
        {
          user_id: id,
          ...filteredUpdates,
          full_name: `${filteredUpdates.first_name || ""} ${filteredUpdates.last_name || ""}`.trim(),
          updated_at: new Date().toISOString(),
          profile_status: "complete",
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // --- AUTOMATION JOB START ---
    // Trigger Welcome Email & WhatsApp asynchronously (don't block the UI response)
    if (data && user.email) {
      try {
        const userName = data.full_name || data.first_name || "Candidate";

        // 1. Send Welcome Email via EmailJS
        sendWelcomeEmail({
          email: user.email,
          name: userName,
          communityLink: "https://chat.whatsapp.com/GzXpExampleLink"
        });

        // 2. Send WhatsApp Welcome (if phone provided)
        if (data.phone) {
          sendWhatsAppWelcomeInvite(userName, data.phone);
        }
      } catch (automationError) {
        console.error("[AUTOMATION] Background job error:", automationError);
        // We don't throw here to avoid failing the whole request if just email/WA fails
      }
    }
    // --- AUTOMATION JOB END ---

    return NextResponse.json(
      { success: true, message: "Profile updated successfully", data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Route Error (PUT):", error);
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "Username already taken. Please choose a different one.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: "Update failed",
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
