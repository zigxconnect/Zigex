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
import { AnnouncementItem, type AnnouncementView } from "@/components/blog/AnnouncementItem";

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
      fromLogo: a.company?.logo_url ?? a.author?.avatar_url ?? (a.company ? null : "https://i.ibb.co/Cp502Yby/logo.png"),
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

      <div className="grid gap-10 lg:grid-cols-[minmax(0,42rem)_320px]">
        <section aria-label="Announcements" className="min-w-0">
          {announcements.length === 0 ? (
            <p className="rounded-2xl bg-white px-6 py-10 text-center text-base text-[#4A5670] ring-1 ring-[#DCE5F5]">
              No announcements yet. Companies and Zigex post news about programs and opportunities here.
            </p>
          ) : (
            <ul className="space-y-4">
              {announcements.map((a) => (
                <li key={a.id}>
                  <AnnouncementItem a={a} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {posts.length > 0 && (
          <aside aria-labelledby="articles-title">
            <div className="lg:sticky lg:top-24">
              <h2 id="articles-title" className="font-heading text-lg font-semibold text-[#0B1B3F]">
                Articles
              </h2>
              <ul className="mt-3 divide-y divide-[#EEF2FA] rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
                {posts.map((post) => (
                  <li key={post._id}>
                    <Link
                      href={`/dashboard/blog/${post.slug.current}`}
                      className="flex gap-3 p-4 hover:bg-[#F8FAFF] focus-visible:bg-[#F8FAFF] focus-visible:outline-none"
                    >
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F3F7FF]">
                        {Boolean(post.mainImage) && (
                          <img src={urlFor(post.mainImage).width(160).height(112).url()} alt="" loading="lazy" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#0B1B3F]">{post.title}</p>
                        {post.publishedAt && (
                          <p className="mt-1 text-xs text-[#7B869C]">
                            {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
