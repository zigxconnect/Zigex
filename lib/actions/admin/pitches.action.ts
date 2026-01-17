"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

export interface AdminPitchList {
    id: string;
    project: {
        title: string;
        owner: {
            full_name: string;
            email: string;
        };
    };
    company: {
        company_name: string;
    };
    status: string;
    created_at: string;
}

export async function getAdminPitches() {
    try {
        const { data, error } = await supabaseAdmin
            .from('project_submissions')
            .select(`
                id,
                created_at,
                status,
                project:projects!inner (
                    title,
                    student_profiles!inner (
                        full_name,
                        email
                    )
                ),
                company:company_profiles (
                    company_name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching pitches:", error);
            return { success: false, error: error.message };
        }

        const formattedData = data.map((pitch: any) => ({
            ...pitch,
            project: {
                ...pitch.project,
                owner: pitch.project.student_profiles
            }
        }));

        return { success: true, data: formattedData };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function updatePitchStatusAction(id: string, status: string, sendMail: boolean = false) {
    try {
        const { data: submission, error: fetchError } = await supabaseAdmin
            .from('project_submissions')
            .select(`
                *,
                project:projects (
                    title,
                    student_profiles!inner (
                        full_name,
                        email
                    )
                ),
                company:company_profiles (
                    company_name
                )
            `)
            .eq('id', id)
            .single();

        if (fetchError || !submission) {
            return { success: false, error: "Submission not found" };
        }

        const { error: updateError } = await supabaseAdmin
            .from('project_submissions')
            .update({ status })
            .eq('id', id);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        if (sendMail) {
            const student = submission.project.student_profiles;
            const companyName = submission.company?.company_name || "a Partner Company";

            await sendEmail({
                to: student.email,
                subject: `Pitch Update: ${submission.project.title}`,
                heading: `Update on your Pitch: ${submission.project.title}`,
                message: `Hi ${student.full_name},\n\nYour pitch for "${submission.project.title}" has been updated to: **${status.toUpperCase()}** by ${companyName}.\n\nYou can view the details in your dashboard.`,
                statusBadge: status.toUpperCase(),
                statusColor: status === 'interested' ? '#10B981' : (status === 'rejected' ? '#EF4444' : '#3B82F6'),
                ctaText: "View My Pitches",
                ctaLink: `https://zigexconnect.com/student/pitches`, // Update with real link
                opportunityTitle: submission.project.title,
                companyName: companyName
            });
        }

        revalidatePath(`/admin/pitches/${id}`);
        revalidatePath('/admin/pitches');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
