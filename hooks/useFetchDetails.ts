import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/browser-client";
import { ApiClientError } from "@/lib/api/errors";
import { normaliseFeedItem } from "@/lib/api/feed-shape";

/**
 * A reusable hook to fetch details for a specific feed item from the backend.
 * It handles loading, error, and 404 states automatically.
 * @param path The backend feed path (e.g. '/feed/events').
 * @param id The ID of the item to fetch.
 * @returns An object with the fetched data, isLoading state, and error state.
 */
export function useFetchDetails<T>(path: string, id: string) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      // Don't fetch if the ID isn't available yet
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get<Record<string, any>>(`${path}/${encodeURIComponent(id)}`);
        setData(normaliseFeedItem(res.data) as T);
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 404) {
          router.replace("/404");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to fetch details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, path, router]);

  return { data, isLoading, error };
}
