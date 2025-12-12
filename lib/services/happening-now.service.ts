import { HappeningNowUploadPayload, HAPPENING_NOW_CONSTRAINTS } from '@/lib/types/happening-now';
import { createClient } from '@supabase/supabase-js';

// Progress callback type
export type UploadProgressCallback = (progress: {
  stage: 'generating-urls' | 'uploading-files' | 'saving-metadata';
  fileIndex?: number;
  totalFiles?: number;
  fileName?: string;
  percentComplete?: number;
}) => void;

/**
 * Create Supabase client for direct storage uploads
 */
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(url, anonKey);
}

export const happeningNowService = {
  /**
   * Validate images before upload
   */
  validateImages: (images: File[]): { valid: boolean; error?: string } => {
    if (images.length === 0) {
      return { valid: false, error: 'At least one image is required' };
    }

    if (images.length > HAPPENING_NOW_CONSTRAINTS.MAX_IMAGES) {
      return {
        valid: false,
        error: `Maximum ${HAPPENING_NOW_CONSTRAINTS.MAX_IMAGES} images allowed`,
      };
    }

    for (const image of images) {
      if (!HAPPENING_NOW_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(image.type)) {
        return {
          valid: false,
          error: `Invalid image type: ${image.type}. Allowed types: JPEG, PNG, WebP, GIF`,
        };
      }
    }

    return { valid: true };
  },

  /**
   * Validate video before upload
   */
  validateVideo: (video: File): { valid: boolean; error?: string } => {
    if (!HAPPENING_NOW_CONSTRAINTS.ALLOWED_VIDEO_TYPES.includes(video.type)) {
      return {
        valid: false,
        error: `Invalid video type: ${video.type}. Allowed types: MP4, WebM, QuickTime`,
      };
    }

    if (video.size > HAPPENING_NOW_CONSTRAINTS.MAX_VIDEO_SIZE_BYTES) {
      return {
        valid: false,
        error: `Video size exceeds ${HAPPENING_NOW_CONSTRAINTS.MAX_VIDEO_SIZE_MB}MB limit. Current size: ${(video.size / (1024 * 1024)).toFixed(2)}MB`,
      };
    }

    return { valid: true };
  },

  /**
   * Upload happening now content using two-step process:
   * 1. Get presigned URLs
   * 2. Upload files directly to Supabase Storage
   * 3. Save metadata to database
   */
  uploadContent: async (
    payload: HappeningNowUploadPayload,
    onProgress?: UploadProgressCallback
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      // Validate images
      const imageValidation = happeningNowService.validateImages(payload.images);
      if (!imageValidation.valid) {
        return { success: false, error: imageValidation.error };
      }

      // Validate video if provided
      if (payload.video) {
        const videoValidation = happeningNowService.validateVideo(payload.video);
        if (!videoValidation.valid) {
          return { success: false, error: videoValidation.error };
        }
      }

      // Step 1: Get presigned URLs
      onProgress?.({ stage: 'generating-urls', percentComplete: 0 });

      const urlResponse = await fetch('/api/happening-now/upload-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageCount: payload.images.length,
          hasVideo: !!payload.video,
        }),
      });

      if (!urlResponse.ok) {
        const error = await urlResponse.json();
        return { success: false, error: error.error || 'Failed to generate upload URLs' };
      }

      const { uploadUrls } = await urlResponse.json();

      // Step 2: Upload files directly to Supabase Storage
      onProgress?.({ stage: 'uploading-files', totalFiles: payload.images.length + (payload.video ? 1 : 0), percentComplete: 10 });

      const supabase = createSupabaseClient();
      const imageUrls: string[] = [];

      // Upload images
      for (let i = 0; i < payload.images.length; i++) {
        const image = payload.images[i];
        const uploadInfo = uploadUrls.images[i];

        onProgress?.({
          stage: 'uploading-files',
          fileIndex: i + 1,
          totalFiles: payload.images.length + (payload.video ? 1 : 0),
          fileName: image.name,
          percentComplete: 10 + ((i + 1) / (payload.images.length + (payload.video ? 1 : 0))) * 70,
        });

        // Upload using presigned URL with token from response
        const { error: uploadError } = await supabase.storage
          .from('media')
          .uploadToSignedUrl(uploadInfo.path, uploadInfo.token, image);

        if (uploadError) {
          return { success: false, error: `Failed to upload image ${i + 1}: ${uploadError.message}` };
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(uploadInfo.path);

        imageUrls.push(publicUrlData.publicUrl);
      }

      // Upload video if present
      let videoData = null;
      if (payload.video && uploadUrls.video) {
        onProgress?.({
          stage: 'uploading-files',
          fileIndex: payload.images.length + 1,
          totalFiles: payload.images.length + 1,
          fileName: payload.video.name,
          percentComplete: 80,
        });

        // Upload using presigned URL with token from response
        const { error: uploadError } = await supabase.storage
          .from('media')
          .uploadToSignedUrl(uploadUrls.video.path, uploadUrls.video.token, payload.video);

        if (uploadError) {
          return { success: false, error: `Failed to upload video: ${uploadError.message}` };
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('media')
          .getPublicUrl(uploadUrls.video.path);

        videoData = {
          url: publicUrlData.publicUrl,
          size: payload.video.size,
          type: payload.video.type,
        };
      }

      // Step 3: Save metadata to database
      onProgress?.({ stage: 'saving-metadata', percentComplete: 90 });

      const saveResponse = await fetch('/api/happening-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: payload.company,
          imageUrls,
          videoData,
          captions: payload.captions,
          isLive: payload.is_live,
        }),
      });

      const result = await saveResponse.json();

      if (!saveResponse.ok) {
        return { success: false, error: result.error || 'Failed to save metadata' };
      }

      onProgress?.({ stage: 'saving-metadata', percentComplete: 100 });

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  /**
   * Fetch current happening now content
   */
  fetchContent: async () => {
    try {
      const response = await fetch('/api/happening-now', {
        method: 'GET',
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Fetch failed' };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
