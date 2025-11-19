"use client";

import React, { useState } from "react";
import { HappeningNowDisplay } from "./HappeningNowDisplay";
import { formatViewCount, getViewCountDescription } from "@/lib/utils/formatViews";
import { Eye, TrendingUp } from "lucide-react";

/**
 * Showcase component demonstrating the view count formatting and tracking system
 * Shows real-time view count updates with formatted display (1k, 1M, etc.)
 */
export function HappeningNowShowcase() {
  const [showDemo, setShowDemo] = useState(false);

  // Demo data to show formatting examples
  const demoViewCounts = [0, 1, 99, 100, 999, 1000, 1500, 10000, 100000, 1000000, 1500000, 1000000000];

  return (
    <div className="w-full space-y-8">
      {/* Main Happening Now Display */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          Happening Now
        </h2>
        <HappeningNowDisplay limit={10} showFullscreenView={true} />
      </div>

      {/* View Count Formatting Demo */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">View Count Formatting Demo</h3>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Our system automatically formats view counts for better readability:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {demoViewCounts.map((count) => (
            <div
              key={count}
              className="bg-white rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-colors group cursor-default"
            >
              <p className="text-xs text-gray-500 mb-1">Actual:</p>
              <p className="font-mono text-sm text-gray-700 mb-3">{count.toLocaleString()}</p>

              <p className="text-xs text-gray-500 mb-1">Formatted:</p>
              <div className="flex items-center gap-2 mb-2">
                <Eye size={14} className="text-blue-600" />
                <span className="font-bold text-lg text-blue-600">{formatViewCount(count)}</span>
              </div>

              <p className="text-xs text-gray-400 truncate group-hover:text-gray-600 transition-colors">
                {getViewCountDescription(count)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-gray-900 mb-2">📊 Formatting Rules:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 0 - 999: Displayed as-is (e.g., "999")</li>
            <li>• 1,000 - 999,999: Formatted as "K" (e.g., "1k", "1.5k", "999k")</li>
            <li>• 1M - 999M: Formatted as "M" (e.g., "1M", "1.5M", "999M")</li>
            <li>• 1B+: Formatted as "B" (e.g., "1B", "1.5B", etc.)</li>
            <li>• Smart decimal placement: Shows 1 decimal for values &lt; 10 in that range</li>
          </ul>
        </div>
      </div>

      {/* Features Description */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">✨ Features</h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Feature 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="text-blue-600" size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Real-time View Tracking</h4>
              <p className="text-sm text-gray-600">
                View counts increment automatically when users view content, with real-time updates via Supabase subscriptions.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600">📸</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Individual Media Tracking</h4>
              <p className="text-sm text-gray-600">
                Each image and video is tracked separately, providing granular analytics on what content users are engaging with most.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">🎯</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Smart Formatting</h4>
              <p className="text-sm text-gray-600">
                Automatically converts large numbers to human-readable format (1000 → 1k, 1000000 → 1M, etc.).
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-amber-600">⚡</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Performance Optimized</h4>
              <p className="text-sm text-gray-600">
                Debounced tracking, indexed database columns, and efficient queries ensure smooth performance at scale.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-pink-600">🎨</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Beautiful UI</h4>
              <p className="text-sm text-gray-600">
                Gradient cards, smooth animations, and intuitive controls provide an excellent user experience.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-cyan-600">♿</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Accessibility First</h4>
              <p className="text-sm text-gray-600">
                Descriptive labels, keyboard navigation, and screen reader support ensure everyone can use the feature.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Stack */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <h3 className="text-xl font-bold mb-6">🔧 Technical Implementation</h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-blue-400 mb-3">Frontend Stack</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ React 18+ with TypeScript</li>
              <li>✓ Custom React hooks for view tracking</li>
              <li>✓ Next.js 15.5+ for server components</li>
              <li>✓ Tailwind CSS for styling</li>
              <li>✓ Lucide React icons</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-blue-400 mb-3">Backend Stack</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ Supabase PostgreSQL database</li>
              <li>✓ Real-time subscriptions via WebSockets</li>
              <li>✓ Indexed view_count column for fast queries</li>
              <li>✓ JSONB media_views for granular tracking</li>
              <li>✓ Service role key support for admin operations</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <p className="text-xs text-gray-400 mb-2">📝 Database Schema:</p>
          <code className="text-xs text-blue-300 font-mono block overflow-x-auto">
            happening_now.view_count: integer (main view counter)<br />
            happening_now.media_views: jsonb (per-media tracking: {"{image: {0, 1, 2}, video: count}"})
          </code>
        </div>
      </div>

      {/* Integration Guide */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">🚀 Integration Guide</h3>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-semibold text-gray-900 mb-2">1. Use HappeningNowDisplay Component</h4>
            <code className="text-xs bg-white p-2 rounded border border-gray-200 block overflow-x-auto font-mono text-gray-700">
              import HappeningNowDisplay from "@/components/sections/HappeningNowDisplay";<br />
              &lt;HappeningNowDisplay limit={"{10}"} showFullscreenView={"{true}"} /&gt;
            </code>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-semibold text-gray-900 mb-2">2. Format View Counts in Custom Components</h4>
            <code className="text-xs bg-white p-2 rounded border border-gray-200 block overflow-x-auto font-mono text-gray-700">
              import {"{formatViewCount}"} from "@/lib/utils/formatViews";<br />
              const formatted = formatViewCount(1500); // Returns "1.5k"
            </code>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
            <h4 className="font-semibold text-gray-900 mb-2">3. Track Views with Hooks</h4>
            <code className="text-xs bg-white p-2 rounded border border-gray-200 block overflow-x-auto font-mono text-gray-700">
              import {"{useHappeningNowViewTracking}"} from "@/hooks/useHappeningNowViewTracking";<br />
              useHappeningNowViewTracking(itemId); // Tracks main item view<br />
              useIndividualMediaViewTracking(itemId, "image", 0); // Tracks image 0
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
