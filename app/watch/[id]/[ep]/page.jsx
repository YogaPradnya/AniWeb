import { animeApi } from "@/lib/api";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

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
      <div className="text-center py-32 text-red-500 font-black uppercase tracking-widest">
        Data episode tidak ditemukan atau API error.
      </div>
    );
  }

  if (!episodeData) {
    return (
      <div className="text-center py-32 text-red-500 font-black uppercase tracking-widest">
        Episode tidak tersedia.
      </div>
    );
  }

  // Hitung next episode dari list episode di detail
  const allEpisodes = anime?.episodes || [];
  const sortedEps = [...allEpisodes].sort((a, b) => {
    return parseInt(a.episodeNumber || a.number || 0) - parseInt(b.episodeNumber || b.number || 0);
  });
  const currentIdx = sortedEps.findIndex(
    (e) => String(e.episodeNumber || e.number || "") === String(ep)
  );
  const hasNext = currentIdx !== -1 && currentIdx < sortedEps.length - 1;
  const nextEpNum = hasNext
    ? sortedEps[currentIdx + 1]?.episodeNumber || sortedEps[currentIdx + 1]?.number
    : parseInt(ep) + 1;
  const hasPrev = parseInt(ep) > 1;

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Player Section */}
        <div className="flex-grow min-w-0 space-y-8">
          <div>
            {anime && (
              <Link
                href={`/anime/${id}`}
                className="inline-flex items-center gap-2 text-[10px] font-black text-accent hover:text-white uppercase tracking-[0.2em] transition-colors mb-4"
              >
                <ChevronLeft className="w-4 h-4" /> {anime.title}
              </Link>
            )}
            <h1 className="text-4xl font-black tracking-tighter leading-tight italic">
              {episodeData.title || `Episode ${ep}`}
            </h1>
            {/* Video Sources Info */}
            {episodeData.videoSources?.length > 0 && (
              <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">
                {episodeData.videoSources.length} video source tersedia •{" "}
                {episodeData.resolutions?.join(", ")}
              </p>
            )}
          </div>

          <VideoPlayer episode={episodeData} anime={anime} animeId={id} epNum={ep} />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {hasPrev && (
                <Link
                  href={`/watch/${id}/${parseInt(ep) - 1}`}
                  className="flex items-center gap-3 px-8 py-4 bg-card border border-black/5 dark:border-white/5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:border-accent transition-all shadow-hd-light"
                >
                  <ChevronLeft className="w-5 h-5" /> Previous
                </Link>
              )}
              {hasNext && (
                <Link
                  href={`/watch/${id}/${nextEpNum}`}
                  className="flex items-center gap-3 px-8 py-4 bg-accent-gradient text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-hd"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          {anime && (
            <div className="bg-card border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 sticky top-24 shadow-hd-light">
              <img
                src={anime.poster || anime.thumbnail}
                alt={anime.title}
                className="w-full aspect-[2/3] object-cover rounded-3xl mb-8 shadow-hd transition-transform duration-500 hover:scale-105"
              />
              <h2 className="text-2xl font-black mb-6 leading-tight italic">
                {anime.title}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                    Status
                  </p>
                  <p className="text-xs font-bold uppercase">{anime.status || "N/A"}</p>
                </div>
                <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                    Episode
                  </p>
                  <p className="text-xs font-bold">
                    {ep} / {anime.episodes?.length || "?"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                  Synopsis
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-6 leading-relaxed font-medium italic">
                  "{anime.synopsis}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Episode List */}
      {allEpisodes.length > 0 && (
        <section className="pt-12 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <Play className="w-6 h-6 text-accent fill-accent" />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic">
              Semua Episode ({allEpisodes.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sortedEps.slice(-30).reverse().map((e, i) => {
              const epNum = e.episodeNumber || e.number || (i + 1);
              const isActive = String(epNum) === String(ep);
              return (
                <Link
                  key={epNum}
                  href={`/watch/${id}/${epNum}`}
                  className={`group relative aspect-video rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 flex items-center justify-center ${
                    isActive
                      ? "border-accent shadow-hd bg-accent/20"
                      : "border-transparent group-hover:border-accent/50 bg-black/5 dark:bg-white/5"
                  }`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] z-10 ${isActive ? "text-accent" : ""}`}>
                    EP {epNum}
                  </p>
                </Link>
              );
            })}
          </div>

          {allEpisodes.length > 30 && (
            <p className="text-center text-xs text-gray-400 font-bold mt-6 uppercase tracking-widest">
              Menampilkan 30 episode terakhir dari {allEpisodes.length} total — buka halaman detail untuk semua episode
            </p>
          )}
        </section>
      )}
    </div>
  );
}
