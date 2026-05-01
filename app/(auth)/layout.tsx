import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Authentication | Zigex",
  description: "Sign in or sign up to access your account.",
};

const AUTH_BG_IMAGE =
  "https://i.ibb.co/1YqtdCtK/Chat-GPT-Image-Apr-23-2026-03-29-43-PM.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image — eager loaded for speed */}
      <Image
        src={AUTH_BG_IMAGE}
        alt=""
        fill
        priority
        fetchPriority="high"
        quality={80}
        className="object-cover"
        sizes="100vw"
      />

      {/* Bluish-dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/85 via-slate-900/80 to-indigo-950/85" />

      {/* Subtle pattern overlay for depth */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      {/* Logo watermark */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
          <img
            src="https://i.ibb.co/Cp502Yby/logo.png"
            alt="Zigex"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-lg font-bold text-white/90 tracking-tight">Zigex</span>
        </Link>
      </div>

      {/* Auth content */}
      <div className="relative z-10 w-full max-w-md mx-auto p-4">
        {children}
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-[10px] font-medium text-white/30 tracking-wide">
          © {new Date().getFullYear()} Zigex. All rights reserved.
        </p>
      </div>
    </div>
  );
}
