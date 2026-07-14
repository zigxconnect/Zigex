"use server";

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';

interface ActiveProjectResult {
  success: boolean;
  data?: {
    id: string;
    student_id: string;
    project_title: string;
    description: string;
    cover_image_url: string | null;
    github_repository: string | null;
    project_video_url: string | null;
    uploaded_video_url: string | null;
    project_duration: string;
    end_date: string;
    created_at: string;
    status: string; // 'valid' | 'pending' | 'cancel'
  } | null;
  error?: string;
}

export async function fetchActiveProject(): Promise<ActiveProjectResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try { cookieStore.set({ name, value, ...options }); } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try { cookieStore.set({ name, value: '', ...options }); } catch {}
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view your project.',
        data: null
      };
    }

    const { data: studentProfile, error: profileError } = await supabaseAdmin
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !studentProfile) {
      return {
        success: false,
        error: 'Student profile not found.',
        data: null
      };
    }

    const { data: dbProject, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (projectError) {
      console.error('Project fetch error:', projectError.message || projectError);
      return {
        success: false,
        error: 'Failed to fetch project.',
        data: null
      };
    }

    if (!dbProject) {
      return {
        success: true,
        data: null
      };
    }

    const mappedProject = {
      id: dbProject.id,
      student_id: studentProfile.id,
      project_title: dbProject.title || '',
      description: dbProject.solution_description || dbProject.problem_statement || dbProject.tagline || '',
      cover_image_url: dbProject.cover_images?.[0] || null,
      github_repository: dbProject.github_url || null,
      project_video_url: dbProject.video_url || null,
      uploaded_video_url: null,
      project_duration: '6 months',
      end_date: new Date(new Date(dbProject.created_at).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: dbProject.created_at,
      status: dbProject.is_published ? 'valid' : 'pending',
    };

    return {
      success: true,
      data: mappedProject
    };
  } catch (error: any) {
    console.error('Critical error in fetchActiveProject:', error);
    return {
      success: false,
      error: 'An unexpected error occurred.',
      data: null
    };
  }
}

// Helper function to fetch all projects for a specific student profile ID
export async function fetchAllUserProjects(studentProfileId: string): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id')
      .eq('id', studentProfileId)
      .single();

    if (profileErr || !profile) {
      return { success: true, data: [] };
    }

    const { data: projects, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('owner_id', profile.user_id)
      .order('created_at', { ascending: false });

    if (projectError) {
      console.error('Projects fetch error:', projectError.message || projectError);
      return { success: false, data: [] };
    }

    const mappedProjects = (projects || []).map((dbProject: any) => ({
      id: dbProject.id,
      student_id: studentProfileId,
      project_title: dbProject.title || '',
      description: dbProject.solution_description || dbProject.problem_statement || dbProject.tagline || '',
      cover_image_url: dbProject.cover_images?.[0] || null,
      github_repository: dbProject.github_url || null,
      project_video_url: dbProject.video_url || null,
      uploaded_video_url: null,
      project_duration: '6 months',
      end_date: new Date(new Date(dbProject.created_at).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: dbProject.created_at,
      status: dbProject.is_published ? 'valid' : 'pending',
    }));

    return {
      success: true,
      data: mappedProjects
    };
  } catch (error: any) {
    console.error('Critical error in fetchAllUserProjects:', error);
    return { success: false, data: [] };
  }
}

// Helper function to fetch project for a specific student profile ID (for visitor view)
export async function fetchUserActiveProject(studentProfileId: string): Promise<ActiveProjectResult> {
  try {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id')
      .eq('id', studentProfileId)
      .single();

    if (profileErr || !profile) {
      return { success: true, data: null };
    }

    const { data: dbProject, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('owner_id', profile.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (projectError) {
      console.error('Project fetch error:', projectError.message || projectError);
      return {
        success: false,
        error: 'Failed to fetch project.',
        data: null
      };
    }

    if (!dbProject) {
      return {
        success: true,
        data: null
      };
    }

    const mappedProject = {
      id: dbProject.id,
      student_id: studentProfileId,
      project_title: dbProject.title || '',
      description: dbProject.solution_description || dbProject.problem_statement || dbProject.tagline || '',
      cover_image_url: dbProject.cover_images?.[0] || null,
      github_repository: dbProject.github_url || null,
      project_video_url: dbProject.video_url || null,
      uploaded_video_url: null,
      project_duration: '6 months',
      end_date: new Date(new Date(dbProject.created_at).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: dbProject.created_at,
      status: dbProject.is_published ? 'valid' : 'pending',
    };

    return {
      success: true,
      data: mappedProject
    };

  } catch (error: any) {
    console.error('Critical error in fetchUserActiveProject:', error);
    return {
      success: false,
      error: 'An unexpected error occurred.',
      data: null
    };
  }
}