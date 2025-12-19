import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { Calendar, Clock, User, ArrowRight } from 'lucide-react'

interface BlogCardProps {
  post: {
    title: string
    slug: { current: string }
    excerpt?: string
    mainImage?: any
    publishedAt?: string
    author?: {
      name: string
      image?: any
    }
    categories?: { title: string }[]
  }
  isFeatured?: boolean
}

export default function BlogCard({ post, isFeatured = false }: BlogCardProps) {
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(isFeatured ? 1200 : 600).height(isFeatured ? 600 : 400).url()
    : '/placeholder.jpg'

  // Featured Layout
  if (isFeatured) {
    return (
        <>
            <div className="absolute inset-0">
                <Image
                src={imageUrl}
                alt={post.mainImage?.alt || post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-60"
                priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            </div>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-3/4 lg:w-2/3">
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories?.map((cat, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-sm">
                            {cat.title}
                        </span>
                    ))}
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-blue-200 transition-colors">
                    {post.title}
                </h2>
                
                {post.excerpt && (
                    <p className="text-gray-200 text-lg mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl">
                        {post.excerpt}
                    </p>
                )}
                
                <div className="flex items-center gap-6 text-gray-300">
                     {post.author && (
                        <div className="flex items-center gap-2">
                             {post.author.image && (
                                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                    <Image
                                        src={urlFor(post.author.image).width(32).height(32).url()}
                                        alt={post.author.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <span className="text-sm font-medium">{post.author.name}</span>
                        </div>
                    )}
                    {post.publishedAt && (
                        <div className="flex items-center gap-2 text-sm">
                             <Calendar className="w-4 h-4" />
                             <time dateTime={post.publishedAt}>
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                                })}
                            </time>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
  }

  // Regular Card Layout
  return (
    <Link href={`/dashboard/blog/${post.slug.current}`} className="group h-full block">
      <article className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
        
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
             <div className="absolute top-4 left-4 z-10 flex gap-2">
                {post.categories?.slice(0, 1).map((cat, i) => (
                     <span key={i} className="px-3 py-1 bg-white/95 backdrop-blur-md text-blue-700 text-xs font-bold rounded-full shadow-lg">
                        {cat.title}
                    </span>
                ))}
            </div>
            <Image
                src={imageUrl}
                alt={post.mainImage?.alt || post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center text-xs text-gray-400 mb-3 space-x-2">
                {post.publishedAt && (
                   <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                   </span>
                )}
                 <span>•</span>
                 <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Read
                 </span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
            </h2>

            {post.excerpt && (
                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                </p>
            )}

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
               {post.author && (
                  <div className="flex items-center gap-2">
                    {post.author.image ? (
                        <Image
                            src={urlFor(post.author.image).width(24).height(24).url()}
                            alt={post.author.name}
                            width={24}
                            height={24}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                           <User className="w-3 h-3" />
                        </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">{post.author.name}</span>
                  </div>
               )}
               
               <span className="text-blue-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                   <ArrowRight className="w-5 h-5" />
               </span>
            </div>
        </div>
      </article>
    </Link>
  )
}