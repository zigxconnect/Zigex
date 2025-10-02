import BlogCard from '@/components/blog/BlogCard'
import { sanityFetch } from '@/sanity/lib/client'
import Link from 'next/link'
import { getProfileInfo } from '@/lib/actions/profile.actions'

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

const currentYear = new Date().getFullYear()

export default async function BlogPage() {
  const posts = await sanityFetch({ query: POSTS_QUERY })
  
  // Get current user data
  const userData = await getProfileInfo()
  console.log("User Data in BlogPage:", userData?.profile?.email);
  
  // Check if user is admin
  const adminEmail = process.env.ADMIN_EMAIL || 'fonyuyjudegita@gmail.com'
  const isAdmin = userData?.profile?.email === adminEmail

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
           <Link
            href="/dashboard/blog"
            className="group flex items-center shadow-md p-2 rounded-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
          >
            <div className="text-white font-bold text-sm w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-sm flex items-center justify-center shadow-md mr-1 transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:shadow-blue-500/50 group-hover:rotate-12 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-purple-600">
              <span className="transition-transform duration-300 ease-in-out group-hover:scale-125">
                Z
              </span>
            </div>
            <div className="sm:block font-bold text-blue-700 text-lg rounded flex items-center justify-center transition-all duration-300 ease-in-out group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:scale-105">
              IGEX

              <span> NEWS</span>
            </div>
          </Link>
            {isAdmin && (
              <Link
                href="/studio"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Admin Studio
              </Link>
            )}
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
            {isAdmin && (
              <Link
                href="/studio"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Studio
              </Link>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-8">Latest News</h2>
            <p>Get the latest news from the Zigex Community</p>
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
         <p>&copy; {currentYear} Zigex News by the Z-finding Team.</p>
        </div>
      </footer>
    </div>
  )
}