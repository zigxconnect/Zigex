import Link from "next/link";
import { Orbitron } from "next/font/google";
import { clsx } from "clsx";

// This component renders a logo that can be used as a link or a static element.
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
});

type LogoProps = {
  className?: string;
  isLink?: boolean;
};

export const Logo = ({ className, isLink = true }: LogoProps) => {
  const logoContent = (
    <div className={clsx("flex items-center gap-2", className)}>
      {/* You can replace this with an <Image> component if you have a graphical logo */}
      <div className="w-8 h-8 bg-blue-600 rounded-full" />
      <span
        className={clsx("text-2xl font-bold text-gray-900", orbitron.className)}
      >
        futureProspect
      </span>
    </div>
  );

  if (isLink) {
    return <Link href="/">{logoContent}</Link>;
  }

  return logoContent;
};
