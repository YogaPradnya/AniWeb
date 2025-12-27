"use client";
import { useState, useEffect } from "react";
import { Download, Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { animeApi } from "@/lib/api";
import { store } from "@/lib/store";

export default function VideoPlayer({ episode, anime, animeId, epNum }) {
  const [selectedQuality, setSelectedQuality] = useState(episode.videoSources?.[0]);
  const [downloading, setDownloading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setSelectedQuality(episode.videoSources?.[0]);
    setIsBookmarked(store.isBookmarked(animeId));
    // Add to history automatically
    if (anime) {
      store.addHistory({
        animeId,
        title: anime.title,
        poster: anime.poster,
        cover: anime.cover,
        thumbnail: anime.thumbnail,
        genre: anime.genres?.[0]
      }, epNum);
    }
  }, [episode, animeId, anime, epNum]);

  const handleBookmark = () => {
    const status = store.toggleBookmark({
      animeId,
      title: anime.title,
      poster: anime.poster,
      cover: anime.cover,
      thumbnail: anime.thumbnail,
      genre: anime.genres?.[0]
    });
    setIsBookmarked(status);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const data = await animeApi.getDownload(animeId, epNum, selectedQuality?.resolution);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (e) {
      alert("Gagal mengambil link download");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-black aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 relative group">
        {selectedQuality ? (
          <video
            key={selectedQuality.url}
            src={decodeURIComponent(selectedQuality.url)}
            controls
            autoPlay
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 font-bold uppercase tracking-widest text-xs">
            Video source not found.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-card border border-black/5 dark:border-white/5 rounded-[2rem]">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all ${isBookmarked ? 'bg-accent text-white shadow-hd' : 'bg-black/5 dark:bg-white/5 hover:bg-accent hover:text-white'}`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-white" /> : <Bookmark className="w-4 h-4" />}
            {isBookmarked ? 'BOOKMARKED' : 'BOOKMARK'}
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 rounded-2xl font-black text-xs hover:bg-accent hover:text-white transition-all">
            <Share2 className="w-4 h-4" /> SHARE
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-2">
            {episode.videoSources?.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedQuality(v)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                  selectedQuality?.resolution === v.resolution
                    ? "bg-accent border-transparent text-white shadow-hd"
                    : "bg-transparent border-black/10 dark:border-white/10 text-gray-500 hover:border-accent"
                }`}
              >
                {v.resolution}
              </button>
            ))}
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-8 py-3 bg-accent-gradient rounded-2xl font-black text-xs text-white shadow-hd hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> {downloading ? "PROCESSING..." : "DOWNLOAD"}
          </button>
        </div>
      </div>
    </div>
  );
}
