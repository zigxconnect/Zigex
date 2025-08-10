// this handles post request for user registeration

// app/api/auth/register/route.ts
// app/api/auth/register-student/route.ts

// app/api/auth/register/route.ts

import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password, fullName } = await request.json();

  // Validate required fields
  if (!email || !password || !fullName) {
    console.log('Validation Error: Missing required fields.', { email, password, fullName });
    return NextResponse.json(
      { error: 'Email, password, and full name are required.' },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email format.' },
      { status: 400 }
    );
  }

  // Check for existing user
  const { data: existingUser } = await supabaseAdmin
    .from('student_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (existingUser) {
    return NextResponse.json(
      { error: 'A user with this email already exists.' },
      { status: 400 }
    );
  }

  console.log(`Attempting to create auth user for: ${email}`);
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error('Supabase Auth Error:', authError);
    return NextResponse.json(
      { error: authError?.message || 'Could not sign up user.' },
      { status: 400 }
    );
  }

  console.log(`Auth user created successfully with ID: ${authData.user.id}`);
  const userId = authData.user.id;

  // Check if profile already exists for the user ID
  const { data: existingProfile } = await supabaseAdmin
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingProfile) {
    console.log(`Profile already exists for user ID: ${userId}`);
    return NextResponse.json(
      { message: 'Profile already exists.', user: authData.user },
      { status: 200 }
    );
  }

  console.log(`Attempting to create profile for user ID: ${userId}`);
  const { error: profileError } = await supabaseAdmin
    .from('student_profiles')
    .insert({
      user_id: userId,
      full_name: fullName,
    });

  if (profileError) {
    console.error('Supabase Profile Creation Error:', profileError.message);
    return NextResponse.json(
      { error: 'Failed to create user profile after authentication.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: 'Student registered successfully', user: authData.user },
    { status: 201 }
  );
}