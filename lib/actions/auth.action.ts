"use server"

// lib/auth/server-actions.ts
import { createServerActionClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

// Return type for auth functions
interface AuthResult {
  user: User;
  isAuthenticated: true;
}
// BELOW IS CALLED A DOCUMENTATION IN JS/TS HOVER WERE THE FUNCTION IS CALLED TO SEE MORE

/**
 * Server action to check if user is authenticated
 * @param redirectTo - Where to redirect if not authenticated
 * @returns User data
 */
export async function checkAuthStatus(
  redirectTo: string = "/sign-in"
): Promise<AuthResult> {
  const supabase = createServerActionClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (!user || authError) {
    redirect(redirectTo);
  }

  return {
    user,
    isAuthenticated: true as const
  };
}

/**
 * Lightweight version that checks authentication with default redirect
 */
export async function requireAuth(
  redirectTo: string = "/sign-in"
): Promise<AuthResult> {
  return checkAuthStatus(redirectTo);
}