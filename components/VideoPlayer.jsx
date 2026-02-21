"use client";
import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { store } from "@/lib/store";

export default function VideoPlayer({ episode, anime, animeId, epNum }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [selectedQuality, setSelectedQuality] = useState(episode.videoSources?.[0]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setSelectedQuality(episode.videoSources?.[0]);
    setIsBookmarked(store.isBookmarked(animeId));
    // Auto-add to history
    if (anime) {
      store.addHistory(
        {
          animeId,
          title: anime.title,
          poster: anime.poster,
          cover: anime.cover,
          thumbnail: anime.thumbnail,
          genre: anime.genres?.[0],
        },
        epNum
      );
    }
  }, [episode, animeId, anime, epNum]);

  // Handle Video Loading with HLS support
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedQuality?.url) return;

    // Ensure URL is properly formatted for browser (handle literal spaces etc.)
    let streamUrl = selectedQuality.url;
    if (streamUrl.includes(" ")) {
      streamUrl = streamUrl.replace(/ /g, "%20");
    }
    
    // Log for debugging (remove in production)
    console.log("[VideoPlayer] Loading source:", streamUrl);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (streamUrl.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          startLevel: -1,
          capLevelToPlayerSize: true,
          // Add some retry logic for unstable streams
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native support (Safari)
        video.src = streamUrl;
      }
    } else {
      // Direct MP4 or other formats
      video.src = streamUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedQuality]);

  const handleBookmark = () => {
    const status = store.toggleBookmark({
      animeId,
      title: anime.title,
      poster: anime.poster,
      cover: anime.cover,
      thumbnail: anime.thumbnail,
      genre: anime.genres?.[0],
    });
    setIsBookmarked(status);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: anime?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Link disalin ke clipboard!");
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="bg-black aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 relative">
        {selectedQuality ? (
          <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            crossOrigin="anonymous"
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 font-bold uppercase tracking-widest text-xs">
            Video source tidak ditemukan.
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-card border border-black/5 dark:border-white/5 rounded-[2rem]">
        {/* Left: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
              isBookmarked
                ? "bg-accent text-white shadow-hd"
                : "bg-black/5 dark:bg-white/5 hover:bg-accent hover:text-white"
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-white" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isBookmarked ? "BOOKMARKED" : "BOOKMARK"}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3 bg-black/5 dark:bg-white/5 rounded-2xl font-black text-xs hover:bg-accent hover:text-white transition-all"
          >
            <Share2 className="w-4 h-4" /> SHARE
          </button>
        </div>

        {/* Right: Quality Selector */}
        {episode.videoSources && episode.videoSources.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest self-center mr-1">
              Kualitas:
            </span>
            {episode.videoSources.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedQuality(v)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                  selectedQuality === v
                    ? "bg-accent border-transparent text-white shadow-hd"
                    : "bg-transparent border-black/10 dark:border-white/10 text-gray-500 hover:border-accent"
                }`}
              >
                {v.resolution || v.quality}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Episode Info */}
      {episode.resolutions && episode.resolutions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest self-center">Tersedia:</span>
          {episode.resolutions.map((r, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-accent/5 border border-accent/10 rounded-full text-[9px] font-black uppercase tracking-widest text-accent"
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
