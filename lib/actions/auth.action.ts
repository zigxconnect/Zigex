"use server";

import { createServerActionClient } from "@/lib/supabase/server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { getURL } from "@/lib/utils";

/**
 * Server Action to check if a user is already authenticated.
 * Used to protect pages like /sign-in from logged-in users.
 */
export async function checkAuthStatus(
  redirectTo: string = "/dashboard"
): Promise<void> {
  const supabase = await createServerActionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If a user is found, they are already logged in. Redirect them.
  if (user) {
    redirect(redirectTo);
  }
}

// Validation schema for the Sign-Up form
const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("A valid email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

// Validation schema for the Sign-In form
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required."),
});

/**
 * Server Action for User Sign-Up
 * Handles registration, auto-login, and redirection.
 * Relies on a database trigger to create the user's profile.
 */
export async function signUpAction(formData: z.infer<typeof signUpSchema>) {
  const supabase = await createServerActionClient();

  const result = signUpSchema.safeParse(formData);
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." };
  }

  const { email, password, fullName } = result.data;

  // 1. Create the user in Supabase Auth.
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getURL()}api/auth/callback`,
      data: {
        full_name: fullName, // Pass fullName to be used by the database trigger
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  // 2. Immediately log the new user in to create a session.
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

  // 3. Deferred completion: land on the dashboard. Profile setup happens
  // later via the dismissible banner linking to /dashboard/edit-profile.
  redirect("/dashboard");
}

/**
 * Server Action for User Sign-In
 * Handles login and redirects the user based on their profile completion status.
 */
export async function signInAction(formData: z.infer<typeof signInSchema>) {
  const supabase = await createServerActionClient();

  const result = signInSchema.safeParse(formData);
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." };
  }

  const { email, password } = result.data;

  // 1. Log the user in.
  const { error: signInError, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !data.user) {
    return { error: "Invalid email or password. Please try again." };
  }

  // 2. Deferred completion: always land on the dashboard regardless of
  // profile completeness. The dashboard banner nudges incomplete profiles
  // toward /dashboard/edit-profile.
  redirect("/dashboard");
}
