import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://zigex.vercel.app';

    // Static routes
    const staticRoutes = [
        '',
        '/internships',
        '/events',
        '/programs',
        '/feed',
        '/projects',
        '/dashboard',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // In a real production app with a database, you would fetch all IDs here
    // e.g., const internshipIds = await getInternshipIds();
    // and map them to urls.

    // For now, these are the primary landing and list pages.
    // Search engines will follow links from these pages to find individual items.

    return [...staticRoutes];
}
