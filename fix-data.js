import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Critical: Supabase environment variables are missing.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixData() {
  // console.log('Fixing happening_now data...');
  
  // 1. Get existing record
  const { data: existing, error: fetchError } = await supabase
    .from('happening_now')
    .select('id')
    .limit(1);

  if (fetchError) {
    console.error('Error fetching:', fetchError);
    return;
  }

  // 2. Prepare valid test data
  // Using picsum.photos for image (allowlisted in next.config.mjs)
  // Using a standard reliable test video
  const validData = {
    company: "ZIGEX Demo",
    images: [
      "https://picsum.photos/seed/zigex1/800/600",
      "https://picsum.photos/seed/zigex2/800/600"
    ],
    video: {
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      type: "video/mp4"
    },
    captions: [
      "Platform Update 1", 
      "Community Event"
    ],
    is_live: true,
    view_count: 42,
    updated_at: new Date().toISOString()
  };

  let result;
  
  if (existing && existing.length > 0) {
    const id = existing[0].id;
    // console.log(`Updating record ${id}...`);
    result = await supabase
      .from('happening_now')
      .update(validData)
      .eq('id', id);
  } else {
    // console.log(`Inserting new record...`);
    result = await supabase
      .from('happening_now')
      .insert([validData]);
  }

  if (result.error) {
    console.error('Update failed:', result.error);
  } else {
    // console.log('✅ Data successfully updated with valid test content!');
  }
}

fixData();
