import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createServerActionClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * Create Supabase client with service role for admin operations
 */
function createSupabaseAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Missing Supabase credentials');
    }

    return createClient(url, serviceKey);
}

/**
 * POST - Generate presigned URLs for uploading files directly to Supabase Storage
 * Body: { imageCount: number, hasVideo: boolean }
 */
export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const authClient = await createServerActionClient();
        const {
            data: { user },
        } = await authClient.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only allow ADMIN_EMAIL to perform uploads
        if (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { imageCount, hasVideo } = body;

        if (!imageCount || imageCount < 1 || imageCount > 6) {
            return NextResponse.json(
                { error: 'Invalid imageCount. Must be between 1 and 6' },
                { status: 400 }
            );
        }

        const supabase = createSupabaseAdminClient();
        const timestamp = Date.now();
        const uploadUrls: {
            images: Array<{ index: number; uploadUrl: string; path: string; token: string }>;
            video?: { uploadUrl: string; path: string; token: string };
        } = { images: [] };

        // Generate presigned URLs for images
        for (let i = 0; i < imageCount; i++) {
            const path = `happening-now/images/${timestamp}-${i}`;

            const { data, error } = await supabase.storage
                .from('media')
                .createSignedUploadUrl(path);

            if (error || !data) {
                console.error(`Failed to create upload URL for image ${i}:`, error);
                return NextResponse.json(
                    { error: `Failed to generate upload URL for image ${i + 1}` },
                    { status: 500 }
                );
            }

            uploadUrls.images.push({
                index: i,
                uploadUrl: data.signedUrl,
                path: data.path,
                token: data.token,
            });
        }

        // Generate presigned URL for video if needed
        if (hasVideo) {
            const path = `happening-now/videos/${timestamp}`;

            const { data, error } = await supabase.storage
                .from('media')
                .createSignedUploadUrl(path);

            if (error || !data) {
                console.error('Failed to create upload URL for video:', error);
                return NextResponse.json(
                    { error: 'Failed to generate upload URL for video' },
                    { status: 500 }
                );
            }

            uploadUrls.video = {
                uploadUrl: data.signedUrl,
                path: data.path,
                token: data.token,
            };
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Generated ${imageCount} image URLs${hasVideo ? ' + 1 video URL' : ''}`);
        }

        return NextResponse.json({
            success: true,
            uploadUrls,
            expiresIn: 3600, // URLs expire in 1 hour
        });
    } catch (error) {
        console.error('Error generating upload URLs:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
