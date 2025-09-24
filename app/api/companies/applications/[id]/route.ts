import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

//Get a unique application
/**
 * @swagger
 * /api/companies/applications/[id]:
 *  get:
 *      summary: get a details of a unique application
 *      description: get details of a unique student application, id is the application id
 *      tags:
 *          - Company Applications
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const { data: application, error: applicationError } = await supabaseAdmin
        .from('applications')
        .select('*')
        .eq('id', id)
        // .eq('internship.company_id', company.id)
        .single();

    if (applicationError || !application) {
        return NextResponse.json(
            { error: 'Application not found' },
            { status: 404 }
        );
    }

    const { data:internship, error: internshipError } = await supabaseAdmin
        .from('internships')
        .select('*')
        .eq('id', application.internship_id)
        .eq('company_id', company.id)
        .single();
    if (internshipError || !internship) {
        return NextResponse.json(
            { error: 'Application does not belong to this company' },
            { status: 403 }
        );
    }
    
    return NextResponse.json(application);
}


/**
 * @swagger
 * /api/companies/applications/[id]:
 *  patch:
 *      summary: update status of a unique application
 *      description: update details (status) of a student application. id is  the application id
 *      tags:
 *          - Company Applications
 */

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

    const { data, error } = await supabaseAdmin
        .from('applications')
        .update(updates)
        .eq('id', id)
        // .eq('internship.company_id', company.id)
        .single();

    if (error) {
        console.log('hello')
        console.log(error)
        return NextResponse.json(
            { error: 'Application not found or does not belong to this company' },
            { status: 400}
        );
    }

    return NextResponse.json({data:'updated successfully'});
}