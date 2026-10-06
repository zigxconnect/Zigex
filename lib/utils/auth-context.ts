/**
 * Optional authentication context helper.
 *
 * Unlike `getProfileInfo()` inside the dashboard layout, this function never
 * throws or redirects. It is designed for pages that are publicly accessible
 * but benefit from knowing whether the visitor is signed in (e.g. the public feed).
 */

import { getProfileInfo, type FormattedUserData } from "@/lib/actions/profile.actions";

export interface AuthContext {
  user: FormattedUserData | null;
  isAuthenticated: boolean;
}

/**
 * Returns the current user's profile and an `isAuthenticated` flag.
 * Always resolves — never redirects.
 *
 * Use this in Server Components that are reachable by unauthenticated visitors.
 */
export async function getOptionalAuth(): Promise<AuthContext> {
  try {
    const user = await getProfileInfo();
    return { user, isAuthenticated: user !== null };
  } catch {
    // Supabase session errors (e.g. invalid/missing JWT) are non-fatal here.
    return { user: null, isAuthenticated: false };
  }
}
