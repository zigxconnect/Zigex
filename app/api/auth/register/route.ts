// this handles post request for user registeration

// app/api/auth/register/route.ts
// app/api/auth/register-student/route.ts

import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1. Get and validate the required fields from the request body
  const { email, password, fullName } = await request.json();

  if (!email || !password || !fullName) {
    console.log('Validation Error: Missing required fields.', { email: !!email, password: !!password, fullName: !!fullName });
    return NextResponse.json(
      { error: 'Email, password, and full name are required.' },
      { status: 400 }
    );
  }

  // 2. Create the user in Supabase Auth
  console.log(`Attempting to create auth user for: ${email}`);
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
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

  // 3. Create the corresponding profile in the 'student_profiles' table
  console.log(`Attempting to create profile for user ID: ${userId}`);
  const { error: profileError } = await supabaseAdmin
    .from('student_profiles')
    .insert({
      user_id: userId,
      full_name: fullName,
      // You can add other default fields here if needed
    });

  // 4. Handle profile creation errors (CRITICAL STEP)
  if (profileError) {
    console.error('Supabase Profile Creation Error:', profileError);
    
    // If profile creation fails, we MUST delete the auth user to avoid orphans.
    console.log(`Attempting to clean up and delete orphaned auth user: ${userId}`);
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.log(`Cleanup successful for user: ${userId}`);

    return NextResponse.json(
      { error: 'Failed to create user profile after authentication.' },
      { status: 500 }
    );
  }

  // console.log(`Profile for student ${fullName} (ID: ${userId}) created successfully.`);

  // 5. If everything succeeded, return a success response
  return NextResponse.json(
    { message: 'Student registered successfully', user: authData.user },
    { status: 201 }
  );
}