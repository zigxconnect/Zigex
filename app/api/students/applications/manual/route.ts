// app/api/applications/manual/route.ts

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';


export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path?: string }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { path?: string }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Use getUser() for secure authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  try {
    // Parse form data
    const formData = await request.formData();
    
    // Get text fields
    const internship_id = formData.get('internship_id') as string;
    const cover_letter = formData.get('cover_letter') as string;
    const linkedin_url = formData.get('linkedin_url') as string;
    const answers = formData.get('answers') as string;
    
    // Get file
    const cv_file = formData.get('cv_file') as File;

    // Validate required fields
    if (!internship_id) {
      return NextResponse.json(
        { error: 'Internship ID is required.' },
        { status: 400 }
      );
    }

    if (!cv_file) {
      return NextResponse.json(
        { error: 'CV file is required.' },
        { status: 400 }
      );
    }

    // Get the student ID
    const { data: studentData, error: studentError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentError || !studentData) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      );
    }

    const student_id = studentData.id;

    // Upload CV file to the new applications bucket
    const fileExtension = cv_file.name.split('.').pop();
    const fileName = `cv_${student_id}_${Date.now()}.${fileExtension}`;
    const filePath = `cv/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('applications') // Changed to new bucket
      .upload(filePath, cv_file);

    if (uploadError) {
      console.error('Error uploading CV:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload CV file: ${uploadError.message}. Please check if the applications bucket exists and has proper RLS policies.` },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('applications') // Changed to new bucket
      .getPublicUrl(filePath);

    const cv_url = urlData.publicUrl;

    // Create a new application record
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .insert([
        {
          student_id,
          internship_id,
          application_type: 'manual',
        },
      ])
      .select()
      .single();

    if (appError || !appData) {
      console.error('Error creating application:', appError);
      
      // Clean up the uploaded file if application creation fails
      await supabase.storage
        .from('applications')
        .remove([filePath]);
      
      return NextResponse.json(
        { error: 'Failed to create application.' },
        { status: 500 }
      );
    }

    const application_id = appData.id;

    // Parse answers if provided as JSON string
    let parsedAnswers = null;
    if (answers) {
      try {
        parsedAnswers = JSON.parse(answers);
      } catch (e) {
        console.error('Error parsing answers:', e);
      }
    }

    // Insert the application form details
    const { error: formError } = await supabase
      .from('application_forms')
      .insert([
        {
          application_id,
          cover_letter,
          cv_url,
          linkedin_url,
          answers: parsedAnswers,
        },
      ]);

    if (formError) {
      console.error('Error inserting application form:', formError);
      
      // Clean up: delete application and uploaded file
      await supabase.from('applications').delete().eq('id', application_id);
      await supabase.storage.from('applications').remove([filePath]);
      
      return NextResponse.json(
        { error: 'Failed to submit application form.' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'Application submitted successfully.',
        application_id,
        cv_url 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path?: string }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { path?: string }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Use getUser() for secure authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const application_id = searchParams.get('id');
    
    // Get the student ID
    const { data: studentData, error: studentError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentError || !studentData) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      );
    }

    const student_id = studentData.id;

    if (application_id) {
      // Get single application
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          application_forms (*),
          internships (*)
        `)
        .eq('id', application_id)
        .eq('student_id', student_id)
        .single();

      if (appError) {
        return NextResponse.json(
          { error: 'Application not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ application });
    } else {
      // Get all applications for this student
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          application_forms (*),
          internships (*)
        `)
        .eq('student_id', student_id)
        .order('created_at', { ascending: false });

      if (appsError) {
        return NextResponse.json(
          { error: 'Failed to fetch applications.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ applications });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path?: string }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { path?: string }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Use getUser() for secure authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const application_id = formData.get('application_id') as string;
    const cover_letter = formData.get('cover_letter') as string;
    const linkedin_url = formData.get('linkedin_url') as string;
    const answers = formData.get('answers') as string;
    const cv_file = formData.get('cv_file') as File;

    if (!application_id) {
      return NextResponse.json(
        { error: 'Application ID is required.' },
        { status: 400 }
      );
    }

    // Get the student ID
    const { data: studentData, error: studentError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentError || !studentData) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      );
    }

    const student_id = studentData.id;

    // Verify the application belongs to the student
    const { data: existingApp, error: verifyError } = await supabase
      .from('applications')
      .select('id, application_forms(cv_url)')
      .eq('id', application_id)
      .eq('student_id', student_id)
      .single();

    if (verifyError || !existingApp) {
      return NextResponse.json(
        { error: 'Application not found or access denied.' },
        { status: 404 }
      );
    }

    let cv_url = null;
    let oldFilePath = null;
    
    // Handle file upload if a new CV is provided
    if (cv_file) {
      // Extract old file path for cleanup
      const oldCvUrl = (existingApp as any).application_forms?.cv_url;
      if (oldCvUrl) {
        const urlParts = oldCvUrl.split('/');
        oldFilePath = urlParts.slice(urlParts.indexOf('cv')).join('/');
      }

      const fileExtension = cv_file.name.split('.').pop();
      const fileName = `cv_${student_id}_${Date.now()}.${fileExtension}`;
      const filePath = `cv/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('applications') // Changed to new bucket
        .upload(filePath, cv_file);

      if (uploadError) {
        console.error('Error uploading CV:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload CV file.' },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from('applications') // Changed to new bucket
        .getPublicUrl(filePath);

      cv_url = urlData.publicUrl;

      // Clean up old file if it exists
      if (oldFilePath) {
        await supabase.storage
          .from('applications')
          .remove([oldFilePath])
          .catch(err => console.warn('Could not delete old file:', err));
      }
    }

    // Parse answers if provided
    let parsedAnswers = null;
    if (answers) {
      try {
        parsedAnswers = JSON.parse(answers);
      } catch (e) {
        console.error('Error parsing answers:', e);
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (cover_letter !== null) updateData.cover_letter = cover_letter;
    if (linkedin_url !== null) updateData.linkedin_url = linkedin_url;
    if (parsedAnswers !== null) updateData.answers = parsedAnswers;
    if (cv_url !== null) updateData.cv_url = cv_url;

    // Update application form
    const { error: updateError } = await supabase
      .from('application_forms')
      .update(updateData)
      .eq('application_id', application_id);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: 'Failed to update application.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Application updated successfully.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path?: string }) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: { path?: string }) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Use getUser() for secure authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const application_id = searchParams.get('id');

    if (!application_id) {
      return NextResponse.json(
        { error: 'Application ID is required.' },
        { status: 400 }
      );
    }

    // Get the student ID
    const { data: studentData, error: studentError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentError || !studentData) {
      return NextResponse.json(
        { error: 'Student profile not found.' },
        { status: 404 }
      );
    }

    const student_id = studentData.id;

    // Get the application with its CV file info for cleanup
    const { data: existingApp, error: verifyError } = await supabase
      .from('applications')
      .select('id, application_forms(cv_url)')
      .eq('id', application_id)
      .eq('student_id', student_id)
      .single();

    if (verifyError || !existingApp) {
      return NextResponse.json(
        { error: 'Application not found or access denied.' },
        { status: 404 }
      );
    }

    // Extract file path for cleanup
    const cvUrl = (existingApp as any).application_forms?.cv_url;
    let filePath = null;
    if (cvUrl) {
      const urlParts = cvUrl.split('/');
      filePath = urlParts.slice(urlParts.indexOf('cv')).join('/');
    }

    // Delete application form first (due to foreign key constraint)
    const { error: formDeleteError } = await supabase
      .from('application_forms')
      .delete()
      .eq('application_id', application_id);

    if (formDeleteError) {
      console.error('Error deleting application form:', formDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete application.' },
        { status: 500 }
      );
    }

    // Delete application
    const { error: appDeleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', application_id);

    if (appDeleteError) {
      console.error('Error deleting application:', appDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete application.' },
        { status: 500 }
      );
    }

    // Clean up stored file if it exists
    if (filePath) {
      await supabase.storage
        .from('applications') // Changed to new bucket
        .remove([filePath])
        .catch(err => console.warn('Could not delete file:', err));
    }

    return NextResponse.json(
      { message: 'Application deleted successfully.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}