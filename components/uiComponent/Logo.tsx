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
        <Image
          src="/zigex.svg"
          alt="Zigex Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
};
