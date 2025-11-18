import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get the current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { isAdmin: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user's email matches ADMIN_EMAIL from environment
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn("ADMIN_EMAIL is not set in environment variables");
      return NextResponse.json(
        { isAdmin: false, error: "Admin configuration missing" },
        { status: 500 }
      );
    }

    const isAdmin = user.email === adminEmail;

    return NextResponse.json(
      {
        isAdmin,
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { isAdmin: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
