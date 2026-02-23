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
      // Aggressive play start
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("[VideoPlayer] Auto-play prevented, waiting for interaction:", e);
          // Fallback: stay on loading OR show a big play button
          setIsLoading(false);
        });
      }
    };

    if (streamUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({ 
          startLevel: 0, // FORCE START AT LOWEST QUALITY FOR INSTANT PLAY
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          maxBufferLength: 5, // Small buffer to start ASAP
          maxMaxBufferLength: 10,
          maxBufferSize: 30 * 1000 * 1000,
          manifestLoadingTimeOut: 5000,
          levelLoadingTimeOut: 5000,
          fragLoadingTimeOut: 10000,
          fragLoadingMaxRetry: 10,
          levelLoadingMaxRetry: 10,
          manifestLoadingMaxRetry: 10,
          startFragPrefetch: true,
          testBandwidth: false,
          maxBufferHole: 0.5,
          nudgeOffset: 0.1,
          nudgeMaxRetry: 10,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          // Immediately try to play as soon as manifest is ready
          resumeAtSavedTime();
        });

        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (isLoading) setIsLoading(false);
        });
        
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("[VideoPlayer] Network fatal, recovering...");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("[VideoPlayer] Media fatal, recovering...");
                hls.recoverMediaError();
                break;
              default:
                console.error("[VideoPlayer] Unrecoverable error, switching to native source");
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
    const handleCanPlay = () => {
      setIsLoading(false);
      video.play().catch(() => {});
    };
    const handleError = (e) => {
      console.warn("[VideoPlayer] native video failed to load:", selectedQuality.url);
      setIsLoading(false);
      setError("Gagal memuat video.");
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);
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
      video.removeEventListener('canplay', handleCanPlay);
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
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300 pointer-events-none">
               <div className="w-10 h-10 border-4 border-[#9933FF]/20 border-t-[#9933FF] rounded-full animate-spin mb-3" />
               <p className="text-[#9933FF] font-black text-[9px] uppercase tracking-[0.3em] animate-pulse">Fast Loading...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
               <p className="text-red-500 font-black text-xs uppercase tracking-widest mb-4">{error}</p>
               <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#9933FF] hover:opacity-90 rounded-full text-[10px] font-bold text-white transition-all shadow-lg"
               >
                 COBA LAGI
               </button>
            </div>
          )}

          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            muted={false}
            className="w-full h-full object-contain"
          />
        </>
      )}
    </div>
  );
}
