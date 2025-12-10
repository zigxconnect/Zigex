import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { validate as isUUID } from 'uuid';

// UPDATE PROJECT - USING PUT
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    console.log('🔄 Updating project ID:', id);

    // Validate UUID
    if (!id || typeof id !== 'string' || !isUUID(id)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 });
    }

    // Setup Supabase
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    // Check authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 });
    }

    const jwt = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 401 });
    }

    // Get student profile
    const { data: studentProfile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !studentProfile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Verify project exists and belongs to student
    const { data: existingProject, error: projectError } = await supabase
      .from('projects')
      .select('student_id')
      .eq('id', id)
      .single();

    if (projectError || !existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (existingProject.student_id !== studentProfile.id) {
      return NextResponse.json({ error: 'Not your project' }, { status: 403 });
    }

    // Process form data
    const formData = await req.formData();
    const updateData: any = {};

    // Handle text fields
    const title = formData.get('projectTitle');
    const description = formData.get('description');
    const githubRepo = formData.get('githubRepository');
    const duration = formData.get('projectDuration');
    const videoUrl = formData.get('projectVideoUrl');

    if (title) updateData.project_title = title.toString();
    if (description) updateData.description = description.toString();
    if (githubRepo !== null) updateData.github_repository = githubRepo.toString();
    if (videoUrl !== null) updateData.project_video_url = videoUrl.toString();
    if (duration) updateData.project_duration = duration.toString();

    // Handle file uploads
    const coverImage = formData.get('coverImage') as File;
    if (coverImage && coverImage.size > 0) {
      const fileName = `covers/${user.id}/${Date.now()}_${coverImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(fileName, coverImage);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('project-assets').getPublicUrl(uploadData.path);
        updateData.cover_image_url = urlData.publicUrl;
      }
    }

    const uploadedVideo = formData.get('uploadedVideo') as File;
    if (uploadedVideo && uploadedVideo.size > 0) {
      const fileName = `videos/${user.id}/${Date.now()}_${uploadedVideo.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-videos')
        .upload(fileName, uploadedVideo);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('project-videos').getPublicUrl(uploadData.path);
        updateData.uploaded_video_url = urlData.publicUrl;
      }
    }

    // Update project in database
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 400 });
    }

    console.log('✅ Project updated successfully');
    return NextResponse.json(updatedProject);

  } catch (error: any) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE PROJECT
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    console.log('🗑️ Deleting project ID:', id);

    if (!id || !isUUID(id)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
        },
      }
    );

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jwt = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('student_id')
      .eq('id', id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.student_id !== studentProfile.id) {
      return NextResponse.json({ error: 'Not your project' }, { status: 403 });
    }

    // Delete project
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' });

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Server error during deletion' }, { status: 500 });
  }
}