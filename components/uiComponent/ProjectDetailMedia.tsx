"use client";

import React, { useState } from "react";

interface Props {
  uploadedVideo?: string | null;
  youtubeVideo?: string | null;
  coverImage?: string | null;
  title?: string;
}

export default function ProjectDetailMedia({ uploadedVideo, youtubeVideo, coverImage, title }: Props) {
  const videos: Array<{ type: "uploaded" | "youtube"; url: string }> = [];
  if (uploadedVideo) videos.push({ type: "uploaded", url: uploadedVideo });
  if (youtubeVideo) videos.push({ type: "youtube", url: youtubeVideo });

  const [index, setIndex] = useState(0);
  const current = videos.length > 0 ? videos[index] : null;

  const getYouTubeEmbed = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
    } catch (e) {
      return null;
    }
  };

  const prev = () => setIndex((i) => (i - 1 + videos.length) % videos.length);
  const next = () => setIndex((i) => (i + 1) % videos.length);

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {!current ? (
          // show cover
          (coverImage ? (
            // use native img for signed urls
            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <div className="text-center">
                <div className="text-lg font-bold">{title || "Project"}</div>
              </div>
            </div>
          ))
        ) : current.type === "youtube" ? (
          (() => {
            const emb = getYouTubeEmbed(current.url);
            return emb ? (
              <iframe src={emb} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <div className="w-full h-full flex items-center justify-center">Invalid Youtube link</div>
            );
          })()
        ) : (
          <video src={current.url} className="w-full h-full" controls />
        )}

        {videos.length > 0 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
              {videos.length > 1 && (
                <>
                  <button onClick={prev} className="pointer-events-auto bg-white/90 p-2 rounded-full shadow">◀</button>
                  <button onClick={next} className="pointer-events-auto bg-white/90 p-2 rounded-full shadow">▶</button>
                </>
              )}
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {videos.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
