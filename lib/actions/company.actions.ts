"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCompaniesAction() {
    const supabase = await createSupabaseServerClient();

    try {
        const { data, error } = await supabase
            .from('company_profiles')
            .select('id, company_name')
            .order('company_name');

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function getCompanySubmissionsAction() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // Get Company ID
    const { data: company, error: companyError } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (companyError || !company) return { success: false, error: "Company profile not found" };

    // Fetch Submissions using admin to bypass RLS on private projects
    const { data: submissions, error } = await supabaseAdmin
        .from('project_submissions')
        .select(`
      id,
      status,
      created_at,
      project:projects (
        id,
        title,
        tagline,
        category,
        video_url,
        pitch_deck_url,
        cover_images,
        tech_stack,
        owner_id,
        is_published
      )
    `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    // Filter out orphaned submissions (where project is null)
    const validSubmissions = submissions ? submissions.filter((s: any) => s.project) : [];

    // Fetch owner profiles manually to avoid complex joins if relations aren't perfect
    // or use a second query
    const ownerIds = validSubmissions.map((s: any) => s.project.owner_id);

    const { data: owners } = await supabaseAdmin
        .from('student_profiles')
        .select('user_id, full_name, avatar_url, university')
        .in('user_id', ownerIds);

    const ownerMap = new Map(owners?.map((o: any) => [o.user_id, o]));

    const enriched = validSubmissions.map((s: any) => ({
        ...s,
        project: {
            ...s.project,
            owner: ownerMap.get(s.project.owner_id) || { full_name: 'Unknown User' }
        }
    }));

    return { success: true, data: enriched };
}

/**
 * Update the status of a project submission (Phase 2: The Handshake)
 * FR-07: System MUST allow Companies to update Project Lifecycle Status
 */
export async function updateSubmissionStatusAction(
    submissionId: string,
    newStatus: 'reviewing' | 'meeting_scheduled' | 'accepted' | 'rejected' | 'sponsored'
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // Verify ownership
    const { data: company } = await supabase
        .from('company_profiles')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single();

    if (!company) return { success: false, error: "Company profile not found" };

    // Get the submission to verify it belongs to this company
    const { data: submission } = await supabase
        .from('project_submissions')
        .select('id, project_id, company_id, project:projects(owner_id, title)')
        .eq('id', submissionId)
        .single();

    if (!submission || submission.company_id !== company.id) {
        return { success: false, error: "Submission not found or unauthorized" };
    }

    // Update the status
    const { error: updateError } = await supabaseAdmin
        .from('project_submissions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', submissionId);

    if (updateError) return { success: false, error: updateError.message };

    // If accepted/sponsored, also update the project itself
    if (newStatus === 'accepted' || newStatus === 'sponsored') {
        await supabaseAdmin
            .from('projects')
            .update({
                is_published: true,
                status: newStatus === 'sponsored' ? 'sponsored' : 'valid',
                sponsoring_company_id: company.id
            })
            .eq('id', submission.project_id);
    }

    // Create a notification for the project owner (FR-09: Status Update Alert)
    const project = submission.project as any;
    if (project?.owner_id) {
        await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: project.owner_id,
                type: 'project_status_update',
                title: getStatusNotificationTitle(newStatus, company.company_name),
                message: getStatusNotificationMessage(newStatus, project.title, company.company_name),
                metadata: {
                    submission_id: submissionId,
                    project_id: submission.project_id,
                    new_status: newStatus,
                    company_id: company.id,
                    company_name: company.company_name
                }
            });
    }

    revalidatePath('/admin/dashboard/inbox');
    revalidatePath(`/feed/projects/${submission.project_id}`);

    return { success: true };
}

function getStatusNotificationTitle(status: string, companyName: string): string {
    switch (status) {
        case 'reviewing': return `${companyName} is reviewing your pitch!`;
        case 'meeting_scheduled': return `Meeting Scheduled with ${companyName}!`;
        case 'accepted': return `🎉 Your project was ACCEPTED by ${companyName}!`;
        case 'sponsored': return `🚀 Your project is now SPONSORED by ${companyName}!`;
        case 'rejected': return `Update from ${companyName}`;
        default: return `Status update from ${companyName}`;
    }
}

function getStatusNotificationMessage(status: string, projectTitle: string, companyName: string): string {
    switch (status) {
        case 'reviewing': return `${companyName} has started reviewing "${projectTitle}". Stay tuned for updates!`;
        case 'meeting_scheduled': return `Great news! ${companyName} wants to schedule a meeting to discuss "${projectTitle}". Check your messages.`;
        case 'accepted': return `Congratulations! "${projectTitle}" has been accepted by ${companyName}. Your project is now live!`;
        case 'sponsored': return `Amazing! ${companyName} has decided to sponsor "${projectTitle}". You're on your way!`;
        case 'rejected': return `After careful review, ${companyName} has decided not to move forward with "${projectTitle}" at this time.`;
        default: return `The status of "${projectTitle}" has been updated by ${companyName}.`;
    }
}

/**
 * Schedule a meeting with a project founder (FR-05)
 */
export async function scheduleMeetingAction(
    submissionId: string,
    meetingDetails: {
        date: string;
        time: string;
        link: string;
        notes?: string;
    }
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data: company } = await supabase
        .from('company_profiles')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single();

    if (!company) return { success: false, error: "Company profile not found" };

    // Get submission
    const { data: submission } = await supabase
        .from('project_submissions')
        .select('id, project_id, company_id, project:projects(owner_id, title)')
        .eq('id', submissionId)
        .single();

    if (!submission || submission.company_id !== company.id) {
        return { success: false, error: "Submission not found" };
    }

    // Update status to meeting_scheduled
    await supabaseAdmin
        .from('project_submissions')
        .update({
            status: 'meeting_scheduled',
            meeting_details: meetingDetails,
            updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

    // Notify the founder (FR-10: Meeting Alert)
    const project = submission.project as any;
    if (project?.owner_id) {
        await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: project.owner_id,
                type: 'meeting_scheduled',
                title: `📅 Meeting Scheduled with ${company.company_name}!`,
                message: `${company.company_name} wants to meet about "${project.title}" on ${meetingDetails.date} at ${meetingDetails.time}.`,
                metadata: {
                    submission_id: submissionId,
                    project_id: submission.project_id,
                    company_id: company.id,
                    company_name: company.company_name,
                    meeting_link: meetingDetails.link,
                    meeting_date: meetingDetails.date,
                    meeting_time: meetingDetails.time,
                    meeting_notes: meetingDetails.notes
                }
            });
    }

    revalidatePath('/admin/dashboard/inbox');
    return { success: true };
}

/**
 * Toggle project visibility (FR-06): Make project PUBLIC or PRIVATE
 * When set to PUBLIC, the project becomes visible to all users in the feed
 */
export async function toggleProjectVisibilityAction(
    submissionId: string,
    isPublic: boolean
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const { data: company } = await supabase
        .from('company_profiles')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single();

    if (!company) return { success: false, error: "Company profile not found" };

    // Get submission
    const { data: submission } = await supabase
        .from('project_submissions')
        .select('id, project_id, company_id, project:projects(owner_id, title, is_published)')
        .eq('id', submissionId)
        .single();

    if (!submission || submission.company_id !== company.id) {
        return { success: false, error: "Submission not found or unauthorized" };
    }

    // Update project visibility
    const { error: updateError } = await supabaseAdmin
        .from('projects')
        .update({
            is_published: isPublic,
            updated_at: new Date().toISOString()
        })
        .eq('id', submission.project_id);

    if (updateError) return { success: false, error: updateError.message };

    // Notify the founder
    const project = submission.project as any;
    if (project?.owner_id) {
        const title = isPublic
            ? `🌍 Your project is now PUBLIC!`
            : `🔒 Your project is now PRIVATE`;
        const message = isPublic
            ? `${company.company_name} has made "${project.title}" visible to everyone. Students can now discover and collaborate on your project!`
            : `${company.company_name} has set "${project.title}" to private. It's no longer visible in the public feed.`;

        await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: project.owner_id,
                type: 'project_visibility_changed',
                title,
                message,
                metadata: {
                    submission_id: submissionId,
                    project_id: submission.project_id,
                    is_public: isPublic,
                    company_id: company.id,
                    company_name: company.company_name
                }
            });
    }

    revalidatePath('/admin/dashboard/inbox');
    revalidatePath('/feed');
    revalidatePath('/feed/projects');
    revalidatePath(`/feed/projects/${submission.project_id}`);

    return { success: true };
}
