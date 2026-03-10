"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * SessionGuard
 *
 * Secondary safety net for the Auth Session "TypeError: Cannot create property 'user' on string" bug.
 *
 * NOTE: The primary protection now lives as a synchronous blocking script in
 * app/layout.tsx. That script handles the race condition by purging corrupted
 * localStorage BEFORE the Supabase JavaScript bundles even load/initialize.
 *
 * This component acts as a runtime guardian to catch any errors that might occur
 * after the initial page load (e.g. during a session refresh in a long-lived tab).
 */

export function SessionGuard({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Global error listener to catch the specific Supabase/GoTrue TypeError
        const handleError = (event: ErrorEvent) => {
            const msg = event?.message ?? "";

            // Check for the signature of the Supabase session corruption error
            if (
                msg.includes("Cannot create property") &&
                msg.includes("on string")
            ) {
                console.error(
                    "[SessionGuard] Runtime GoTrue session corruption detected. Purging and recovering...",
                    msg
                );

                // 1. Prevent the default browser error overlay / log
                event.preventDefault();

                // 2. Recovery: Synchronously purge all Supabase-related keys from localStorage
                try {
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.indexOf('sb-') === 0 || key === 'supabase.auth.token')) {
                            // We skip code-verifiers as they are naturally strings, 
                            // but for a full recovery purge, it's safer to clear everything.
                            localStorage.removeItem(key);
                        }
                    }
                } catch (e) {
                    console.error("[SessionGuard] Failed to purge localStorage:", e);
                }

                // 3. Force a complete logout and redirect
                // This clears server-side cookies via signOut() then bounces to sign-in.
                try {
                    const supabase = createClient();
                    supabase.auth.signOut().finally(() => {
                        window.location.replace("/sign-in?error=session_corrupted");
                    });
                } catch (err) {
                    // If Supabase client itself fails, do a hard redirect
                    window.location.replace("/sign-in?error=session_corrupted");
                }
            }
        };

        window.addEventListener("error", handleError);
        return () => window.removeEventListener("error", handleError);
    }, []);

    return <>{children}</>;
}
