"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { X, User, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentAvatarUrl: string | null;
  currentCoverImageUrl: string | null;
  onProfileUpdated?: () => void;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  userId,
  currentAvatarUrl,
  currentCoverImageUrl,
  onProfileUpdated,
}: EditProfileModalProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentAvatarUrl
  );
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    currentCoverImageUrl
  );
  // Removed prevCoverImagePreviewRef, not needed
  // Removed unused prevAvatarPreviewRef
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  useEffect(() => {
    if (isOpen && userId) {
      setAvatarPreview(currentAvatarUrl);
      setCoverImagePreview(currentCoverImageUrl);
    }
  }, [isOpen, userId, currentAvatarUrl, currentCoverImageUrl]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Avatar image must be less than 2MB");
        return;
      }
      // Revoke previous object URL if it was an object URL
      if (avatarPreview && avatarPreview !== currentAvatarUrl) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      // Revoke previous object URL if it was an object URL
      if (avatarPreview && avatarPreview !== currentAvatarUrl) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarFile(null);
      setAvatarPreview(currentAvatarUrl);
    }
    // No useEffect inside handler
  };

  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Cover image must be less than 2MB");
        return;
      }
      // Revoke previous object URL if it was an object URL
      if (coverImagePreview && coverImagePreview !== currentCoverImageUrl) {
        URL.revokeObjectURL(coverImagePreview);
      }
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    } else {
      // Revoke previous object URL if it was an object URL
      if (coverImagePreview && coverImagePreview !== currentCoverImageUrl) {
        URL.revokeObjectURL(coverImagePreview);
      }
      setCoverImageFile(null);
      setCoverImagePreview(currentCoverImageUrl);
    }
    // Cleanup avatar and cover image preview object URLs on unmount
    useEffect(() => {
      return () => {
        if (avatarPreview && avatarPreview !== currentAvatarUrl) {
          URL.revokeObjectURL(avatarPreview);
        }
        if (coverImagePreview && coverImagePreview !== currentCoverImageUrl) {
          URL.revokeObjectURL(coverImagePreview);
        }
      };
    }, []);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    if (coverImageFile) {
      formData.append("cover_image", coverImageFile);
    }

    if (!avatarFile && !coverImageFile) {
      setError("Please select at least one image to upload.");
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setError("User ID is not defined.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/students/stud/${userId}`, {
        method: "PUT",
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.details ||
            responseData.error ||
            "Failed to update profile."
        );
      }

      toast.success("Profile updated successfully!", {
        description: "Your profile pictures have been updated.",
        duration: 3000,
      });

      if (onProfileUpdated && typeof onProfileUpdated === "function") {
        onProfileUpdated();
      }

      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "An unexpected error occurred.");
      toast.error("Failed to update profile", {
        description: err.message || "Please try again.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    // Revoke avatar preview if it was an object URL
    if (avatarPreview && avatarPreview !== currentAvatarUrl) {
      URL.revokeObjectURL(avatarPreview);
    }
    // Revoke cover image preview if it was an object URL
    if (coverImagePreview && coverImagePreview !== currentCoverImageUrl) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setAvatarFile(null);
    setCoverImageFile(null);
    setAvatarPreview(currentAvatarUrl);
    setCoverImagePreview(currentCoverImageUrl);
    // Removed assignments to preview refs
    // Cleanup avatar and cover image preview object URLs on unmount
    // Removed invalid useEffect from resetForm
    setError(null);
    // Removed invalid useEffect from resetForm
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fade-in-up">
        <button
          onClick={() => {
            onClose();
            resetForm();
          }}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Edit Profile Pictures
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <label
              htmlFor="avatar-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Profile Picture
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar Preview"
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <User className="text-gray-400 w-12 h-12" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload new image
                <input
                  id="avatar-upload"
                  name="avatar"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            {avatarFile && (
              <p className="text-xs text-gray-500 mt-2">{avatarFile.name}</p>
            )}
          </div>

          {/* Cover Image Upload */}
          <div>
            <label
              htmlFor="cover-image-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cover Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm">
                {coverImagePreview ? (
                  <Image
                    src={coverImagePreview}
                    alt="Cover Image Preview"
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <ImageIcon className="text-gray-400 w-12 h-12" />
                )}
              </div>
              <label
                htmlFor="cover-image-upload"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload new image
                <input
                  id="cover-image-upload"
                  name="cover_image"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                />
              </label>
            </div>
            {coverImageFile && (
              <p className="text-xs text-gray-500 mt-2">
                {coverImageFile.name}
              </p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || (!avatarFile && !coverImageFile)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
