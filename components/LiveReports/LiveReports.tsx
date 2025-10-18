"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@liveblocks/client";
import {
  LiveblocksProvider,
  RoomProvider,
  useBroadcastEvent,
  useStorage,
} from "@liveblocks/react";
import { v4 as uuidv4 } from "uuid";

// NOTE: This component is a scaffold. You must provide NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
// in your environment for RoomProvider to connect. See docs/LiveReports.md for setup.

type MentorFeedback = {
  id: string;
  mentorEmail: string;
  content: string;
  pointsEffect: number;
  created_at: string;
};

type DailyReport = {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  content: string;
  skills: string[];
  submitted: boolean;
  points: number;
  feedback: MentorFeedback[];
};

export default function LiveReports({ programId, studentId }: { programId: string; studentId: string }) {
  const router = useRouter();
  const roomId = `program-${programId}-student-${studentId}`;

  // Liveblocks client (prototype). For production, use server-side tokens.
  const client = createClient({ publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY ?? "" });

  // Read the reports from Liveblocks storage immutably using a selector.
  const reports = useStorage((root: any) => {
    if (!root) return [] as any[];
    try {
      const list = typeof root.get === "function" ? root.get("reports") : (root as any).reports;
      if (!list) return [] as any[];
      return typeof list.toArray === "function" ? list.toArray() : Array.from(list as any);
    } catch (e) {
      return [] as any[];
    }
  }) || [];

  const [localContent, setLocalContent] = useState("");
  const [todayPosted, setTodayPosted] = useState(false);
  const [optimisticReports, setOptimisticReports] = useState<any[]>([]);

  useEffect(() => {
    if (!reports) return;
    const today = new Date().toISOString().split("T")[0];
    const has = Array.isArray(reports) ? reports.some((r: any) => r.date === today && r.studentId === studentId) : false;
    setTodayPosted(has);
  }, [reports, studentId]);

  const createReport = async () => {
    const id = uuidv4();
    const today = new Date().toISOString().split("T")[0];
    const report: DailyReport = {
      id,
      studentId,
      date: today,
      content: localContent,
      skills: [],
      submitted: true,
      points: 20,
      feedback: [],
    };

    // Optimistic UI update
    setOptimisticReports(prev => [report, ...prev]);

    // Persist to server (Supabase)
    try {
      await fetch(`/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, report }),
      });
    } catch (err) {
      console.error("Failed saving report", err);
      // rollback optimistic update
      setOptimisticReports(prev => prev.filter(r => r.id !== id));
      return;
    }

    setTodayPosted(true);
    setLocalContent("");
  };

  return (
    <LiveblocksProvider client={client}>
      <RoomProvider id={roomId}>
        <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold">Collaborative Daily Report</h3>
        <div className="mt-2">
          <textarea value={localContent} onChange={(e) => setLocalContent(e.target.value)} className="w-full p-2 border rounded" placeholder="Write your daily report here..." />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-gray-500">{todayPosted ? "You have posted today." : "You can post once per day."}</div>
          <div>
            <button disabled={todayPosted} onClick={createReport} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">Submit</button>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium">Live Reports</h4>
          {/* Show Liveblocks reports + optimistic reports */}
          <div>
            {optimisticReports.map(item => (
              <div key={item.id} className="border rounded p-2 mt-2 bg-blue-50">
                <div className="text-sm text-gray-700">{item.date} (pending)</div>
                <div className="text-gray-900">{item.content}</div>
              </div>
            ))}
            {reports.length > 0 ? (
              reports.map((item: any) => (
                <div key={item.id} className="border rounded p-2 mt-2">
                  <div className="text-sm text-gray-700">{item.date}</div>
                  <div className="text-gray-900">{item.content}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No live reports yet.</div>
            )}
          </div>
        </div>
      </div>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
