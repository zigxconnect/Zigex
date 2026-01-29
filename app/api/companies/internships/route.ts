import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';
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

    const { user, type } = auth;
    if (type !== 'company') {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 403 }
        );
    }

    const { company } = auth;
    if (!company) {
        return NextResponse.json(
            { error: 'Company profile not found' },
            { status: 404 }
        );
    }


    const supabase = await createClient();
    const { data, error } = await supabase
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

    const { user, type } = auth;
    if (type !== 'company') {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 403 }
        );
    }

    const { company } = auth;
    if (!company) {
        return NextResponse.json(
            { error: 'Company profile not found' },
            { status: 404 }
        );
    }
    try {
        const formData = await request.formData();
        const coverImage = formData.get("cover_image") as File | null;

        // Extract fields from FormData
        const rawData: any = {};
        formData.forEach((value, key) => {
            if (key === "required_skills") {
                try {
                    rawData[key] = JSON.parse(value as string);
                } catch {
                    rawData[key] = [];
                }
            } else if (key === "is_paid") {
                rawData[key] = value === "true";
            } else if (key !== "cover_image") {
                rawData[key] = value === "null" ? null : value;
            }
        });

        console.log("POST /api/companies/internships - Processing form data");

        const sanitizePathComponent = (str: string) =>
            str.replace(/[^a-zA-Z0-9_-]/g, "_");

        let cover_image_url = rawData.cover_image_url || null;

        const supabase = await createClient();

        // Handle Image Upload if new image provided
        if (coverImage) {
            console.log("Uploading internship cover image...");
            const imageExt = coverImage.name.split(".").pop();
            const imageName = `internship-${Date.now()}.${imageExt}`;
            const imagePath = `${sanitizePathComponent(company.company_name)}/internships/${imageName}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from("company-assets")
                .upload(imagePath, coverImage, { cacheControl: "3600", upsert: false });

            if (uploadError) {
                console.error("Supabase storage upload error:", uploadError);
                return NextResponse.json(
                    { error: "Failed to upload cover image" },
                    { status: 500 }
                );
            }

            const { data: imageData } = supabaseAdmin.storage
                .from("company-assets")
                .getPublicUrl(imagePath);
            cover_image_url = imageData.publicUrl;
            console.log("Image uploaded to:", cover_image_url);
        }

        const validatedData = internshipSchema.parse({
            ...rawData,
            cover_image_url,
            company_id: company.id
        });

        console.log("Inserting internship into DB...");
        const { data: internship, error } = await supabase.from('internships').insert([validatedData]).select('*').single();
        if (error) {
            console.error("DB Insert Error:", error);
            // Cleanup uploaded image if DB insert fails
            if (coverImage && cover_image_url) {
                const path = cover_image_url.split('/company-assets/').pop();
                if (path) await supabaseAdmin.storage.from('company-assets').remove([path]);
            }
            return NextResponse.json(
                { error: error.message },
                { status: 500 });
        }
        console.log("Internship created successfully:", internship.id);

        // --- NOTIFICATION & EMAIL LOGIC ---
        // Note: We don't want to block the response too long if this is slow.
        console.log("Starting notification process...");
        try {
            // 1. Get subscribed users
            const { data: users, error: userError } = await (await createClient()).rpc("get_subscribed_emails");

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
                // Note: Resend has a limit on BCC recipients (usually 50-100).
                // We'll cap it at 50 for now or ideally use a mailing list/loop.
                if (process.env.RESEND_API_KEY && recipientEmails.length > 0) {
                    const { Resend } = await import("resend");
                    const resend = new Resend(process.env.RESEND_API_KEY);
                    const { NewPostEmail } = await import("@/emails/NewPostEmail");

                    // Resend BCC limit is usually 50. We cap it to avoid hanging/errors.
                    const limitedRecipients = recipientEmails.slice(0, 50);

                    console.log(`Sending notification emails to ${limitedRecipients.length} recipients...`);

                    try {
                        await resend.emails.send({
                            from: "ZIGEX <notifications@zigexconnect.com>",
                            to: "notifications@zigexconnect.com",
                            bcc: limitedRecipients,
                            subject: `New Internship Posted: ${internship.title}`,
                            react: NewPostEmail({
                                postTitle: internship.title,
                                postType: "Internship",
                                postLocation: internship.location,
                                viewPostUrl: `https://zigexconnect.com/internships/${internship.id}`,
                                companyLogoUrl: "https://tmvipinvvhgklmqwvows.supabase.co/storage/v1/object/public/company-assets/Seed%20Company/events/SEED%20community%20Challenge-1757769838240.jpg",
                                managePreferencesUrl: "https://zigexconnect.com/profile/notifications",
                                postedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
                            }),
                        });
                    } catch (emailErr) {
                        console.error("Resend email sending failed:", emailErr);
                    }
                }

                // 3. Create Notifications in DB (using unique recipients)
                const notifications = uniqueRecipients.map((u: any) => ({
                    user_id: u.id || u.user_id,
                    title: "New Internship Posted!",
                    message: `A new internship "${internship.title}" is available.`,
                    type: "internship",
                    reference_id: internship.id,
                }));

                const { error: notifError } = await (await createClient()).from("notifications").insert(notifications);
                if (notifError) console.error("Failed to create notifications:", notifError);
            }
        } catch (innerErr) {
            console.error("Async notification error:", innerErr);
        }
        // ---------------------------------------------------------------

        return NextResponse.json(internship, { status: 201 });
    }
    catch (err) {
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

    const { user, type } = auth;
    if (type !== 'company') {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 403 }
        );
    }

    const { company } = auth;
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
    const supabase = await createClient();
    // Ensure the internship belongs to the authenticated company
    const { data: existingInternship, error: fetchError } = await supabase
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
    const { data, error } = await supabase
        .from('internships')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
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

    const { user, type } = auth;
    if (type !== 'company') {
        return NextResponse.json(
            { error: 'Unauthorized access' },
            { status: 403 }
        );
    }

    const { company } = auth;
    if (!company) {
        return NextResponse.json(
            { error: 'Company profile not found' },
            { status: 404 }
        );
    }

    const body = await request.json()
    const { id } = body;

    const supabase = await createClient();
    // verify internship belongs to company
    const { data: existingInternship, error: fetchError } = await supabase
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
    const { data, error } = await supabase.from('internships').delete().eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}