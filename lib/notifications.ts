import { supabaseAdmin } from "./supabase/server";

export type NotificationType =
    | "task_assigned"
    | "log_reviewed"
    | "evaluation_submitted"
    | "supervisor_assigned"
    | "new_log_submitted"
    | "payment_confirmed";

interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    referenceId?: string;
    metadata?: any;
}

/**
 * Creates a notification record in the database.
 * This triggers real-time updates for the recipient.
 */
export async function createNotification({
    userId,
    title,
    message,
    type,
    referenceId,
    metadata
}: CreateNotificationParams) {
    try {
        const { data, error } = await supabaseAdmin
            .from("notifications")
            .insert({
                user_id: userId,
                title,
                message,
                type,
                reference_id: referenceId,
                metadata,
                is_read: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error("[NOTIFICATIONS] Error creating notification:", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error("[NOTIFICATIONS] Critical error:", err);
        return { success: false, error: err };
    }
}
