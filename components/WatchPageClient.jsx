"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import Image from "next/image";
import { capitalizeWords, fixImageUrl } from "@/lib/utils";
import { store } from "@/lib/store";

export default function WatchPageClient({ episodeData, anime, id, ep, sortedEps }) {
  const [selectedQuality, setSelectedQuality] = useState(episodeData.videoSources?.[0]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsBookmarked(store.isBookmarked(id));
    if (anime) {
      store.addHistory(
        {
          animeId: id,
          title: anime.title,
          poster: anime.poster || anime.image_poster,
          cover: anime.cover || anime.image_cover,
          thumbnail: anime.thumbnail,
          genre: anime.genres?.[0],
        },
        ep
      );
    }
  }, [id, anime, ep]);

  const handleBookmark = () => {
    const status = store.toggleBookmark({
      animeId: id,
      title: anime.title,
      poster: anime.poster || anime.image_poster,
      cover: anime.cover || anime.image_cover,
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
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        alert("Link disalin!");
      });
    }
  };

  const hasNext = sortedEps.findIndex(e => String(e.episodeNumber || e.number || "") === String(ep)) !== -1 && 
                  sortedEps.findIndex(e => String(e.episodeNumber || e.number || "") === String(ep)) < sortedEps.length - 1;
  const currentIdx = sortedEps.findIndex(e => String(e.episodeNumber || e.number || "") === String(ep));
  const nextEpNum = hasNext ? sortedEps[currentIdx + 1]?.episodeNumber || sortedEps[currentIdx + 1]?.number : parseInt(ep) + 1;
  const hasPrev = parseInt(ep) > 1;

  // Group sources by Server
  const groupedSources = episodeData.videoSources?.reduce((acc, src) => {
    const server = src.server || src.name || "Default";
    if (!acc[server]) acc[server] = [];
    acc[server].push(src);
    return acc;
  }, {}) || {};

  return (
    <div className="relative flex flex-col xl:flex-row gap-6 lg:gap-8">
      {/* 1. LAYER BANNER BACKGROUND (Menggunakan 'cover' Landscape) */}
      {anime && (
        <div className="absolute inset-0 -z-10 w-full h-[30vh] lg:h-[40vh] pointer-events-none overflow-hidden rounded-[2rem]">
          <Image
            src={fixImageUrl(anime.cover || anime.image_cover || anime.poster || anime.image_poster || anime.thumbnail)}
            alt={`${anime.title} Cover`}
            fill
            className="object-cover opacity-20 blur-sm brightness-50"
            priority
            unoptimized
          />
          {/* Gradien pemisah antara Banner dan bawah halaman */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-transparent" />
        </div>
      )}

      {/* ─── LEFT: MAIN PLAYER AREA ─── */}
      <div className="flex-1 min-w-0 space-y-4 lg:space-y-6">
        
        {/* Header Info */}
        <div className="bg-[#1B1B1B] p-5 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-white/5 shadow-hd-light">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {anime && (
                <Link
                  href={`/anime/${id}`}
                  className="inline-flex items-center gap-2 text-[10px] lg:text-xs font-bold text-[#9933FF] hover:text-white transition-colors mb-1.5 lg:mb-2"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back to {anime.title}
                </Link>
              )}
              <h1 className="text-xl lg:text-3xl font-black text-white leading-tight">
                {capitalizeWords(episodeData.title || `Episode ${ep}`)}
              </h1>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2.5 lg:gap-3 shrink-0">
              {hasPrev ? (
                <Link
                  href={`/watch/${id}/${parseInt(ep) - 1}`}
                  className="flex items-center justify-center w-9 h-9 lg:w-11 lg:h-11 bg-[#262626] hover:bg-white/10 border border-white/5 rounded-full text-white transition-colors"
                  title="Previous Episode"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </Link>
              ) : (
                <div className="w-9 h-9 lg:w-11 lg:h-11 flex items-center justify-center bg-[#262626]/50 rounded-full text-white/20 border border-white/5 cursor-not-allowed">
                  <ChevronLeft className="w-4.5 h-4.5" />
                </div>
              )}
              
              {hasNext ? (
                <Link
                  href={`/watch/${id}/${nextEpNum}`}
                  className="flex items-center gap-2 px-5 lg:px-7 h-9 lg:h-11 bg-[#9933FF] hover:opacity-90 active:scale-95 text-white font-bold text-xs lg:text-sm tracking-wide rounded-full shadow-[0_5px_15px_rgba(153,51,255,0.3)] transition-all shrink-0"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-5 lg:px-7 h-9 lg:h-11 bg-[#262626]/50 text-white/30 border border-white/5 font-bold text-xs lg:text-sm tracking-wide rounded-full cursor-not-allowed shrink-0">
                  Next <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Player & Interaction Bar */}
        <div className="space-y-4">
          <VideoPlayer 
            episode={episodeData} 
            anime={anime} 
            animeId={id} 
            epNum={ep} 
            selectedQuality={selectedQuality}
          />
          
          {/* Interaction Bar below Video */}
          <div className="flex items-center justify-between p-4 lg:p-6 bg-[#1B1B1B] border border-white/5 rounded-[1.5rem] lg:rounded-[2rem] shadow-hd-light">
            <div className="flex items-center gap-2.5 lg:gap-4">
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3.5 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs transition-all ${
                  isBookmarked
                    ? "bg-[#9933FF] text-white shadow-hd"
                    : "bg-white/5 hover:bg-[#9933FF] hover:text-white"
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
                className="flex items-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3.5 bg-white/5 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs hover:bg-[#9933FF] hover:text-white transition-all text-white/70"
              >
                <Share2 className="w-4 h-4" /> SHARE
              </button>
            </div>

            <div className="hidden md:flex items-center gap-3 pr-2">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Server:</span>
               <div className="flex items-center gap-2 px-3 py-1 bg-[#9933FF]/10 rounded-lg border border-[#9933FF]/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9933FF] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#9933FF] uppercase">{selectedQuality?.server || selectedQuality?.name || "Default"}</span>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─── RIGHT SIDEBAR (Anime Info, Episodes & Quality Selection) ─── */}
      <div className="w-full xl:w-[360px] shrink-0 space-y-6">
        
        {/* Sidebar Container */}
        <div className="bg-[#1B1B1B] p-5 lg:p-7 rounded-[1.5rem] lg:rounded-[2rem] border border-white/5 shadow-hd-light space-y-8 lg:sticky lg:top-6">
          
          {/* Anime Mini Card */}
          {anime && (
            <div className="flex gap-4 p-1.5">
              <Link href={`/anime/${id}`} className="shrink-0 group">
                <img
                  src={fixImageUrl(anime.image_poster || anime.poster || anime.thumbnail)}
                  alt={anime.title}
                  className="w-20 lg:w-24 h-28 lg:h-32 object-cover rounded-xl shadow-hd border border-white/10 group-hover:ring-2 ring-[#9933FF] transition-all"
                />
              </Link>
              <div className="flex-1 space-y-2">
                <Link href={`/anime/${id}`}>
                  <h2 className="text-sm font-black text-white hover:text-[#9933FF] transition-colors line-clamp-2 leading-snug">
                    {anime.title}
                  </h2>
                </Link>
                <div className="flex flex-col gap-1 text-[10px] lg:text-[11px] font-medium text-gray-400">
                  <p><span className="text-gray-500">Status:</span> <span className="text-green-500">{anime.status}</span></p>
                  <p><span className="text-gray-500">Format:</span> {anime.type || "TV"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Episode Selection */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-3.5 bg-[#9933FF] rounded-full" />
                Episodes
              </h3>
              <span className="text-[10px] font-bold text-[#9933FF] bg-[#9933FF]/10 px-2 py-0.5 rounded-md">
               {sortedEps.length} Total
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1 pb-1">
              {sortedEps.map((e, i) => {
                const epNum = e.episodeNumber || e.number || (i + 1);
                const isActive = String(epNum) === String(ep);
                return (
                  <Link
                    key={epNum}
                    href={`/watch/${id}/${epNum}`}
                    prefetch={false}
                    className={`flex items-center justify-center aspect-square rounded-lg text-xs font-bold transition-all border ${
                      isActive
                        ? "bg-[#9933FF] text-white border-transparent shadow-[0_0_12px_rgba(153,51,255,0.4)]"
                        : "bg-[#262626] text-gray-400 hover:text-white border-white/5 hover:border-white/20"
                    }`}
                  >
                    {epNum}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Server & Quality Selection (Pindahkan ke sini) */}
          <div className="space-y-4 pt-6 border-t border-white/5">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                   <span className="w-1 h-3.5 bg-blue-500 rounded-full" />
                   Server & Resolusi
                </h3>
             </div>
             
             <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 lg:pr-2 custom-scrollbar">
                {Object.entries(groupedSources).map(([serverName, sources]) => {
                  const isServerActive = sources.some(s => s === selectedQuality);
                  return (
                    <div 
                      key={serverName} 
                      className={`space-y-2.5 p-3 lg:p-4 rounded-2xl border transition-all group ${
                        isServerActive 
                          ? "bg-[#9933FF]/5 border-[#9933FF]/30 shadow-[0_0_20px_rgba(153,51,255,0.1)]" 
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      }`}
                    >
                       <div className="flex items-center justify-between px-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                            isServerActive ? "text-[#9944FF]" : "text-gray-400 group-hover:text-white"
                          }`}>
                            {serverName}
                          </span>
                          {isServerActive && (
                            <div className="flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#9933FF] shadow-[0_0_8px_#9933FF] animate-pulse" />
                               <span className="text-[9px] font-black text-[#9933FF] uppercase tracking-wider">SEDANG DIPUTAR</span>
                            </div>
                          )}
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          {sources.map((v, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedQuality(v)}
                              className={`py-2.5 rounded-xl text-[10px] font-black transition-all border ${
                                selectedQuality === v
                                  ? "bg-[#9933FF] border-transparent text-white shadow-[0_8px_15px_rgba(153,51,255,0.4)] scale-[1.02]"
                                  : "bg-[#2A2A2A] border-white/5 text-gray-400 hover:text-white hover:border-white/20 hover:bg-[#333]"
                              }`}
                            >
                              {v.resolution || v.quality || "DIRECT"}
                            </button>
                          ))}
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
