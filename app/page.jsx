import { animeApi } from "@/lib/api";
import Link from "next/link";
import { Play, Star, Search, Bell } from "lucide-react";

export const revalidate = 600; // 10 menit cache

export default async function Home() {
  const [trending, latest, newAnime] = await Promise.all([
    animeApi.getTrending(),
    animeApi.getLatest(),
    animeApi.getNew(),
  ]);

  const featured = trending?.[0] || null; // Top trending as Featured (Hero)
  const popular = trending?.slice(1, 6) || []; // Top 5 trending for Right Sidebar
  const ongoing = latest?.slice(0, 10) || []; // Top 10 Latest for Ongoing section

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* ─── CENTER CONTENT (Hero & Ongoing) ─── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-10">
        
        {/* HERO SECTION */}
        {featured && (
          <div className="relative w-full aspect-[21/9] sm:aspect-[16/7] bg-[#1B1B1B] rounded-[2rem] overflow-hidden group shadow-hd-light border border-white/5">
            {/* Background Image full width */}
            <div 
              className="absolute inset-0 bg-cover bg-top opacity-60 transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: `url(${featured.cover || featured.poster || featured.image})` }}
            />
            {/* Gradient Overlay left-to-right fade to black */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B1B1B] via-[#1B1B1B]/80 to-transparent" />
            
            <div className="relative h-full flex items-center p-8 sm:p-12 z-10 w-[70%]">
              <div className="space-y-4">
                <p className="text-white/60 font-semibold uppercase tracking-widest text-xs">
                  Trending #1 &bull; TV Series
                </p>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight break-words line-clamp-2">
                  {featured.title}
                </h1>
                
                {/* Rating Stars (Mock since API rank views) */}
                <div className="flex gap-1 items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-orange-400 text-orange-400" : "text-gray-600"}`} />
                  ))}
                  <span className="text-sm font-bold text-white/50 ml-2">4.8</span>
                </div>

                <p className="text-sm text-white/60 line-clamp-2 mt-2 leading-relaxed">
                  Join the adventure of {featured.title} in an epic journey. This is currently the most viewed anime on streamnime!
                </p>

                <div className="pt-4">
                  <Link 
                    href={`/anime/${featured.id || featured.slug || featured.animeId}`}
                    className="inline-flex items-center justify-center bg-white text-black px-8 py-3 rounded-full font-bold text-sm tracking-wide gap-2 hover:bg-[#9933FF] hover:text-white transition-all shadow-lg active:scale-95"
                  >
                    Stream
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGOING SECTION */}
        <div>
          <h2 className="text-xl font-black text-white mb-6">Ongoing</h2>
          <div className="grid grid-cols-2 shadow-hd md:grid-cols-3 xl:grid-cols-4 gap-6">
            {ongoing.map((anime, i) => (
              <Link 
                key={i} 
                href={`/anime/${anime.id || anime.slug || anime.animeId || 'new'}`}
                className="group flex flex-col gap-3 rounded-2xl p-2 bg-transparent hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              >
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-hd-light border border-white/5">
                  <img 
                    src={anime.thumbnail || anime.image || anime.poster} 
                    alt={anime.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Play badge overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="bg-[#9933FF] rounded-full p-2 shadow-lg">
                      <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="text-sm font-bold text-white truncate">{anime.title}</h3>
                  <p className="text-[11px] text-gray-500 font-medium tracking-wide mt-1 uppercase">
                    {anime.episode || anime.releaseTime || `Episode ${10 - i}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* ─── RIGHT SIDEBAR (Search & Popular) ─── */}
      <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-8 bg-[#1B1B1B] rounded-[2rem] p-6 border border-white/5">
        
        {/* Top Header */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              autoComplete="off"
              className="w-full bg-[#262626] text-sm text-white rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[#9933FF] border border-white/5 placeholder:text-gray-500"
            />
          </div>
          <button className="flex-shrink-0 relative">
            <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-[#9933FF] overflow-hidden flex-shrink-0 cursor-pointer shadow-[0_0_15px_rgba(153,51,255,0.3)]">
            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Popular List */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-lg font-black text-white mb-6">Popular This Week</h2>
          <div className="flex flex-col gap-5 flex-1">
            {popular.map((item, i) => (
              <Link 
                key={i} 
                href={`/anime/${item.id || item.slug || item.animeId}`}
                className="flex gap-4 items-center group"
              >
                <img 
                  src={item.poster || item.thumbnail || item.image || "https://wsrv.nl/?url=https://fakeimg.pl/60x80/282828/909090"} 
                  alt={item.title} 
                  className="w-16 h-20 object-cover rounded-xl shadow-lg group-hover:ring-1 ring-[#9933FF] transition-all"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-white truncate">{item.title}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 mb-1 leading-relaxed">
                    Action, Adventure, Fantasy, Sci-Fi, Slice of Life
                  </p>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < 4 ? "fill-orange-400 text-orange-400" : "text-gray-600"}`} />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button className="w-full mt-6 py-3.5 rounded-xl bg-[#9933FF] text-white font-bold text-sm tracking-wide shadow-[0_5px_15px_rgba(153,51,255,0.3)] hover:opacity-90 active:scale-95 transition-all">
            See More
          </button>
        </div>

      </div>

    </div>
  );
}
