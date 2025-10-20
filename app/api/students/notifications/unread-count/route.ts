import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
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

  try {
    // Get current user (for authentication only)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prefer user_metadata; it's safer and requires no schema change
    try {
      const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(user.id);
      const readList: string[] = (adminUser?.user?.user_metadata?.read_notifications) || [];

      const { data: allNotifications } = await supabase.from("notifications").select("id");
      const notificationIds = (allNotifications || []).map((n: any) => n.id);
      const unreadCount = notificationIds.filter((id: string) => !readList.includes(id)).length;
      return NextResponse.json({ unreadCount });
    } catch (err) {
      console.warn("user_metadata unread-count failed, trying mapping table or legacy", err);
      try {
        const { data: allNotifications } = await supabase.from("notifications").select("id");
        const notificationIds = (allNotifications || []).map((n: any) => n.id);

        if (notificationIds.length === 0) return NextResponse.json({ unreadCount: 0 });

        const { data: reads, error: readsError } = await supabase
          .from("notification_reads")
          .select("notification_id")
          .eq("user_id", user.id)
          .in("notification_id", notificationIds);

        if (readsError) {
          const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("is_read", false);
          if (error) throw error;
          return NextResponse.json({ unreadCount: count || 0 });
        }

        const readSet = new Set((reads || []).map((r: any) => r.notification_id));
        const unreadCount = notificationIds.filter((id: string) => !readSet.has(id)).length;
        return NextResponse.json({ unreadCount });
      } catch (finalErr) {
        console.error("Unread count error", finalErr);
        return NextResponse.json({ unreadCount: 0 });
      }
    }
  } catch (error: any) {
    console.error("API Endpoint Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
