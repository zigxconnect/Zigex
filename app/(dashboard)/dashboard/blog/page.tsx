/**
 * Announcements — app/(dashboard)/dashboard/blog/page.tsx
 *
 * Messages from companies and Zigex, read in place (newest first, pinned on
 * top), and Zigex articles alongside. Search, category tabs, the promo card
 * and the oversized hero were removed: there are a handful of items, and
 * announcements are short enough to read without opening a page.
 */

import Link from "next/link";
import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { getProfileInfo } from "@/lib/actions/profile.actions";
import { getAnnouncements } from "@/lib/api/services/workspace";
import { AnnouncementTimeline, type AnnouncementView } from "@/components/blog/AnnouncementTimeline";

export const metadata: Metadata = { title: "Announcements" };
export const revalidate = 60;

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc)[0...6] {
  _id, title, slug, excerpt, mainImage, publishedAt
}`;

type Post = { _id: string; title: string; slug: { current: string }; excerpt?: string; mainImage?: unknown; publishedAt?: string };

export default async function AnnouncementsPage() {
  const [rows, posts, user] = await Promise.all([
    getAnnouncements({}).catch(() => []),
    sanityFetch<Post[]>({ query: POSTS_QUERY }).catch(() => [] as Post[]),
    getProfileInfo().catch(() => null),
  ]);

  const announcements: AnnouncementView[] = (rows as any[])
    .map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content ?? "",
      image: a.image_url ?? null,
      createdAt: a.created_at,
      pinned: Boolean(a.is_pinned),
      from: a.company?.company_name ?? (a.author?.full_name && a.author.full_name !== "Zigex Admin" ? a.author.full_name : "Zigex"),
      fromLogo: a.company?.logo_url ?? a.author?.avatar_url ?? (a.company ? null : "/brand/logo.png"),
    }))
    .sort((x, y) => Number(y.pinned) - Number(x.pinned) || new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());

  // Writing articles is for the Zigex team only (ADMIN_EMAIL); no fallback address in code.
  const isAdmin = Boolean(process.env.ADMIN_EMAIL) && user?.profile?.email === process.env.ADMIN_EMAIL;

  return (
    <div className="pb-16">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">Announcements</h1>
          <p className="mt-1 text-base text-[#4A5670]">News from companies and the Zigex team.</p>
        </div>
        {isAdmin && (
          <Link href="/studio" className="shrink-0 text-sm font-semibold text-[#155DFC] hover:underline">
            Write an article
          </Link>
        )}
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,44rem)_300px] xl:gap-12">
        <section aria-label="Announcements" className="min-w-0">
          <AnnouncementTimeline items={announcements} />
        </section>

        {posts.length > 0 && (
          <aside aria-labelledby="articles-title">
            <div className="lg:sticky lg:top-24">
              <h2 id="articles-title" className="font-heading text-base font-semibold text-[#0B1B3F]">
                From the Zigex blog
              </h2>
              {/* Latest article as a card, the rest as a list. */}
              {(() => {
                const [first, ...rest] = posts;
                const date = (d?: string) =>
                  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;
                return (
                  <div className="mt-3 overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
                    <Link href={`/dashboard/blog/${first.slug.current}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#155DFC]">
                      <div className="aspect-[16/9] bg-[#F3F7FF]">
                        {Boolean(first.mainImage) && (
                          <img src={urlFor(first.mainImage).width(640).height(360).url()} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-heading text-base font-semibold leading-snug text-[#0B1B3F] group-hover:text-[#155DFC]">{first.title}</p>
                        {first.excerpt && <p className="mt-1 line-clamp-2 text-sm text-[#4A5670]">{first.excerpt}</p>}
                        {date(first.publishedAt) && <p className="mt-2 text-xs text-[#7B869C]">{date(first.publishedAt)}</p>}
                      </div>
                    </Link>
                    {rest.length > 0 && (
                      <ul className="divide-y divide-[#EEF2FA] border-t border-[#EEF2FA]">
                        {rest.map((post) => (
                          <li key={post._id}>
                            <Link
                              href={`/dashboard/blog/${post.slug.current}`}
                              className="flex gap-3 p-4 hover:bg-[#F8FAFF] focus-visible:bg-[#F8FAFF] focus-visible:outline-none"
                            >
                              <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F3F7FF]">
                                {Boolean(post.mainImage) && (
                                  <img src={urlFor(post.mainImage).width(128).height(96).url()} alt="" loading="lazy" className="h-full w-full object-cover" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#0B1B3F]">{post.title}</p>
                                {date(post.publishedAt) && <p className="mt-1 text-xs text-[#7B869C]">{date(post.publishedAt)}</p>}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })()}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
