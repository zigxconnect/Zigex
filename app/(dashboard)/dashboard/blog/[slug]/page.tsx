import PortableText from '@/components/blog/PortableText'
import { sanityFetch } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, User, Tag, Clock } from 'lucide-react'

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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <Link
              href="/dashboard/blog"
              className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to News
            </Link>
            
            <div className="font-bold text-lg text-gray-900">
                ZIGEX<span className="text-blue-600">NEWS</span>
            </div>
         </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-32 pb-16 lg:pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {post.categories && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {post.categories.map((category: any) => (
                <span
                  key={category.slug?.current || category.title}
                  className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase"
                >
                  {category.title}
                </span>
              ))}
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-base">
             {post.author && (
              <div className="flex items-center gap-3">
                {post.author.image && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                       <Image
                        src={urlFor(post.author.image).width(40).height(40).url()}
                        alt={post.author.name}
                        fill
                        className="object-cover"
                      />
                  </div>
                )}
                <span className="font-medium text-gray-900">{post.author.name}</span>
              </div>
            )}
            <span className="hidden sm:inline w-1.5 h-1.5 bg-gray-300 rounded-full" />
            {post.publishedAt && (
              <time dateTime={post.publishedAt} className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            <span className="hidden sm:inline w-1.5 h-1.5 bg-gray-300 rounded-full" />
            <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Read
            </span>
          </div>
      </header>

      {/* Main Image */}
      {imageUrl && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="relative aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/100">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar (Left on Large screens) - Table of Contents or Share */}
            <aside className="lg:col-span-2 hidden lg:block">
               <div className="sticky top-32 space-y-8 text-center sm:text-left">
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Share</div>
                  <button className="block w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center mb-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.802-1.588 2.457-2.548l-.047-.02z"/></svg>
                  </button>
                  <button className="block w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </button>
               </div>
            </aside>

            {/* Article Content */}
            <article className="lg:col-span-8 prose prose-lg md:prose-xl prose-blue max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-2xl">
                <PortableText value={post.body} />
                
                {/* Author Bio Box */}
                <div className="mt-16 not-prose border-t border-gray-100 pt-12">
                     <div className="bg-gray-50 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start">
                        {post.author?.image && (
                            <div className="relative w-24 h-24 flex-shrink-0 rounded-full overflow-hidden border-4 border-white shadow-md">
                                <Image
                                    src={urlFor(post.author.image).width(100).height(100).url()}
                                    alt={post.author?.name || 'Author'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div>
                             <h3 className="text-xl font-bold text-gray-900 mb-2">Written by {post.author?.name}</h3>
                             <div className="text-gray-600 leading-relaxed">
                                {post.author?.bio ? <PortableText value={post.author.bio} /> : <p>Tech enthusiast and content creator at Zigex.</p>}
                             </div>
                        </div>
                     </div>
                </div>
            </article>

            {/* Right Sider - Categories / Related ?? (Or empty for focus) */}
            <aside className="lg:col-span-2 hidden lg:block">
                 {/* Can add related posts widget here later */}
            </aside>
        </div>
      </div>
    </div>
  )
}