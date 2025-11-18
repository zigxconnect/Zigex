"use client";

import { useState, useEffect } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { injectMetadataTags } from "@/lib/metadata";

interface ShareButtonProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  type: "internship" | "event" | "program";
}

export const ShareButton = ({
  title,
  description,
  url,
  imageUrl,
  type,
}: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  // Inject metadata tags when component mounts
  useEffect(() => {
    const fullUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${url}`;
    injectMetadataTags(
      `${title} - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description,
      imageUrl,
      fullUrl
    );
  }, [title, description, url, imageUrl, type]);

  const fullUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${url}`;

  const handleShare = async () => {
    // Prepare share data
    const shareData = {
      title: `${title} - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      text: description,
      url: fullUrl,
    };

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled share or error occurred, copy to clipboard as fallback
        if (error instanceof Error && !error.message.includes("abort")) {
          copyToClipboard();
        }
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleShare();
      }}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
      title={`Share this ${type}`}
      aria-label={`Share this ${type}`}
    >
      {copied ? (
        <Check size={20} className="text-green-600" />
      ) : (
        <Share2
          size={20}
          className="text-gray-600 group-hover:text-blue-600 transition-colors"
        />
      )}
    </button>
  );
};
