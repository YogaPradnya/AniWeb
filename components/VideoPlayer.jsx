"use client";
import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { store } from "@/lib/store";

export default function VideoPlayer({ episode, anime, animeId, epNum, selectedQuality }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const currentTimeRef = useRef(0); // Store current play time

  // Handle Video Loading with HLS support and Time Persistence
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedQuality?.url) return;

    // Save current time before switching
    if (video.currentTime > 0 && !video.ended) {
      currentTimeRef.current = video.currentTime;
    }

    const streamUrl = selectedQuality.url.trim().replace(/ /g, "%20");
    console.log("[VideoPlayer] Source:", streamUrl);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();

    const needsProxy = !streamUrl.includes(".m3u8") && 
                       !selectedQuality.url.includes('embed') && 
                       !selectedQuality.url.includes('iframe') && 
                       selectedQuality.type !== 'iframe' && 
                       !selectedQuality.url.includes('nanifile') && 
                       !selectedQuality.url.includes('uservideo') &&
                       (streamUrl.includes('animein.net') || streamUrl.includes('storages'));

    const finalUrl = needsProxy 
      ? `/api/proxy/media?url=${encodeURIComponent(streamUrl)}` 
      : streamUrl;

    const resumeAtSavedTime = () => {
      if (currentTimeRef.current > 0) {
        video.currentTime = currentTimeRef.current;
      }
      video.play().catch(e => console.warn("[VideoPlayer] Auto-play prevented:", e));
    };

    if (streamUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({ startLevel: -1, enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
        hls.on(Hls.Events.MANIFEST_PARSED, resumeAtSavedTime);
        
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                video.src = finalUrl;
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.onloadedmetadata = resumeAtSavedTime;
      }
    } else {
      video.src = finalUrl;
      video.onloadedmetadata = resumeAtSavedTime;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video && video.currentTime > 0) {
        currentTimeRef.current = video.currentTime;
      }
    };
  }, [selectedQuality]);

  return (
    <div className="bg-black aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 relative">
      {!selectedQuality ? (
        <div className="flex items-center justify-center h-full text-gray-500 font-bold uppercase tracking-widest text-xs">
          Video source tidak ditemukan.
        </div>
      ) : selectedQuality.url.includes('embed') || selectedQuality.url.includes('iframe') || selectedQuality.type === 'iframe' || selectedQuality.url.includes('nanifile') || selectedQuality.url.includes('uservideo') ? (
        <iframe
          src={selectedQuality.url}
          className="w-full h-full border-0"
          allowFullScreen
          scrolling="no"
        />
      ) : (
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-full h-full"
          onError={(e) => {
            console.warn("[VideoPlayer] native video failed to load:", selectedQuality.url);
          }}
        />
      )}
    </div>
  );
}
