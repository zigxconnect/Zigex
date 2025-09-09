import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
// import { Button } from "../../ui/Button";

type SocialButtonProps = {
  icon: LucideIcon;
  text: string;
  className?: string;
};

export const SocialButton = ({
  icon: Icon,
  text,
  className,
}: SocialButtonProps) => {
  return (
    <Button
      variant="secondary"
      className={`w-full justify-center gap-3 ${className}`}
    >
      <Icon size={20} />
      <span>{text}</span>
    </Button>
  );
};
