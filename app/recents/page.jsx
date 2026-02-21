"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { store } from "@/lib/store";
import { capitalizeWords } from "@/components/HeroSlider";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(store.getHistory() || []);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Continue Watching</h1>
        {history.length > 0 && (
          <button 
            onClick={() => { store.clearHistory(); setHistory([]); }}
            className="text-xs font-bold text-red-500 hover:text-red-400"
          >
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-bold bg-[#1B1B1B] rounded-2xl">
          No history yet. Start watching some anime!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {history.map((item, i) => (
            <Link 
              key={i} 
              href={`/watch/${item.animeId}/${item.episodeNumber}`}
              className="group flex flex-col gap-2 rounded-xl p-2 bg-transparent hover:bg-[#1B1B1B] transition-colors border border-transparent hover:border-white/5"
            >
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/50 border border-white/5">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-[#9933FF] rounded-full p-2">
                     <Play className="w-4 h-4 text-white fill-white translate-x-[1px]" />
                   </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white truncate" title={item.title}>{capitalizeWords(item.title)}</h3>
                <p className="text-[10px] text-gray-400 font-medium">Episode {item.episodeNumber}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
