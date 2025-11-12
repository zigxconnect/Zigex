import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <div className="relative w-20 h-20 transition-transform duration-300 group-hover:scale-110">
        <Image
          src="/z3.png"
          alt="Zigex Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </Link>
  );
};
