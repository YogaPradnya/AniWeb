import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import { ChevronRight, TrendingUp, Sparkles, CalendarDays } from "lucide-react";
import Link from "next/link";

async function getHomeData() {
  try {
    const [scheduleData, trendingData, newAnimeData] = await Promise.all([
      animeApi.getSchedule("random").catch(() => ({ schedule: [] })),
      animeApi.getTrending().catch(() => []),
      animeApi.getNew().catch(() => []),
    ]);
    
    const trendingList = Array.isArray(trendingData) ? trendingData : (trendingData?.data || []);
    const newAnimeList = Array.isArray(newAnimeData) ? newAnimeData : (newAnimeData?.data || []);
    const todayList = scheduleData?.schedule || [];
    
    return { today: todayList, trending: trendingList, newAnime: newAnimeList };
  } catch (error) {
    return { today: [], trending: [], newAnime: [] };
  }
}

export default async function Home() {
  const { today, trending, newAnime } = await getHomeData();

  const HorizontalSection = ({ title, data, icon: Icon, colorClass }) => (
    <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight uppercase">{title}</h2>
            <div className="h-1 w-12 bg-accent rounded-full mt-1" />
          </div>
        </div>
        <Link href="/schedule" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-accent transition-all">
          Lihat Semua <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar -mx-4 px-4 snap-x">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div key={idx} className="flex-none w-[180px] md:w-[200px] snap-start">
              <AnimeCard anime={item} />
            </div>
          ))
        ) : (
          <div className="w-full py-20 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-[2.5rem]">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada data tersedia</p>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="space-y-4">
      <HorizontalSection 
        title="Sedang Hangat" 
        data={trending} 
        icon={TrendingUp} 
        colorClass="bg-orange-500" 
      />
      
      <HorizontalSection 
        title="Baru Ditambahkan" 
        data={newAnime} 
        icon={Sparkles} 
        colorClass="bg-blue-500" 
      />
      
      <HorizontalSection 
        title="Anime Hari Ini" 
        data={today} 
        icon={CalendarDays} 
        colorClass="bg-purple-500" 
      />
    </div>
  );
}
