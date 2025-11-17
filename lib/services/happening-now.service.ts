import { HappeningNowUploadPayload, HAPPENING_NOW_CONSTRAINTS } from '@/lib/types/happening-now';

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
   * Upload happening now content
   */
  uploadContent: async (
    payload: HappeningNowUploadPayload
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
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

    // Create FormData
    const formData = new FormData();
    formData.append('company', payload.company);
    formData.append('is_live', String(payload.is_live));
    formData.append('captions', JSON.stringify(payload.captions));

    // Append images
    payload.images.forEach((image) => {
      formData.append('images', image);
    });

    // Append video if present
    if (payload.video) {
      formData.append('video', payload.video);
    }

    try {
      const response = await fetch('/api/happening-now', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Upload failed' };
      }

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
