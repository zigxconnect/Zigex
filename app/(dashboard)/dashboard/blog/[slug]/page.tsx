/**
 * Article — app/(dashboard)/dashboard/blog/[slug]/page.tsx
 *
 * A reading page inside the app shell: way back to Announcements, title and
 * byline, cover photo, the article at a comfortable measure, the author, a
 * feedback form, and what to read next.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import PortableText from "@/components/blog/PortableText";
import BlogFeedbackForm from "@/components/blog/BlogFeedbackForm";
import { sanityFetch } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { getProfileInfo } from "@/lib/actions/profile.actions";

type Props = { params: Promise<{ slug: string }> };

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id, title, slug, mainImage, body, publishedAt, excerpt,
  author->{ name, image, bio },
  categories[]->{ title, slug }
}`;

const MORE_QUERY = `*[_type == "post" && slug.current != $slug] | order(publishedAt desc)[0...3]{
  _id, title, slug, mainImage, publishedAt
}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityFetch({ query: `*[_type == "post" && slug.current == $slug][0]{ title, excerpt, mainImage }`, params: { slug } });
  if (!post) return { title: "Article not found" };
  const description = post.excerpt || `Read ${post.title} on the Zigex blog.`;
  const image = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : "https://i.ibb.co/k2Rpz2jQ/og-image-2x-100.jpg";
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, type: "article", url: `https://www.zigexconnect.com/dashboard/blog/${slug}`, images: [{ url: image }] },
    twitter: { card: "summary_large_image", title: post.title, description, images: [image] },
  };
}

/** Words in the Portable Text body, at 200 words a minute. */
function readingMinutes(body: any[] | undefined) {
  const words = (body ?? [])
    .flatMap((block) => (Array.isArray(block?.children) ? block.children.map((c: any) => c?.text ?? "") : []))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const longDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [post, more, user] = await Promise.all([
    sanityFetch({ query: POST_QUERY, params: { slug } }),
    sanityFetch<any[]>({ query: MORE_QUERY, params: { slug } }).catch(() => []),
    getProfileInfo().catch(() => null),
  ]);
  if (!post) notFound();

  const category: string | undefined = post.categories?.[0]?.title;
  const minutes = readingMinutes(post.body);

  return (
    <div className="pb-16">
      <Link
        href="/dashboard/blog"
        className="mb-6 inline-flex h-10 items-center gap-2 rounded-lg pr-2 text-sm font-semibold text-[#4A5670] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Announcements
      </Link>

      <article className="mx-auto max-w-[720px]">
        <header>
          {category && <p className="text-sm font-semibold text-[#155DFC]">{category}</p>}
          <h1 className="mt-2 font-heading text-3xl font-bold leading-tight tracking-tight text-[#0B1B3F] sm:text-[40px] sm:leading-[1.15]">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-[#4A5670]">{post.excerpt}</p>}

          <div className="mt-6 flex items-center gap-3 border-y border-[#EEF2FA] py-4">
            {post.author?.image ? (
              <img src={urlFor(post.author.image).width(80).height(80).url()} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#155DFC] font-semibold text-white">
                {(post.author?.name ?? "Z").charAt(0)}
              </span>
            )}
            <div className="text-sm">
              <p className="font-semibold text-[#0B1B3F]">{post.author?.name ?? "Zigex team"}</p>
              <p className="text-[#7B869C]">
                {post.publishedAt && <time dateTime={post.publishedAt}>{longDate(post.publishedAt)}</time>}
                {post.publishedAt && ", "}
                {minutes} min read
              </p>
            </div>
          </div>
        </header>

        {post.mainImage && (
          <img
            src={urlFor(post.mainImage).width(1440).height(810).url()}
            alt={post.mainImage?.alt || ""}
            className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-[#EEF2FA]"
          />
        )}

        <div className="mt-8 text-[17px] leading-[1.75] text-[#2B3A55]">
          <PortableText value={post.body} />
        </div>

        {post.author?.bio && (
          <aside className="mt-12 flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5]">
            {post.author.image && (
              <img src={urlFor(post.author.image).width(112).height(112).url()} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
            )}
            <div className="text-sm leading-relaxed text-[#4A5670]">
              <p className="font-semibold text-[#0B1B3F]">About {post.author.name}</p>
              <div className="mt-1">
                <PortableText value={post.author.bio} />
              </div>
            </div>
          </aside>
        )}

        <div className="mt-12">
          <BlogFeedbackForm
            postTitle={post.title}
            postSlug={slug}
            defaultName={user?.name ?? ""}
            defaultEmail={(user?.profile as { email?: string } | undefined)?.email ?? ""}
          />
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more-title" className="mx-auto mt-16 max-w-[720px] border-t border-[#DCE5F5] pt-10">
          <h2 id="more-title" className="font-heading text-xl font-semibold text-[#0B1B3F]">
            Keep reading
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {more.map((p: any) => (
              <li key={p._id}>
                <Link href={`/dashboard/blog/${p.slug.current}`} className="group block focus-visible:outline-none">
                  <div className="aspect-[16/10] overflow-hidden rounded-xl bg-[#F3F7FF] ring-1 ring-[#EEF2FA] group-focus-visible:ring-2 group-focus-visible:ring-[#155DFC]">
                    {p.mainImage && <img src={urlFor(p.mainImage).width(480).height(300).url()} alt="" loading="lazy" className="h-full w-full object-cover" />}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-[#0B1B3F] group-hover:text-[#155DFC]">{p.title}</p>
                  {p.publishedAt && <p className="mt-1 text-xs text-[#7B869C]">{longDate(p.publishedAt)}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
