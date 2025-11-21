"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProjectSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      // focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const controller = new AbortController();
    if (!query || query.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        setResults(json.data || []);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  // Perform an immediate search (used for Enter key behavior)
  const performSearchAndMaybeNavigate = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/search?q=${encodeURIComponent(q)}&limit=1`);
      const json = await res.json();
      const first = json.data && json.data[0];
      if (first) {
        // navigate to the first matching project
        router.push(`/feed/projects/${first.id}`);
        setOpen(false);
      }
    } catch (err) {
      console.error("Search/Enter navigation error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        aria-label="Search projects"
        title="Search projects"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:bg-slate-100 transition"
      >
        <Search className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-5 h-5 text-slate-500" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      performSearchAndMaybeNavigate();
                    }
                  }}
                  placeholder="Search projects by title..."
                  className="w-full bg-transparent outline-none text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close search"
                  className="p-2 rounded-md text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {loading && (
                <div className="py-6 text-center text-sm text-slate-500">Searching…</div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-500">No results</div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-3">
                  {results.map((r: any) => (
                    <Link
                      key={r.id}
                      href={`/feed/projects/${r.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                        {r.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.cover_image_url} alt={r.project_title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">📁</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="truncate font-medium text-sm text-slate-900">{r.project_title}</div>
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {r.student_profiles?.full_name || 'Unknown author'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
