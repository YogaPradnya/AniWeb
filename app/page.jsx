import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import { ChevronRight, TrendingUp, Sparkles, CalendarDays } from "lucide-react";
import Link from "next/link";

// Disable caching untuk memastikan data selalu fresh
export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getHomeData() {
  try {
    // Ambil hari realtime untuk "Anime Hari Ini"
    const getCurrentDayRealtime = () => {
      const now = new Date();
      const dayIndex = now.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
      const dayMap = { 0: 'minggu', 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat', 6: 'sabtu' };
      return dayMap[dayIndex] || 'senin';
    };

    const currentDay = getCurrentDayRealtime();
    console.log(`[Home] Current realtime day: ${currentDay}`);

    const [scheduleData, todayData, trendingData, newAnimeData] = await Promise.all([
      // PASTIKAN selalu kirim parameter day ke API untuk mendapatkan data sesuai hari
      animeApi.getSchedule(currentDay).catch((e) => {
        console.error(`[Home] Error fetching schedule for ${currentDay}:`, e.message);
        return { schedule: [] };
      }),
      // Fallback ke endpoint /today
      animeApi.getToday().catch((e) => {
        console.error('[Home] Error fetching today endpoint:', e.message);
        return { data: [] };
      }),
      animeApi.getTrending().catch((e) => {
        console.error('[Home] Error fetching trending:', e.message);
        return [];
      }),
      animeApi.getNew().catch((e) => {
        console.error('[Home] Error fetching new:', e.message);
        return [];
      }),
    ]);
    
    console.log(`[Home] Schedule data for ${currentDay}:`, scheduleData?.schedule?.length || 0, 'items');
    console.log(`[Home] Today endpoint data:`, Array.isArray(todayData) ? todayData.length : (todayData?.data?.length || 0), 'items');
    
    // Handle response format sesuai dokumentasi: { success: true, data: [...] }
    const trendingList = Array.isArray(trendingData) ? trendingData : (trendingData?.data || []);
    const newAnimeList = Array.isArray(newAnimeData) ? newAnimeData : (newAnimeData?.data || []);
    
    // Prioritas: schedule.schedule > today.data (sesuai dokumentasi, /today return { data: [...] })
    const todayList = (scheduleData?.schedule && scheduleData.schedule.length > 0) 
      ? scheduleData.schedule 
      : (Array.isArray(todayData) ? todayData : (todayData?.data || todayData?.anime || []));
    
    console.log(`[Home] Final today list count:`, todayList.length);
    
    return { today: todayList, trending: trendingList, newAnime: newAnimeList };
  } catch (error) {
    console.error('[Home] Fatal error fetching data:', error);
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
        title="Anime Hari Ini" 
        data={today} 
        icon={CalendarDays} 
        colorClass="bg-purple-500" 
      />
      
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
    </div>
  );
}
