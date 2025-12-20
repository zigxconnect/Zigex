import { sanityFetch } from '@/sanity/lib/client'
import { getProfileInfo } from '@/lib/actions/profile.actions'
import BlogListing from '@/components/blog/BlogListing'

const DATA_QUERY = `{
  "posts": *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    author->{
      name,
      image
    },
    categories[]->{
      title,
      slug
    }
  },
  "categories": *[_type == "category"] | order(title asc) {
    title,
    slug
  }
}`

export const revalidate = 60; // Revalidate every minute

export default async function BlogPage() {
  const { posts, categories } = await sanityFetch({ query: DATA_QUERY })
  
  // Get current user data for admin check (passed to navigation/layout usually, but we might need it)
  const userData = await getProfileInfo()
  const adminEmail = process.env.ADMIN_EMAIL || 'fonyuyjudegita@gmail.com'
  const isAdmin = userData?.profile?.email === adminEmail

  return (
    <div className="min-h-screen bg-gray-50/50">
      <BlogListing 
        initialPosts={posts} 
        categories={categories} 
        isAdmin={isAdmin}
      />
    </div>
  )
}