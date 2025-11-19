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
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    let formData;
    
    // Parse form data with error handling
    try {
      formData = await request.formData();
      console.log('✅ FormData parsed successfully');
    } catch (parseError) {
      console.error('❌ FormData parsing error:', parseError);
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
      console.warn('Failed to parse captions:', e);
      captions = [];
    }

    console.log(`📤 Received upload request:`);
    console.log(`  - Company: ${company}`);
    console.log(`  - Is Live: ${isLive}`);
    console.log(`  - Captions count: ${captions.length}`);

    if (!company) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Process images
    const imageUrls: string[] = [];
    const imageFiles = formData.getAll('images') as File[];

    console.log(`📸 Processing ${imageFiles.length} images`);

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
      console.log(`  - Image ${i + 1}: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)}KB)`);

      if (!HAPPENING_NOW_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid image type: ${file.type}. Allowed: ${HAPPENING_NOW_CONSTRAINTS.ALLOWED_IMAGE_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      const fileName = `happening-now/images/${Date.now()}-${i}-${file.name}`;
      console.log(`  - Uploading to: ${fileName}`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        console.error(`❌ Image ${i + 1} upload failed:`, uploadError);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }

      if (!uploadData || !uploadData.path) {
        console.error(`❌ Image ${i + 1} upload returned no path`);
        return NextResponse.json(
          { error: `Image ${i + 1} upload failed: No path returned` },
          { status: 500 }
        );
      }

      const { data: publicUrl } = supabase.storage
        .from('media')
        .getPublicUrl(uploadData.path);

      imageUrls.push(publicUrl.publicUrl);
      console.log(`  ✅ Image ${i + 1} uploaded: ${publicUrl.publicUrl}`);
    }

    // Process video
    let videoData = null;
    const videoFile = formData.get('video') as File | null;

    if (videoFile && videoFile instanceof File && videoFile.size > 0) {
      console.log(`🎥 Processing video: ${videoFile.name} (${(videoFile.size / (1024 * 1024)).toFixed(2)}MB)`);

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
      console.log(`  - Uploading to: ${videoFileName}`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(videoFileName, videoFile, { upsert: false });

      if (uploadError) {
        console.error('❌ Video upload failed:', uploadError);
        return NextResponse.json(
          { error: `Video upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }

      if (!uploadData || !uploadData.path) {
        console.error('❌ Video upload returned no path');
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
      console.log(`  ✅ Video uploaded: ${publicUrl.publicUrl}`);
    }

    console.log('💾 Saving to database...');

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
      console.error('❌ Database insert failed:', insertError);
      return NextResponse.json(
        { error: `Failed to save data: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Data saved successfully');

    return NextResponse.json(
      {
        success: true,
        data: insertedData,
        message: 'Happening Now content uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Upload error:', error);
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
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
