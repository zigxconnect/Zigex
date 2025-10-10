import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

async function createSupabaseClient() {
  // cookies() must be awaited in Next.js server runtime
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // Handle error
          }
        },
      },
    }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const supabase = await createSupabaseClient();

  try {
    // Get current user (just for authentication)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build base notifications query (no global read filter)
    const { data: notifications, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    // Try reading per-user read list from auth.user_metadata first (no schema change)
    try {
      const { data: adminUser, error: adminUserError } = await supabaseAdmin.auth.admin.getUserById(user.id);
      if (!adminUserError && adminUser && adminUser.user) {
        const readList: string[] = (adminUser.user.user_metadata?.read_notifications) || [];
        const mapped = (notifications || []).map((n: any) => ({ ...n, is_read: readList.includes(n.id) }));
        const filtered = unreadOnly ? mapped.filter((m: any) => !m.is_read) : mapped;
        return NextResponse.json({ notifications: filtered, total: count, page, totalPages: Math.ceil((count || 0) / limit) });
      }
    } catch (metaErr) {
      console.warn("user_metadata read mapping failed, will try other methods", metaErr);
    }

    // Fallback: use notification_reads table if available (mapping table)
    try {
      const notificationIds = (notifications || []).map((n: any) => n.id);
      let readRows: any[] = [];

      if (notificationIds.length > 0) {
        const { data: reads, error: readsError } = await supabase
          .from("notification_reads")
          .select("notification_id")
          .eq("user_id", user.id)
          .in("notification_id", notificationIds);

        if (!readsError && reads) {
          readRows = reads;
        }
      }

      const mapped = (notifications || []).map((n: any) => ({ ...n, is_read: !!readRows.find((r: any) => r.notification_id === n.id) }));
      const filtered = unreadOnly ? mapped.filter((m: any) => !m.is_read) : mapped;
      return NextResponse.json({ notifications: filtered, total: count, page, totalPages: Math.ceil((count || 0) / limit) });
    } catch (mapError) {
      // If mapping fails completely, fall back to legacy global is_read
      console.warn("notification_reads mapping failed, falling back to global is_read", mapError);
      const filteredLegacy = unreadOnly ? (notifications || []).filter((n: any) => !n.is_read) : notifications;
      return NextResponse.json({ notifications: filteredLegacy, total: count, page, totalPages: Math.ceil((count || 0) / limit) });
    }
  } catch (error: any) {
    console.error("API Endpoint Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      // Persist 'mark all' by updating user's metadata read_notifications to include all current notification ids.
      try {
        const { data: allNotifications } = await supabase.from("notifications").select("id");
        const ids = (allNotifications || []).map((n: any) => n.id);

        // Fetch admin user metadata
        const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
        const existing: string[] = (adminUser?.user?.user_metadata?.read_notifications) || [];
        const merged = Array.from(new Set([...existing, ...ids]));

        await supabaseAdmin.auth.admin.updateUserById(user.id, { user_metadata: { ...(adminUser?.user?.user_metadata || {}), read_notifications: merged } });

        return NextResponse.json({ message: "All notifications marked as read for this user (metadata)" });
      } catch (e) {
        console.warn("user_metadata update failed, falling back to notification_reads or legacy", e);
        // Fallback to notification_reads upsert
        try {
          const { data: allNotifications } = await supabase.from("notifications").select("id");
          const rows = (allNotifications || []).map((n: any) => ({ notification_id: n.id, user_id: user.id, read_at: new Date().toISOString() }));
          if (rows.length > 0) {
            const { error: insertError } = await supabase.from("notification_reads").upsert(rows, { onConflict: "notification_id,user_id" });
            if (insertError) throw insertError;
          }
          return NextResponse.json({ message: "All notifications marked as read for this user (notification_reads fallback)" });
        } catch (e2) {
          console.warn("fallback upsert failed, falling back to legacy global update", e2);
          const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
          if (error) throw error;
          return NextResponse.json({ message: "All notifications marked as read (legacy fallback)" });
        }
      }
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: "Invalid notification IDs" },
        { status: 400 }
      );
    }

    // Persist specific notification reads in user's metadata
    try {
      const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
      const existing: string[] = (adminUser?.user?.user_metadata?.read_notifications) || [];
      const merged = Array.from(new Set([...existing, ...notificationIds]));

      await supabaseAdmin.auth.admin.updateUserById(user.id, { user_metadata: { ...(adminUser?.user?.user_metadata || {}), read_notifications: merged } });

      return NextResponse.json({ message: "Notifications marked as read for this user (metadata)" });
    } catch (e) {
      console.warn("user_metadata update failed, trying notification_reads fallback", e);
      try {
        const rows = notificationIds.map((id: string) => ({ notification_id: id, user_id: user.id, read_at: new Date().toISOString() }));
        const { error: insertError } = await supabase.from("notification_reads").upsert(rows, { onConflict: "notification_id,user_id" });
        if (insertError) throw insertError;
        return NextResponse.json({ message: "Notifications marked as read for this user (notification_reads)" });
      } catch (e2) {
        console.warn("fallback upsert failed, falling back to legacy global update", e2);
        const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", notificationIds);
        if (error) throw error;
        return NextResponse.json({ message: "Notifications marked as read (legacy fallback)" });
      }
    }
  } catch (error: any) {
    console.error("API Endpoint Error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications", details: error.message },
      { status: 500 }
    );
  }
}
