"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAnnouncements() {
    const supabase = await createServerActionClient();

    const { data, error } = await supabase
        .from("announcements")
        .select(`
      *,
      author:author_id (
        full_name,
        avatar_url,
        email
      ),
      company:company_id (
        company_name,
        logo_url
      )
    `)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }

    return data;
}

export async function createAnnouncement(payload: {
    title: string;
    content: string;
    is_pinned?: boolean;
    company_id?: string;
}) {
    const supabase = await createServerActionClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data, error } = await supabase
        .from("announcements")
        .insert({
            title: payload.title,
            content: payload.content,
            is_pinned: payload.is_pinned || false,
            author_id: user.id,
            company_id: payload.company_id || null, // null means global zigex announcement
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating announcement:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/dashboard/announcements");
    return { success: true, data };
}

export async function deleteAnnouncement(id: string) {
    const supabase = await createServerActionClient();

    const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting announcement:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/admin/announcements");
    revalidatePath("/dashboard/announcements");
    return { success: true };
}

const supabase = await createServerActionClient();

const { error } = await supabase
    .from("announcements")
    .update({ is_pinned: !currentStatus })
    .eq("id", id);

if (error) {
    console.error("Error toggling pin:", error);
    return { success: false, error: error.message };
}

revalidatePath("/admin/announcements");
revalidatePath("/dashboard/announcements");
return { success: true };
}
