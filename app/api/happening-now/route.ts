import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
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
    let formData;
    
    // Parse form data with error handling
    try {
      formData = await request.formData();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ FormData parsed successfully');
      }
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ FormData parsing error:', parseError);
      }
      return NextResponse.json(
        { error: 'Failed to parse form data. Ensure all files are properly uploaded.' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();
    
    const company = formData.get('company') as string;
    const isLive = formData.get('is_live') === 'true';
    let captions: string[] = [];
    
    try {
      const captionsStr = formData.get('captions') as string;
      if (captionsStr) {
        captions = JSON.parse(captionsStr);
        if (!Array.isArray(captions)) {
          captions = [];
        }
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to parse captions:', e);
      }
      captions = [];
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📤 Received upload request:`);
      console.log(`  - Company: ${company}`);
      console.log(`  - Is Live: ${isLive}`);
      console.log(`  - Captions count: ${captions.length}`);
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Process images
    const imageUrls: string[] = [];
    const imageFiles = formData.getAll('images') as File[];

    if (process.env.NODE_ENV === 'development') {
      console.log(`📸 Processing ${imageFiles.length} images`);
    }

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    if (imageFiles.length > HAPPENING_NOW_CONSTRAINTS.MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${HAPPENING_NOW_CONSTRAINTS.MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (process.env.NODE_ENV === 'development') {
        console.log(`  - Image ${i + 1}: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)}KB)`);
      }

      if (!HAPPENING_NOW_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid image type: ${file.type}. Allowed: ${HAPPENING_NOW_CONSTRAINTS.ALLOWED_IMAGE_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      const fileName = `happening-now/images/${Date.now()}-${i}-${file.name}`;
      if (process.env.NODE_ENV === 'development') {
        console.log(`  - Uploading to: ${fileName}`);
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ Image ${i + 1} upload failed:`, uploadError);
        }
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }

      if (!uploadData || !uploadData.path) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ Image ${i + 1} upload returned no path`);
        }
        return NextResponse.json(
          { error: `Image ${i + 1} upload failed: No path returned` },
          { status: 500 }
        );
      }

      const { data: publicUrl } = supabase.storage
        .from('media')
        .getPublicUrl(uploadData.path);

      imageUrls.push(publicUrl.publicUrl);
      if (process.env.NODE_ENV === 'development') {
        console.log(`  ✅ Image ${i + 1} uploaded: ${publicUrl.publicUrl}`);
      }
    }

    // Process video
    let videoData = null;
    const videoFile = formData.get('video') as File | null;

    if (videoFile && videoFile instanceof File && videoFile.size > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎥 Processing video: ${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(2)}MB)`);
      }

      if (videoFile.size > HAPPENING_NOW_CONSTRAINTS.MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `Video size exceeds ${HAPPENING_NOW_CONSTRAINTS.MAX_VIDEO_SIZE_MB}MB limit. Size: ${(videoFile.size / (1024 * 1024)).toFixed(2)}MB`,
          },
          { status: 400 }
        );
      }

      if (!HAPPENING_NOW_CONSTRAINTS.ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
        return NextResponse.json(
          { error: `Invalid video type: ${videoFile.type}. Allowed: ${HAPPENING_NOW_CONSTRAINTS.ALLOWED_VIDEO_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      const videoFileName = `happening-now/videos/${Date.now()}-${videoFile.name}`;
      if (process.env.NODE_ENV === 'development') {
        console.log(`  - Uploading to: ${videoFileName}`);
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(videoFileName, videoFile, { upsert: false });

      if (uploadError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Video upload failed:', uploadError);
        }
        return NextResponse.json(
          { error: `Video upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }

      if (!uploadData || !uploadData.path) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Video upload returned no path');
        }
        return NextResponse.json(
          { error: 'Video upload failed: No path returned' },
          { status: 500 }
        );
      }

      const { data: publicUrl } = supabase.storage
        .from('media')
        .getPublicUrl(uploadData.path);

      videoData = {
        url: publicUrl.publicUrl,
        size: videoFile.size,
      };
      if (process.env.NODE_ENV === 'development') {
        console.log(`  ✅ Video uploaded: ${publicUrl.publicUrl}`);
      }
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
          captions,
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

export async function GET() {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('happening_now')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch data: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { data: null, message: 'No happening now content available' },
        { status: 200 }
      );
    }

    return NextResponse.json({ data: data[0] }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Fetch error:', error);
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT - Increment view count for a happening now item
 * Body: { itemId: string, increment?: number }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, increment = 1 } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing itemId' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Incrementing view for item: ${itemId}`);
    }

    // Get current view count
    const { data: currentData, error: fetchError } = await supabase
      .from('happening_now')
      .select('id, view_count, company')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Fetch error: ${fetchError.message}`);
      }
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    if (!currentData) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const oldViewCount = currentData.view_count || 0;
    const newViewCount = oldViewCount + increment;

    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 ${currentData.company}: ${oldViewCount} → ${newViewCount}`);
    }

    // Update view count
    const { data: updatedData, error: updateError } = await supabase
      .from('happening_now')
      .update({ 
        view_count: newViewCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select('view_count')
      .single();

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Update error: ${updateError.message}`);
      }
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Successfully updated view count to: ${updatedData?.view_count}`);
    }

    return NextResponse.json({
      success: true,
      itemId,
      company: currentData.company,
      oldViewCount,
      newViewCount: updatedData?.view_count,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Exception: ${message}`);
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

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
