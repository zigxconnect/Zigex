// api/companies/programs/route.ts (MODIFIED)
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { programSchema } from '@/lib/validation/program';
import { v4 as uuidv4 } from 'uuid'; // For unique file names

/**
 * @swagger
 * /api/companies/programs:
 *   post:
 *     summary: Add a new program posting for a company with image upload
 *     description: Create a new program (bootcamp, hackathon, volunteer, mentorship, apprenticeship) including an optional program picture.
 *     tags:
 *          - Company Programs
 *     requestBody:
 *             required:
 *               - title
 *               - description
 *               - program_category
 *               - start_date
 *               - end_date
 *     responses:
 *       201:
 *         description: Program created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Program'
 *       400:
 *         description: Bad request (validation error)
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Company profile not found
 *       500:
 *         description: Internal server error
 

 */

export async function GET(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth;
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

    const { data, error } = await supabaseAdmin
        .from('programs')
        .select('*')
        .eq('company_id', company.id);

    if (error) {
        console.error('Error fetching programs:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth;
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
        const programPicture = formData.get('program_picture') as File | null;

        // Extract other fields, handling potential comma-separated strings for arrays
        const rawData: { [key: string]: any } = {};
        for (const [key, value] of formData.entries()) {
            if (key === 'required_skills' && typeof value === 'string') {
                rawData[key] = value.split(',').map(s => s.trim()).filter(s => s);
            } else if (key !== 'program_picture') {
                rawData[key] = value;
            }
        }

        // Add company_id before validation
        const validatedData = programSchema.parse({
            ...rawData,
            company_id: company.id
        });

        let program_picture_url: string | undefined;

        // Handle image upload to Supabase Storage
        if (programPicture) {
            const fileExtension = programPicture.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`; // Use UUID for unique filename
            const filePath = `${company.id}/${fileName}`; // Store images per company ID

            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('program_pictures') // Your bucket name
                .upload(filePath, programPicture, {
                    cacheControl: '3600',
                    upsert: true, // Allow overwriting if a file with same path exists
                    contentType: programPicture.type
                });

            if (uploadError) {
                console.error('Supabase Storage upload error:', uploadError);
                return NextResponse.json(
                    { error: `Failed to upload image: ${uploadError.message}` },
                    { status: 500 }
                );
            }

            const { data: publicUrlData } = supabaseAdmin.storage
                .from('program_pictures')
                .getPublicUrl(filePath);

            program_picture_url = publicUrlData.publicUrl;
        }

        // Insert program data into the database
        const { data, error } = await supabaseAdmin.from('programs').insert([{
            ...validatedData,
            program_picture_url: program_picture_url // Add the URL here
        }]).select('*').single();

        if (error) {
            console.error('Error creating program:', error);
            // Optionally, delete the uploaded image if DB insertion fails
            if (program_picture_url) {
                await supabaseAdmin.storage.from('program_pictures').remove([`${company.id}/${program_picture_url.split('/').pop()}`]);
            }
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error('Validation or processing error:', err);
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 400 }
        );
    }
}

export async function PATCH(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth;
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
        const programPicture = formData.get('program_picture') as File | null;
        const programId = formData.get('id') as string | null;

        if (!programId) {
            return NextResponse.json(
                { error: 'Program ID is required for updates' },
                { status: 400 }
            );
        }

        // Extract other fields, handling potential comma-separated strings for arrays
        const rawUpdates: { [key: string]: any } = {};
        for (const [key, value] of formData.entries()) {
            if (key === 'required_skills' && typeof value === 'string') {
                rawUpdates[key] = value.split(',').map(s => s.trim()).filter(s => s);
            } else if (key !== 'program_picture' && key !== 'id') { // Exclude program_picture and id
                rawUpdates[key] = value;
            }
        }

        // Validate partial updates
        const updates = programSchema.partial().parse(rawUpdates);

        // Ensure the program belongs to the authenticated company
        const { data: existingProgram, error: fetchError } = await supabaseAdmin
            .from('programs')
            .select('id, company_id, program_picture_url') // Also get current image URL
            .eq('id', programId)
            .eq('company_id', company.id)
            .single();

        if (fetchError || !existingProgram) {
            return NextResponse.json(
                { error: 'Program not found or does not belong to this company' },
                { status: 404 }
            );
        }

        let program_picture_url: string | undefined = existingProgram.program_picture_url;

        // Handle new image upload
        if (programPicture) {
            // Optional: Delete old image from storage if it exists
            if (existingProgram.program_picture_url) {
                const oldFileName = existingProgram.program_picture_url.split('/').pop();
                if (oldFileName) {
                    await supabaseAdmin.storage.from('program_pictures').remove([`${company.id}/${oldFileName}`]);
                }
            }

            const fileExtension = programPicture.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const filePath = `${company.id}/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('program_pictures')
                .upload(filePath, programPicture, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: programPicture.type
                });

            if (uploadError) {
                console.error('Supabase Storage upload error:', uploadError);
                return NextResponse.json(
                    { error: `Failed to upload new image: ${uploadError.message}` },
                    { status: 500 }
                );
            }

            const { data: publicUrlData } = supabaseAdmin.storage
                .from('program_pictures')
                .getPublicUrl(filePath);

            program_picture_url = publicUrlData.publicUrl;
        }

        // Update program data in the database
        const { data, error } = await supabaseAdmin
            .from('programs')
            .update({
                ...updates,
                program_picture_url: program_picture_url // Update with new URL or keep old
            })
            .eq('id', programId)
            .select('*')
            .single();

        if (error) {
            console.error('Error updating program:', error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(data);
    } catch (err) {
        console.error('Validation or processing error:', err);
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 400 }
        );
    }
}

export async function DELETE(request: Request) {
    const auth = await authMiddleware(request);
    if (auth instanceof NextResponse) {
        return auth;
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
        const body = await request.json(); // DELETE typically uses JSON body for ID
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Program ID is required for deletion' },
                { status: 400 }
            );
        }

        // Verify program belongs to company and get its image URL
        const { data: existingProgram, error: fetchError } = await supabaseAdmin
            .from('programs')
            .select('id, company_id, program_picture_url')
            .eq('id', id)
            .eq('company_id', company.id)
            .single();

        if (fetchError || !existingProgram) {
            return NextResponse.json(
                { error: 'Program not found or does not belong to this company' },
                { status: 404 }
            );
        }

        // Delete program from database
        const { error: dbError } = await supabaseAdmin
            .from('programs')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('Error deleting program from DB:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        // If DB deletion is successful, delete the associated image from storage
        if (existingProgram.program_picture_url) {
            const fileName = existingProgram.program_picture_url.split('/').pop();
            if (fileName) {
                const { error: storageError } = await supabaseAdmin.storage
                    .from('program_pictures')
                    .remove([`${company.id}/${fileName}`]);

                if (storageError) {
                    console.warn('Warning: Program deleted from DB, but failed to delete image from storage:', storageError);
                    // You might want to log this but not fail the entire request,
                    // as the main goal (DB deletion) was successful.
                }
            }
        }

        return NextResponse.json({ message: 'Program deleted successfully' });
    } catch (err) {
        console.error('Processing error:', err);
        return NextResponse.json(
            { error: (err as Error).message },
            { status: 400 }
        );
    }
}