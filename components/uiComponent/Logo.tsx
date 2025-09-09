import Link from "next/link";
import { Orbitron } from "next/font/google";
import { clsx } from "clsx";

// This component renders a logo that can be used as a link or a static element.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      <div className="w-8 h-8 bg-blue-800 rounded-border" />
      <span
        className={clsx("text-2xl ext-lg sm:text-xl font-bold hover:text-blue-100 transition-colors duration-200 flex-shrink-0 text-blue-800")}

      >
        FutureProspect
      </span>
    </div>
  );

  if (isLink) {
    return <Link href="/">{logoContent}</Link>;
  }

  return logoContent;
};
