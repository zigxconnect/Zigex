import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

type SocialButtonProps = {
  icon: LucideIcon;
  text: string;
  className?: string;
  onClick?: () => void;
};

export const SocialButton = ({
  icon: Icon,
  text,
  className,
  onClick,
}: SocialButtonProps) => {
  return (
    <Button
      variant="secondary"
      className={`w-full justify-center gap-3 ${className}`}
      onClick={onClick}
    >
      <Icon size={20} />
      <span>{text}</span>
    </Button>
  );
};
