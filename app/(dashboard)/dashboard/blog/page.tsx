import BlogCard from '@/components/blog/BlogCard'
import { sanityFetch } from '@/sanity/lib/client'
// import BlogCard from '@/components/BlogCard'
import Link from 'next/link'

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  mainImage,
  publishedAt,
  author->{
    name,
    image
  }
}`

export default async function Home() {
  const posts = await sanityFetch({ query: POSTS_QUERY })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">My Blog</h1>
            <Link
              href="/studio"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Studio
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              No posts yet
            </h2>
            <p className="text-gray-500 mb-6">
              Get started by creating your first post in the Studio
            </p>
            <Link
              href="/studio"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Studio
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-8">Latest Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="bg-white mt-20 py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2025 My Blog. Built with Next.js & Sanity.</p>
        </div>
      </footer>
    </div>
  )
}