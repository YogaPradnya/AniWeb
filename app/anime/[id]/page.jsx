"use client";
import { animeApi } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, Star, Calendar, User, Tv, Bookmark, BookmarkCheck, Share2, Info } from "lucide-react";
import { store } from "@/lib/store";

export default function DetailPage({ params }) {
  const id = params.id;
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  const handleBookmark = () => {
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

  if (loading) return <div className="py-32 text-center animate-pulse font-black uppercase tracking-widest text-accent">Loading Anime Detail...</div>;
  if (!anime) return <div className="text-center py-32 text-red-500 font-black uppercase tracking-widest">Anime not found or API error.</div>;

  const coverImage = anime.cover || anime.poster || anime.thumbnail;

  return (
    <div className="relative">
      {/* Background Blur HD */}
      <div 
        className="absolute inset-0 h-[600px] w-full blur-[120px] opacity-30 -z-10 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${coverImage})` }}
      />

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left: Poster & Actions */}
        <div className="flex-shrink-0 w-full lg:w-[400px]">
          <div className="sticky top-28 space-y-8">
            <div className="relative group">
              <img
                src={anime.poster || anime.thumbnail}
                alt={anime.title}
                className="w-full aspect-[2/3] object-cover rounded-[3rem] shadow-hd border border-white/10 transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 rounded-[3rem] ring-1 ring-inset ring-white/20" />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {anime.episodes?.length > 0 && (
                <Link 
                  href={`/watch/${id}/1`}
                  className="w-full py-5 bg-accent-gradient text-white rounded-[2rem] flex items-center justify-center gap-3 font-black hover:scale-[1.02] active:scale-95 transition-all shadow-hd"
                >
                  <Play className="w-6 h-6 fill-white" /> NONTON SEKARANG
                </Link>
              )}
              <div className="flex gap-4">
                <button 
                  onClick={handleBookmark}
                  className={`flex-grow py-4 rounded-[2rem] font-black text-xs flex items-center justify-center gap-2 transition-all border ${isBookmarked ? 'bg-accent border-transparent text-white shadow-hd' : 'bg-card border-black/5 dark:border-white/5 hover:border-accent'}`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-white" /> : <Bookmark className="w-5 h-5" />}
                  {isBookmarked ? 'BOOKMARKED' : 'BOOKMARK'}
                </button>
                <button className="p-4 bg-card border border-black/5 dark:border-white/5 rounded-[2rem] hover:border-accent transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info HD */}
        <div className="flex-grow space-y-12">
          <div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-4 leading-[0.9] italic">
              {anime.title}
            </h1>
            {anime.alternativeTitle && (
              <p className="text-lg text-gray-500 font-bold uppercase tracking-[0.3em] mb-10">
                {anime.alternativeTitle}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Star, label: "Rating", val: `⭐ ${anime.rating || 'N/A'}`, color: "text-yellow-500" },
                { icon: Tv, label: "Status", val: anime.status || 'N/A', color: "text-green-500" },
                { icon: Calendar, label: "Type", val: anime.type || 'N/A', color: "text-blue-500" },
                { icon: User, label: "Author", val: anime.author || 'N/A', color: "text-purple-500" },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-black/5 dark:border-white/5 p-6 rounded-[2rem] shadow-hd-light">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} /> {item.label}
                  </p>
                  <p className="text-lg font-black truncate">{item.val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {anime.genres?.map((g, i) => (
              <span key={i} className="px-6 py-3 bg-accent/5 border border-accent/10 rounded-full text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all cursor-default">
                {g}
              </span>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase italic">
              <div className="w-1.5 h-8 bg-accent rounded-full" />
              Synopsis
            </h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xl font-medium italic">
              "{anime.synopsis || "No synopsis available."}"
            </p>
          </div>

          {/* Episode List HD */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 uppercase italic">
              <div className="w-1.5 h-8 bg-accent rounded-full" />
              Daftar Episode ({anime.episodes?.length || 0})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {anime.episodes?.map((ep, idx) => {
                // Handle both 'episodeNumber' and 'number' field names
                const epNum = ep.episodeNumber || ep.number || (idx + 1);
                return (
                  <Link
                    key={idx}
                    href={`/watch/${id}/${epNum}`}
                    className="group relative bg-card hover:bg-accent-gradient p-6 rounded-[1.5rem] border border-black/5 dark:border-white/5 transition-all duration-500 text-center shadow-hd-light overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="relative z-10 text-sm font-black uppercase tracking-widest group-hover:text-white group-hover:scale-110 transition-transform">EPS {epNum}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
