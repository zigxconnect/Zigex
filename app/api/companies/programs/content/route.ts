// API Route: Manage program content (lessons/updates)
import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// GET: Fetch all content for a program
// Secure: Checks if student has paid. If not, content body and resources are redacted from API response.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    if (!programId) {
        return NextResponse.json(
            { error: "Program ID is required" },
            { status: 400 }
        );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set() { },
                remove() { },
            },
        }
    );

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    let hasAccess = false;

    if (user) {
        // 2. Check enrollment status for this program
        const { data: studentProfile } = await supabaseAdmin
            .from("student_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (studentProfile) {
            const { data: application } = await supabaseAdmin
                .from("Applications")
                .select("payment_completed, status")
                .eq("program_id", programId)
                .eq("student_id", studentProfile.id)
                .single();

            // Grant access if accepted and payment is completed
            if (application && application.status === 'accepted' && application.payment_completed) {
                hasAccess = true;
            }
        }
    }

    // 3. Fetch content
    const { data: content, error } = await supabaseAdmin
        .from("program_content")
        .select("*")
        .eq("program_id", programId)
        .order("display_order", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Transform and filter content based on payment/access status
    const securedContent = content?.map(item => {
        // Construct resources array from flat columns
        const resources: any[] = [];

        if (item.video_url) {
            resources.push({
                type: 'video',
                title: 'Video Lesson',
                url: item.video_url,
                description: 'Watch the lesson video'
            });
        }

        if (item.github_url) {
            resources.push({
                type: 'github',
                title: 'Source Code',
                url: item.github_url,
                description: 'Access the project repository'
            });
        }

        if (item.google_docs_url) {
            resources.push({
                type: 'link',
                title: 'Documentation',
                url: item.google_docs_url,
                description: 'Read the lesson notes'
            });
        }

        if (item.content_url) {
            resources.push({
                type: item.resource_type || 'other',
                title: 'Downloadable Material',
                url: item.content_url
            });
        }

        // Map to expected camelCase interface
        const mappedItem = {
            id: item.id,
            programId: item.program_id,
            weekNumber: item.week_number,
            title: item.title,
            description: item.description,
            // If payment required and no access, hide markdown content
            content: (!item.payment_required || hasAccess) ? item.assignment_details : null,
            resources: resources.map(r => ({
                ...r,
                // Redact URL if no access
                url: (!item.payment_required || hasAccess) ? r.url : '#'
            })),
            isPublished: true, // Assumed
            notifyPaidUsers: true,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            payment_required: item.payment_required // Keep for frontend check
        };

        return mappedItem;
    });

    return NextResponse.json(securedContent || []);
}

// POST: Create new program content (admin only)
export async function POST(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    // Check if user is Company or Admin
    const isAdmin = auth.user?.app_metadata?.claims_admin;
    if ((auth.type !== "company" || !auth.company) && !isAdmin) {
        // Double check if they are a super admin in the User table or similar if app_metadata isn't set
        // For now, fail if not company and not admin
        return NextResponse.json({ error: "Unauthorized: Must be a Company or Admin" }, { status: 403 });
    }

    const body = await request.json();
    const {
        program_id,
        title,
        description,
        content_type,
        week_number,
        date_due,
        video_url,
        github_url,
        google_docs_url,
        assignment_details,
        content_url,
        resource_type,
        display_order,
        payment_required,
    } = body;

    if (!program_id || !title || !content_type) {
        return NextResponse.json(
            { error: "Program ID, title, and content_type are required" },
            { status: 400 }
        );
    }

    // Verify program exists
    const { data: program, error: programError } = await supabaseAdmin
        .from("programs")
        .select("id, title, company_id")
        .eq("id", program_id)
        .single();

    if (programError || !program) {
        return NextResponse.json(
            { error: "Program not found" },
            { status: 404 }
        );
    }

    // If user is functioning as a Company, verify ownership
    if (auth.type === "company" && auth.company) {
        if (program.company_id !== auth.company.id) {
            return NextResponse.json(
                { error: "Unauthorized: You can only create content for your own programs" },
                { status: 403 }
            );
        }
    }

    // Create the content
    const { data: newContent, error: insertError } = await supabaseAdmin
        .from("program_content")
        .insert({
            program_id,
            title,
            description: description || null,
            content_type,
            week_number: week_number || null,
            date_due: date_due || null,
            video_url: video_url || null,
            github_url: github_url || null,
            google_docs_url: google_docs_url || null,
            assignment_details: assignment_details || null,
            content_url: content_url || null,
            resource_type: resource_type || null,
            display_order: display_order || 0,
            payment_required: payment_required || false,
            created_by: auth.user?.id,
        })
        .select()
        .single();

    if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Optionally send email notifications to accepted students
    if (auth.user && auth.type === "company") {
        try {
            // Get all accepted students for this program who have paid
            const { data: acceptedStudents } = await supabaseAdmin
                .from("Applications")
                .select(`
          student_id,
          payment_completed,
          student:student_profiles (
            full_name,
            user_id
          )
        `)
                .eq("program_id", program_id)
                .eq("status", "accepted")
                .eq("payment_completed", true);

            if (acceptedStudents && acceptedStudents.length > 0) {
                // Get emails from auth users
                const notificationPromises = acceptedStudents.map(async (app: any) => {
                    const student = Array.isArray(app.student) ? app.student[0] : app.student;
                    if (!student?.user_id) return;

                    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(student.user_id);
                    if (!userData?.user?.email) return;

                    return sendEmail({
                        to: userData.user.email,
                        subject: `📚 New Content: ${title} - ${program.title}`,
                        heading: "New Program Content Available!",
                        message: `Hi ${student.full_name || "Student"},\n\nNew content has been added to your program "${program.title}":\n\n**${title}**\n\n${description || "Check it out in your dashboard!"}\n\nLog in to access the full content and resources.`,
                        ctaText: "View Content",
                        ctaLink: `https://zigexconnect.com/programs/${program_id}/updates`,
                        opportunityTitle: program.title,
                        opportunityType: "program",
                        companyName: auth.company?.company_name || "ZIGEX",
                    });
                });

                await Promise.allSettled(notificationPromises);
            }
        } catch (notificationError) {
            console.error("Error sending notifications:", notificationError);
            // Don't fail the request if notifications fail
        }
    }

    return NextResponse.json(newContent);
}

// PUT: Update program content
export async function PUT(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    // Check if user is Company or Admin
    const isAdmin = auth.user?.app_metadata?.claims_admin;
    if ((auth.type !== "company" || !auth.company) && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
        return NextResponse.json({ error: "Content ID is required" }, { status: 400 });
    }

    // Verify content exists and belongs to company (if company)
    const { data: existingContent, error: fetchError } = await supabaseAdmin
        .from("program_content")
        .select("*, programs!inner(company_id)")
        .eq("id", id)
        .single();

    if (fetchError || !existingContent) {
        return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    if (auth.type === "company" && auth.company) {
        // @ts-ignore - Supabase types join
        if (existingContent.programs.company_id !== auth.company.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    }

    // Remove immutable fields or dangerous updates
    delete (updates as any).created_at;
    delete (updates as any).created_by;
    delete (updates as any).program_id; // Ideally prevent moving content between programs for now

    const { data: updatedContent, error: updateError } = await supabaseAdmin
        .from("program_content")
        .update({
            title: updates.title,
            description: updates.description,
            content_type: updates.content_type,
            week_number: updates.week_number,
            date_due: updates.date_due,
            video_url: updates.video_url,
            github_url: updates.github_url,
            google_docs_url: updates.google_docs_url,
            assignment_details: updates.assignment_details,
            content_url: updates.content_url,
            resource_type: updates.resource_type,
            display_order: updates.display_order,
            payment_required: updates.payment_required,
        })
        .eq("id", id)
        .select()
        .single();

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedContent);
}

// DELETE: Delete program content
export async function DELETE(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ error: "Content ID is required" }, { status: 400 });
    }

    // Check if user is Company or Admin
    const isAdmin = auth.user?.app_metadata?.claims_admin;
    if ((auth.type !== "company" || !auth.company) && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify content ownership
    const { data: existingContent, error: fetchError } = await supabaseAdmin
        .from("program_content")
        .select("*, programs!inner(company_id)")
        .eq("id", id)
        .single();

    if (fetchError || !existingContent) {
        return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    if (auth.type === "company" && auth.company) {
        // @ts-ignore
        if (existingContent.programs.company_id !== auth.company.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
    }

    const { error: deleteError } = await supabaseAdmin
        .from("program_content")
        .delete()
        .eq("id", id);

    if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
