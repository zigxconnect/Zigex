import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false, // Set to false for real-time updates
})

export async function sanityFetch<T = any>({
  query,
  params = {},
  tags = ['sanity'], // Default tag for revalidation
}: {
  query: string
  params?: any
  tags?: string[]
}) {
  return client.fetch<T>(query, params, {
    next: {
      // Short revalidation time - webhooks handle instant updates
      revalidate: process.env.NODE_ENV === 'development' ? 30 : 60,
      tags: ['sanity', ...tags], // Always include 'sanity' tag
    },
  })
}
