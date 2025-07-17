// this handles post request for user registeration

// app/api/auth/register/route.ts
import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password, role, profileData } = await request.json();

  console.log('REGISTER_ROUTE_BODY:', { email, role }); // Log request body for debugging

  if (!email || !password || !role || !profileData) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error('AUTH_ERROR:', authError); // Log auth error
    return NextResponse.json({ error: authError?.message || 'Could not sign up user' }, { status: 400 });
  }

  const userId = authData.user.id;
  let profileError;

  // 2. Create the corresponding profile
  if (role === 'student') {
    const { error } = await supabaseAdmin.from('student_profiles').insert({
      user_id: userId,
      full_name: profileData.fullName,
      university: profileData.university,
      // ...other student fields
    });
    profileError = error;
  } else if (role === 'company') {
    const { error } = await supabaseAdmin.from('company_profiles').insert({
      user_id: userId,
      company_name: profileData.companyName,
      // ...other company fields
    });
    profileError = error;
  } else {
    // This case should ideally not be reached if frontend is correct
    // Clean up the created auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
  }

  if (profileError) {
    console.error('PROFILE_ERROR:', profileError); // Log profile error
    // If profile creation fails, we should delete the auth user to avoid orphaned users
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'User registered successfully', user: authData.user }, { status: 201 });
}