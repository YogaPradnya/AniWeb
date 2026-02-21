import { animeApi } from "@/lib/api";
import Link from "next/link";
import { Play, Star, Search, Bell } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import { capitalizeWords } from "@/lib/utils";

const SectionGrid = ({ title, items, badgeColor = "bg-[#9933FF]" }) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h2 className="text-xl font-black text-white mb-6">{title}</h2>
      <div className="grid grid-cols-2 shadow-hd md:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((anime, i) => {
          const defaultBadge = anime.isNew ? "BARU" : (anime.episode || anime.releaseTime || `Ep ${10 - i}`);
          return (
            <Link 
              key={i} 
              href={`/anime/${anime.id || anime.slug || anime.animeId || 'new'}`}
              className="group flex flex-col gap-3 rounded-2xl p-2 bg-transparent hover:bg-[#1B1B1B] transition-colors border border-transparent hover:border-white/5 bg-black/10"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-hd-light border border-white/5">
                <img 
                  src={anime.thumbnail || anime.image || anime.poster || "https://fakeimg.pl/400x225/1B1B1B/909090"} 
                  alt={anime.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
                {/* Play badge overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className={`${badgeColor} rounded-full p-2 shadow-lg`}>
                    <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                  </div>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-[13px] font-bold text-white truncate" title={anime.title}>{capitalizeWords(anime.title)}</h3>
                <p className="text-[10px] text-gray-500 font-bold tracking-wider mt-1.5 uppercase">
                  {defaultBadge}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const revalidate = 600; // 10 menit cache

export default async function Home() {
  const [trending, latest, newAnime, todayAnime] = await Promise.all([
    animeApi.getTrending(),
    animeApi.getLatest(),
    animeApi.getNew(),
    animeApi.getToday(),
  ]);

  const popList = trending || [];
  const popular = popList.slice(0, 5); // Top 5 trending for Right Sidebar
  
  const jadwalRilis = todayAnime?.slice(0, 12) || [];
  const ongoing = latest?.slice(0, 12) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* ─── CENTER CONTENT (Hero & Sections) ─── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-12">
        
        {/* HERO CAROUSEL */}
        <HeroSlider trending={popList} />

        {/* GRIDS SECTIONS */}
        <div className="space-y-12 pb-10">
          <SectionGrid title="Jadwal Rilis" items={jadwalRilis} badgeColor="bg-green-500" />
          <SectionGrid title="Ongoing" items={ongoing} badgeColor="bg-[#9933FF]" />
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
                  <h4 className="text-[13px] font-bold text-white line-clamp-2" title={item.title}>{capitalizeWords(item.title)}</h4>
                  <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 mb-1 leading-relaxed">
                    Action, Adventure, Fantasy
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

          <Link href="/trending" className="w-full mt-6 py-3.5 rounded-xl bg-[#9933FF] text-white font-bold text-sm text-center tracking-wide flex items-center justify-center shadow-[0_5px_15px_rgba(153,51,255,0.3)] hover:opacity-90 active:scale-95 transition-all">
            See More
          </Link>
        </div>

      </div>

    </div>
  );
}
