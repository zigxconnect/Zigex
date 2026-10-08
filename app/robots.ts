import { MetadataRoute } from 'next';
import { IS_PRODUCTION } from '@/lib/app-env';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
    // The development site must never show up in search results.
    if (!IS_PRODUCTION) return { rules: { userAgent: '*', disallow: '/' } };
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/api/health'],
            // Signed-in areas and the API: nothing for search engines there.
            disallow: ['/api/', '/dashboard/', '/notifications', '/profile-settings', '/profile/', '/programs/', '/student/', '/intern/', '/create-profile', '/profile-complete', '/studio'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
