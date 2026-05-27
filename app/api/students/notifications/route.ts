import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin, createClient } from "@/lib/supabase/server";

/**
 * GET: Securely fetches a hybrid list of personal and global notifications.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [personalResult, globalResult] = await Promise.all([
      supabase.from("notifications").select("*").eq("user_id", user.id),

      supabase.from("notifications").select("*").is("user_id", null),
    ]);

    if (personalResult.error) throw personalResult.error;
    if (globalResult.error) throw globalResult.error;

    const userCreatedAt = new Date(user.created_at).getTime();

    const filteredGlobalNotifications = (globalResult.data || []).filter(
      (n) => new Date(n.created_at).getTime() >= userCreatedAt
    );

    const combinedNotifications = [
      ...(personalResult.data || []),
      ...filteredGlobalNotifications,
    ];
    combinedNotifications.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(
      user.id
    );
    const readList: string[] =
      adminUser?.user?.user_metadata?.read_notifications || [];

    const mappedNotifications = combinedNotifications.map((n) => {
      const isRead = n.user_id ? n.is_read : readList.includes(n.id);
      return { ...n, is_read: isRead };
    });
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const filtered = unreadOnly
      ? mappedNotifications.filter((n) => !n.is_read)
      : mappedNotifications;
    const total = filtered.length;
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginated = filtered.slice(from, to);

    return NextResponse.json({
      notifications: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("GET Notifications Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * POST: Securely marks notifications as read.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (notificationIds && Array.isArray(notificationIds)) {
      const { data: notificationsToUpdate } = await supabase
        .from("notifications")
        .select("id, user_id")
        .in("id", notificationIds);

      const personalIds = (notificationsToUpdate || [])
        .filter((n) => n.user_id === user.id)
        .map((n) => n.id);
      const globalIds = (notificationsToUpdate || [])
        .filter((n) => n.user_id === null)
        .map((n) => n.id);

      if (personalIds.length > 0) {
        await supabase
          .from("notifications")
          .delete()
          .in("id", personalIds)
          .eq("user_id", user.id);
      }

      if (globalIds.length > 0) {
        const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(
          user.id
        );
        const existing: string[] =
          adminUser?.user?.user_metadata?.read_notifications || [];
        const merged = Array.from(new Set([...existing, ...globalIds])).slice(-20);
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...adminUser?.user?.user_metadata,
            read_notifications: merged,
          },
        });
      }
      return NextResponse.json({ message: "Notifications marked as read." });
    }

    // --- Logic for marking all as read ---
    if (markAll) {
      // 1. Delete all PERSONAL notifications to save space
      await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id)
        .eq("is_read", false);

      // 2. Mark all GLOBAL notifications as read by adding them to metadata
      const { data: allGlobalNotifications } = await supabase
        .from("notifications")
        .select("id")
        .is("user_id", null);
      const globalIds = (allGlobalNotifications || []).map((n) => n.id);
      const { data: adminUser } = await supabaseAdmin.auth.admin.getUserById(
        user.id
      );
      const existing: string[] =
        adminUser?.user?.user_metadata?.read_notifications || [];
      const merged = Array.from(new Set([...existing, ...globalIds])).slice(-20);
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...adminUser?.user?.user_metadata,
          read_notifications: merged,
        },
      });

      return NextResponse.json({
        message: "All notifications marked as read.",
      });
    }

    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST Notifications Error:", error.message);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
