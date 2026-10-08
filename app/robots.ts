import { MetadataRoute } from 'next';
import { IS_PRODUCTION } from '@/lib/app-env';

export default function robots(): MetadataRoute.Robots {
    // The development site must never show up in search results.
    if (!IS_PRODUCTION) return { rules: { userAgent: '*', disallow: '/' } };
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/dashboard/'],
        },
        sitemap: 'https://zigexconnect.com/sitemap.xml',
    };
}
