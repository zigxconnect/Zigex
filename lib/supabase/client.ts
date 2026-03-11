import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser (client components).
 *
 * This version includes a safe storage adapter that validates session
 * data on read and prevents the infamous
 * `TypeError: Cannot create property 'user' on string` crash.
 *
 * The crash happens when GoTrue reads a double-stringified or corrupted
 * session from storage, gets a STRING instead of an OBJECT, and then
 * tries to assign `.user` to it.
 *
 * @see docs/AUTH_SESSION_BUG_POSTMORTEM.md
 */

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is missing in environment variables.");
    throw new Error("Supabase configuration is missing.");
  }

  // Singleton: reuse the same client instance to avoid multiple GoTrue
  // initializations which can cause race conditions on the session.
  if (cachedClient) {
    return cachedClient;
  }

  // Extract the project ref for the storage key
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const storageKey = `sb-${projectRef}-auth-token`;

  cachedClient = createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      storageKey,
      storage: createSafeStorage(storageKey),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    // Let @supabase/ssr handle cookies with its built-in mechanism
    // but our custom `auth.storage` overrides localStorage usage
  });

  return cachedClient;
}

/**
 * Creates a safe localStorage wrapper that validates session data on read.
 *
 * WHY THIS IS NEEDED:
 * ------------------
 * GoTrue stores session as `JSON.stringify(sessionObj)` in storage.
 * On read, it does `JSON.parse(value)` to get the session object back.
 *
 * If the value was somehow double-stringified (e.g., by a bug in cookie
 * synchronization, or by conflicting storage adapters), then:
 *   JSON.parse('"{\\"access_token\\":\\"eyJ...\\"}"') → returns STRING
 *   GoTrue then does: session.user = newUser → TypeError! 💥
 *
 * This adapter catches that case by:
 * 1. On getItem: validates the parsed result is an object
 * 2. If it's a double-stringified string, parses again and fixes it
 * 3. If still invalid, removes the key (forces a clean re-login)
 */
function createSafeStorage(authKey: string): Storage {
  if (typeof window === "undefined") {
    // SSR: return a no-op storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      length: 0,
      key: () => null,
      clear: () => {},
    };
  }

  return {
    getItem(key: string): string | null {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        // Only validate the auth token key, pass other keys through
        if (key !== authKey) return raw;

        // Validate: parse and check the structure
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          // Not valid JSON — corrupted or truncated
          console.warn(`[SafeStorage] Corrupted (non-JSON) value for "${key}". Removing.`);
          localStorage.removeItem(key);
          return null;
        }

        // CRITICAL CHECK: If JSON.parse returned a STRING, the value was double-stringified.
        // This is the exact cause of "Cannot create property 'user' on string".
        if (typeof parsed === "string") {
          try {
            const recovered = JSON.parse(parsed);
            if (typeof recovered === "object" && recovered !== null && !Array.isArray(recovered)) {
              // Successfully recovered! Fix the storage so it doesn't happen again.
              const fixed = JSON.stringify(recovered);
              console.info(`[SafeStorage] Fixed double-stringified session for "${key}".`);
              localStorage.setItem(key, fixed);
              return fixed;
            }
          } catch {
            // Can't recover — it's truly corrupted
          }

          console.warn(`[SafeStorage] Session for "${key}" is a string (not an object). Removing.`);
          localStorage.removeItem(key);
          return null;
        }

        // Check for null/array (invalid for session)
        if (parsed === null || Array.isArray(parsed)) {
          console.warn(`[SafeStorage] Invalid session type for "${key}". Removing.`);
          localStorage.removeItem(key);
          return null;
        }

        // Value is valid — return the raw string for GoTrue to parse
        return raw;
      } catch (err) {
        console.error(`[SafeStorage] Unexpected error reading "${key}":`, err);
        try { localStorage.removeItem(key); } catch {}
        return null;
      }
    },

    setItem(key: string, value: string): void {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.error(`[SafeStorage] Error writing "${key}":`, err);
      }
    },

    removeItem(key: string): void {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.error(`[SafeStorage] Error removing "${key}":`, err);
      }
    },

    get length(): number {
      return localStorage.length;
    },

    key(index: number): string | null {
      return localStorage.key(index);
    },

    clear(): void {
      localStorage.clear();
    },
  };
}
