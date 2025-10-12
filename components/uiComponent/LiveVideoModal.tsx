"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  videoSrc?: string; // supports YouTube URLs
  postingType?: "Program" | "Internship" | "Event";
  description?: string;
  applyUrl?: string;
};

export const LiveVideoModal: React.FC<Props> = ({ open, onClose, title, videoSrc, postingType = "Event", description = "" , applyUrl }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setShowCTA(false);
      setEmbedSrc(null);
      setElapsed(0);
      setMobileExpanded(false);
      return;
    }
    setShowCTA(false);
    setPlaying(false);
    setEmbedSrc(null);
    setElapsed(0);
    setMobileExpanded(false);
  }, [open]);

  // track elapsed playback seconds while playing (approximate preview)
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [playing]);

  useEffect(() => {
    if (elapsed >= 30 && playing) {
      setShowCTA(true);
      setPlaying(false);
      // stop iframe by clearing src
      setEmbedSrc(null);
    }
  }, [elapsed, playing]);

  // helpers to work with YouTube links: create embed URL
  const createYouTubeEmbed = (url?: string, muted = true) => {
    if (!url) return null;
    // extract video id
    try {
      const u = new URL(url);
      let id = "";
      if (u.hostname.includes("youtube.com")) {
        id = u.searchParams.get("v") || "";
      } else if (u.hostname === "youtu.be") {
        id = u.pathname.slice(1);
      }
      if (!id) return null;
      return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1&controls=1&mute=${muted ? 1 : 0}`;
    } catch (e) {
      return null;
    }
  };

  const handlePlayClick = () => {
    // if not playing, load embed with muted initially and then reload unmuted when user toggles
    if (!playing) {
      // first click: start unmuted playback by replacing embed with muted=false
      const firstEmbed = createYouTubeEmbed(videoSrc, false);
      // Some browsers require user gesture to unmute — using user click to set unmuted embed
      setEmbedSrc(firstEmbed);
      setPlaying(true);
      setElapsed(0);
      setShowCTA(false);
      return;
    }

    // if currently playing, pause by clearing embed
    setPlaying(false);
    setEmbedSrc(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${open ? "" : "pointer-events-none"}`}
    >
      <div className={`absolute inset-0 bg-black/60`} onClick={onClose} />

      <div className="relative z-10 max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-xl">
        <div className="relative md:grid md:grid-cols-3">
          <div className="md:col-span-2 relative h-64 md:h-96 bg-black">
            {/* iframe only created when embedSrc is set to avoid auto-loading many iframes */}
            {embedSrc ? (
              <iframe
                ref={iframeRef}
                src={embedSrc}
                className="w-full h-full object-cover"
                allow="autoplay; encrypted-media; picture-in-picture"
                title={title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/60">
                <button
                  onClick={handlePlayClick}
                  className="bg-white/90 text-black rounded-full px-4 py-2 shadow-md font-semibold"
                  aria-label="Play preview"
                >
                  Play Preview
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-1 p-4 bg-white flex flex-col">
            <h3 className="text-lg font-bold">{title || "Live"}</h3>
            <p className="text-sm text-gray-600 mb-3">{postingType} — Live stream preview</p>
            <div className={`prose max-w-none text-sm text-gray-700 ${mobileExpanded ? "" : "line-clamp-3"}`}>
              {description || "No description available."}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <a href={applyUrl || "#"} className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg">Apply / Learn more</a>
              <button className="text-sm text-gray-600 underline" onClick={() => setMobileExpanded((s) => !s)}>
                {mobileExpanded ? "Show less" : "Read more"}
              </button>
            </div>
          </div>
        </div>
        {/* mobile fixed Read more bar */}
        <div className="md:hidden fixed left-0 right-0 bottom-4 px-4">
          <button
            onClick={() => setMobileExpanded(true)}
            className="w-full bg-white/95 backdrop-blur-sm border rounded-lg py-3 font-semibold"
          >
            Read more
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">{title || "Live"}</h3>
              <p className="text-sm text-gray-600">{postingType} — Live stream preview</p>
            </div>
            <div>
              <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
          </div>

          {!showCTA ? (
            <p className="text-sm text-gray-700">You're watching a short preview. Click play to unmute — preview will pause after 30s and prompt next steps.</p>
          ) : (
            <div className="rounded-lg p-4 bg-gray-50 border">
              {postingType === "Event" ? (
                <>
                  <h4 className="font-semibold">Watch the full stream for free</h4>
                  <p className="text-sm text-gray-600">RSVP to unlock the remainder of this event.</p>
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => { alert('RSVP confirmed — enjoy!'); onClose(); }}>RSVP & Continue</Button>
                    <Button variant="secondary-outline" onClick={() => { onClose(); }}>Maybe later</Button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-semibold">Subscribe to join</h4>
                  <p className="text-sm text-gray-600">This is a live preview. Subscribe to get access to the full live session and materials.</p>
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => { alert('Subscribed — thanks!'); onClose(); }}>Subscribe</Button>
                    <Button variant="secondary-outline" onClick={() => { onClose(); }}>Not now</Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveVideoModal;
