import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser (client components).
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase configuration is missing.");
  }

  return createBrowserClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Default to localStorage, but we wrap it to prevent the crash
      storage: wrapStorageWithSafety(typeof window !== "undefined" ? window.localStorage : undefined)
    }
  });
}

/**
 * Wraps any Storage implementation (like localStorage) with a validator.
 * If the stored session is corrupted (e.g. a string instead of an object),
 * it returns null to prevent the GoTrue crash while allowing the app to recover.
 */
function wrapStorageWithSafety(baseStorage?: Storage): Storage {
  // SSR or no storage available
  if (!baseStorage) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      key: () => null,
      clear: () => {},
      length: 0
    };
  }

  return {
    getItem(key: string): string | null {
      const value = baseStorage.getItem(key);
      if (!value) return null;

      // Only validate Supabase auth tokens
      if (!key.includes("-auth-token")) return value;

      try {
        const parsed = JSON.parse(value);
        
        // THE CRITICAL FIX: If JSON.parse(value) returns a string, 
        // it means the value was double-stringified. 
        // Returning this string to GoTrue causes the "property 'user' on string" crash.
        if (typeof parsed === 'string') {
          console.warn(`[Supabase SafeStorage] Corrupted string session detected for ${key}. Clearing.`);
          baseStorage.removeItem(key);
          return null;
        }

        if (parsed === null || typeof parsed !== 'object') {
          baseStorage.removeItem(key);
          return null;
        }

        return value;
      } catch (e) {
        // Invalid JSON
        baseStorage.removeItem(key);
        return null;
      }
    },
    setItem(key: string, value: string): void {
      baseStorage.setItem(key, value);
    },
    removeItem(key: string): void {
      baseStorage.removeItem(key);
    },
    get length(): number {
      return baseStorage.length;
    },
    key(index: number): string | null {
      return baseStorage.key(index);
    },
    clear(): void {
      baseStorage.clear();
    }
  };
}

