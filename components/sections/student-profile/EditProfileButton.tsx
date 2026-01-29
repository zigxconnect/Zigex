"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { EditProfileModal } from "@/components/sections/student-profile/EditProfileModal";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "@/app/types/profile";

interface EditProfileButtonProps {
  isOwner: boolean;
  userId: string; // This should be the auth user_id, not profile id
  profileData: Partial<ProfileFormData>;
  onUpdate?: () => void;
  className?: string; // Allow custom styling
}

export const EditProfileButton = ({
  isOwner,
  userId,
  profileData,
  onUpdate,
  className,
}: EditProfileButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`relative z-20 px-6 py-2 rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 ${className || ''}`}
      >
        <Edit2 size={16} />
        <span>EDIT PROFILE</span>
      </Button>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={profileData}
        userId={userId}
        onSaveSuccess={() => {
          onUpdate?.();
          // Optionally refresh the page
          window.location.reload();
        }}
      />
    </>
  );
};
