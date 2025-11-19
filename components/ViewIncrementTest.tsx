"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface ViewIncrementTestProps {
  itemId: string;
  currentViewCount?: number;
}

export function ViewIncrementTest({ itemId, currentViewCount = 0 }: ViewIncrementTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [viewCount, setViewCount] = useState(currentViewCount);

  const handleIncrementManually = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log(`🧪 Testing manual increment for: ${itemId}`);

      const response = await fetch("/api/happening-now", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          increment: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Error:", data.error);
        setResult({
          success: false,
          message: `Error: ${data.error}`,
        });
        return;
      }

      console.log("✅ Increment successful:", data);
      setViewCount(data.newViewCount);
      setResult({
        success: true,
        message: `Success! New count: ${data.newViewCount}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Exception:", message);
      setResult({
        success: false,
        message: `Exception: ${message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-mono text-xs text-gray-600">Item ID:</p>
          <p className="font-mono text-xs text-yellow-700 truncate">{itemId}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">Current View Count:</p>
          <p className="text-2xl font-bold text-yellow-600">{viewCount}</p>
        </div>
      </div>

      <button
        onClick={handleIncrementManually}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
      >
        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        {isLoading ? "Incrementing..." : "Test Increment View Count"}
      </button>

      {result && (
        <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
          result.success 
            ? "bg-green-100 border border-green-300" 
            : "bg-red-100 border border-red-300"
        }`}>
          {result.success ? (
            <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${
            result.success ? "text-green-800" : "text-red-800"
          }`}>
            {result.message}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-600 mt-3">
        💡 <strong>Tip:</strong> Open browser console (F12) to see detailed logs of the increment process.
      </p>
    </div>
  );
}
