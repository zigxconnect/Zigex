import { sanityFetch } from '@/sanity/lib/client'
import { getProfileInfo } from '@/lib/actions/profile.actions'
import { getAnnouncements } from '@/lib/actions/announcement.actions'
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
  const [
    sanityData,
    announcements,
    userData
  ] = await Promise.all([
    sanityFetch({ query: DATA_QUERY }),
    getAnnouncements(),
    getProfileInfo()
  ])

  const { posts, categories } = sanityData || { posts: [], categories: [] }
  const adminEmail = process.env.ADMIN_EMAIL || 'fonyuyjudegita@gmail.com'
  const isAdmin = userData?.profile?.email === adminEmail

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <BlogListing 
        initialPosts={posts} 
        initialAnnouncements={announcements}
        categories={categories} 
        isAdmin={isAdmin}
      />
    </div>
  )
}