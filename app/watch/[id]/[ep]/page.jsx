import { animeApi } from "@/lib/api";
import WatchPageClient from "@/components/WatchPageClient";

export default async function WatchPage({ params }) {
  const { id, ep } = params;
  let episodeData = null;
  let anime = null;

  try {
    // Fetch episode video dan detail anime secara parallel
    [episodeData, anime] = await Promise.all([
      animeApi.getEpisode(id, ep),
      animeApi.getDetail(id),
    ]);
  } catch (e) {
    console.error("[Watch] Error:", e.message);
    return (
      <div className="h-full flex items-center justify-center text-red-500 font-black uppercase tracking-widest bg-[#1B1B1B] rounded-[2rem]">
        Data episode tidak ditemukan
      </div>
    );
  }

  if (!episodeData) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 font-black uppercase tracking-widest bg-[#1B1B1B] rounded-[2rem]">
        Episode tidak tersedia.
      </div>
    );
  }

  // Hitung next episode dari list episode di detail
  const allEpisodes = anime?.episodes || [];
  const sortedEps = [...allEpisodes].sort((a, b) => {
    return parseInt(a.episodeNumber || a.number || 0) - parseInt(b.episodeNumber || b.number || 0);
  });

  return (
    <WatchPageClient 
      episodeData={episodeData}
      anime={anime}
      id={id}
      ep={ep}
      sortedEps={sortedEps}
    />
  );
}
