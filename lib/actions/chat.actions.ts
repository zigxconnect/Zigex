"use server";

import { createServerActionClient } from "@/lib/supabase/server";

/**
 * Persists a message to Supabase.
 */
export async function persistMessageAction({
    projectId,
    senderId,
    recipientId,
    text,
    metadata = {}
}: {
    projectId: string;
    senderId: string;
    recipientId: string;
    text: string;
    metadata?: any;
}) {
    const supabase = await createServerActionClient();

    const { data, error } = await supabase
        .from('project_messages')
        .insert([
            {
                project_id: projectId,
                sender_id: senderId,
                recipient_id: recipientId,
                text,
                metadata
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Error persisting message:", error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

/**
 * Fetches message history for a specific conversation.
 */
export async function getMessageHistoryAction(projectId: string, participantId: string, ownerId: string) {
    const supabase = await createServerActionClient();

    // Logic: either (sender=participant, recipient=owner) OR (sender=owner, recipient=participant)
    const { data, error } = await supabase
        .from('project_messages')
        .select('*')
        .eq('project_id', projectId)
        .or(`and(sender_id.eq.${participantId},recipient_id.eq.${ownerId}),and(sender_id.eq.${ownerId},recipient_id.eq.${participantId})`)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        return [];
    }

    return data || [];
}
