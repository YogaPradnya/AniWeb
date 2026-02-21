"use client";
import { animeApi } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Play, Star, Calendar, User, Tv, Bookmark, BookmarkCheck, Share2, ChevronDown, Search } from "lucide-react";
import { store } from "@/lib/store";
import ReadMore from "@/components/ReadMore";

export default function DetailPage({ params }) {
  const id = params.id;
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [episodeSearch, setEpisodeSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await animeApi.getDetail(id);
        setAnime(data);
        setIsBookmarked(store.isBookmarked(id));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Handle episode list: filter berdasarkan search dan tampilkan 30 episode terakhir berdasarkan episode number
  // HARUS dipanggil sebelum early return untuk mematuhi Rules of Hooks
  const episodes = useMemo(() => {
    if (!anime?.episodes) return [];
    
    // Sort episodes berdasarkan episode number (dari terbesar ke terkecil untuk ambil yang terakhir)
    const sortedEpisodes = [...anime.episodes].sort((a, b) => {
      const numA = parseInt(a.episodeNumber || a.number || a.episode || 0);
      const numB = parseInt(b.episodeNumber || b.number || b.episode || 0);
      return numB - numA; // Descending order
    });
    
    // Filter berdasarkan search
    let filtered = sortedEpisodes;
    if (episodeSearch.trim()) {
      const searchNum = parseInt(episodeSearch.trim());
      if (!isNaN(searchNum)) {
        filtered = sortedEpisodes.filter(ep => {
          const epNum = parseInt(ep.episodeNumber || ep.number || ep.episode || 0);
          return epNum === searchNum || epNum.toString().includes(searchNum.toString());
        });
      }
    }
    
    // Jika lebih dari 30 dan belum show all, ambil 30 terakhir (berdasarkan episode number tertinggi)
    const totalEpisodes = sortedEpisodes.length;
    if (totalEpisodes > 30 && !showAllEpisodes && !episodeSearch.trim()) {
      return filtered.slice(0, 30); // Ambil 30 teratas (karena sudah sorted descending)
    }
    
    return filtered;
  }, [anime?.episodes, showAllEpisodes, episodeSearch]);
  
  const totalEpisodes = anime?.episodes?.length || 0;
  const lastEpisodeNumber = useMemo(() => {
    if (!anime?.episodes || anime.episodes.length === 0) return 0;
    const sorted = [...anime.episodes].sort((a, b) => {
      const numA = parseInt(a.episodeNumber || a.number || a.episode || 0);
      const numB = parseInt(b.episodeNumber || b.number || b.episode || 0);
      return numB - numA;
    });
    return parseInt(sorted[0]?.episodeNumber || sorted[0]?.number || sorted[0]?.episode || 0);
  }, [anime?.episodes]);
  
  const firstShownEpisodeNumber = useMemo(() => {
    if (episodes.length === 0) return 0;
    return parseInt(episodes[episodes.length - 1]?.episodeNumber || episodes[episodes.length - 1]?.number || episodes[episodes.length - 1]?.episode || 0);
  }, [episodes]);

  const handleBookmark = () => {
    if (!anime) return;
    const status = store.toggleBookmark({
      animeId: id,
      title: anime.title,
      poster: anime.poster,
      cover: anime.cover,
      thumbnail: anime.thumbnail,
      genre: anime.genres?.[0]
    });
    setIsBookmarked(status);
  };

  // Early return SETELAH semua hooks dipanggil
  if (loading) return <div className="py-32 text-center animate-pulse font-black uppercase tracking-widest text-accent">Loading Anime Detail...</div>;
  if (!anime) return <div className="text-center py-32 text-red-500 font-black uppercase tracking-widest">Anime not found or API error.</div>;

  const coverImage = anime.cover || anime.poster || anime.thumbnail;

  return (
    <div className="relative px-4 sm:px-6 lg:px-8">
      {/* Background Blur HD */}
      <div 
        className="absolute inset-0 h-[400px] sm:h-[500px] lg:h-[600px] w-full blur-[120px] opacity-30 -z-10 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${coverImage})` }}
      />

      <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16">
        {/* Left: Poster & Actions */}
        <div className="flex-shrink-0 w-full lg:w-[300px] xl:w-[400px]">
          <div className="sticky top-24 sm:top-28 space-y-6 sm:space-y-8">
            <div className="relative group">
              <img
                src={anime.poster || anime.thumbnail}
                alt={anime.title}
                className="w-full max-w-[280px] mx-auto lg:max-w-none aspect-[2/3] object-cover rounded-2xl sm:rounded-3xl shadow-hd border border-white/10 transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-inset ring-white/20" />
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {anime.episodes?.length > 0 && (
                <Link 
                  href={`/watch/${id}/${lastEpisodeNumber || 1}`}
                  className="w-full py-4 sm:py-5 bg-accent-gradient text-white rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 font-black text-xs sm:text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-hd"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" /> <span className="hidden sm:inline">NONTON </span>SEKARANG
                </Link>
              )}

              <div className="flex gap-3 sm:gap-4">
                <button 
                  onClick={handleBookmark}
                  className={`flex-grow py-3 sm:py-4 rounded-xl sm:rounded-2rem font-black text-[10px] sm:text-xs flex items-center justify-center gap-2 transition-all border ${isBookmarked ? 'bg-accent border-transparent text-white shadow-hd' : 'bg-card border-black/5 dark:border-white/5 hover:border-accent'}`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-white" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
                  <span className="hidden sm:inline">{isBookmarked ? 'BOOKMARKED' : 'BOOKMARK'}</span>
                  <span className="sm:hidden">{isBookmarked ? 'SAVED' : 'SAVE'}</span>
                </button>
                <button className="p-3 sm:p-4 bg-card border border-black/5 dark:border-white/5 rounded-xl sm:rounded-2rem hover:border-accent transition-all">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info HD */}
        <div className="flex-grow space-y-8 sm:space-y-10 lg:space-y-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter mb-3 sm:mb-4 leading-[0.9] italic break-words">
              {anime.title}
            </h1>
            {anime.alternativeTitle && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-500 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-6 sm:mb-8 lg:mb-10 break-words">
                {anime.alternativeTitle}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {[
                { icon: Star, label: "Rating", val: `⭐ ${anime.rating || 'N/A'}`, color: "text-yellow-500" },
                { icon: Tv, label: "Status", val: anime.status || 'N/A', color: "text-green-500" },
                { icon: Calendar, label: "Type", val: anime.type || 'N/A', color: "text-blue-500" },
                { icon: User, label: "Author", val: anime.author || 'N/A', color: "text-purple-500" },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-black/5 dark:border-white/5 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl shadow-hd-light">
                  <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                    <item.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${item.color}`} /> <span className="truncate">{item.label}</span>
                  </p>
                  <p className="text-sm sm:text-base lg:text-lg font-black truncate">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {anime.genres?.map((g, i) => (
              <span key={i} className="px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-3 bg-accent/5 border border-accent/10 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all cursor-default">
                {g}
              </span>
            ))}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 sm:gap-3 uppercase italic">
              <div className="w-1 h-6 sm:w-1.5 sm:h-8 bg-accent rounded-full" />
              Synopsis
            </h3>
            <ReadMore text={anime.synopsis} maxLength={200} />
          </div>

          {/* Episode List HD */}
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 sm:gap-3 uppercase italic">
                <div className="w-1 h-6 sm:w-1.5 sm:h-8 bg-accent rounded-full" />
                Daftar Episode ({totalEpisodes})
              </h2>
              {totalEpisodes > 30 && !showAllEpisodes && !episodeSearch.trim() && (
                <div className="text-xs sm:text-sm font-bold text-gray-400">
                  Menampilkan episode {firstShownEpisodeNumber}-{lastEpisodeNumber}
                </div>
              )}
            </div>

            {/* Episode Search */}
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={episodeSearch}
                onChange={(e) => setEpisodeSearch(e.target.value)}
                placeholder="Cari episode (contoh: 1105)"
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-card border-2 border-black/5 dark:border-white/5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-accent transition-all"
              />
              {episodeSearch.trim() && (
                <button
                  onClick={() => setEpisodeSearch("")}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-accent transition-colors text-[10px] sm:text-xs font-black uppercase"
                >
                  Clear
                </button>
              )}
            </div>
            
            {episodes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
                {episodes.map((ep, idx) => {
                  // Handle both 'episodeNumber' and 'number' field names
                  const epNum = ep.episodeNumber || ep.number || ep.episode || (idx + 1);
                  // Key harus unique, gunakan episode number atau index
                  const uniqueKey = ep.episodeNumber || ep.number || ep.episode || `ep-${idx}`;
                  return (
                    <Link
                      key={uniqueKey}
                      href={`/watch/${id}/${epNum}`}
                      className="group relative bg-card hover:bg-accent-gradient p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl border border-black/5 dark:border-white/5 transition-all duration-500 text-center shadow-hd-light overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="relative z-10 text-xs sm:text-sm font-black uppercase tracking-widest group-hover:text-white group-hover:scale-110 transition-transform">EPS {epNum}</p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                  {episodeSearch.trim() ? `Episode "${episodeSearch}" tidak ditemukan` : "Tidak ada episode"}
                </p>
              </div>
            )}

            {/* View More Button */}
            {totalEpisodes > 30 && !showAllEpisodes && !episodeSearch.trim() && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowAllEpisodes(true)}
                  className="flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-accent-gradient text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-hd"
                >
                  <span className="hidden sm:inline">View More Episodes </span><span className="sm:hidden">More</span> ({totalEpisodes - 30})
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}

            {showAllEpisodes && totalEpisodes > 30 && !episodeSearch.trim() && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => {
                    setShowAllEpisodes(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-card border border-black/5 dark:border-white/5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:border-accent transition-all"
                >
                  <span className="hidden sm:inline">Show Less (Episode {firstShownEpisodeNumber}-{lastEpisodeNumber})</span>
                  <span className="sm:hidden">Show Less</span>
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
