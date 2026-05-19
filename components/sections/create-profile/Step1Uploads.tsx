"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { ProfileFormData } from "@/app/types/profile";
import { FormField } from "@/components/uiComponent/FormField";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { Camera, Image as ImageIcon, X, UploadCloud } from "lucide-react";
import Image from "next/image";

export const Step1Uploads = () => {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProfileFormData>();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const avatarUrl = watch("avatar_url");
  const coverImageUrl = watch("cover_image");

  const supabase = createClient();

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Invalid file type. Please upload a JPEG, PNG, WEBP, or GIF image.");
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size too large. Maximum size is 10MB.");
    }
  };

  const sanitizeFileName = (fileName: string) => {
    // Remove non-alphanumeric characters except dots and dashes
    return fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  };

  const handleUpload = async (
    file: File,
    bucket: string,
    pathPrefix: string,
    field: "avatar_url" | "cover_image",
    setLoading: (loading: boolean) => void
  ) => {
    try {
      setLoading(true);
      validateFile(file);

      const fileExt = file.name.split(".").pop();
      const sanitizedName = sanitizeFileName(file.name.split(".")[0]);
      const fileName = `${uuidv4()}-${sanitizedName}.${fileExt}`;
      const filePath = `${pathPrefix}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setValue(field, publicUrlData.publicUrl, { shouldValidate: true });
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(
        e.target.files[0],
        "student-assets",
        "avatars",
        "avatar_url",
        setIsUploadingAvatar
      );
    }
  };

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(
        e.target.files[0],
        "student-assets",
        "cover-images",
        "cover_image",
        setIsUploadingCover
      );
    }
  };

  const removeImage = (field: "avatar_url" | "cover_image") => {
    setValue(field, "", { shouldValidate: true });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Profile & Cover Image
        </h2>
        <p className="text-gray-500">
          Add a professional touch to your profile.
        </p>
      </div>

      {/* Cover Image Section */}
      <div className="relative group">
        <div
          className={`relative w-full h-48 md:h-64 rounded-xl overflow-hidden border-2 border-dashed transition-all duration-300 ${coverImageUrl
              ? "border-transparent shadow-lg"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary/50"
            }`}
        >
          {coverImageUrl ? (
            <>
              <Image
                src={coverImageUrl}
                alt="Cover"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <label className="cursor-pointer px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-full font-medium shadow-sm transition-all transform hover:scale-105 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onCoverChange}
                    disabled={isUploadingCover}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeImage("cover_image")}
                  className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-sm transition-all transform hover:scale-105"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-primary transition-colors">
              <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all group-hover:scale-110">
                {isUploadingCover ? (
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ImageIcon className="w-8 h-8" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onCoverChange}
                disabled={isUploadingCover}
              />
            </label>
          )}
        </div>
        {errors.cover_image && (
          <p className="text-sm text-red-500 mt-2">
            {errors.cover_image.message}
          </p>
        )}
      </div>

      {/* Profile Picture Section - Overlapping */}
      <div className="relative -mt-16 ml-6 md:ml-10 w-32 h-32 md:w-40 md:h-40">
        <div className="relative w-full h-full rounded-full border-4 border-white shadow-xl bg-white overflow-hidden group/avatar">
          {avatarUrl ? (
            <>
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex gap-2">
                  <label className="cursor-pointer p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-sm transition-all transform hover:scale-110">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onAvatarChange}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeImage("avatar_url")}
                    className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-sm transition-all transform hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
              {isUploadingAvatar ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-500">
                    Upload
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
                disabled={isUploadingAvatar}
              />
            </label>
          )}
        </div>
        {errors.avatar_url && (
          <p className="text-sm text-red-500 mt-2 ml-2">
            {errors.avatar_url.message}
          </p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
        <div className="p-2 bg-blue-100 rounded-full shrink-0">
          <ImageIcon className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-blue-900">Pro Tip</h4>
          <p className="text-sm text-blue-700 mt-1">
            Profiles with photos get 4x more views. Use a clear, professional
            headshot for your profile picture and a banner that represents your
            interests or work for the cover.
          </p>
        </div>
      </div>
    </div>
  );
};
