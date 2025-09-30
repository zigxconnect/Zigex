import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";




// Get all applications for a unique internship posted by the authenticated company
// The id is the internship ID

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
    // Fetch applications for the internship
    const { data, error } = await supabaseAdmin
        .from('Applications')
        .select('*')
        .or(`internship_id.eq.${id},program_id.eq.${id},event_id.eq.${id}`)

        // .eq('internship_id:company_id', company.id); // Ensure the internship belongs to the authenticated company

    console.log(company.id);
    console.log(data);
    console.log(error);
    if (error || !data) {
        return NextResponse.json(
            { error: 'Internship is not found or does not belong to this company' },
            { status: 404 }
        );
    }
    return NextResponse.json(data);
}


// Update the status of an application for a specific internship
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