"use client";
import { animeApi } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Play, Star, Calendar, User, Tv, Bookmark, BookmarkCheck, Share2, ChevronDown, Search, Heart, Clock } from "lucide-react";
import { store } from "@/lib/store";

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

  const episodes = useMemo(() => {
    if (!anime?.episodes) return [];
    
    const sortedEpisodes = [...anime.episodes].sort((a, b) => {
      const numA = parseInt(a.episodeNumber || a.number || a.episode || 0);
      const numB = parseInt(b.episodeNumber || b.number || b.episode || 0);
      return numB - numA;
    });
    
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
    
    const totalEpisodes = sortedEpisodes.length;
    if (totalEpisodes > 30 && !showAllEpisodes && !episodeSearch.trim()) {
      return filtered.slice(0, 30);
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

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-pulse w-10 h-10 border-4 border-[#9933FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!anime) return (
    <div className="text-center py-32 text-red-500 font-black uppercase tracking-widest bg-[#1B1B1B] rounded-3xl">
      Anime not found or API error.
    </div>
  );

  const coverImage = anime.cover || anime.poster || anime.thumbnail || "https://fakeimg.pl/800x400/1B1B1B/909090";
  const posterImage = anime.poster || anime.thumbnail || coverImage;

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* ─── LEFT: MAIN CONTENT ─── */}
      <div className="flex-1 space-y-10">
        
        {/* Banner Card */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[16/6] bg-[#1B1B1B] rounded-[2rem] overflow-hidden group border border-white/5 shadow-hd-light">
          <div 
            className="absolute inset-0 bg-cover bg-top opacity-30 transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url(${coverImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-[#1B1B1B]/80 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-end">
            <img 
              src={posterImage} 
              alt={anime.title} 
              className="w-32 h-44 sm:w-40 sm:h-56 object-cover rounded-2xl shadow-hd border-2 border-white/10 shrink-0 hidden md:block" 
            />
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {anime.genres?.slice(0, 3).map((g, i) => (
                  <span key={i} className="px-3 py-1 bg-[#9933FF] text-white text-[10px] font-bold uppercase rounded-full">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                {anime.title}
              </h1>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> {anime.rating || 'N/A'}</span>
                <span className="flex items-center gap-1"><Tv className="w-4 h-4"/> {anime.status}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {anime.type || 'TV'}</span>
              </div>
            </div>
            
            <div className="flex shrink-0 gap-3">
              <button 
                onClick={handleBookmark}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isBookmarked ? 'bg-white text-[#9933FF]' : 'bg-[#262626] text-white hover:bg-white/10'}`}
              >
                {isBookmarked ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
              </button>
              {anime.episodes?.length > 0 && (
                <Link 
                  href={`/watch/${id}/${firstShownEpisodeNumber || 1}`}
                  className="bg-[#9933FF] hover:opacity-90 active:scale-95 text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 shadow-[0_5px_15px_rgba(153,51,255,0.3)] transition-all"
                >
                  <Play className="w-4 h-4 fill-white" /> Stream
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Synopsis & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-black text-white">Synopsis</h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {anime.synopsis || "No synopsis available."}
            </p>
          </div>
          <div className="bg-[#1B1B1B] p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Details</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 font-medium">Alternative</span>
                <span className="text-white font-bold text-right max-w-[60%] truncate" title={anime.alternativeTitle}>{anime.alternativeTitle || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 font-medium">Author</span>
                <span className="text-white font-bold">{anime.author || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 font-medium">Total Episodes</span>
                <span className="text-[#9933FF] font-black">{totalEpisodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="text-green-500 font-bold uppercase text-xs">{anime.status || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes */}
        <div className="bg-[#1B1B1B] p-6 sm:p-8 rounded-[2rem] border border-white/5">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
             <div>
               <h2 className="text-2xl font-black text-white">Episodes</h2>
               <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
                  List of all {totalEpisodes} available episodes
               </p>
             </div>
             
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                  placeholder="Find episode..."
                  className="w-full bg-[#262626] border border-white/5 text-sm text-white rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[#9933FF] transition-all placeholder:text-gray-500"
                />
             </div>
           </div>

           {episodes.length > 0 ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
               {episodes.map((ep, idx) => {
                 const epNum = ep.episodeNumber || ep.number || ep.episode || (idx + 1);
                 return (
                   <Link
                     key={epNum}
                     href={`/watch/${id}/${epNum}`}
                     className="group flex flex-col items-center justify-center bg-[#262626] hover:bg-[#9933FF] border border-white/5 p-4 rounded-xl transition-colors duration-300"
                   >
                     <span className="text-xs text-gray-400 hover:text-white group-hover:text-white/80 font-medium uppercase tracking-widest mb-1">
                       Episode
                     </span>
                     <span className="text-lg font-black text-white">
                       {epNum}
                     </span>
                     {ep.isNew && (
                       <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                     )}
                   </Link>
                 );
               })}
             </div>
           ) : (
             <div className="py-12 text-center text-gray-500 font-bold bg-[#262626] rounded-2xl">
                No episodes found matching "{episodeSearch}".
             </div>
           )}

           {totalEpisodes > 30 && !showAllEpisodes && !episodeSearch.trim() && (
             <div className="flex justify-center mt-8">
               <button
                 onClick={() => setShowAllEpisodes(true)}
                 className="bg-[#262626] text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5"
               >
                 Show More <ChevronDown className="w-4 h-4" />
               </button>
             </div>
           )}
        </div>

      </div>

      {/* ─── RIGHT SIDEBAR (Mini Recommendation or Top List) ─── */}
      <div className="w-full xl:w-[300px] flex-shrink-0 flex flex-col gap-6">
        <div className="bg-[#1B1B1B] rounded-[2rem] p-6 border border-white/5 sticky top-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Related Anime</h3>
          <p className="text-xs text-gray-500 mb-6 font-medium">Coming soon in next update. Stay tuned for personalized recommendations.</p>
          
          <div className="space-y-4">
            {/* Placeholder items */}
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-14 h-16 bg-[#262626] rounded-xl" />
                <div className="flex-1 py-1 space-y-2">
                  <div className="w-3/4 h-3 bg-[#262626] rounded" />
                  <div className="w-1/2 h-2 bg-[#262626] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
