"use client";
import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { store } from "@/lib/store";

export default function VideoPlayer({ episode, anime, animeId, epNum, selectedQuality }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentTimeRef = useRef(0); // Store current play time

  // Handle Video Loading with HLS support and Time Persistence
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedQuality?.url) return;

    setIsLoading(true);
    setError(null);

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
      setIsLoading(false);
      video.play().catch(e => console.warn("[VideoPlayer] Auto-play prevented:", e));
    };

    if (streamUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({ 
          startLevel: -1, 
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          manifestLoadingTimeOut: 10000,
          levelLoadingTimeOut: 10000,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 5,
          levelLoadingMaxRetry: 5,
          manifestLoadingMaxRetry: 5,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
        
        hls.on(Hls.Events.MANIFEST_PARSED, resumeAtSavedTime);
        hls.on(Hls.Events.FRAG_BUFFERED, () => setIsLoading(false));
        
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("[VideoPlayer] Network error, trying to recover...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("[VideoPlayer] Media error, trying to recover...");
                hls.recoverMediaError();
                break;
              default:
                console.error("[VideoPlayer] Fatal error, destroying and falling back to native...");
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

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleError = (e) => {
      console.warn("[VideoPlayer] native video failed to load:", selectedQuality.url);
      setIsLoading(false);
      setError("Gagal memuat video.");
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video && video.currentTime > 0) {
        currentTimeRef.current = video.currentTime;
      }
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
    };
  }, [selectedQuality]);

  return (
    <div className="bg-black aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 relative group">
      {!selectedQuality ? (
        <div className="flex items-center justify-center h-full text-gray-500 font-bold uppercase tracking-widest text-xs font-mono">
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
        <>
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
               <div className="w-12 h-12 border-4 border-[#9933FF]/20 border-t-[#9933FF] rounded-full animate-spin mb-4" />
               <p className="text-[#9933FF] font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Buffering...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
               <p className="text-red-500 font-black text-xs uppercase tracking-widest mb-4">{error}</p>
               <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-bold text-white transition-all border border-white/10"
               >
                 COBA LAGI
               </button>
            </div>
          )}

          <video
            ref={videoRef}
            controls
            playsInline
            preload="auto"
            className="w-full h-full"
          />
        </>
      )}
    </div>
  );
}
