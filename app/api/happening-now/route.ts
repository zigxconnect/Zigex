import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createServerActionClient } from '@/lib/supabase/server';

// Use Node.js runtime for this route because @supabase/supabase-js
// relies on Node APIs that are not available in the Edge runtime.
export const runtime = 'nodejs';

// Note: In App Router, we use presigned URLs for file uploads to bypass payload limits
// Files are uploaded directly to Supabase Storage from the client
export const maxDuration = 300; // 5 minutes timeout for database operations

import { HAPPENING_NOW_CONSTRAINTS } from '@/lib/types/happening-now';

/**
 * Create Supabase client - use service role key if available, otherwise use anon key
 */
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceKey || anonKey;

  if (!url || !key) {
    const errorMsg = 'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY';
    console.error('❌ ' + errorMsg);
    throw new Error(errorMsg);
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize the requester on the server
    try {
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
    } catch (authErr) {
      console.error('Authorization check failed:', authErr);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse JSON body (much smaller payload - just URLs and metadata)
    let body;
    try {
      body = await request.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Request body parsed successfully');
      }
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Body parsing error:', parseError);
      }
      return NextResponse.json(
        { error: 'Failed to parse request body' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    const { company, imageUrls, videoData, captions, isLive } = body;

    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 Received save request:`);
      console.log(`  - Company: ${company}`);
      console.log(`  - Is Live: ${isLive}`);
      console.log(`  - Image URLs: ${imageUrls?.length || 0}`);
      console.log(`  - Video: ${videoData ? 'Yes' : 'No'}`);
      console.log(`  - Captions count: ${captions?.length || 0}`);
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one image URL is required' },
        { status: 400 }
      );
    }

    if (imageUrls.length > HAPPENING_NOW_CONSTRAINTS.MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${HAPPENING_NOW_CONSTRAINTS.MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    // Validate URLs are from Supabase storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    for (const url of imageUrls) {
      if (!url.startsWith(supabaseUrl!)) {
        return NextResponse.json(
          { error: 'Invalid image URL. Must be from Supabase storage' },
          { status: 400 }
        );
      }
    }

    if (videoData && videoData.url && !videoData.url.startsWith(supabaseUrl!)) {
      return NextResponse.json(
        { error: 'Invalid video URL. Must be from Supabase storage' },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('💾 Saving to database...');
    }

    // Delete existing happeningNow data and insert new
    await supabase
      .from('happening_now')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This deletes all records

    const { data: insertedData, error: insertError } = await supabase
      .from('happening_now')
      .insert([
        {
          company,
          images: imageUrls,
          video: videoData,
          captions: captions || [],
          is_live: isLive,
          view_count: 0,
        },
      ])
      .select()
      .single();

    if (insertError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Database insert failed:', insertError);
      }
      return NextResponse.json(
        { error: `Failed to save data: ${insertError.message}` },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Data saved successfully');
    }

    return NextResponse.json(
      {
        success: true,
        data: insertedData,
        message: 'Happening Now content uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Upload error:', error);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Students read the latest post and count views through the backend
// (GET /happening-now/latest, POST /happening-now/{id}/view). Only the
// company upload remains here; it moves with the admin app.

/**
 * OPTIONS - Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigin = origin === frontendUrl ? origin : frontendUrl;

  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}
