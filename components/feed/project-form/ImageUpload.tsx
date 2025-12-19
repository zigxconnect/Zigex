"use client";

import React, { useRef } from "react";
import { X, ImagePlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  previewUrl: string | null;
  onImageChange: (file: File | null) => void;
  onRemove: () => void;
  error?: string;
  maxSize?: string;
  acceptedFormats?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  previewUrl,
  onImageChange,
  onRemove,
  error,
  maxSize = "5MB",
  acceptedFormats = "PNG, JPG, WEBP, GIF"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onImageChange(file);
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
        <span>Cover Intel (Image)</span>
        <span className="text-[8px] text-slate-400 normal-case tracking-normal font-medium">(Optional)</span>
      </Label>
      
      {previewUrl ? (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-blue-100 shadow-xl group">
          <img
            src={previewUrl}
            alt="Cover preview"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-2xl bg-white/20 backdrop-blur-md hover:bg-red-500 border border-white/30 text-white transition-all duration-300 flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-4 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
             Mission Thumbnail Secured
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
            <ImagePlus className="h-7 w-7" />
          </div>
          <div className="text-center px-6">
            <p className={`text-xs font-black uppercase tracking-widest ${
              error ? "text-red-500" : "text-slate-900"
            }`}>
              {error ? "Intel Error" : "Upload Hero Image"}
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
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload cover image"
      />
    </div>
  );
};