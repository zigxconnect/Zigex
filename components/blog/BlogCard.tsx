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
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-90" />
            </div>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-4/5 lg:w-2/3">
                <div className="flex flex-wrap gap-2 mb-6">
                    {post.categories?.map((cat, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-900/20">
                            {cat.title}
                        </span>
                    ))}
                </div>
                
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[0.9] tracking-tighter group-hover:text-blue-200 transition-colors">
                    {post.title}
                </h2>
                
                {post.excerpt && (
                    <p className="text-slate-200 text-lg md:text-xl mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-2xl font-medium">
                        {post.excerpt}
                    </p>
                )}
                
                <div className="flex items-center gap-6 text-slate-300">
                     {post.author && (
                        <div className="flex items-center gap-3">
                             {post.author.image && (
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                                    <Image
                                        src={urlFor(post.author.image).width(40).height(40).url()}
                                        alt={post.author.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <span className="text-sm font-bold text-white tracking-wide">{post.author.name}</span>
                        </div>
                    )}
                    {post.publishedAt && (
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                             <div className="w-1 h-1 rounded-full bg-slate-400" />
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
      <article className="h-full flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_20px_40px_-5px_rgba(6,81,237,0.15)] transition-all duration-300 hover:-translate-y-1">
        
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-slate-100">
             <div className="absolute top-4 left-4 z-10 flex gap-2">
                {post.categories?.slice(0, 1).map((cat, i) => (
                     <span key={i} className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                        {cat.title}
                    </span>
                ))}
            </div>
            <Image
                src={imageUrl}
                alt={post.mainImage?.alt || post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
            <div className="flex items-center text-[10px] font-bold text-slate-400 mb-4 space-x-3 uppercase tracking-wider">
                {post.publishedAt && (
                   <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                   </span>
                )}
                 <span>•</span>
                 <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Read
                 </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                {post.title}
            </h2>

            {post.excerpt && (
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                    {post.excerpt}
                </p>
            )}

            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
               {post.author && (
                  <div className="flex items-center gap-3">
                    {post.author.image ? (
                        <Image
                            src={urlFor(post.author.image).width(28).height(28).url()}
                            alt={post.author.name}
                            width={28}
                            height={28}
                            className="rounded-full ring-2 ring-white"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 ring-2 ring-white">
                           <User className="w-3.5 h-3.5" />
                        </div>
                    )}
                    <span className="text-xs font-bold text-slate-700">{post.author.name}</span>
                  </div>
               )}
               
               <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                   <ArrowRight className="w-4 h-4" strokeWidth={3} />
               </div>
            </div>
        </div>
      </article>
    </Link>
  )
}