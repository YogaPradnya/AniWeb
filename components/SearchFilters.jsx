"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function SearchFilters({ genres = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentGenre = searchParams.get('genre') || '';
  const currentSort = searchParams.get('sort') || 'views';
  const currentQ = searchParams.get('q') || '';

  const sortOptions = [
    { value: 'views', label: 'Paling Populer' },
    { value: 'title', label: 'A-Z' },
    { value: 'favorites', label: 'Paling Difavoritkan' },
    { value: 'newest', label: 'Paling Baru' },
  ];

  const updateFilters = (genre, sort) => {
    const params = new URLSearchParams();
    if (currentQ) params.set('q', currentQ);
    if (genre) params.set('genre', genre);
    if (sort && sort !== 'views') params.set('sort', sort);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (currentQ) params.set('q', currentQ);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-6 py-3 bg-card border border-black/5 dark:border-white/5 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-accent transition-all"
        >
          <Filter className="w-4 h-4" />
          Filter & Sort
        </button>
        {(currentGenre || currentSort !== 'views') && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-gray-400 hover:text-accent uppercase tracking-widest transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {isOpen && (
        <div className="bg-card border border-black/5 dark:border-white/5 rounded-2xl p-6 space-y-6">
          {/* Genre Filter */}
          {genres.length > 0 && (
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
                Genre
              </label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => updateFilters(genre.id.toString(), currentSort)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      currentGenre === genre.id.toString()
                        ? 'bg-accent border-transparent text-white shadow-hd'
                        : 'bg-transparent border-black/10 dark:border-white/10 text-gray-400 hover:border-accent'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">
              Urutkan
            </label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters(currentGenre, option.value)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    currentSort === option.value
                      ? 'bg-accent border-transparent text-white shadow-hd'
                      : 'bg-transparent border-black/10 dark:border-white/10 text-gray-400 hover:border-accent'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

