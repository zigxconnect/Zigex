import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

/**
 * Extracts the file path from a Supabase storage URL
 */
function extractFilePathFromUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    // For URLs like: https://project.supabase.co/storage/v1/object/public/student-assets/avatars/filename.jpg
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Find the index after 'object' and get the remaining path
    const objectIndex = pathParts.indexOf("object");
    if (objectIndex !== -1 && objectIndex + 2 < pathParts.length) {
      return pathParts.slice(objectIndex + 2).join("/");
    }

    return null;
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

/**
 * Checks if a URL is a Supabase storage URL (not a default placeholder)
 */
function isSupabaseStorageUrl(url: string | null): boolean {
  if (!url) return false;

  // Check if it's a default placeholder image
  if (
    url.includes("/ar.png") ||
    url.includes("/gita.png") ||
    url.startsWith("data:")
  ) {
    return false;
  }

  // Check if it's a Supabase storage URL
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes("supabase") ||
      urlObj.pathname.includes("/object/")
    );
  } catch (error) {
    return false;
  }
}

/**
 * Handles updating a student's profile including file uploads.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient();

  try {
    // Await the params object first
    const { id } = await params;

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if the profile exists
    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("*")
      .or(`id.eq.${id},user_id.eq.${id}`)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error: "Profile not found",
          details: profileError?.message,
        },
        { status: 404 }
      );
    }

    // Verify that the profile belongs to the authenticated user
    if (profile.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update your own profile" },
        { status: 403 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const avatarFile = formData.get("avatar") as File | null;
    const coverImageFile = formData.get("cover_image") as File | null;

    // If no files were provided, return an error
    if (
      (!avatarFile || avatarFile.size === 0) &&
      (!coverImageFile || coverImageFile.size === 0)
    ) {
      return NextResponse.json(
        { error: "No valid files provided for update" },
        { status: 400 }
      );
    }

    // Check file sizes (2MB max)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    if (avatarFile && avatarFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Avatar image must be less than 2MB" },
        { status: 400 }
      );
    }

    if (coverImageFile && coverImageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Cover image must be less than 2MB" },
        { status: 400 }
      );
    }

    let avatarUrl = profile.avatar_url;
    let coverImageUrl = profile.cover_image;

    // Delete old avatar if a new one is being uploaded AND the user already has a Supabase-stored avatar
    if (
      avatarFile &&
      avatarFile.size > 0 &&
      profile.avatar_url &&
      isSupabaseStorageUrl(profile.avatar_url)
    ) {
      const oldAvatarPath = extractFilePathFromUrl(profile.avatar_url);
      if (oldAvatarPath) {
        try {
          const { error: deleteError } = await supabase.storage
            .from("student-assets")
            .remove([oldAvatarPath]);

          if (deleteError) {
            console.warn("Failed to delete old avatar:", deleteError);
            // Continue with upload even if deletion fails
          } else {
            console.log("Successfully deleted old avatar:", oldAvatarPath);
          }
        } catch (deleteError) {
          console.warn("Error deleting old avatar:", deleteError);
          // Continue with upload even if deletion fails
        }
      }
    }

    // Delete old cover image if a new one is being uploaded AND the user already has a Supabase-stored cover image
    if (
      coverImageFile &&
      coverImageFile.size > 0 &&
      profile.cover_image &&
      isSupabaseStorageUrl(profile.cover_image)
    ) {
      const oldCoverImagePath = extractFilePathFromUrl(profile.cover_image);
      if (oldCoverImagePath) {
        try {
          const { error: deleteError } = await supabase.storage
            .from("student-assets")
            .remove([oldCoverImagePath]);

          if (deleteError) {
            console.warn("Failed to delete old cover image:", deleteError);
            // Continue with upload even if deletion fails
          } else {
            console.log(
              "Successfully deleted old cover image:",
              oldCoverImagePath
            );
          }
        } catch (deleteError) {
          console.warn("Error deleting old cover image:", deleteError);
          // Continue with upload even if deletion fails
        }
      }
    }

    // Upload avatar if provided and valid
    if (avatarFile && avatarFile.size > 0) {
      const avatarExt = avatarFile.name.split(".").pop();
      const avatarFileName = `${uuidv4()}.${avatarExt}`;
      const avatarPath = `avatars/${avatarFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("student-assets")
        .upload(avatarPath, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload avatar" },
          { status: 500 }
        );
      }

      // Get public URL for the uploaded avatar
      const { data: avatarData } = supabase.storage
        .from("student-assets")
        .getPublicUrl(avatarPath);

      avatarUrl = avatarData.publicUrl;
    }

    // Upload cover image if provided and valid
    if (coverImageFile && coverImageFile.size > 0) {
      const coverImageExt = coverImageFile.name.split(".").pop();
      const coverImageFileName = `${uuidv4()}.${coverImageExt}`;
      const coverImagePath = `cover-images/${coverImageFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("student-assets")
        .upload(coverImagePath, coverImageFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Cover image upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload cover image" },
          { status: 500 }
        );
      }

      // Get public URL for the uploaded cover image
      const { data: coverImageData } = supabase.storage
        .from("student-assets")
        .getPublicUrl(coverImagePath);

      coverImageUrl = coverImageData.publicUrl;
    }

    // Update the profile in the database
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (avatarFile && avatarFile.size > 0) {
      updateData.avatar_url = avatarUrl;
    }

    if (coverImageFile && coverImageFile.size > 0) {
      updateData.cover_image = coverImageUrl;
    }

    const { error: updateError } = await supabase
      .from("student_profiles")
      .update(updateData)
      .eq("id", profile.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      avatar_url: avatarUrl,
      cover_image: coverImageUrl,
    });
  } catch (error: any) {
    console.error("API Route Error (PUT):", error);
    return NextResponse.json(
      {
        error: "Update failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
