import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Helper function to create the Supabase client (with async fixes)
async function createSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          await cookieStore.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          await cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

/**
 * GET: Securely calculates the total number of unread notifications
 * for the logged-in user, combining personal and global alerts.
 */
export async function GET() {
  const supabase = await createSupabaseClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- We will calculate the unread count in two parts and add them together ---

    // Part 1: Count PERSONAL unread notifications directly from the database.
    // This is very efficient as the database does the counting for us.
    const { count: personalUnreadCount, error: personalCountError } =
      await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

    if (personalCountError) {
      console.error(
        "Error fetching personal unread count:",
        personalCountError
      );
      throw personalCountError;
    }

    // Part 2: Count GLOBAL unread notifications using the user_metadata.
    let globalUnreadCount = 0;
    try {
      // Get the list of global notification IDs that the user has already read.
      const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(
        user.id
      );
      const readList: string[] =
        adminUser?.user?.user_metadata?.read_notifications || [];
      const readSet = new Set(readList);

      // Get all global notification IDs from the database.
      const { data: allGlobalNotifications, error: globalFetchError } =
        await supabase.from("notifications").select("id").is("user_id", null);

      if (globalFetchError) throw globalFetchError;

      // Calculate the unread count in code.
      if (allGlobalNotifications) {
        globalUnreadCount = allGlobalNotifications.filter(
          (n) => !readSet.has(n.id)
        ).length;
      }
    } catch (err) {
      console.warn(
        "Could not calculate global unread count via user_metadata:",
        err
      );
      // We default to 0 for globals if the metadata check fails, to avoid blocking the response.
      globalUnreadCount = 0;
    }

    // --- Final Step: Combine the counts and return the result ---
    const totalUnreadCount = (personalUnreadCount || 0) + globalUnreadCount;

    return NextResponse.json({ unreadCount: totalUnreadCount });
  } catch (error: any) {
    console.error("API Endpoint Error (unread-count):", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
