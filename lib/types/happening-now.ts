export interface HappeningNowMedia {
  url: string;
  thumbnail?: string;
  size?: number; // in bytes
}

export interface HappeningNowItem {
  id: string;
  created_at: string;
  updated_at: string;
  company: string;
  images: string[]; // Array of up to 6 image URLs
  video: HappeningNowMedia | null; // Single video (max 30MB)
  captions: string[]; // Captions for images
  view_count: number;
  is_live: boolean;
}

export interface HappeningNowUploadPayload {
  company: string;
  images: File[]; // Max 6 files
  video?: File; // Max 30MB
  captions: string[];
  is_live: boolean;
}

// Constants
export const HAPPENING_NOW_CONSTRAINTS = {
  MAX_IMAGES: 6,
  MAX_VIDEO_SIZE_MB: 30,
  MAX_VIDEO_SIZE_BYTES: 30 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
};
