import { createClient } from 'next-sanity'
import { dataset, projectId } from '../env'

// projectId / dataset come from sanity/env.ts, which fails with a clear message when they're missing.
export const client = createClient({
  projectId,
  dataset,
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
