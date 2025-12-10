// app/api/projects/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Step 1: Set up Supabase client 
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // <<< START: AUTHENTICATION VIA BEARER TOKEN >>>
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid Authorization header.' },
        { status: 401 }
      );
    }
    
    // Extract the token from the "Bearer <token>" string
    const jwt = authHeader.split(' ')[1];

    // Get the user data from the provided token instead of the cookie
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      console.error('Auth Error:', authError?.message);
      return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }



    // 2. Get the user's student profile ID
    const { data: studentProfile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !studentProfile) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }
    const studentId = studentProfile.id;

    // 3. Check the project creation cooldown
    const { data: canCreate, error: checkError } = await supabase.rpc('can_student_create_project', {
      student_id_to_check: studentId,
    });

    if (checkError) {
      return NextResponse.json({ error: 'Could not verify project creation eligibility.' }, { status: 500 });
    }
    if (!canCreate) {
      return NextResponse.json({ error: 'You cannot create a new project until your current one is due.' }, { status: 403 });
    }

    // 4. Process form data
    const formData = await req.formData();
    const projectTitle = formData.get('projectTitle') as string;
    const description = formData.get('description') as string;
    const githubRepository = formData.get('githubRepository') as string;
    const projectDuration = formData.get('projectDuration') as string;
    const projectVideoUrl = formData.get('projectVideoUrl') as string;
    const coverImage = formData.get('coverImage') as File | null;
    const uploadedVideo = formData.get('uploadedVideo') as File | null;

    if (!projectTitle || !description || !projectDuration) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    
    // 5. Calculate the end date
    const { data: endDate, error: dateError } = await supabase.rpc('get_end_date_from_duration', {
      duration: projectDuration,
    });
    if (dateError) {
      return NextResponse.json({ error: 'Invalid project duration format.' }, { status: 400 });
    }

    // 6. Handle file uploads (unchanged)
    let coverImageUrl: string | null = null;
    let uploadedVideoUrl: string | null = null;
    

    if (coverImage && coverImage.size > 0) {
      // Validate file type (jpg/png only)
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(coverImage.type)) {
        return NextResponse.json(
          { error: 'Only JPG and PNG files are allowed for cover image.' },
          { status: 400 }
        );
      }
      const { data, error } = await supabase.storage
        .from('project-assets')
        .upload(`${user.id}/${Date.now()}_${coverImage.name}`, coverImage);
      if (error) throw new Error(`Cover image upload failed: ${error.message}`);
      coverImageUrl = supabase.storage.from('project-assets').getPublicUrl(data.path).data.publicUrl;
    }

    if (uploadedVideo && uploadedVideo.size > 0) {
      const { data, error } = await supabase.storage
        .from('project-videos')
        .upload(`${user.id}/${Date.now()}_${uploadedVideo.name}`, uploadedVideo);
      if (error) throw new Error(`Video upload failed: ${error.message}`);
      uploadedVideoUrl = supabase.storage.from('project-videos').getPublicUrl(data.path).data.publicUrl;
    }

    // 7. Insert the new project into the database
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{
        student_id: studentId,
        project_title: projectTitle,
        description,
        github_repository: githubRepository || null,
        project_duration: projectDuration,
        end_date: endDate,
        cover_image_url: coverImageUrl,
        project_video_url: projectVideoUrl || null,
        uploaded_video_url: uploadedVideoUrl,
      }])
      .select()
      .single();

    if (projectError) {
      throw new Error(`Failed to create project entry: ${projectError.message}`);
    }

    return NextResponse.json(projectData, { status: 201 });

  } catch (error: any) {
    console.error("A critical error occurred in the projects API:", error.message);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}