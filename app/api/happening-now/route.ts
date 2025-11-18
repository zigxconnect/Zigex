import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { HAPPENING_NOW_CONSTRAINTS } from '@/lib/types/happening-now';

/**
 * Create Supabase client - initialize inside functions to avoid build-time errors
 */
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const formData = await request.formData();

    const company = formData.get('company') as string;
    const isLive = formData.get('is_live') === 'true';
    const captions = JSON.parse(formData.get('captions') as string || '[]');

    if (!company) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Process images
    const imageUrls: string[] = [];
    const imageFiles = formData.getAll('images') as File[];

    if (imageFiles.length > HAPPENING_NOW_CONSTRAINTS.MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${HAPPENING_NOW_CONSTRAINTS.MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];

      if (!HAPPENING_NOW_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid image type: ${file.type}` },
          { status: 400 }
        );
      }

      const fileName = `happening-now/images/${Date.now()}-${i}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }

      const { data: publicUrl } = supabase.storage
        .from('media')
        .getPublicUrl(uploadData.path);

      imageUrls.push(publicUrl.publicUrl);
    }

    // Process video
    let videoData = null;
    const videoFile = formData.get('video') as File | null;

    if (videoFile) {
      if (videoFile.size > HAPPENING_NOW_CONSTRAINTS.MAX_VIDEO_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `Video size exceeds ${HAPPENING_NOW_CONSTRAINTS.MAX_VIDEO_SIZE_MB}MB limit`,
          },
          { status: 400 }
        );
      }

      if (!HAPPENING_NOW_CONSTRAINTS.ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
        return NextResponse.json(
          { error: `Invalid video type: ${videoFile.type}` },
          { status: 400 }
        );
      }

      const videoFileName = `happening-now/videos/${Date.now()}-${videoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(videoFileName, videoFile, { upsert: false });

      if (uploadError) {
        return NextResponse.json(
          { error: `Video upload failed: ${uploadError.message}` },
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
      return NextResponse.json(
        { error: `Failed to save data: ${insertError.message}` },
        { status: 500 }
      );
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
    console.error('Upload error:', error);
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
