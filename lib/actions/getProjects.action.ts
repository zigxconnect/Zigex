"use server";

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
    // Set up Supabase client
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
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to view your project.',
        data: null
      };
    }

    // Get student profile
    const { data: studentProfile, error: profileError } = await supabase
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

    // Fetch the active project (end_date is in the future)
    const { data: activeProject, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', studentProfile.id)
      .gt('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If no active project found, return success with null data
    if (projectError && projectError.code === 'PGRST116') {
      return {
        success: true,
        data: null
      };
    }

    if (projectError) {
      console.error('Project fetch error:', projectError);
      return {
        success: false,
        error: 'Failed to fetch project.',
        data: null
      };
    }

    // Check if project is invalid and older than 48 hours
    if (activeProject && activeProject.status !== 'valid') {
      const createdAt = new Date(activeProject.created_at);
      const now = new Date();
      const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
      const timeDifference = now.getTime() - createdAt.getTime();

      // If invalid project is older than 48 hours, return null (don't show it)
      if (timeDifference > fortyEightHoursInMs) {
        return {
          success: true,
          data: null
        };
      }
    }

    return {
      success: true,
      data: activeProject
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
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('*, project_submissions(status)')
      .eq('student_id', studentProfileId)
      .order('created_at', { ascending: false });

    if (projectError) {
      console.error('Projects fetch error:', projectError);
      return { success: false, data: [] };
    }

    const mappedProjects = (projects || []).map((p: any) => ({
      ...p,
      pitch_status: p.project_submissions?.[0]?.status
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
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Fetch the active project directly using the student_id (which is the profile ID)
    const { data: activeProject, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('student_id', studentProfileId)
      .gt('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If no active project found, return success with null data
    if (projectError && projectError.code === 'PGRST116') {
      return {
        success: true,
        data: null
      };
    }

    if (projectError) {
      console.error('Project fetch error:', projectError);
      return {
        success: false,
        error: 'Failed to fetch project.',
        data: null
      };
    }

    // Check if project is invalid and older than 48 hours
    if (activeProject && activeProject.status !== 'valid') {
      const createdAt = new Date(activeProject.created_at);
      const now = new Date();
      const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
      const timeDifference = now.getTime() - createdAt.getTime();

      // If invalid project is older than 48 hours, return null (don't show it)
      if (timeDifference > fortyEightHoursInMs) {
        return {
          success: true,
          data: null
        };
      }
    }

    return {
      success: true,
      data: activeProject
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