"use server";

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { serverProjectSchema } from '../validation/project.validation';

interface CreateProjectResult {
  success: boolean;
  data?: any;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Uploads multiple files to a Supabase bucket and returns their signed URLs
 */
async function uploadFiles(supabase: any, bucket: string, userId: string, files: File[], prefix: string) {
  const uploadPromises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${userId}/${Date.now()}_${prefix}_${index}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Create signed URL (1 year)
    const { data: signData, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(uploadData.path, 365 * 24 * 60 * 60);

    if (signError) throw signError;
    return signData.signedUrl;
  });

  return Promise.all(uploadPromises);
}

/**
 * Uploads a single file and returns its signed URL
 */
async function uploadSingleFile(supabase: any, bucket: string, userId: string, file: File, prefix: string) {
  const fileExt = file.name.split('.').pop() || 'bin';
  const fileName = `${userId}/${Date.now()}_${prefix}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data: signData, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(uploadData.path, 365 * 24 * 60 * 60);

  if (signError) throw signError;
  return signData.signedUrl;
}

export async function createProjectAction(formData: FormData): Promise<CreateProjectResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) { try { cookieStore.set({ name, value, ...options }); } catch (e) { } },
          remove(name: string, options: CookieOptions) { try { cookieStore.set({ name, value: '', ...options }); } catch (e) { } },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication required' };

    // 1. Extract Data
    const rawData = {
      title: formData.get('title') as string,
      tagline: formData.get('tagline') as string,
      problemStatement: formData.get('problemStatement') as string,
      solutionDescription: formData.get('solutionDescription') as string,
      category: formData.get('category') as string,
      coverImages: formData.getAll('coverImages') as File[],
      videoFile: formData.get('videoFile') as File | null,
      pitchDeck: formData.get('pitchDeck') as File | null,
      targetCompanyId: formData.get('targetCompanyId') as string || null,
      fundingGoal: formData.get('fundingGoal') as string,
      repoLink: formData.get('repoLink') as string,
      techStack: formData.getAll('techStack') as string[],
      roadmap: formData.get('roadmap') as string,
    };

    // 2. Upload Assets
    let coverImageUrls: string[] = [];
    let videoUrl: string | null = null;
    let pitchDeckUrl: string | null = null;

    try {
      if (rawData.coverImages.length > 0 && rawData.coverImages[0].size > 0) {
        coverImageUrls = await uploadFiles(supabase, 'project-assets', user.id, rawData.coverImages, 'cover');
      }

      if (rawData.videoFile && rawData.videoFile.size > 0) {
        videoUrl = await uploadSingleFile(supabase, 'project-videos', user.id, rawData.videoFile, 'pitch');
      }

      if (rawData.pitchDeck && rawData.pitchDeck.size > 0) {
        pitchDeckUrl = await uploadSingleFile(supabase, 'project-assets', user.id, rawData.pitchDeck, 'deck');
      }
    } catch (uploadError: any) {
      console.error('Upload failed:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // 3. Insert Record
    const projectInsertData = {
      owner_id: user.id,
      title: rawData.title,
      tagline: rawData.tagline,
      problem_statement: rawData.problemStatement,
      solution_description: rawData.solutionDescription,
      category: rawData.category,
      cover_images: coverImageUrls,
      video_url: videoUrl,
      pitch_deck_url: pitchDeckUrl,
      funding_goal: rawData.fundingGoal ? parseFloat(rawData.fundingGoal) : null,
      github_url: rawData.repoLink || null,
      tech_stack: rawData.techStack,
      roadmap_url: rawData.roadmap || null,
      is_published: false, // Default to private until a company or admin validates it
      view_count: 0
    };

    const { data: projectData, error: dbError } = await supabaseAdmin
      .from('projects')
      .insert(projectInsertData)
      .select()
      .single();

    if (dbError) {
      console.error('DB Insert Error:', dbError);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    // 4. Create Submission if target company is selected
    if (rawData.targetCompanyId && rawData.targetCompanyId !== "open") {
      const { error: submitError } = await supabaseAdmin
        .from('project_submissions')
        .insert({
          project_id: projectData.id,
          company_id: rawData.targetCompanyId,
          status: 'pending'
        });

      if (submitError) {
        console.error('Submission Error:', submitError);
        // We don't fail the whole creation if submission fails, but maybe we should?
        // For now, project is created.
      }
    }

    // 5. Revalidate
    revalidatePath('/dashboard/projects');
    revalidatePath('/feed');

    return {
      success: true,
      data: projectData
    };

  } catch (error: any) {
    console.error('Critical creation error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

/**
 * Allows a company or admin to publish a project to the community feed.
 */
export async function publishProjectAction(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('projects')
      .update({ is_published: true, status: 'valid' })
      .eq('id', projectId);

    if (error) throw error;

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath('/dashboard/projects');
    revalidatePath('/feed');

    return { success: true };
  } catch (error: any) {
    console.error('Publish error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Confirms a user/company as a project collaborator.
 */
export async function confirmCollaboratorAction(projectId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Mark in project_collaborators table (New official tracking)
    const { error: collabError } = await supabaseAdmin
      .from('project_collaborators')
      .upsert({
        project_id: projectId,
        user_id: userId,
        role: 'collaborator'
      }, { onConflict: 'project_id, user_id' });

    if (collabError) throw collabError;

    // 2. Also update submission status if it was a company inquiry
    const { data: company } = await supabaseAdmin
      .from('company_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (company) {
      await supabaseAdmin
        .from('project_submissions')
        .update({ status: 'collaborator_confirmed' })
        .eq('project_id', projectId)
        .eq('company_id', company.id);
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Collaboration confirmation error:', error);
    return { success: false, error: error.message };
  }
}