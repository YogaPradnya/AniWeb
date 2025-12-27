import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import Link from "next/link";

export default async function SchedulePage({ searchParams }) {
  const day = searchParams.day || "";
  let data = { schedule: [] };
  
  // HANYA ambil data REAL dari API, TIDAK ada fallback data dummy
  try {
    console.log(`[Schedule] Fetching REAL schedule data for day: ${day || 'default'}`);
    const result = await animeApi.getSchedule(day);
    console.log('[Schedule] REAL API Response:', JSON.stringify(result, null, 2));
    data = result || { schedule: [] };
    
    // Pastikan schedule adalah array - HANYA data REAL
    if (!Array.isArray(data.schedule)) {
      console.warn('[Schedule] schedule is not an array, setting to empty');
      data.schedule = []; // Empty array, BUKAN data dummy
    }
    
    console.log(`[Schedule] Found ${data.schedule.length} REAL schedule items`);
    
    // Debug: Log struktur item pertama jika ada
    if (data.schedule.length > 0) {
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

  const currentDay = day || data.currentDay?.toLowerCase() || "senin";
  
  console.log(`[Schedule] Current day: ${currentDay}, REAL Schedule count: ${data.schedule?.length || 0}`);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
        <div className="w-2 h-10 bg-accent-gradient rounded-full" />
        Schedule Anime - {days.find(d => d.id === currentDay)?.label || "Hari Ini"}
      </h1>

      <div className="flex gap-2 overflow-x-auto pb-8 hide-scrollbar">
        {days.map((d) => (
          <Link
            key={d.id}
            href={`/schedule?day=${d.id}`}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
              currentDay === d.id
                ? "bg-accent-gradient border-transparent shadow-[0_8px_20px_rgba(94,92,230,0.3)] text-white"
                : "bg-card border-white/5 hover:border-accent text-gray-400 hover:text-white"
            }`}
          >
            {d.label}
          </Link>
        ))}
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





