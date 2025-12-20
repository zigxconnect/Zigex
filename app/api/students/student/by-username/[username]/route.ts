import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const supabase = await createSupabaseServerClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }
    const { username } = await params;
    const { data, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("username", username)
      .single();
    if (error) {
      throw error;
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("API Route Error (GET):", error);
    return NextResponse.json(
      { error: "Profile not found or an error occurred." },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const supabase = await createSupabaseServerClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { username } = await params;
    // Log incoming request
    console.log("[API] Incoming PUT /student/by-username/", username);
    let updates;
    try {
      updates = await request.json();
      console.log("[API] Request body:", updates);
    } catch (err) {
      console.error("[API] Failed to parse JSON body", err);
      return NextResponse.json({ error: "Invalid JSON body", details: String(err) }, { status: 400 });
    }
    console.log("[API] User ID:", user.id, "Username:", username);
    // Insert if not exists, update if exists
    const { data: myProfile, error: myProfileError } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (myProfileError) {
      console.error("[API] Error fetching profile:", myProfileError);
    }
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
    // Construct full_name
    filteredUpdates.full_name = `${filteredUpdates.first_name || ""} ${filteredUpdates.last_name || ""}`.trim();
    let result;
    try {
      if (!myProfile) {
        // Insert new profile
        result = await supabase
          .from("student_profiles")
          .insert({
            ...filteredUpdates,
            user_id: user.id,
            username,
            updated_at: new Date().toISOString(),
            profile_status: "complete",
          })
          .select()
          .single();
        console.log("[API] Insert result:", result);
      } else {
        // Update existing profile
        result = await supabase
          .from("student_profiles")
          .update({
            ...filteredUpdates,
            updated_at: new Date().toISOString(),
            profile_status: "complete",
          })
          .eq("user_id", user.id)
          .select()
          .single();
        console.log("[API] Update result:", result);
      }
    } catch (err) {
      console.error("[API] Supabase insert/update threw error:", err);
      return NextResponse.json({ error: "Supabase threw error", details: String(err) }, { status: 500 });
    }
    const { data: updated, error: updateError } = result || {};
    if (updateError) {
      console.error("[API] Supabase update/insert failed:", updateError);
      return NextResponse.json(
        {
          error: "Supabase update/insert failed",
          details: updateError.message,
          code: updateError.code,
        },
        { status: 400 }
      );
    }
    if (!updated) {
      console.error("[API] No profile data returned from Supabase");
      return NextResponse.json(
        {
          error: "No profile data returned from Supabase",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Profile saved successfully", data: updated },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Route Error (PUT):", error);
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
