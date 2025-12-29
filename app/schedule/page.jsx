import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";

// Disable caching untuk memastikan data selalu fresh setiap request
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function SchedulePage({ searchParams }) {
  // Ambil hari realtime jika tidak ada parameter
  const getCurrentDayRealtime = () => {
    const now = new Date();
    const dayIndex = now.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    const dayMap = { 0: 'minggu', 1: 'senin', 2: 'selasa', 3: 'rabu', 4: 'kamis', 5: 'jumat', 6: 'sabtu' };
    return dayMap[dayIndex] || 'senin';
  };

  // Normalize day parameter: jika kosong, pakai hari realtime
  const normalizeDay = (dayStr) => {
    if (!dayStr) return getCurrentDayRealtime();
    const normalized = dayStr.toLowerCase();
    // Map variasi nama hari ke format standar kita
    const dayMap = {
      'senin': 'senin', 'sen': 'senin', 'monday': 'senin',
      'selasa': 'selasa', 'sel': 'selasa', 'tuesday': 'selasa',
      'rabu': 'rabu', 'rab': 'rabu', 'wednesday': 'rabu',
      'kamis': 'kamis', 'kam': 'kamis', 'thursday': 'kamis',
      'jumat': 'jumat', 'jum': 'jumat', 'friday': 'jumat',
      'sabtu': 'sabtu', 'sab': 'sabtu', 'saturday': 'sabtu',
      'minggu': 'minggu', 'min': 'minggu', 'sunday': 'minggu',
      'random': 'random'
    };
    return dayMap[normalized] || normalized;
  };

  const dayParam = searchParams.day || "";
  const dayToFetch = normalizeDay(dayParam);
  
  let data = { schedule: [] };
  
  // HANYA ambil data REAL dari API, TIDAK ada fallback data dummy
  try {
    console.log(`[Schedule] Requested day param: "${dayParam}"`);
    console.log(`[Schedule] Normalized day to fetch: "${dayToFetch}"`);
    console.log(`[Schedule] Fetching REAL schedule data for day: ${dayToFetch}`);
    
    // PASTIKAN selalu kirim parameter day ke API
    const result = await animeApi.getSchedule(dayToFetch);
    console.log('[Schedule] REAL API Response received');
    console.log(`[Schedule] Response currentDay: ${result?.currentDay || 'N/A'}`);
    console.log(`[Schedule] Response schedule count: ${result?.schedule?.length || 0}`);
    
    data = result || { schedule: [] };
    
    // Pastikan schedule adalah array - HANYA data REAL
    if (!Array.isArray(data.schedule)) {
      console.warn('[Schedule] schedule is not an array, setting to empty');
      data.schedule = []; // Empty array, BUKAN data dummy
    }
    
    // VALIDASI: Pastikan currentDay dari response sesuai dengan hari yang diminta
    // Map currentDay dari API (SEN, SEL, dll) ke format kita (senin, selasa, dll)
    const apiDayMap = {
      'SEN': 'senin', 'SEL': 'selasa', 'RAB': 'rabu', 'KAM': 'kamis',
      'JUM': 'jumat', 'SAB': 'sabtu', 'MIN': 'minggu'
    };
    const apiCurrentDay = result?.currentDay ? apiDayMap[result.currentDay] || result.currentDay.toLowerCase() : null;
    
    if (apiCurrentDay && apiCurrentDay !== dayToFetch && dayToFetch !== 'random') {
      console.warn(`[Schedule] WARNING: Requested day "${dayToFetch}" but API returned "${apiCurrentDay}"`);
      console.warn(`[Schedule] This might indicate API is returning wrong data. Filtering...`);
      
      // Jika API mengembalikan data yang salah, kosongkan array
      // (Ini seharusnya tidak terjadi jika API bekerja dengan benar)
      if (data.schedule.length > 0) {
        console.warn(`[Schedule] API returned ${data.schedule.length} items for wrong day. Clearing...`);
        data.schedule = [];
      }
    }
    
    console.log(`[Schedule] Found ${data.schedule.length} REAL schedule items for day: ${dayToFetch}`);
    
    // Debug: Log beberapa item pertama untuk verifikasi
    if (data.schedule.length > 0) {
      console.log('[Schedule] First 3 anime IDs:', data.schedule.slice(0, 3).map(a => a.animeId || a.id).join(', '));
      console.log('[Schedule] First item structure:', JSON.stringify(data.schedule[0], null, 2));
    }
  } catch (e) {
    console.error('[Schedule] Error fetching REAL schedule data:', e.message);
    console.error('[Schedule] Error stack:', e.stack);
    // Return empty - TIDAK ada data dummy
    data = { schedule: [] };
  }

  const days = [
    { id: "senin", label: "Senin" },
    { id: "selasa", label: "Selasa" },
    { id: "rabu", label: "Rabu" },
    { id: "kamis", label: "Kamis" },
    { id: "jumat", label: "Jumat" },
    { id: "sabtu", label: "Sabtu" },
    { id: "minggu", label: "Minggu" },
    { id: "random", label: "Random" },
  ];

  // Gunakan dayToFetch yang sudah dinormalisasi (bukan dari data.currentDay karena bisa berbeda)
  const currentDay = dayToFetch;
  const currentDayLabel = days.find(d => d.id === currentDay)?.label || data.currentDay?.toUpperCase() || "Hari Ini";
  
  console.log(`[Schedule] Display day: ${currentDay} (${currentDayLabel})`);
  console.log(`[Schedule] REAL Schedule count: ${data.schedule?.length || 0}`);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <div className="w-2 h-10 bg-accent-gradient rounded-full" />
          Schedule Anime - {currentDayLabel}
        </h1>
        {data.schedule && data.schedule.length > 0 && (
          <div className="px-6 py-2 bg-accent/10 border border-accent/20 rounded-full">
            <span className="text-xs font-black text-accent uppercase tracking-widest">
              {data.schedule.length} Anime
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-8 hide-scrollbar">
        {days.map((d) => {
          // Highlight hari yang sedang aktif (currentDay) dan hari realtime jika tidak ada parameter
          const isActive = currentDay === d.id;
          const isToday = !dayParam && d.id === getCurrentDayRealtime();
          
          return (
            <Link
              key={d.id}
              href={`/schedule?day=${d.id}`}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? "bg-accent-gradient border-transparent shadow-[0_8px_20px_rgba(94,92,230,0.3)] text-white"
                  : isToday
                  ? "bg-accent/20 border-accent/30 text-accent"
                  : "bg-card border-white/5 hover:border-accent text-gray-400 hover:text-white"
              }`}
            >
              {d.label} {isToday && !isActive && '•'}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {data.schedule && Array.isArray(data.schedule) && data.schedule.length > 0 ? (
          // HANYA render data REAL dari API
          data.schedule.map((anime, idx) => {
            // Debug: Log setiap item sebelum render
            console.log(`[Schedule] Rendering anime ${idx}:`, {
              animeId: anime.animeId,
              title: anime.title,
              hasPoster: !!anime.poster,
              hasCover: !!anime.cover,
              hasThumbnail: !!anime.thumbnail
            });
            return <AnimeCard key={anime.animeId || idx} anime={anime} />;
          })
        ) : (
          // Tampilkan pesan kosong - TIDAK ada data dummy
          <div className="col-span-full py-20 text-center text-gray-500 font-semibold border border-dashed border-white/10 rounded-3xl">
            {data.schedule && Array.isArray(data.schedule) && data.schedule.length === 0 
              ? `Jadwal tidak ditemukan untuk hari ${days.find(d => d.id === currentDay)?.label}.`
              : "Sedang memuat data dari API..."}
          </div>
        )}
      </div>
    </div>
  );
}





