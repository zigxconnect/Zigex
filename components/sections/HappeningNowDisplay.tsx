"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { HappeningNowItem } from "@/lib/types/happening-now";
import { HappeningNowCard } from "./HappeningNowCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Zap } from "lucide-react";

interface HappeningNowDisplayProps {
  limit?: number;
  showFullscreenView?: boolean;
}

export function HappeningNowDisplay({ limit = 10, showFullscreenView = true }: HappeningNowDisplayProps) {
  const [items, setItems] = useState<HappeningNowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HappeningNowItem | null>(null);

  // Fetch happening now items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("happening_now")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (fetchError) throw fetchError;

        setItems((data || []) as HappeningNowItem[]);
      } catch (err) {
        console.error("Error fetching happening now items:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();

    // Set up real-time subscription for view count updates
    const supabase = createClient();
    const subscription = supabase
      .channel("happening_now_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "happening_now" },
        (payload) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === payload.new.id ? { ...item, ...payload.new } : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [limit]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("happening_now")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      setItems((data || []) as HappeningNowItem[]);
    } catch (err) {
      console.error("Error refreshing items:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh items");
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading && items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-red-600">HAPPENING NOW</span>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md">
            <Skeleton className="w-full h-96" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Happening Now</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8 text-center">
        <Zap className="mx-auto text-blue-600 mb-3" size={32} />
        <h3 className="font-semibold text-gray-900 mb-1">Nothing happening right now</h3>
        <p className="text-gray-600 text-sm mb-4">
          Check back later for live updates from companies
        </p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-red-600">
            HAPPENING NOW • {items.length}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Grid or Single Column */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} onClick={() => setSelectedItem(item)} className="cursor-pointer">
            <HappeningNowCard item={item} />
          </div>
        ))}
      </div>

      {/* Modal View - when item selected */}
      {selectedItem && showFullscreenView && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <HappeningNowCard
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
