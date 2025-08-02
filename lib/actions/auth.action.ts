"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js"; // Import the User type

// --- Define return types for better TypeScript support ---
interface AuthResult {
  user: User;
  isAuthenticated: true;
}

/**
 * NEW: Server Action to check if a user is authenticated.
 * This is used on pages like /sign-in and /sign-up to redirect
 * users who are already logged in.
 *
 * @param redirectTo - The path to redirect to if the user is NOT authenticated.
 * @returns An AuthResult if the user is authenticated.
 * @throws {Error} Throws an error (which is caught by redirect()) if the user is not authenticated.
 */
export async function checkAuthStatus(
  redirectTo: string = "/sign-in"
): Promise<AuthResult> {
  const supabase = createServerActionClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If no user is found, redirect to the specified path.
    // This throws an error that can be caught in Server Components.
    redirect(redirectTo);
  }

  return {
    user,
    isAuthenticated: true as const,
  };
}

// --- Define validation schemas for the actions ---
const signUpSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * Server Action for User Sign-Up
 * Handles user registration and automatic profile creation via the database trigger.
 */
export async function signUpAction(formData: z.infer<typeof signUpSchema>) {
  const supabase = createServerActionClient();

  const result = signUpSchema.safeParse(formData);
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." };
  }

  const { email, password, fullName } = result.data;

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      error:
        "Registration successful, but auto-login failed. Please log in manually.",
    };
  }
}

/**
 * Server Action for User Sign-In
 * Handles user login and redirects them based on their profile status.
 */
export async function signInAction(formData: z.infer<typeof signInSchema>) {
  const supabase = createServerActionClient();

  const result = signInSchema.safeParse(formData);
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." };
  }

  const { email, password } = result.data;

  const { error: signInError, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !data.user) {
    return { error: "Invalid email or password. Please try again." };
  }

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("profile_status")
    .eq("user_id", data.user.id)
    .single();

  if (profile?.profile_status === "complete") {
    redirect("/dashboard");
  } else {
    redirect("/create-profile");
  }
}
