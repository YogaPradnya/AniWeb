import { animeApi } from "@/lib/api";
import Link from "next/link";
import { Download, ChevronLeft, ChevronRight, Play } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";

export default async function WatchPage({ params }) {
  const { id, ep } = params;
  let episodeData = null;
  let anime = null;

  try {
    [episodeData, anime] = await Promise.all([
      animeApi.getEpisode(id, ep),
      animeApi.getDetail(id)
    ]);
  } catch (e) {
    return <div className="text-center py-32 text-red-500 font-black uppercase tracking-widest">Data not found or API error.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Player Section */}
        <div className="flex-grow min-w-0 space-y-8">
          <div>
            <Link href={`/anime/${id}`} className="inline-flex items-center gap-2 text-[10px] font-black text-accent hover:text-white uppercase tracking-[0.2em] transition-colors mb-4">
              <ChevronLeft className="w-4 h-4" /> {anime.title}
            </Link>
            <h1 className="text-4xl font-black tracking-tighter leading-tight italic">{episodeData.title}</h1>
          </div>

          <VideoPlayer episode={episodeData} anime={anime} animeId={id} epNum={ep} />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              {parseInt(ep) > 1 && (
                <Link href={`/watch/${id}/${parseInt(ep) - 1}`} className="flex items-center gap-3 px-8 py-4 bg-card border border-black/5 dark:border-white/5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:border-accent transition-all shadow-hd-light">
                  <ChevronLeft className="w-5 h-5" /> Previous
                </Link>
              )}
              {episodeData.nextEpisode && (
                <Link href={`/watch/${id}/${parseInt(ep) + 1}`} className="flex items-center gap-3 px-8 py-4 bg-accent-gradient text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-hd">
                  Next <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Sidebar - Professional Style */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-card border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 sticky top-24 shadow-hd-light">
            <img src={anime.poster || anime.thumbnail} className="w-full aspect-[2/3] object-cover rounded-3xl mb-8 shadow-hd transition-transform duration-500 hover:scale-105" />
            <h2 className="text-2xl font-black mb-6 leading-tight italic">{anime.title}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xs font-bold uppercase">{anime.status}</p>
              </div>
              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Rating</p>
                <p className="text-xs font-bold">⭐ {anime.rating}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Synopsis</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-6 leading-relaxed font-medium italic">"{anime.synopsis}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episode Navigation - Matching Screenshot */}
      <section className="pt-12 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-accent/10 rounded-2xl">
            <Play className="w-6 h-6 text-accent fill-accent" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase italic">Semua Episode</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {anime.episodes?.map((e, i) => {
            // Handle both 'episodeNumber' and 'number' field names
            const epNum = e.episodeNumber || e.number || (i + 1);
            return (
              <Link key={i} href={`/watch/${id}/${epNum}`} className="group">
                <div className={`relative aspect-video rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 ${epNum == ep ? 'border-accent shadow-hd' : 'border-transparent group-hover:border-accent/50'}`}>
                  <img src={e.thumbnail || anime.cover || anime.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Episode {epNum}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}


