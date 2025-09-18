import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * A reusable hook to fetch details for a specific item (internship, event, program).
 * It handles loading, error, and 404 states automatically.
 * @param apiUrl The base API URL for the resource (e.g., '/api/students/events').
 * @param id The ID of the item to fetch.
 * @returns An object with the fetched data, isLoading state, and error state.
 */
export function useFetchDetails<T>(apiUrl: string, id: string) {
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
        const response = await fetch(`${apiUrl}/${encodeURIComponent(id)}`);

        if (!response.ok) {
          if (response.status === 404) {
            router.replace("/404"); // Or a custom 'not found' page
            return;
          }
          throw new Error("Failed to fetch details.");
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, apiUrl, router]);

  return { data, isLoading, error };
}
