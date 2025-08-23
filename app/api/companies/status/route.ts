import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { companySchema } from '@/lib/validation/company';




// get company status
/**
 * @swagger
 * /api/companies/status:
 *   get:
 *     summary: Get company profile status
 *     tags:
 *      - Company Profile
 *     description: Retrieve the status of the company profile.
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Company profile not found 
 */
export async function GET(request: Request) {
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

    // Fetch the company profile status from the database
    const { data: companyData, error } = await supabaseAdmin
        .from('company_profiles')
        .select('is_verified')
        .eq('id', company.id)
        .single();
    if (error || !companyData) {
        return NextResponse.json(
            { error: 'Error getting company sttatus' },
            { status: 404 }
        );
    }

    return NextResponse.json({ status: companyData }, { status: 200 });
}