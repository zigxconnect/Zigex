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
    <div className="space-y-3 w-full">
      <Label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1 flex items-center gap-2">
        <span>Video Brief (Demo)</span>
        <span className="text-[8px] text-slate-400 normal-case tracking-normal font-medium">(Optional)</span>
      </Label>
      
      {videoPreviewUrl ? (
        <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border-2 border-blue-100 shadow-2xl bg-slate-900 group">
          {/* Cover Image as Thumbnail */}
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt="Video thumbnail"
              className="absolute w-full h-full object-cover z-0 opacity-40 transition-transform duration-1000 group-hover:scale-110"
            />
          )}
          
          {/* Video Preview */}
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
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-red-500 border border-white/30 text-white shadow-2xl z-20 flex items-center justify-center transition-all duration-300"
            aria-label="Remove video"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Video Info */}
          <div className="absolute bottom-4 left-4 right-4 bg-[#155DFC]/20 backdrop-blur-md rounded-2xl px-4 py-2 z-20 border border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Demo Stream Ready
            </p>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed rounded-[2rem] transition-all duration-500 cursor-pointer flex flex-col items-center justify-center gap-4 hover:bg-blue-50/50 bg-slate-50/30 ${
            error
              ? "border-red-300 bg-red-50/50"
              : "border-blue-100 hover:border-[#155DFC] hover:shadow-lg hover:shadow-blue-200/20"
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 transform group-hover:scale-110 ${
            error ? "bg-red-100 text-red-500" : "bg-white text-[#155DFC]"
          }`}>
            <Video className="h-7 w-7" />
          </div>
          <div className="text-center px-6">
            <p className={`text-xs font-black uppercase tracking-widest ${
              error ? "text-red-500" : "text-slate-900"
            }`}>
              {error ? "Video Error" : "Upload Video Link"}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">
              {acceptedFormats} (Max {maxSize})
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 ml-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
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
