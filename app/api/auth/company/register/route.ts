// this handles post request for user registeration

// app/api/auth/register/route.ts
// app/api/auth/register-student/route.ts

import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { companySchema } from '@/lib/validation/company';
import { authMiddleware } from '@/lib/middleware/auth';


/**
 * @swagger
 * /api/auth/company/register:
 *   post:
 *     summary: Register a company
 *     tags:
 *        - Authentication
 *     description: Register a new company. data format in company schema
 *     responses:
 *       201:
 *         description: Company registered successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  // 1. Get and validate the required fields from the request body
  const formData = await request.formData();
  const image = formData.get('image') as File
  const data = Object.fromEntries(formData.entries());
  const { email, password, company_name } = data;

  console.log(email)

  if (!email || !password || !company_name) {
    console.log('Validation Error: Missing required fields.', { email: !!email, password: !!password, company_name: !!company_name });
    return NextResponse.json(
      { error: 'Email, password, and company name are required.' },
      { status: 400 }
    );
  }



  // 2. Create the user in Supabase Auth
  console.log(`Attempting to create auth user for: ${email}`);
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password
  });

  // Handle authentication errors
  if (authError || !authData.user) {
    console.error('Supabase Auth Error:', authError);
    return NextResponse.json(
      { error: authError?.message || 'Could not sign up user.' },
      { status: 400 }
    );
  }

  console.log(`Auth user created successfully with ID: ${authData.user.id}`);
  const userId = authData.user.id;

  let logoUrl : string = '';
  if (image && image.size > 0) {
    // 2.1 Upload the company logo to Supabase Storage
    const ext = image.name.split('.').pop() || 'png'; // Default to png if no extension
    const filePath = `company-images/${data.company_name}/${authData.user.id[0] + authData.user.id[5] + authData.user.id[10] }/${data.company_name}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('company-assets')
      .upload(filePath, image, { contentType: image.type });
    // Handle upload errors
    if (uploadError) {
      console.error('Supabase Storage Upload Error:', uploadError);
      // If upload fails, we MUST delete the auth user to avoid orphans.
      console.log(`Attempting to clean up and delete orphaned auth user: ${userId}`);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.log(`Cleanup successful for user: ${userId}`);
      return NextResponse.json(
        { error: 'Failed to upload company logo.' },
        { status: 500 }
      );
    }

    logoUrl = supabaseAdmin.storage
      .from('company-assets')
      .getPublicUrl(filePath).data.publicUrl;
  }

  // 3. Create the corresponding profile in the 'company_profile' table
  console.log(`Attempting to create profile for user ID: ${userId}`);
  const companyData = companySchema.parse(
    {
      ...data, 
      user_id: userId,
      logo_url: logoUrl, // Use the uploaded logo URL if available
      }
    )
  const { error: profileError } = await supabaseAdmin
    .from('company_profiles')
    .insert(
      companyData
      // You can add other default fields here if needed
      );

  // 4. Handle profile creation errors (CRITICAL STEP)
  if (profileError) {
    console.error('Supabase Profile Creation Error:', profileError);
    
    // If profile creation fails, we MUST delete the auth user to avoid orphans.
    console.log(`Attempting to clean up and delete orphaned auth user: ${userId}`);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.log(`Cleanup successful for user: ${userId}`);

    return NextResponse.json(
      { error: 'Failed to create company profile after authentication.' },
      { status: 500 }
    );
  }

  // console.log(`Profile for student ${companyName} (ID: ${userId}) created successfully.`);

  // 5. If everything succeeded, return a success response
  return NextResponse.json(
    { message: 'Company registered successfully', user: authData.user.id, company: companyData },
    { status: 201 }
  );
}