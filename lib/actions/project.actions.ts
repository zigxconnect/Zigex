"use server";

import { serverApi } from '@/lib/api/server-client';
import { ApiClientError, isEndpointMissing } from '@/lib/api/errors';
import { getSession } from '@/lib/api/auth';
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

/**
 * Creates a portfolio project (POST /projects, multipart; spec'd in
 * the Oct 2026 backend endpoint request → Projects). The backend enforces one
 * active project at a time and computes the end date from the duration.
 */
export async function createProjectAction(formData: FormData): Promise<CreateProjectResult> {
  try {
    if (!(await getSession())) {
      return { success: false, error: 'You must be logged in to create a project.' };
    }

    // Step 3: Extract and validate form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const githubLink = formData.get('githubLink') as string;
    const youtubeLink = formData.get('youtubeLink') as string;
    const duration = formData.get('duration') as string;
    const coverImage = formData.get('coverImage') as File | null;
    const uploadedVideo = formData.get('uploadedVideo') as File | null;

    // Clean and validate YouTube URL
    let cleanedYoutubeLink: string | null = null;

    if (!youtubeLink || !youtubeLink.trim()) {
      return {
        success: false,
        error: 'YouTube URL is required. Please provide a valid YouTube video URL.',
        fieldErrors: { youtubeLink: 'YouTube URL is required' }
      };
    }

    if (!youtubeLink.toLowerCase().includes('youtube.com') && !youtubeLink.toLowerCase().includes('youtu.be')) {
      return {
        success: false,
        error: 'Invalid YouTube URL. Please ensure your link contains "youtube.com"',
        fieldErrors: { youtubeLink: 'Link must contain youtube.com' }
      };
    }

    // Accept the link as-is since it passed the simple check
    cleanedYoutubeLink = youtubeLink.trim();

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


    const upload = new FormData();
    upload.set('projectTitle', title);
    upload.set('description', description);
    upload.set('githubRepository', githubLink || '');
    upload.set('projectDuration', duration);
    if (youtubeLink) upload.set('projectVideoUrl', youtubeLink);
    if (coverImage && coverImage.size > 0) upload.set('coverImage', coverImage);
    if (uploadedVideo && uploadedVideo.size > 0) upload.set('uploadedVideo', uploadedVideo);

    let project;
    try {
      project = (await serverApi.post('/projects', upload, { timeoutMs: 120_000 })).data;
    } catch (error) {
      if (isEndpointMissing(error)) {
        return { success: false, error: 'Creating projects is coming soon.' };
      }
      if (error instanceof ApiClientError && error.status === 403) {
        const body = error.body as { error?: { activeProject?: CreateProjectResult['activeProject'] } } | undefined;
        return { success: false, error: error.message, activeProject: body?.error?.activeProject };
      }
      if (error instanceof ApiClientError) {
        return { success: false, error: error.message };
      }
      throw error;
    }

    // Step 10: Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/projects');
    revalidatePath('/projects');

    return {
      success: true,
      data: project
    };

  } catch (error: any) {
    console.error('Critical error in createProjectAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}