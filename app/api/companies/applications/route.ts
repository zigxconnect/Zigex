import { supabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware/auth";


export async function GET (request: Request){
    //authenticate user
    const auth = await authMiddleware(request)
    if(auth instanceof NextResponse){
        return auth
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

    const {data: internships, error: internshipsError} = await supabaseAdmin
        .from('internships')
        .select('id')
        .eq('company_id', company.id)
    if (internshipsError) {
        console.log('Error fetching internships:', internshipsError);
        return NextResponse.json(
            { error: internshipsError.message },
            { status: 500 }
        );
    }
    const internshipIds = internships.map(internship => internship.id)
    const { data: applications, error: applicationError } = await supabaseAdmin
        .from('applications')
        .select('*, internship:internship_id(title)')
        .in('internship_id', internshipIds);
    if (applicationError) {
        console.log('Error fetching applications:', applicationError);
        return NextResponse.json(
            { error: applicationError.message },
            { status: 500 }
        );
    }
    

    console.log(applications)
    console.log(company.id)

    return NextResponse.json(applications)

}
