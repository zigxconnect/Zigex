import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { internshipSchema } from '@/lib/validation/internship';


/**
 * @swagger
 * /api/companies/internships:
 *   post:
 *     summary: add company postings(internships, events, etc)
 *     description: Create a new Post 
 *     tags:
 *          - Company Postings
 *     responses:
 *       201:
 *         description: Internship created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Company profile not found
 * 
 *   get:
 *      summary: get all company postings(internships, events, etc)
 *      description: Get all postings for a company(internship, event, etc)
 *      tags:
 *          - Company Postings
 *      responses:
 *       200:
 *         description: Success
 * 
 */



export async function GET(request: Request) {

    // Authenticate the user
    // This middleware checks the request for a valid authentication token
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth; // Return the NextResponse if authentication fails
    }

    const {user, type} = auth;
    if (type !== 'company') {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 403 }
        );
    }

    const {company} = auth;
    if (!company) {
        return NextResponse.json(
            { error: 'Company profile not found' },
            { status: 404 }
        );
    }


    const { data, error } = await supabaseAdmin
    .from('internships')
    .select('*')
    .eq('company_id', company.id);
    if (error) {
        console.log('Error fetching internships:', error);
        return NextResponse.json(
            { error: error.message }, 
            { status: 500 }
            );
    }
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    // Authenticate the user
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth; // Return the NextResponse if authentication fails
    }

    const {user, type} = auth;
    if (type !== 'company') {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 403 }
        );
    }

    const {company} = auth;
    if (!company) {
        return NextResponse.json(
            { error: 'Company profile not found' },
            { status: 404 }
        );
    }
    try {
        const body = await request.json();
        const validatedData = internshipSchema.parse({
            ...body,
            company_id: company.id
        });

        const { data: internship, error } = await supabaseAdmin.from('internships').insert([validatedData]).select('*').single();
        if (error) {
            console.log( error);
            return NextResponse.json(
                { error: error.message }, 
                { status: 500 });
        }

        // --- NOTIFICATION & EMAIL LOGIC (Migrated from Edge Function) ---
        try {
            // 1. Get subscribed users
            const { data: users, error: userError } = await supabaseAdmin.rpc("get_subscribed_emails");
            
            let recipients = users || [];
            if (userError) {
                console.error("RPC get_subscribed_emails failed:", userError);
            }

            if (recipients.length > 0) {
                // Deduplicate recipients based on user_id/id
                const uniqueRecipientsMap = new Map();
                recipients.forEach((item: any) => {
                    const uid = item.id || item.user_id;
                    if (uid && !uniqueRecipientsMap.has(uid)) {
                        uniqueRecipientsMap.set(uid, item);
                    }
                });
                const uniqueRecipients = Array.from(uniqueRecipientsMap.values());
                const recipientEmails = uniqueRecipients.map((u: any) => u.email).filter(Boolean);
                
                // 2. Send Email (Batch BCC with Generic To)
                if (process.env.RESEND_API_KEY && recipientEmails.length > 0) {
                    const { Resend } = await import("resend");
                    const resend = new Resend(process.env.RESEND_API_KEY);
                    const { NewPostEmail } = await import("@/emails/NewPostEmail");

                    // Send to "notifications@ZIGEX.online" (ourselves) and BCC everyone else
                    await resend.emails.send({
                        from: "ZIGEX <notifications@ZIGEX.online>",
                        to: "notifications@ZIGEX.online", 
                        bcc: recipientEmails, // Everyone goes to BCC
                        subject: `New Internship Posted: ${internship.title}`,
                        react: NewPostEmail({
                            postTitle: internship.title,
                            postType: "Internship",
                            postLocation: internship.location,
                            viewPostUrl: `https://ZIGEX.online/internships/${internship.id}`,
                            companyLogoUrl: "https://tmvipinvvhgklmqwvows.supabase.co/storage/v1/object/public/company-assets/Seed%20Company/events/SEED%20community%20Challenge-1757769838240.jpg", 
                            managePreferencesUrl: "https://ZIGEX.online/profile/notifications",
                            postedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
                        }),
                    });
                }

                // 3. Create Notifications in DB (using unique recipients)
                const notifications = uniqueRecipients.map((u: any) => ({
                    user_id: u.id || u.user_id, 
                    title: "New Internship Posted!",
                    message: `A new internship "${internship.title}" is available.`,
                    type: "internship",
                    reference_id: internship.id,
                }));

                const { error: notifError } = await supabaseAdmin.from("notifications").insert(notifications);
                if (notifError) console.error("Failed to create notifications:", notifError);
            }
        } catch (innerErr) {
            console.error("Async notification error:", innerErr);
        }
        // ---------------------------------------------------------------

        return NextResponse.json(internship, { status: 201 });
    }
    catch(err){
        console.log(err)
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 400 }
        )
    }
}

export async function PATCH(request: Request) {
    // Authenticate the user
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth; // Return the NextResponse if authentication fails
    }

    const {user, type} = auth;
    if (type !== 'company') {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 403 }
        );
    }

    const {company} = auth;
    if (!company) {
        return NextResponse.json(
            { error: 'Company profile not found' },
            { status: 404 }
        );
    }


    // Validate data
    const body = await request.json();
    const { id, ...updates } = internshipSchema.partial().parse(body);
    if (!id) {
        return NextResponse.json(
            { error: 'Internship ID is required for updates' },
            { status: 400 }
        );
    }
    // Ensure the internship belongs to the authenticated company
    const { data: existingInternship, error: fetchError } = await supabaseAdmin
        .from('internships')
        .select('*')
        .eq('id', id)
        .eq('company_id', company.id)
        .single();
    if (fetchError || !existingInternship) {
        return NextResponse.json(
            { error: 'Internship not found or does not belong to this company' },
            { status: 404 }
        );
    }

    // Update data
    const { data, error } = await supabaseAdmin
        .from('internships')
        .update(updates)
        .eq('id', id);
    if (error) {
        return NextResponse.json(
            { error: error.message }, 
            { status: 500 });
    }
    return NextResponse.json(data);
}

export async function DELETE(request: Request) {
    // Authenticate the user
    
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth; // Return the NextResponse if authentication fails
    }

    const {user, type} = auth;
    if (type !== 'company') {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 403 }
        );
    }

    const {company} = auth;
    if (!company) {
        return NextResponse.json(
            { error: 'Company profile not found' },
            { status: 404 }
        );
    }

    const body = await request.json()
    const { id } = body;

    // verify internship belongs to company
    const { data: existingInternship, error: fetchError } = await supabaseAdmin
        .from('internships')
        .select('*')
        .eq('id', id)
        .eq('company_id', company.id)
        .single();
    if (fetchError || !existingInternship) {
        return NextResponse.json(
            { error: 'Internship not found or does not belong to this company' },
            { status: 404 }
        );
    }

    // const { id } = await request.json();
    const { data, error } = await supabaseAdmin.from('internships').delete().eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}