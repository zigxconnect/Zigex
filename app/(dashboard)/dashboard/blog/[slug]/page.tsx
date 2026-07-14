import PortableText from '@/components/blog/PortableText'
import { sanityFetch } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react'
import { Metadata } from 'next'
import BlogFeedbackForm from '@/components/blog/BlogFeedbackForm'

// Query for metadata
const METADATA_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  title,
  excerpt,
  mainImage,
  author->{name}
}`

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await sanityFetch({
    query: METADATA_QUERY,
    params: { slug },
  })

  if (!post) return { title: 'Post Not Found' }

  const title = `${post.title} | Zigex News`
  const description = post.excerpt || `Read ${post.title} on Zigex News.`
  const image = post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : "https://i.ibb.co/k2Rpz2jQ/og-image-2x-100.jpg"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.zigexconnect.com/dashboard/blog/${slug}`,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  mainImage,
  body,
  publishedAt,
  excerpt,
  author->{
    name,
    image,
    bio
  },
  categories[]->{
    title,
    slug
  }
}`

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await sanityFetch({
    query: POST_QUERY,
    params: { slug },
  })

  if (!post) {
    notFound()
  }

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(800).url()
    : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/dashboard/blog"
            className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold text-sm group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Updates
          </Link>

          <div className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
            ZIGEX<span className="text-[#155DFC]">NEWS</span>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-28 pb-10 lg:pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {post.categories && (
          <div className="flex flex-wrap justify-center gap-2">
            {post.categories.map((category: any) => (
              <span
                key={category.slug?.current || category.title}
                className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase"
              >
                {category.title}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight max-w-3xl mx-auto">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-5 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-bold">
          {post.author && (
            <div className="flex items-center gap-2.5">
              {post.author.image && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                  <Image
                    src={urlFor(post.author.image).width(32).height(32).url()}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-slate-900 dark:text-white">{post.author.name}</span>
            </div>
          )}
          {post.publishedAt && (
            <>
              <span className="hidden sm:inline w-1.5 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full" />
              <time dateTime={post.publishedAt} className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </>
          )}
          <span className="hidden sm:inline w-1.5 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full" />
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Article
          </span>
        </div>
      </header>

      {/* Main Image */}
      {imageUrl && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-900">
            <Image
              src={imageUrl}
              alt={post.mainImage?.alt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Content Layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-slate-900 rounded-[2rem] p-6 md:p-10 shadow-sm space-y-10">
          
          {/* Article Content */}
          <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-img:rounded-2xl">
            <PortableText value={post.body} />
          </article>

          {/* Author Bio Box */}
          {post.author && (
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-8 mt-10">
              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start border border-slate-100 dark:border-slate-900">
                {post.author.image && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-slate-100">
                    <Image
                      src={urlFor(post.author.image).width(64).height(64).url()}
                      alt={post.author?.name || 'Author'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Written by {post.author.name}
                  </h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {post.author?.bio ? <PortableText value={post.author.bio} /> : <p>Tech enthusiast and content creator at Zigex.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Form */}
          <div>
            <BlogFeedbackForm postTitle={post.title} postSlug={slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
