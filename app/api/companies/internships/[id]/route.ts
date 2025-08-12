import { AuthResponse } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";
import { internshipSchema } from "@/lib/validation/internship";


export async function PUT(
    request: Request,
    { params }: {params: { id: string}}
    ) {
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
    const { ...updates } = internshipSchema.partial().parse(body);
    // if (!id) {
    //     return NextResponse.json(
    //         { error: 'Internship ID is required for updates' },
    //         { status: 400 }
    //     );
    // }
    // Ensure the internship belongs to the authenticated company
    const { data: existingInternship, error: fetchError } = await supabaseAdmin
        .from('internships')
        .select('*')
        .eq('id', params.id)
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
        .eq('id', params.id);
    if (error) {
        return NextResponse.json(
            { error: error.message }, 
            { status: 500 });
    }
    return NextResponse.json(data);
}

export async function DELETE
(request: Request,
    { params }: {params: { id: string}}
) {
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

    // verify internship belongs to company
    const { data: existingInternship, error: fetchError } = await supabaseAdmin
        .from('internships')
        .select('*')
        .eq('id', params.id)
        .eq('company_id', company.id)
        .single();
    if (fetchError || !existingInternship) {
        return NextResponse.json(
            { error: 'Internship not found or does not belong to this company' },
            { status: 404 }
        );
    }

    // const { id } = await request.json();
    const { data, error } = await supabaseAdmin.from('internships').delete().eq('id', params.id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}