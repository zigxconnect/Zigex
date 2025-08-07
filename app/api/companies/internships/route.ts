import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { internshipSchema } from '@/lib/validation/internship';

// company internship manager
// const supabase = createClient(
//     process.env.SUPABASE_URL || '',
//     process.env.SUPABASE_ANON_KEY || ''
// );

/**
 * @swagger
 * /api/companies/internships:
 *   post:
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
 *      description: Get all postings for a company(internship, event, etc)
 *      tags:
 *          - Company Postings
 *      responses:
 *       200:
 *         description: Success
 * 
 *   patch:
 *      description: Update posting for a company
 *      tags:
 *          - Company Postings
 *   delete:
 *      description: delete posting for a company
 *      tags:
 *          - Company Postings
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

        console.log(supabaseAdmin.auth.getSession()); // Should return null or service context

        const { data, error } = await supabaseAdmin.from('internships').insert([validatedData]).select('*').single();
        if (error) {
            console.log( error);
            return NextResponse.json(
                { error: error.message }, 
                { status: 500 });
        }
        return NextResponse.json(data, { status: 201 });
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