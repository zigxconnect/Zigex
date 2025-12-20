// file: src/components/ui/UserAvatar.tsx

import Image from "next/image";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility

type UserAvatarProps = {
  /** The source URL of the avatar image. Can be null or undefined. */
  src: string | null | undefined;
  /** The alt text for the image. */
  alt: string;
  /** The size of the avatar in pixels. */
  size?: number;
  /** Optional additional class names. */
  className?: string;
};

export const UserAvatar = ({
  src,
  alt,
  size = 48,
  className,
}: UserAvatarProps) => {
  // Determine the image source, falling back to the default SVG if src is falsy.
  const imageUrl =  src || `/default-avatar.svg`;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "rounded-full object-cover",
        // If we're using the default avatar, add a border to make it look cleaner.
        !src && "border bg-muted/20 p-1 text-muted-foreground",
        className
      )}
    />
  );
};
