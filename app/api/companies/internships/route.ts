import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { internshipSchema } from '@/lib/validation/internship';
import { dispatchBroadcastNotification } from '@/lib/notifications';


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
            } else if (key === "is_visible") {
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

        // --- BROADCAST NOTIFICATIONS ---
        try {
            await dispatchBroadcastNotification({
                title: internship.title,
                message: `A new internship "${internship.title}" is available.`,
                type: 'internship',
                referenceId: internship.id,
                link: `/internships/${internship.id}`,
                location: internship.location || 'Remote'
            });
            console.log("[INTERNSHIP_NOTIFY] Broadcast dispatched successfully.");
        } catch (notifErr) {
            console.error("[INTERNSHIP_NOTIFY] Failed to dispatch broadcast:", notifErr);
        }
        // ---------------------------------
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
