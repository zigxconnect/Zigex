"use client";

import React, { useRef } from "react";
import { X, Video, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

interface VideoUploadProps {
  videoPreviewUrl: string | null;
  onVideoChange: (file: File | null) => void;
  onRemove: () => void;
  error?: string;
  maxSize?: string;
  acceptedFormats?: string;
  coverImageUrl?: string | null;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  videoPreviewUrl,
  onVideoChange,
  onRemove,
  error,
  maxSize = "20MB",
  acceptedFormats = "MP4, WEBM, OGG, MOV",
  coverImageUrl
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onVideoChange(file);
    }
  };

  const handleRemove = () => {
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2 w-full">
      <Label className="text-sm font-semibold flex items-center flex-wrap gap-x-2">
        <span>Upload Short Video</span>
        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
      </Label>
      
      {videoPreviewUrl ? (
        <div className="relative w-full h-56 sm:h-64 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700 bg-black">
          {/* Cover Image as Thumbnail */}
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt="Video thumbnail"
              className="absolute w-full h-full object-cover z-0"
            />
          )}
          
          {/* Video Preview (if available) */}
          <video
            src={videoPreviewUrl}
            controls
            className="w-full h-full object-cover relative z-10"
            poster={coverImageUrl || undefined}
          >
            Your browser does not support the video tag.
          </video>
          
          {/* Remove Button */}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg z-20 flex items-center justify-center transition-colors"
            aria-label="Remove video"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          {/* Video Info */}
          <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1 z-20">
            <p className="text-xs text-white">Video selected and ready to upload</p>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-56 sm:h-64 border-2 border-dashed rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-3 hover:bg-accent ${
            error
              ? "border-red-500 bg-red-50 dark:bg-red-950/10"
              : "border-gray-300 dark:border-gray-700 hover:border-primary"
          }`}
        >
          <div className={`p-3 rounded-full ${
            error ? "bg-red-100 dark:bg-red-900/20" : "bg-primary/10"
          }`}>
            <Video className={`h-7 w-7 sm:h-8 sm:w-8 ${
              error ? "text-red-500" : "text-primary"
            }`} />
          </div>
          <div className="text-center px-4">
            <p className={`text-sm sm:text-base font-medium ${
              error ? "text-red-500" : "text-foreground"
            }`}>
              Click to upload video
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {acceptedFormats} (max {maxSize})
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <span className="text-xs sm:text-sm text-red-500 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </span>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload project video"
      />
    </div>
  );
};
