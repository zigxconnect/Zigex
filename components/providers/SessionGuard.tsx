"use client";

/**
 * SessionGuard
 *
 * Solves the intermittent "TypeError: Cannot create property 'user' on string"
 * that some users encounter on re-login.
 *
 * Root Cause:
 * Supabase's GoTrue client stores the session as a JSON-stringified object in
 * localStorage under the key `sb-<project-ref>-auth-token`. If that value ever
 * becomes a plain string (double-serialization, storage quota error, old auth
 * format, or a corrupted write), GoTrue will try to mutate the string as an
 * object → TypeError: Cannot create property 'user' on string.
 *
 * Fix:
 * Before React hydration settles, we scan every `sb-*` key in localStorage,
 * attempt to parse the value, and verify it is a non-null object. Any key
 * that fails this check is immediately removed so GoTrue starts with a clean
 * slate. The user is then asked to sign in again — which is safe and correct
 * behaviour.
 */

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Returns true if the raw string value is a valid, non-null JSON *object*
 * (i.e. what Supabase expects for a stored session).
 */
function isValidSessionValue(raw: string): boolean {
    try {
        const parsed = JSON.parse(raw);
        // Must be a non-null object (not a number, boolean, array, or string)
        return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed);
    } catch {
        return false;
    }
}

/**
 * Clears all Supabase auth-related keys from localStorage.
 * Returns the number of keys removed.
 */
function purgeSupabaseStorage(): number {
    if (typeof window === "undefined") return 0;

    const keysToRemove: string[] = [];

    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;

            // Supabase ssr/gotrue stores sessions under keys like:
            //   sb-<ref>-auth-token
            //   sb-<ref>-auth-token-code-verifier
            //   supabase.auth.token  (legacy v1 key)
            const isSupabaseKey =
                key.startsWith("sb-") || key === "supabase.auth.token";

            if (!isSupabaseKey) continue;

            // Code-verifier keys are plain strings — skip them
            if (key.endsWith("-code-verifier")) continue;

            const raw = localStorage.getItem(key);
            if (raw === null) continue;

            if (!isValidSessionValue(raw)) {
                console.warn(
                    `[SessionGuard] Corrupted Supabase session detected at key "${key}". Removing it.`
                );
                keysToRemove.push(key);
            }
        }
    } catch (scanErr) {
        console.error("[SessionGuard] Error scanning localStorage:", scanErr);
    }

    keysToRemove.forEach((key) => {
        try {
            localStorage.removeItem(key);
        } catch (removeErr) {
            console.error(`[SessionGuard] Failed to remove key "${key}":`, removeErr);
        }
    });

    return keysToRemove.length;
}

export function SessionGuard({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // --- Step 1: Scan and purge corrupted session data ---
        const removed = purgeSupabaseStorage();

        if (removed > 0) {
            console.info(
                `[SessionGuard] Removed ${removed} corrupted session key(s). ` +
                "The user will need to sign in again."
            );
        }

        // --- Step 2: Register a global error handler to catch any future ---
        // TypeError from GoTrue that slips through (e.g., race conditions).
        const handleError = (event: ErrorEvent) => {
            const msg = event?.message ?? "";
            if (
                msg.includes("Cannot create property") &&
                msg.includes("on string")
            ) {
                console.error(
                    "[SessionGuard] Caught GoTrue session TypeError. Purging storage and reloading.",
                    msg
                );

                // Prevent the default browser error overlay
                event.preventDefault();

                // Remove all corrupted keys
                purgeSupabaseStorage();

                // Also sign out via the Supabase client to clean server-side cookies
                try {
                    const supabase = createClient();
                    supabase.auth.signOut().finally(() => {
                        // Redirect to sign-in with an informative query param
                        window.location.replace("/sign-in?error=session_corrupted");
                    });
                } catch {
                    window.location.replace("/sign-in?error=session_corrupted");
                }
            }
        };

        window.addEventListener("error", handleError);
        return () => window.removeEventListener("error", handleError);
    }, []);

    // --- Step 3: Listen for the URL param set by the error handler above ---
    // (Handled in AuthForm.tsx's existing searchParams effect — no change needed.)

    return <>{children}</>;
}
