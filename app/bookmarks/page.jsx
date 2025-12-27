"use client";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import AnimeCard from "@/components/AnimeCard";
import { Bookmark, Trash2 } from "lucide-react";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    setBookmarks(store.getBookmarks());
  }, []);

  const clearBookmarks = () => {
    if (confirm("Hapus semua bookmark?")) {
      localStorage.removeItem("bookmarks");
      setBookmarks([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-black flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-2xl">
            <Bookmark className="w-8 h-8 text-accent" />
          </div>
          Daftar Bookmark
        </h1>
        {bookmarks.length > 0 && (
          <button 
            onClick={clearBookmarks}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="w-4 h-4" /> Hapus Semua
          </button>
        )}
      </div>

      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {bookmarks.map((anime, idx) => (
            <AnimeCard key={idx} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-[3rem]">
          <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-xl font-black mb-2">Belum ada bookmark</h2>
          <p className="text-gray-500 max-w-sm mx-auto">Simpan anime favorit kamu agar mudah ditemukan kembali di sini.</p>
        </div>
      )}
    </div>
  );
}

