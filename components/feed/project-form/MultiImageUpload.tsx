"use client";

import React, { useRef } from "react";
import { X, ImagePlus, AlertCircle, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

interface MultiImageUploadProps {
  previewUrls: string[];
  onImagesChange: (files: FileList | File[]) => void;
  onRemove: (index: number) => void;
  error?: string;
  maxCount?: number;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  previewUrls,
  onImagesChange,
  onRemove,
  error,
  maxCount = 6
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImagesChange(files);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <Label className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1 flex items-center justify-between">
        <span>Visual Evidence (Cover Images)</span>
        <span className="text-[9px] text-slate-400 font-medium">Min 3, Max {maxCount}</span>
      </Label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {previewUrls.map((url, index) => (
          <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-50 shadow-md group">
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button
                type="button"
                onClick={() => onRemove(index)}
                className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {previewUrls.length < maxCount && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
              error ? "border-red-200 bg-red-50" : "border-blue-100 hover:border-[#155DFC] hover:bg-blue-50/30"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white text-[#155DFC] flex items-center justify-center shadow-sm">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">Add Image</span>
          </button>
        )}
      </div>

      {error && (
        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1.5 ml-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </span>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
