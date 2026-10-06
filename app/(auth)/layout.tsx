import Link from "next/link";
import { BadgeCheck, Briefcase, GraduationCap } from "lucide-react";

export const metadata = {
  title: { template: "%s | Zigex", default: "Account | Zigex" },
  description: "Sign in or create your free Zigex student account.",
};

const STUDENT_PHOTO = "https://i.ibb.co/1YqtdCtK/Chat-GPT-Image-Apr-23-2026-03-29-43-PM.png";

const FACTS = [
  { icon: Briefcase, text: "Internships, training programs and events in one place" },
  { icon: BadgeCheck, text: "Posted by companies Zigex has verified" },
  { icon: GraduationCap, text: "Free for students, from first application to certificate" },
];

/**
 * Split screen: the form on the right (always visible, left-aligned, one
 * column), and on large screens a photo panel on the left that reminds
 * students what the account is for. Phones get the form only.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-white font-sans lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-[#0B1B3F] lg:block" aria-hidden="true">
        <img src={STUDENT_PHOTO} alt="" className="absolute inset-0 h-full w-full object-cover object-[center_30%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3F] via-[#0B1B3F]/45 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-10 xl:p-12">
          <p className="max-w-sm font-heading text-[28px] font-bold leading-tight tracking-tight text-white">
            Get real work experience before you graduate.
          </p>
          <ul className="mt-8 space-y-3.5">
            {FACTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[15px] leading-snug text-white/85">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#8DB4FF]" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col px-5 py-4 sm:px-10 lg:px-16">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
          aria-label="Zigex home"
        >
          <img src="https://i.ibb.co/Cp502Yby/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-heading text-xl font-bold tracking-tight text-[#0B1B3F]">Zigex</span>
        </Link>

        <div className="flex flex-1 items-center py-4">
          <div className="mx-auto w-full max-w-[400px]">{children}</div>
        </div>

        <p className="text-center text-[13px] text-[#7B869C]">
          © {new Date().getFullYear()} Zigex ·{" "}
          <Link href="/privacy" className="hover:text-[#0B1B3F] hover:underline">
            Privacy
          </Link>
        </p>
      </main>
    </div>
  );
}
