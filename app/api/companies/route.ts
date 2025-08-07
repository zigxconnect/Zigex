// company CRUD OPERATION
import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { companySchema } from '@/lib/validation/company';


// get company info
/**
 * @swagger
 * /api/companies:
 *   get:
 *     description: Get all companies
 *     responses:
 *       200:
 *         description: Success
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Company profile not found 
 */
export async function GET(request: Request){
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
    
    // Fetch all companies from the database
    const { data: companyData, error } = await supabaseAdmin
        .from('company_profiles')
        .select('*')
        .eq('id', company.id)
        .single();
    
    if (error) {
        console.error('Error fetching companies:', error);
        return NextResponse.json(
        { error: 'Failed to fetch companies.' },
        { status: 500 }
        );
    }
    
    return NextResponse.json(companyData);
}




//Update the company profile

/** 
 * @swagger
  * /api/companies/:
  *   patch:
  *     description: Update a company profile data
  *     parameters: company Schema
  *     responses:
  *       200:
  *         description: Company profile updated successfully
  *       400:
  *         description: Bad request
  *       403:
  *         description: Unauthorized access
  *       404:
  *         description: Company profile not found
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

  const updates = await request.json();
  
  // Validate the updates against the company schema
  const validatedUpdates = companySchema.partial().parse(updates);
  

  // Update the company profile in the database
  const { data, error } = await supabaseAdmin
    .from('company_profiles')
    .update(validatedUpdates)
    .eq('id', company.id)
    .single();


  console.log(data)

  if (error) {
    console.error('Error updating company profile:', error);
    return NextResponse.json(
      { error: 'Failed to update company profile.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: 'Company profile updated successfully', data });
}
