import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="relative w-32 h-10 transition-transform duration-300 group-hover:scale-105">
        <img
          src="https://i.ibb.co/Cp502Yby/logo.png"
          alt="Zigex Logo"
          className="h-full w-auto object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    </Link>
  );
};
