"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type LivePanelProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  coverImage?: string;
  youtubeId?: string; // expects the YouTube video id or full url
  postingType?: "Program" | "Internship" | "Event";
  applyUrl?: string;
};

const extractYouTubeId = (s?: string) => {
  if (!s) return null;
  try {
    const url = new URL(s);
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v");
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
  } catch {
    // not a url, maybe id already
  }
  return s;
};

let ytApiLoading: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).YT && (window as any).YT.Player) return Promise.resolve();
  if (ytApiLoading) return ytApiLoading;
  ytApiLoading = new Promise((res) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.onload = () => {
      // API will call onYouTubeIframeAPIReady; we just wait a tick
      const check = () => {
        if ((window as any).YT && (window as any).YT.Player) return res();
        setTimeout(check, 50);
      };
      check();
    };
    document.body.appendChild(tag);
  });
  return ytApiLoading;
}

export const LivePanel: React.FC<LivePanelProps> = ({
  open,
  onClose,
  title,
  description,
  coverImage,
  youtubeId,
  postingType = "Event",
  applyUrl,
}) => {
  const [showDescription, setShowDescription] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const playerRef = useRef<any>(null);
  const playerContainerId = useRef(`yt-player-${Math.random().toString(36).slice(2)}`);
  const [ytReady, setYtReady] = useState(false);

  useEffect(() => {
    if (!open) {
      // reset
      setPlaying(false);
      setShowCTA(false);
      if (playerRef.current && playerRef.current.pauseVideo) {
        try { playerRef.current.pauseVideo(); } catch {}
      }
    }
  }, [open]);

  const id = extractYouTubeId(youtubeId) || undefined;

  const ensurePlayer = async () => {
    if (!id) return;
    await loadYouTubeApi();
    setYtReady(true);
    if ((window as any).YT && !(playerRef.current && playerRef.current.getPlayerState)) {
      // create player
      playerRef.current = new (window as any).YT.Player(playerContainerId.current, {
        videoId: id,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          mute: 1,
        },
        events: {
          onReady: (ev: any) => {
            // start muted autoplay
            try { ev.target.playVideo(); } catch {}
          },
          onStateChange: (ev: any) => {
            // play state - start preview timer
            const YT = (window as any).YT;
            if (ev.data === YT.PlayingEvent) {
              setPlaying(true);
              // preview timer — 30s
              setShowCTA(false);
              setTimeout(() => {
                try { playerRef.current.pauseVideo(); } catch {}
                setShowCTA(true);
              }, 30000);
            } else if (ev.data === YT.PausedEvent || ev.data === YT.EndedEvent) {
              setPlaying(false);
            }
          },
        },
      });
    }
  };

  const handlePlay = async () => {
    if (!id) return;
    await ensurePlayer();
    if (playerRef.current) {
      try {
        // unmute then play
        playerRef.current.unMute();
        playerRef.current.playVideo();
        setPlaying(true);
      } catch (e) {
        setPlaying(true);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center md:items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full md:max-w-5xl mx-auto">
        <div className="bg-white rounded-t-xl md:rounded-xl overflow-hidden md:flex md:flex-row shadow-2xl">
          {/* Left - video */}
          <div className="w-full md:w-1/2 bg-black relative">
            <div className="aspect-video w-full h-full">
              {/* if not playing show cover image with play button */}
              {!playing && (
                <div className="relative w-full h-full bg-gray-900">
                  <img src={coverImage || "/skye8-internship.jpg"} alt="cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button onClick={handlePlay} className="bg-white/90 text-black rounded-full p-4 shadow-lg scale-100 hover:scale-105 transition">
                      Play Live Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Player container (hidden until YT ready or playing) */}
              <div className={`absolute inset-0 ${playing ? "" : "pointer-events-none opacity-0"}`}>
                <div id={playerContainerId.current} className="w-full h-full" />
              </div>
            </div>

            <div className="p-4 md:p-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white md:text-black">{title}</h3>
                <p className="text-sm text-white/90 md:text-gray-600 mt-1">{postingType} • Live</p>
              </div>
              <div className="ml-2">
                <Button className="bg-orange-500" onClick={() => { window.open(applyUrl || "#", "_blank"); }}>
                  Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Right - description */}
          <div className={`w-full md:w-1/2 bg-white p-6 max-h-[70vh] overflow-auto ${showDescription ? "" : "hidden md:block"}`}>
            <h4 className="text-xl font-semibold mb-2">About this {postingType}</h4>
            <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: description || "<p>No description</p>" }} />
          </div>

          {/* Mobile Read more fixed button */}
          <div className="md:hidden absolute left-0 right-0 bottom-0 p-4">
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setShowDescription((s) => !s)} className="w-full bg-white/90 backdrop-blur-sm rounded-full py-3 text-center font-semibold shadow-lg">
                {showDescription ? "Hide details" : "Read more"}
              </button>
            </div>
          </div>
        </div>

        {/* CTA overlay when preview ended */}
        {showCTA && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-xl p-6 pointer-events-auto">
              <div className="text-center text-white">
                <h4 className="text-lg font-semibold mb-2">Join the full live session</h4>
                {postingType === "Event" ? (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => { alert('RSVP confirmed — enjoy!'); onClose(); }}>RSVP & Continue</Button>
                    <Button variant="secondary-outline" onClick={() => onClose()}>Maybe later</Button>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => { alert('Subscribed — thanks!'); onClose(); }}>Subscribe</Button>
                    <Button variant="secondary-outline" onClick={() => onClose()}>Not now</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePanel;
