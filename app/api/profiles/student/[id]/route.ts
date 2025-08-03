import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          
          return cookieStore.get(name)?.value;
        },
        set: (name: string, value: string, options: CookieOptions) => {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This can happen if the headers have already been sent, a known issue
            // in certain Next.js middleware scenarios. It can be safely ignored.
          }
        },
        remove: (name: string, options: CookieOptions) => {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Same as above.
          }
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
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();

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
    const { id } = params;

    // 3. Fetch the user profile from the database using the user_id.
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", id) // Query by the `user_id` foreign key.
      .single();

    if (error) {
      // If Supabase returns an error (e.g., no profile found), throw it.
      throw error;
    }

    // 4. Return the user profile data.
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
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();
  let updates;

  try {
    // 1. Get the authenticated user securely.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Verify that the user is updating their own profile.
    const { id } = params;
    if (id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update your own profile" },
        { status: 403 }
      );
    }

    // 3. Get the update data from the request body.
    updates = await request.json();

    // 4. Perform the update in the database.
    const { education, experience, skills, ...profileData } = updates;

    const { data, error: updateError } = await supabase
      .from("student_profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
        profile_status: "complete",
      })
      .eq("user_id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 5. Handle education, experience, and skills updates.
    if (education) {
      await supabase.from("student_education").delete().eq("user_id", id);
      if (education.length > 0) {
        await supabase.from("student_education").insert(education.map((edu: any) => ({ ...edu, user_id: id })));
      }
    }

    if (experience) {
      await supabase.from("student_experience").delete().eq("user_id", id);
      if (experience.length > 0) {
        await supabase.from("student_experience").insert(experience.map((exp: any) => ({ ...exp, user_id: id })));
      }
    }

    if (skills) {
      await supabase.from("student_skills").delete().eq("user_id", id);
      if (skills.length > 0) {
        await supabase.from("student_skills").insert(skills.map((skill: any) => ({ ...skill, user_id: id })));
      }
    }

    return NextResponse.json(
      { success: true, message: "Profile updated successfully", data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Route Error (PUT):", error, "Updates:", updates);
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
