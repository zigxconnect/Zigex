"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  coverImage?: string;
  videoUrl?: string; // youtube url
  description?: string;
  postingType?: "Program" | "Internship" | "Event";
};

function getYoutubeId(url?: string) {
  if (!url) return null;
  const m = url.match(/[?&]v=([a-zA-Z0-9_-]{5,})/) || url.match(/youtu\.be\/([a-zA-Z0-9_-]{5,})/);
  return m ? m[1] : null;
}

export const LiveDetailView: React.FC<Props> = ({ open, onClose, title, coverImage, videoUrl, description, postingType = "Program" }) => {
  const [showIframe, setShowIframe] = useState(false);
  const [played, setPlayed] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<number | null>(null);

  const videoId = useMemo(() => getYoutubeId(videoUrl), [videoUrl]);

  useEffect(() => {
    if (!open) {
      setShowIframe(false);
      setPlayed(false);
      setShowCTA(false);
      setExpanded(false);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    if (played) {
      // start 30s preview timer
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setShowCTA(true);
      }, 30000);
    }
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [played]);

  const startPlaying = () => {
    setShowIframe(true);
    setPlayed(true);
  };

  return (
    <div className={`fixed inset-0 z-50 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 max-w-6xl mx-auto my-12 bg-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row">
          {/* Left - video preview */}
          <div className="md:w-2/3 w-full bg-black relative">
            {!showIframe ? (
              <div className="relative h-64 md:h-[520px] w-full">
                <img src={coverImage || "/program-placeholder.jpg"} alt={title} className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button onClick={startPlaying} className="bg-white/90 rounded-full p-4 text-black shadow-lg text-lg font-semibold">
                    ▶ Play Live Preview
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative h-64 md:h-[520px] w-full">
                {videoId ? (
                  <iframe
                    title="live-video"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen"
                  />
                ) : (
                  <video src={videoUrl} className="w-full h-full object-cover" controls muted autoPlay />
                )}
                {showCTA && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="bg-white/95 rounded-lg p-6 max-w-md text-center shadow">
                      {postingType === "Event" ? (
                        <>
                          <h3 className="text-lg font-semibold">RSVP to continue watching</h3>
                          <p className="text-sm text-gray-600 mt-2">This preview ended. RSVP to unlock the rest of this live event.</p>
                          <div className="mt-4 flex justify-center gap-3">
                            <Button onClick={() => { alert('RSVP success'); onClose(); }}>RSVP & Watch</Button>
                            <Button variant="secondary-outline" onClick={() => { onClose(); }}>Close</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-semibold">Subscribe to continue</h3>
                          <p className="text-sm text-gray-600 mt-2">Preview ended. Subscribe to join the live session and access materials.</p>
                          <div className="mt-4 flex justify-center gap-3">
                            <Button onClick={() => { alert('Subscribed'); onClose(); }}>Subscribe</Button>
                            <Button variant="secondary-outline" onClick={() => { onClose(); }}>Close</Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right - description + actions */}
          <div className="md:w-1/3 w-full p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-sm text-gray-500 mt-1">{postingType} • Live</p>
              </div>
              <div>
                <button onClick={onClose} className="text-gray-600">✕</button>
              </div>
            </div>

            <div className="prose max-w-none text-sm text-gray-700 line-clamp-6 md:line-clamp-none">
              {description || "No description available."}
            </div>

            <div className="mt-auto flex items-center gap-3">
              <Button className="shadow-lg">Apply</Button>
              <Button variant="secondary-outline">Share</Button>
            </div>
          </div>
        </div>

        {/* Mobile fixed Read more button and slide-up panel */}
        <div className="md:hidden">
          <div className="fixed left-0 right-0 bottom-4 px-4">
            <button onClick={() => setExpanded(true)} className="w-full bg-blue-600 text-white py-3 rounded-full shadow-lg">Read more</button>
          </div>

          <div className={`fixed inset-x-0 bottom-0 z-50 transition-transform ${expanded ? "translate-y-0" : "translate-y-full"}`}>
            <div className="bg-white rounded-t-2xl shadow-xl p-4 max-h-[70vh] overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={() => setExpanded(false)} className="text-gray-600">Close</button>
              </div>
              <div className="text-sm text-gray-700">
                {description}
              </div>
              <div className="mt-4">
                <Button className="w-full">Apply</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDetailView;
