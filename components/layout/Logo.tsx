import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <div className={cn("relative flex items-center", className)}>
      <img
        src="https://i.ibb.co/Cp502Yby/logo.png"
        alt="Zigex Logo"
        className="h-full w-auto object-contain"
      />
    </div>
  );
};
