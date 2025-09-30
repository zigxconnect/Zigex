import { authMiddleware } from "@/lib/middleware/auth";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { computeNode } from "recharts/types/chart/Treemap";

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
        .from('Applications')
        .select('*')
        .eq('id', id)
        .single();

    if (applicationError || !application) {
        return NextResponse.json(
            { error: 'Application not found' },
            { status: 404 }
        );
    }


    // Verify application belongs to company by checking the associated internship's company_id
     //  If the opportunity is an event
    if(application.application_type == 'event'){
        console.log('is an event')
        const {data: opportunity, error: opportunityError} = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('id', application.event_id)
            .eq('company_id', company.id)
            .single()
        if (opportunityError || !opportunity|| opportunity.company_id != company.id) {
            return NextResponse.json(
                { error: 'Internship not found or does not belong to this company' },
                { status: 404 }
            );
        }
    }

    //  If the opportunity is a program
    if(application.application_type == 'program'){
        console.log('is a program')
        const {data: opportunity, error: opportunityError} = await supabaseAdmin
            .from('programs')
            .select('*')
            .eq('id', application.program_id)
            .eq('company_id', company.id)
            .single()
        if (opportunityError || !opportunity || opportunity.company_id != company.id) {
            return NextResponse.json(
                { error: 'Internship not found or does not belong to this company' },
                { status: 404 }
            );
        }
    }

    //  If the opportunity is an internship
    if(application.application_type == 'internship'){
        console.log('is an internship')
        const {data: opportunity, error: opportunityError} = await supabaseAdmin
            .from('internships')
            .select('*')
            .eq('id', application.internship_id)
            .eq('company_id', company.id)
            .single()
        if (opportunityError || !opportunity || opportunity.company_id != company.id) {
            return NextResponse.json(
                { error: 'Internship not found or does not belong to this company' },
                { status: 404 }
            );
        }
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
    const {status } = await request.json();

    // const appliaction = await GET(request, id)
    // Verify if the opportunity belongs to the company
    // Get the appliaction and check the application type
        const { data: application, error: applicationError } = await supabaseAdmin
        .from('Applications')
        .select('*')
        .eq('id', id)
        .single();

    if (applicationError || !application) {
        return NextResponse.json(
            { error: 'Application not found' },
            { status: 404 }
        );
    }


    // Verify application belongs to company by checking the associated internship's company_id
    //  If the opportunity is an event
    if(application.application_type == 'event'){
        console.log('is an event')
        const {data: opportunity, error: opportunityError} = await supabaseAdmin
            .from('events')
            .select('*')
            .eq('id', application.event_id)
            .eq('company_id', company.id)
            .single()
        if (opportunityError || !opportunity|| opportunity.company_id != company.id) {
            return NextResponse.json(
                { error: 'Internship not found or does not belong to this company' },
                { status: 404 }
            );
        }
    }

    //  If the opportunity is a program
    if(application.application_type == 'program'){
        console.log('is a program')
        const {data: opportunity, error: opportunityError} = await supabaseAdmin
            .from('programs')
            .select('*')
            .eq('id', application.program_id)
            .eq('company_id', company.id)
            .single()
        if (opportunityError || !opportunity || opportunity.company_id != company.id) {
            return NextResponse.json(
                { error: 'Internship not found or does not belong to this company' },
                { status: 404 }
            );
        }
    }

    //  If the opportunity is an internship
    if(application.application_type == 'internship'){
        console.log('is an internship')
        const {data: opportunity, error: opportunityError} = await supabaseAdmin
            .from('internships')
            .select('*')
            .eq('id', application.internship_id)
            .eq('company_id', company.id)
            .single()
        if (opportunityError || !opportunity || opportunity.company_id != company.id) {
            return NextResponse.json(
                { error: 'Internship not found or does not belong to this company' },
                { status: 404 }
            );
        }
    }
    
    const { data, error } = await supabaseAdmin
        .from('Applications')
        .update({status})
        .eq('id', id)
        .single();

    if (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Application not found or does not belong to this company' },
            { status: 400}
        );
    }

    return NextResponse.json({data:'updated successfully'});
}