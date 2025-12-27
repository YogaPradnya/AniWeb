"use client";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import AnimeCard from "@/components/AnimeCard";
import { History, Trash2, Clock } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(store.getHistory());
  }, []);

  const clearHistory = () => {
    if (confirm("Hapus semua riwayat tontonan?")) {
      localStorage.removeItem("history");
      setHistory([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-black flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <History className="w-8 h-8 text-blue-500" />
          </div>
          Riwayat Tontonan
        </h1>
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="w-4 h-4" /> Bersihkan
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {history.map((anime, idx) => (
            <div key={idx} className="relative">
              <AnimeCard anime={anime} isEpisode={true} />
              <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                <Clock className="w-3 h-3" /> 
                {new Date(anime.viewedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-[3rem]">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-xl font-black mb-2">Riwayat masih kosong</h2>
          <p className="text-gray-500 max-w-sm mx-auto">Anime yang kamu tonton akan muncul di sini secara otomatis.</p>
        </div>
      )}
    </div>
  );
}

