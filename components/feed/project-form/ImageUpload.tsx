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
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        Cover Image <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
      </Label>
      
      {previewUrl ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700">
          <img
            src={previewUrl}
            alt="Cover preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-40 border-2 border-dashed rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-3 hover:bg-accent ${
            error
              ? "border-red-500 bg-red-50 dark:bg-red-950/10"
              : "border-gray-300 dark:border-gray-700 hover:border-primary"
          }`}
        >
          <div className={`p-3 rounded-full ${error ? "bg-red-100 dark:bg-red-900/20" : "bg-primary/10"}`}>
            <ImagePlus className={`h-8 w-8 ${error ? "text-red-500" : "text-primary"}`} />
          </div>
          <div className="text-center">
            <p className={`text-sm font-medium ${error ? "text-red-500" : "text-foreground"}`}>
              Click to upload cover image
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {acceptedFormats} (max {maxSize})
            </p>
          </div>
        </div>
      )}
      
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </span>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};