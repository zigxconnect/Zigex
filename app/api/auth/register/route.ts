// import { supabaseAdmin } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// /**
//  * Handles new student registration.
//  * This API route is responsible for creating both the auth user and their
//  * initial profile row using the powerful admin client.
//  */
// export async function POST(request: Request) {
//   // 1. Get and validate the required fields.
//   const { email, password, fullName } = await request.json();

//   if (!email || !password || !fullName) {
//     return NextResponse.json(
//       { error: "Email, password, and full name are required." },
//       { status: 400 }
//     );
//   }

//   // 2. Create the user in Supabase Auth using the ADMIN client.
//   const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
//     email,
//     password,
//   });

//   if (authError || !authData.user) {
//     console.error("Supabase Auth Error:", authError);
//     return NextResponse.json(
//       { error: authError?.message || "Could not sign up user." },
//       { status: 400 }
//     );
//   }

//   const userId = authData.user.id;

//   // 3. Immediately create the corresponding profile in the 'student_profiles' table.
//   const { error: profileError } = await supabaseAdmin
//     .from("student_profiles")
//     .insert({
//       user_id: userId,
//       full_name: fullName,
//       email: email,
//       profile_status: "incomplete", // Set the initial status.
//     });

//   // 4. Critical Error Handling: If profile creation fails, delete the auth user.
//   if (profileError) {
//     console.error("Supabase Profile Creation Error:", profileError);
//     // Cleanup the orphaned auth user to prevent database inconsistencies.
//     await supabaseAdmin.auth.admin.deleteUser(userId);
//     return NextResponse.json(
//       { error: "Failed to create user profile after authentication." },
//       { status: 500 }
//     );
//   }

//   // 5. If both steps succeeded, return a success response.
//   return NextResponse.json(
//     { message: "Student registered successfully", user: authData.user },
//     { status: 201 }
//   );
// }
