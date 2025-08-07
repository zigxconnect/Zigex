import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";




/**
 * @swagger
 * /api/companies/applications/internships/[id]:
 *   post:
 *     description: Create a new internship
 *     responses:
 *       201:
 *         description: Internship created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Company profile not found
 *   get:
 *     description: Get all applications for a particular internship. id is the internship id
 *     responses:
 *       200:
 *         description: Success
 */

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
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
    const id = params?.id;
    const { data, error } = await supabaseAdmin
        .from('applications')
        .select('*, internship:internship_id(title)')
        .eq('internship_id', id)
        .single();
    if (error || !data) {
        return NextResponse.json(
            { error: 'Internship not found or does not belong to this company' },
            { status: 404 }
        );
    }
    return NextResponse.json(data);
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
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

    const id = params?.id;
    const updates = await request.json();

    // Verify internship belongs to company
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