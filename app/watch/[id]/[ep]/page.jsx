import { animeApi } from "@/lib/api";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Server, ListVideo } from "lucide-react";
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
  const currentIdx = sortedEps.findIndex(
    (e) => String(e.episodeNumber || e.number || "") === String(ep)
  );
  
  const hasNext = currentIdx !== -1 && currentIdx < sortedEps.length - 1;
  const nextEpNum = hasNext
    ? sortedEps[currentIdx + 1]?.episodeNumber || sortedEps[currentIdx + 1]?.number
    : parseInt(ep) + 1;
  const hasPrev = parseInt(ep) > 1;

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* ─── LEFT: MAIN PLAYER AREA ─── */}
      <div className="flex-1 min-w-0 space-y-6">
        
        {/* Header Info */}
        <div className="bg-[#1B1B1B] p-6 lg:p-8 rounded-[2rem] border border-white/5 shadow-hd-light space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {anime && (
                <Link
                  href={`/anime/${id}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#9933FF] hover:text-white transition-colors mb-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to {anime.title}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {episodeData.title || `Episode ${ep}`}
              </h1>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {hasPrev ? (
                <Link
                  href={`/watch/${id}/${parseInt(ep) - 1}`}
                  className="flex items-center justify-center w-10 h-10 bg-[#262626] hover:bg-white/10 border border-white/5 rounded-full text-white transition-colors"
                  title="Previous Episode"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-[#262626]/50 rounded-full text-white/20 border border-white/5 cursor-not-allowed">
                  <ChevronLeft className="w-5 h-5" />
                </div>
              )}
              
              {hasNext ? (
                <Link
                  href={`/watch/${id}/${nextEpNum}`}
                  className="flex items-center gap-2 px-6 h-10 bg-[#9933FF] hover:opacity-90 active:scale-95 text-white font-bold text-sm tracking-wide rounded-full shadow-[0_5px_15px_rgba(153,51,255,0.3)] transition-all shrink-0"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-6 h-10 bg-[#262626]/50 text-white/30 border border-white/5 font-bold text-sm tracking-wide rounded-full cursor-not-allowed shrink-0">
                  Next <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
          
          {episodeData.videoSources?.length > 0 && (
            <div className="flex flex-wrap gap-4 items-center text-xs font-medium text-gray-400">
              <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5"/> {episodeData.videoSources.length} Servers</span>
              <span className="flex items-center gap-1.5"><ListVideo className="w-3.5 h-3.5"/> Quality: {episodeData.resolutions?.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Video Player */}
        <div className="bg-[#1B1B1B] p-2 sm:p-4 rounded-[2rem] border border-white/5 shadow-hd-light w-full">
          <div className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black outline outline-1 outline-white/10 shadow-2xl relative">
            <VideoPlayer episode={episodeData} anime={anime} animeId={id} epNum={ep} />
          </div>
        </div>

      </div>

      {/* ─── RIGHT SIDEBAR (Anime Info & Episode Selection) ─── */}
      <div className="w-full xl:w-[320px] shrink-0 space-y-6">
        
        {/* Anime Mini Card */}
        {anime && (
          <div className="bg-[#1B1B1B] p-6 rounded-[2rem] border border-white/5 sticky top-6 shadow-hd-light">
            <div className="flex gap-4">
              <Link href={`/anime/${id}`} className="shrink-0 group">
                <img
                  src={anime.poster || anime.thumbnail}
                  alt={anime.title}
                  className="w-24 h-32 object-cover rounded-xl shadow-hd border border-white/10 group-hover:ring-2 ring-[#9933FF] transition-all"
                />
              </Link>
              <div className="flex-1 space-y-2">
                <Link href={`/anime/${id}`}>
                  <h2 className="text-sm font-black text-white hover:text-[#9933FF] transition-colors line-clamp-2 leading-snug">
                    {anime.title}
                  </h2>
                </Link>
                <div className="flex flex-col gap-1 text-[11px] font-medium text-gray-400">
                  <p><span className="text-gray-500">Status:</span> <span className="text-green-500">{anime.status}</span></p>
                  <p><span className="text-gray-500">Format:</span> {anime.type || "TV"}</p>
                  <p><span className="text-gray-500">Eps:</span> {allEpisodes.length || "?"}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-white/5 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-white">Episodes</h3>
                <span className="text-xs font-bold text-[#9933FF] bg-[#9933FF]/10 px-2.5 py-1 rounded-md">
                 {allEpisodes.length}
                </span>
              </div>
              
              {/* Episodes List Scrollable */}
              <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                {sortedEps.map((e, i) => {
                  const epNum = e.episodeNumber || e.number || (i + 1);
                  const isActive = String(epNum) === String(ep);
                  return (
                    <Link
                      key={epNum}
                      href={`/watch/${id}/${epNum}`}
                      className={`flex items-center justify-center aspect-square rounded-xl text-xs font-bold transition-all border ${
                        isActive
                          ? "bg-[#9933FF] text-white border-transparent shadow-[0_0_15px_rgba(153,51,255,0.4)]"
                          : "bg-[#262626] text-gray-400 hover:text-white border-white/5 hover:border-white/20 hover:bg-[#333333]"
                      }`}
                    >
                      {epNum}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
      </div>

    </div>
  );
}
