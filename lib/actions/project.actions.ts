"use server";

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { serverProjectSchema } from '../validation/project.validation';

interface CreateProjectResult {
  success: boolean;
  data?: any;
  error?: string;
  fieldErrors?: Record<string, string>;
  activeProject?: {
    id: string;
    title: string;
    end_date: string;
    duration: string;
  };
}

export async function createProjectAction(formData: FormData): Promise<CreateProjectResult> {
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

    // Step 2: Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { 
        success: false, 
        error: 'You must be logged in to create a project.' 
      };
    }

    // Step 2.5: Check if user has an active project
    const { data: activeProject } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .gt('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (activeProject) {
      const endDate = new Date(activeProject.end_date);
      const remainingDays = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        success: false,
        error: `You have an active project that expires in ${remainingDays} days`,
        activeProject
      };
    }

    // Step 3: Extract and validate form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const githubLink = formData.get('githubLink') as string;
    const youtubeLink = formData.get('youtubeLink') as string;
    const duration = formData.get('duration') as string;
    const coverImage = formData.get('coverImage') as File | null;
    const uploadedVideo = formData.get('uploadedVideo') as File | null;

    // Clean and validate YouTube URL - it's now REQUIRED
    let cleanedYoutubeLink: string | null = null;
    
    if (!youtubeLink || !youtubeLink.trim()) {
      return {
        success: false,
        error: 'YouTube URL is required. Please provide a valid YouTube video URL.',
        fieldErrors: { youtubeLink: 'YouTube URL is required' }
      };
    }

    try {
      const youtubeUrlPattern = /^https:\/\/youtube\.com\/.+$/;
      if (!youtubeUrlPattern.test(youtubeLink)) {
        return {
          success: false,
          error: 'Invalid YouTube URL. Please use a YouTube URL starting with https://youtube.com',
          fieldErrors: { youtubeLink: 'Invalid YouTube URL format' }
        };
      }
      
      // Extract video ID from YouTube URL
      let videoId: string | null = null;
      
      // Try to extract from watch?v= parameter
      const watchMatch = youtubeLink.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (watchMatch && watchMatch[1]) {
        videoId = watchMatch[1];
      }
      
      // Try to extract from /embed/ URL
      if (!videoId) {
        const embedMatch = youtubeLink.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
        if (embedMatch && embedMatch[1]) {
          videoId = embedMatch[1];
        }
      }
      
      // Try to extract from /v/ URL
      if (!videoId) {
        const vMatch = youtubeLink.match(/\/v\/([a-zA-Z0-9_-]{11})/);
        if (vMatch && vMatch[1]) {
          videoId = vMatch[1];
        }
      }
      
      // Try to extract from shortened youtu.be URL
      if (!videoId) {
        const shortMatch = youtubeLink.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortMatch && shortMatch[1]) {
          videoId = shortMatch[1];
        }
      }
      
      // If video ID found, store the URL as-is
      if (videoId && videoId.length === 11) {
        cleanedYoutubeLink = youtubeLink.trim();
      } else {
        // Video ID not found or invalid
        return {
          success: false,
          error: 'Invalid YouTube URL. Please ensure you\'re using a valid YouTube video URL (e.g., https://youtube.com/watch?v=dQw4w9WgXcQ).',
          fieldErrors: { youtubeLink: 'Could not extract valid video ID from URL' }
        };
      }
    } catch (err) {
      console.warn('YouTube URL processing error:', err);
      return {
        success: false,
        error: 'Error processing YouTube URL. Please try again.',
        fieldErrors: { youtubeLink: 'Error processing YouTube URL' }
      };
    }

    // Validate basic fields
    try {
      serverProjectSchema.parse({
        title,
        description,
        githubLink: githubLink || undefined,
        youtubeLink: youtubeLink || undefined,
        duration,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        (error as z.ZodError).issues?.forEach((err: z.ZodIssue) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        return { 
          success: false, 
          error: 'Validation failed. Please check your inputs.',
          fieldErrors 
        };
      }
    }

    // Validate cover image if provided
    if (coverImage && coverImage.size > 0) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      
      if (!validImageTypes.includes(coverImage.type)) {
        return {
          success: false,
          error: 'Invalid image format. Only JPG, PNG, WEBP, and GIF are allowed.',
          fieldErrors: { coverImage: 'Invalid image format' }
        };
      }

      if (coverImage.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'Image size must be less than 5MB.',
          fieldErrors: { coverImage: 'Image too large' }
        };
      }
    }

    // Validate uploaded video if provided
    if (uploadedVideo && uploadedVideo.size > 0) {
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      
      if (!validVideoTypes.includes(uploadedVideo.type)) {
        return {
          success: false,
          error: 'Invalid video format. Only MP4, WEBM, and OGG are allowed.',
          fieldErrors: { uploadedVideo: 'Invalid video format' }
        };
      }

      if (uploadedVideo.size > 50 * 1024 * 1024) {
        return {
          success: false,
          error: 'Video size must be less than 50MB.',
          fieldErrors: { uploadedVideo: 'Video too large' }
        };
      }
    }

    // Step 4: Get student profile
    const { data: studentProfile, error: profileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !studentProfile) {
      return { 
        success: false, 
        error: 'Student profile not found. Please complete your profile first.' 
      };
    }
    
    const studentId = studentProfile.id;

    // Step 5: Check project creation cooldown
    const { data: canCreate, error: checkError } = await supabase.rpc(
      'can_student_create_project',
      { student_id_to_check: studentId }
    );

    if (checkError) {
      console.error('Cooldown check error:', checkError);
      return { 
        success: false, 
        error: 'Could not verify project creation eligibility.' 
      };
    }

    if (!canCreate) {
      return { 
        success: false, 
        error: 'You cannot create a new project until your current one is due.' 
      };
    }

    // Step 6: Calculate end date
    const { data: endDate, error: dateError } = await supabase.rpc(
      'get_end_date_from_duration',
      { duration }
    );

    if (dateError) {
      console.error('Date calculation error:', dateError);
      return { 
        success: false, 
        error: 'Invalid project duration format.' 
      };
    }

    // Step 7: Upload cover image
    let coverImageUrl: string | null = null;
    if (coverImage && coverImage.size > 0) {
      const fileExt = coverImage.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_cover.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(fileName, coverImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Cover image upload error:', uploadError);
        return { 
          success: false, 
          error: `Failed to upload cover image: ${uploadError.message}` 
        };
      }

      // Generate a signed URL that expires in 365 days (1 year)
      const { data, error: signError } = await supabase.storage
        .from('project-assets')
        .createSignedUrl(uploadData.path, 365 * 24 * 60 * 60); // 365 days in seconds
      
      if (signError || !data) {
        console.error('Failed to create signed URL for cover image:', signError);
        // Fallback to public URL if signed URL generation fails
        const { data: { publicUrl } } = supabase.storage
          .from('project-assets')
          .getPublicUrl(uploadData.path);
        coverImageUrl = publicUrl;
      } else {
        coverImageUrl = data.signedUrl;
      }
    }

    // Step 8: Upload video
    let uploadedVideoUrl: string | null = null;
    if (uploadedVideo && uploadedVideo.size > 0) {
      const fileExt = uploadedVideo.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_video.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-videos')
        .upload(fileName, uploadedVideo, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Video upload error:', uploadError);
        return { 
          success: false, 
          error: `Failed to upload video: ${uploadError.message}` 
        };
      }

      // Generate a signed URL that expires in 365 days (1 year)
      const { data, error: signError } = await supabase.storage
        .from('project-videos')
        .createSignedUrl(uploadData.path, 365 * 24 * 60 * 60); // 365 days in seconds
      
      if (signError || !data) {
        console.error('Failed to create signed URL for video:', signError);
        // Fallback to public URL if signed URL generation fails
        const { data: { publicUrl } } = supabase.storage
          .from('project-videos')
          .getPublicUrl(uploadData.path);
        uploadedVideoUrl = publicUrl;
      } else {
        uploadedVideoUrl = data.signedUrl;
      }
    }

    // Step 9: Insert project into database
    const projectInsertData: any = {
      student_id: studentId,
      project_title: title,
      description,
      github_repository: githubLink || null,
      project_duration: duration,
      end_date: endDate,
      cover_image_url: coverImageUrl,
      // Always include project_video_url, set to null if not valid
      project_video_url: cleanedYoutubeLink,
      uploaded_video_url: uploadedVideoUrl,
      is_valid: false, // Default to false, can be validated later
    };

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert(projectInsertData)
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return { 
        success: false, 
        error: `Failed to create project: ${projectError.message}` 
      };
    }

    // Step 10: Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath('/projects');
    revalidatePath(`/student/${studentId}`);

    return { 
      success: true, 
      data: projectData 
    };

  } catch (error: any) {
    console.error('Critical error in createProjectAction:', error);
    return { 
      success: false, 
      error: `An unexpected error occurred. Please try again.: ${error}` 
    };
  }
}