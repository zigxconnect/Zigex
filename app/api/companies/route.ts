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
 *     summary: Get company profile details
 *     tags:
 *      - Company Profile
 *     description: Get company information. 
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
  *     summary: update details of company profile
  *     tags:
  *         - Company Profile
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



  const formData = await request.formData();
  const image = formData.get('image') as File
  const data = Object.fromEntries(formData.entries());


  
  let logoUrl : string = '';
  if (image && image.size > 0) {
    // 2.1 Upload the company logo to Supabase Storage
    const ext = image.name.split('.').pop() || 'png'; // Default to png if no extension
    const filePath = `company-images/${data.company_name}/${user.id[0] + user.id[5] + user.id[10] }/${data.company_name}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('company-assets')
      .upload(filePath, image, { contentType: image.type });
    // Handle upload errors
    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload company logo.' },
        { status: 500 }
      );
    }

    logoUrl = supabaseAdmin.storage
      .from('company-assets')
      .getPublicUrl(filePath).data.publicUrl;
  }


  // const updates = await request.json();
  
  // Validate the updates against the company schema
  const validatedUpdates = companySchema.partial().parse(data);
  

  // Update the company profile in the database
  const { data: updatedData, error } = await supabaseAdmin
    .from('company_profiles')
    .update({...validatedUpdates, logo_url: logoUrl})
    .eq('id', company.id)
    .single();


  console.log(updatedData)

  if (error) {
    console.error('Error updating company profile:', error);
    return NextResponse.json(
      { error: 'Failed to update company profile.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: 'Company profile updated successfully', updatedData });
}
