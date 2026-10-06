"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { EditProfileModal } from "@/components/sections/student-profile/EditProfileModal";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "@/app/types/profile";

import { cn } from "@/lib/utils";

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
        className={cn(
          "relative z-20 px-4 py-2 rounded-lg font-extrabold bg-[#155DFC] text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/10 hover:shadow-md flex items-center gap-1.5 text-[10px] tracking-wide uppercase",
          className
        )}
      >
        <Edit2 size={11} />
        <span>Edit Profile</span>
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
