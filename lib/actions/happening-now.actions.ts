"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Types for Happening Now Items
export type HappeningNowItem = {
  id: string;
  type: "image" | "video";
  src: string;
  thumbnail?: string;
  caption: string;
  company: string;
  viewCount: number;
  isLive?: boolean;
  created_at?: string;
};

/**
 * Create a Supabase client for server-side operations
 */
async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );
}

/**
 * Fetch all happening now content from the database
 * Transforms JSONB structure into flat array of HappeningNowItem objects
 */
export async function getHappeningNowContent(): Promise<HappeningNowItem[]> {
  try {
    const supabase = await createSupabaseClient();

    // Fetch from happening_now table
    const { data, error } = await supabase
      .from("happening_now")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching happening now content:", error);
      return [];
    }

    // Transform the data to match HappeningNowItem interface
    const happeningNowItems: HappeningNowItem[] = (data || []).flatMap(
      (item: any) => {
        const items: HappeningNowItem[] = [];

        console.log(`📥 Processing Happening Now Item:`);
        console.log(`  - Company: ${item.company}`);
        console.log(`  - Images: ${item.images?.length || 0}`);
        console.log(`  - Captions: ${JSON.stringify(item.captions)}`);

        // Add video as first item if it exists
        if (item.video?.url) {
          items.push({
            id: `${item.id}-video`,
            type: "video",
            src: item.video.url,
            thumbnail: item.images?.[0] || "",
            caption: item.captions?.[0] || "Live Video",
            company: item.company,
            viewCount: item.view_count || 0,
            isLive: item.is_live || false,
            created_at: item.created_at,
          });
        }

        // Add images as separate items
        if (item.images && Array.isArray(item.images)) {
          item.images.forEach((imageUrl: string, index: number) => {
            const caption = item.captions?.[index] || `${item.company} - Image ${index + 1}`;
            console.log(`  - Image ${index + 1} Caption: "${caption}"`);
            items.push({
              id: `${item.id}-image-${index}`,
              type: "image",
              src: imageUrl,
              thumbnail: imageUrl,
              caption: caption,
              company: item.company,
              viewCount: item.view_count || 0,
              isLive: item.is_live || false,
              created_at: item.created_at,
            });
          });
        }

        return items;
      }
    );

    console.log(`✅ Fetched ${happeningNowItems.length} happening now items with captions`);
    return happeningNowItems;
  } catch (error) {
    console.error("Exception in getHappeningNowContent:", error);
    return [];
  }
}

/**
 * Increment view count for a happening now item
 */
export async function incrementHappeningNowViewCount(
  itemId: string
): Promise<{ success: boolean; newViewCount?: number; error?: string }> {
  try {
    const supabase = await createSupabaseClient();

    // Get the base ID (remove -video or -image-X suffix)
    const baseId = itemId.split("-")[0];

    console.log(`🔄 Incrementing view for: ${baseId}`);

    // Get current view count
    const { data: currentData, error: fetchError } = await supabase
      .from("happening_now")
      .select("view_count")
      .eq("id", baseId)
      .single();

    if (fetchError) {
      console.error("Error fetching view count:", fetchError);
      return { success: false, error: fetchError.message };
    }

    const currentViewCount = currentData?.view_count || 0;
    const newViewCount = currentViewCount + 1;

    console.log(`📈 View count: ${currentViewCount} → ${newViewCount}`);

    // Increment view count
    const { error: updateError } = await supabase
      .from("happening_now")
      .update({ view_count: newViewCount })
      .eq("id", baseId);

    if (updateError) {
      console.error("Error incrementing view count:", updateError);
      return { success: false, error: updateError.message };
    }

    console.log(`✅ Successfully incremented view count to: ${newViewCount}`);
    return { success: true, newViewCount };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Exception in incrementHappeningNowViewCount:", error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Upload happening now content (images and video)
 * @param formData FormData containing: company, images[], video, captions[], is_live
 */
export async function uploadHappeningNow(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseClient();

    // Extract form data with proper type checking
    const company = formData.get("company");
    const isLiveStr = formData.get("is_live");
    const captionsStr = formData.get("captions");

    if (!company || typeof company !== "string") {
      return { success: false, error: "Company name is required" };
    }

    const isLive = isLiveStr === "true";

    let captions: string[] = [];
    if (captionsStr) {
      try {
        captions = JSON.parse(captionsStr as string);
        if (!Array.isArray(captions)) {
          captions = [];
        }
      } catch (e) {
        console.warn("Failed to parse captions:", e);
        captions = [];
      }
    }

    // Get image files with proper array handling
    const imageFiles: File[] = [];
    const formDataEntries = formData.entries();
    for (const [key, value] of formDataEntries) {
      if (key === "images" && value instanceof File) {
        imageFiles.push(value);
      }
    }

    if (imageFiles.length === 0) {
      return { success: false, error: "At least one image is required" };
    }

    // Get video file if present
    let videoFile: File | null = null;
    const videoValue = formData.get("video");
    if (videoValue instanceof File) {
      videoFile = videoValue;
    }

    console.log(`📤 Upload Started:`);
    console.log(`  - Company: ${company}`);
    console.log(`  - Images: ${imageFiles.length}`);
    console.log(`  - Captions: ${JSON.stringify(captions)}`);
    console.log(`  - Video: ${videoFile ? "Yes" : "No"}`);
    console.log(`  - Is Live: ${isLive}`);

    // Upload images to storage
    const imageUrls: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 9);
      const fileName = `${timestamp}-${randomStr}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(`happening-now/images/${fileName}`, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { success: false, error: `Failed to upload image ${i + 1}: ${uploadError.message}` };
      }

      if (!uploadData) {
        return { success: false, error: `Failed to upload image ${i + 1}: No upload data returned` };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("media")
        .getPublicUrl(`happening-now/images/${fileName}`);

      imageUrls.push(publicUrl);
      console.log(`Image ${i + 1} uploaded: ${publicUrl}`);
    }

    // Upload video if present
    let videoData = null;
    if (videoFile) {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 9);
      const fileName = `${timestamp}-${randomStr}-${videoFile.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(`happening-now/videos/${fileName}`, videoFile);

      if (uploadError) {
        console.error("Error uploading video:", uploadError);
        return { success: false, error: `Failed to upload video: ${uploadError.message}` };
      }

      if (!uploadData) {
        return { success: false, error: "Failed to upload video: No upload data returned" };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("media")
        .getPublicUrl(`happening-now/videos/${fileName}`);

      videoData = {
        url: publicUrl,
        size: videoFile.size,
        type: videoFile.type,
      };
      console.log(`Video uploaded: ${publicUrl}`);
    }

    // Get existing happening_now record (there should only be one)
    const { data: existingData } = await supabase
      .from("happening_now")
      .select("id")
      .limit(1);

    const happeningNowData = {
      images: imageUrls,
      video: videoData,
      captions: captions,
      company: company,
      is_live: isLive,
      updated_at: new Date().toISOString(),
    };

    console.log(`💾 Saving to Database:`);
    console.log(`  - Images Count: ${imageUrls.length}`);
    console.log(`  - Captions Array: ${JSON.stringify(captions)}`);
    console.log(`  - Captions Count: ${captions.length}`);
    console.log(`  - Company: ${company}`);

    let result;

    if (existingData && existingData.length > 0) {
      // Update existing record
      console.log(`Updating existing happening_now record: ${existingData[0].id}`);
      result = await supabase
        .from("happening_now")
        .update(happeningNowData)
        .eq("id", existingData[0].id);
    } else {
      // Insert new record
      console.log("Inserting new happening_now record");
      result = await supabase.from("happening_now").insert([happeningNowData]);
    }

    if (result.error) {
      console.error("Error saving to database:", result.error);
      return { success: false, error: `Failed to save content: ${result.error.message}` };
    }

    console.log(`✅ Successfully uploaded happening now content`);
    console.log(`  - Captions saved: ${captions.length} items`);
    console.log(`  - Final captions in DB: ${JSON.stringify(captions)}`);
    return { success: true };
  } catch (error) {
    console.error("Exception in uploadHappeningNow:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
