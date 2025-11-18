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
}

export const EditProfileButton = ({
  isOwner,
  userId,
  profileData,
  onUpdate,
}: EditProfileButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 flex items-center gap-2 rounded-lg bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        variant="secondary"
      >
        <Edit2 size={18} />
        Edit Profile
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
