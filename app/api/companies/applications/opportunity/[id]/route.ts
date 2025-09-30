import { authMiddleware } from "@/lib/middleware/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";




// Get all applications for a unique opportunity (internship, event, program) posted by the authenticated company
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
    
   
    // Fetch applications for the internship
    const { data, error } = await supabaseAdmin
        .from('Applications')
        .select('*')
        .or(`internship_id.eq.${id},program_id.eq.${id},event_id.eq.${id}`)

    if(error || !data) {
        return NextResponse.json(
            {error: 'Error fetching internship'},
            {status: 500}
        )
    }

    console.log(data)

    //  Verify if the opportunity belongs to the authenticated company

    //  If the opportunity is an event
    if(data.application_type == 'event'){
        console.log('is an event')
        const {data: opportunity, error: opportunityError} = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('id', data.event_id)
            .eq('company_id', company.id)
        if (opportunityError || !opportunity) {
            return NextResponse.json(
                { error: 'Internship not found or does not belong to this company' },
                { status: 404 }
            );
        }
    }

    //  If the opportunity is a program
    if(data.application_type == 'program'){
        console.log('is a program')
        const {data: opportunity, error: opportunityError} = await supabaseAdmin
            .from('programs')
            .select('*')
            .eq('id', data.event_id)
            .eq('company_id', company.id)
        if (opportunityError || !opportunity) {
            return NextResponse.json(
                { error: 'Internship not found or does not belong to this company' },
                { status: 404 }
            );
        }
    }

    //  If the opportunity is an internship
    if(data.application_type == 'internship'){
        console.log('is an internship')
        const {data: opportunity, error: opportunityError} = await supabaseAdmin
            .from('internships')
            .select('*')
            .eq('id', data.event_id)
            .eq('company_id', company.id)
        if (opportunityError || !opportunity) {
            return NextResponse.json(
                { error: 'Internship not found or does not belong to this company' },
                { status: 404 }
            );
        }
    }

    console.log('is none of the above')
    if (error || !data) {
        return NextResponse.json(
            { error: 'Internship is not found or does not belong to this company' },
            { status: 404 }
        );
    }
    return NextResponse.json(data);
}

