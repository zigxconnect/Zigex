"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { HappeningNowDisplay } from "@/components/sections/HappeningNowDisplay";
import { ViewIncrementTest } from "@/components/ViewIncrementTest";
import { formatViewCount } from "@/lib/utils/formatViews";
import { Eye, RefreshCw } from "lucide-react";

export default function ViewTrackingTestPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  // Fetch and display all items with their view counts
  const fetchItems = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("happening_now")
        .select("id, company, view_count, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    // Subscribe to real-time updates
    const supabase = createClient();
    const subscription = supabase
      .channel("happening_now_debug")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "happening_now" },
        (payload) => {
          console.log("📡 Real-time update received:", payload);
          setItems((prev) =>
            prev.map((item) =>
              item.id === payload.new.id
                ? { ...item, view_count: payload.new.view_count }
                : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 View Tracking Debug Center
          </h1>
          <p className="text-gray-600">
            Monitor real-time view count updates for happening-now items
          </p>
        </div>

        {/* Manual Refresh & Stats */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Items View Counts ({items.length})
            </h2>
            <button
              onClick={() => {
                fetchItems();
                setRefreshCount((c) => c + 1);
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh ({refreshCount})
            </button>
          </div>

          {loading ? (
            <div className="text-gray-500">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="text-gray-500">No items found. Upload some content first!</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors group"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.company}</p>
                    <p className="text-xs text-gray-500">{item.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Raw Count:</p>
                      <p className="font-mono text-sm text-gray-700">{item.view_count || 0}</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-2 bg-white rounded-lg border border-blue-200 group-hover:border-blue-400 transition-colors">
                      <Eye size={16} className="text-blue-600" />
                      <span className="font-bold text-blue-600">
                        {formatViewCount(item.view_count || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-yellow-900 mb-3">📝 Testing Instructions</h3>
          <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
            <li>Click "Refresh" button above to load the latest items from database</li>
            <li>
              In another tab, navigate to the HappeningNow feed and view some items
            </li>
            <li>
              The view counts above should update in real-time as you view items
            </li>
            <li>
              Check browser console for logs: "✅ View tracked: [item-id]"
            </li>
            <li>
              If views don't increment, check the console for error messages
            </li>
          </ol>
        </div>

        {/* Manual Test Section */}
        {items.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-purple-900 mb-4">🧪 Manual Increment Test</h3>
            <p className="text-sm text-purple-700 mb-4">
              Use the button below to manually test the increment API for the first item:
            </p>
            <ViewIncrementTest 
              itemId={items[0].id}
              currentViewCount={items[0].view_count || 0}
            />
          </div>
        )}

        {/* Console Logs Section */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-white mb-3">🔍 Console Logs</h3>
          <p className="text-sm text-gray-400 mb-4">
            Open your browser DevTools (F12) and check the Console tab for tracking logs
          </p>
          <div className="bg-slate-800 rounded p-4 font-mono text-xs text-gray-300 space-y-1 max-h-64 overflow-y-auto">
            <div className="text-green-400">
              ✅ View tracked: [item-id] - New count: X
            </div>
            <div className="text-blue-400">
              📊 Attempting to track view for: [item-id]
            </div>
            <div className="text-blue-400">
              📈 View count: X → X+1
            </div>
            <div className="text-gray-500">
              {/* Logs appear here */}
            </div>
          </div>
        </div>

        {/* Live Feed Component */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎬 Live Feed (Click items to see views update)</h3>
          <HappeningNowDisplay limit={10} showFullscreenView={true} />
        </div>
      </div>
    </div>
  );
}
