export const metadata = {
  title: "Authentication | Zigex",
  description: "Sign in or sign up to access your account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen flex items-center justify-center py-8 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-blue-950/40 dark:to-indigo-950">
      {/* Overlay — adapts to theme, light on desktop/mobile */}
      <div className="absolute inset-0 bg-white/65 dark:bg-slate-950/80" />

      {/* Subtle pattern overlay for depth */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      {/* Auth content — adjusted scale for clarity */}
      <div className="relative z-10 w-full max-w-[440px] mx-auto px-4 scale-[0.85] md:scale-90 origin-center transition-transform duration-300">
        {children}
      </div>

      {/* Bottom attribution */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-[10px] font-medium text-slate-400 dark:text-white/30 md:text-white/30 tracking-wide">
          © {new Date().getFullYear()} Zigex. All rights reserved.
        </p>
      </div>
    </div>
  );
}
