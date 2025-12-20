"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { quickUpdateProfile } from "@/lib/actions/updateProfile.action";

interface QuickEditFieldProps {
  label: string;
  value: string | null;
  fieldName: string;
  multiline?: boolean;
  maxLength?: number;
  onSuccess?: () => void;
}

export const QuickEditField = ({
  label,
  value,
  fieldName,
  multiline = false,
  maxLength = 500,
  onSuccess,
}: QuickEditFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!editValue.trim()) {
      toast.error("This field cannot be empty");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Updating...");

    try {
      const result = await quickUpdateProfile({
        [fieldName]: editValue,
      });

      if (result.success) {
        toast.success("Updated successfully!", { id: toastId });
        setIsEditing(false);
        onSuccess?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error(`Failed to update: ${(error as Error).message}`, {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value.slice(0, maxLength))}
            maxLength={maxLength}
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            rows={4}
            disabled={isLoading}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value.slice(0, maxLength))}
            maxLength={maxLength}
            className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            disabled={isLoading}
          />
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{editValue.length}/{maxLength}</span>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={16} className="text-destructive" />
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="p-2 hover:bg-success/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Check size={16} className="text-success" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-sm text-foreground break-words">
          {value || <span className="text-muted-foreground/50 italic">Not set</span>}
        </p>
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-primary/10 rounded-lg"
      >
        <Pencil size={16} className="text-primary" />
      </button>
    </div>
  );
};
