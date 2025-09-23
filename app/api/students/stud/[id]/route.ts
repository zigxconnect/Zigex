import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid'; // To generate unique file names

function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          return (await cookieStore).get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            (await cookieStore).set({ name, value, ...options });
          } catch (error) {}
        },
        remove: async (name: string, options: CookieOptions) => {
          try {
            (await cookieStore).set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );
}

/**
 * Handles updating a student's profile including file uploads.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient();

  try {
    // 1. Get the authenticated user securely.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Verify that the user is updating their own profile.
    const { id } = params;
    if (id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only update your own profile" },
        { status: 403 }
      );
    }

    // 3. Get the update data from the request body.
    const formData = await request.formData();

    // Extract fields from form data
    const updates: any = {
      full_name: formData.get('full_name'),
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      university: formData.get('university'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      about: formData.get('about'),
      linkedin_url: formData.get('linkedin_url'),
      github_url: formData.get('github_url'),
      portfolio_url: formData.get('portfolio_url'),
      hard_skills: typeof formData.get('hard_skills') === 'string'
        ? (formData.get('hard_skills') as string).split(',')
        : null,
    };

    // Handle file uploads for avatar and cover image
    const avatarFile = formData.get('avatar') as File | null;
    const coverImageFile = formData.get('cover_image') as File | null;

    if (avatarFile) {
      const avatarFileName = `${uuidv4()}.${avatarFile.name.split('.').pop()}`;
      const { error: avatarUploadError } = await supabase
        .storage
        .from('student-assets') // Use the correct bucket name
        .upload(`avatars/${avatarFileName}`, avatarFile);

      if (avatarUploadError) {
        throw avatarUploadError;
      }

      updates.avatar_url = supabase.storage.from('student-assets').getPublicUrl(`avatars/${avatarFileName}`).data.publicUrl;
    }

    if (coverImageFile) {
      const coverImageFileName = `${uuidv4()}.${coverImageFile.name.split('.').pop()}`;
      const { error: coverImageUploadError } = await supabase
        .storage
        .from('student-assets') // Use the correct bucket name
        .upload(`covers/${coverImageFileName}`, coverImageFile);

      if (coverImageUploadError) {
        throw coverImageUploadError;
      }

      updates.cover_image = supabase.storage.from('student-assets').getPublicUrl(`covers/${coverImageFileName}`).data.publicUrl;
    }

    // 4. Perform the update in the database.
    const { data, error: updateError } = await supabase
      .from("student_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(
      { success: true, message: "Profile updated successfully", data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Route Error (PUT):", error);
    return NextResponse.json(
      {
        error: "Update failed",
        details: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}