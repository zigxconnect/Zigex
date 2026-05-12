import MainFeedPage from '@/components/feed/MainFeedPage';
import ProfileRecommendationPopup from '@/components/feed/ProfileRecommendationPopup';
import { getProfileInfo } from '@/lib/actions/profile.actions';
import { DashboardWidgets } from '@/components/feed/DashboardWidgets';
import { ArrowRight, Play, Zap, Users, Target, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import FeedStories from '@/components/feed/FeedStories';
import { cn } from "@/lib/utils";

interface FeedPageProps {
  searchParams: Promise<{ q?: string }>;
}

export const revalidate = 180;

export const metadata = {
  title: "Dashboard | Zigex",
  description: "Discover internships, events, and programs",
};

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const resolvedParams = await searchParams;
  const userData = await getProfileInfo();

  return (
    <div className="flex flex-col xl:flex-row gap-6 pb-12">
      {/* ═══ Main Content Column ═══ */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* ── Hero Banner ── */}
        <section className="relative overflow-hidden rounded-2xl bg-[#155DFC] min-h-[220px]">
          <div className="absolute top-0 right-0 w-1/2 h-full">
            <div className="absolute inset-0 bg-gradient-to-l from-blue-600/50 to-transparent" />
            <div className="absolute right-6 bottom-2 text-white/[0.06] font-black text-[160px] leading-none tracking-tighter select-none pointer-events-none hidden md:block">Z</div>
          </div>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-400/15 rounded-full blur-3xl" />

          <div className="relative z-10 grid md:grid-cols-[1fr_auto] items-center h-full">
            <div className="p-7 sm:p-8 space-y-4">
              <div className="space-y-1.5">
                <h1 className="text-[clamp(1.35rem,3.5vw,2rem)] font-extrabold text-white leading-[1.15] tracking-tight">
                  Discover. Learn. Grow.
                </h1>
                <p className="text-[13px] text-blue-100/80 font-medium max-w-sm leading-relaxed">
                  Find programs, internships, and events<br className="hidden sm:block" /> that shape your future.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="#feed-content" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#155DFC] rounded-full text-[12px] font-bold hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 active:scale-[0.97]">
                  Explore Opportunities
                </Link>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 text-white/90 hover:text-white text-[12px] font-semibold transition-colors">
                  <div className="w-7 h-7 rounded-full border-2 border-white/30 flex items-center justify-center">
                    <Play size={10} className="ml-0.5" fill="white" />
                  </div>
                  How it works
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-end pr-0 md:pr-8 h-full relative mt-4 md:mt-0 p-6 md:p-0">
              <div className="relative w-full md:w-[300px] aspect-[3/2] md:h-[200px] rounded-2xl overflow-hidden border border-white/20 shadow-2xl transform md:rotate-3 hover:rotate-0 transition-transform duration-700 group">
                <Image
                  src="https://i.ibb.co/1YqtdCtK/Chat-GPT-Image-Apr-23-2026-03-29-43-PM.png"
                  alt="Dashboard Preview"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#155DFC]/40 via-transparent to-transparent mix-blend-multiply opacity-40" />
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(21,93,252,0.3)]" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Stories ── */}
        <section>
          <FeedStories currentUser={userData} />
        </section>

        {/* ── Feed Content (Category Tabs + Cards) ── */}
        <section className="space-y-4" id="feed-content">
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Recommended for You
              </h2>
              <p className="text-[12px] text-slate-400 font-medium">
                Opportunities curated based on your interests and profile
              </p>
            </div>
            <Link href="/feed" className="text-[#155DFC] text-[12px] font-semibold hover:underline underline-offset-4 shrink-0 ml-4 hidden sm:inline">
              View all
            </Link>
          </div>

          <MainFeedPage searchQuery={resolvedParams.q} />
        </section>

        {/* ── Platform Stats ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-slate-100 dark:border-slate-800/50">
          {[
            { value: "12+", label: "Active Programs", sub: "Join ongoing opportunities", icon: Zap, color: "text-[#155DFC]", bg: "bg-blue-50 dark:bg-blue-900/10" },
            { value: "2.5K+", label: "Students", sub: "Building their future", icon: Users, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/10" },
            { value: "95%", label: "Satisfaction Rate", sub: "From our community", icon: Target, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/10" },
            { value: "50+", label: "Partner Companies", sub: "Global network access", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 group hover:border-[#155DFC]/30 transition-colors">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
                <stat.icon size={18} />
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mb-0.5">{stat.value}</div>
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight mb-1">{stat.label}</div>
              <div className="text-[9px] font-medium text-slate-400 leading-tight">{stat.sub}</div>
            </div>
          ))}
        </section>
      </div>

      {/* ═══ Sidebar Column ═══ */}
      <DashboardWidgets user={userData} />

      {/* ── Profile Recommendation Popup ── */}
      <ProfileRecommendationPopup user={userData} />
    </div>
  );
}