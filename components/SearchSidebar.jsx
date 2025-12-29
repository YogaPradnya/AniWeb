"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Filter } from "lucide-react";

export default function SearchSidebar({ genres = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentGenre = searchParams.get('genre') || '';
  const currentSort = searchParams.get('sort') || 'views';
  const currentQ = searchParams.get('q') || '';

  const sortOptions = [
    { value: 'views', label: 'Paling Populer', icon: '🔥' },
    { value: 'title', label: 'A-Z', icon: '🔤' },
    { value: 'favorites', label: 'Paling Difavoritkan', icon: '❤️' },
    { value: 'newest', label: 'Paling Baru', icon: '✨' },
  ];

  const updateFilters = (genre, sort) => {
    const params = new URLSearchParams();
    if (currentQ) params.set('q', currentQ);
    if (genre) params.set('genre', genre);
    // Hanya tambahkan sort ke URL jika bukan default (views)
    if (sort && sort !== 'views') {
      params.set('sort', sort);
    }
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (currentQ) params.set('q', currentQ);
    router.push(`/search?${params.toString()}`);
  };

  const hasActiveFilters = currentGenre || currentSort !== 'views';

  return (
    <div className="w-full lg:w-[320px] flex-shrink-0">
      <div className="bg-card border border-black/5 dark:border-white/5 rounded-3xl p-6 sticky top-24 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-xl">
              <Filter className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">Filter</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-black text-gray-400 hover:text-accent uppercase tracking-widest transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pb-6 border-b border-black/5 dark:border-white/5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Active Filters</p>
            <div className="flex flex-wrap gap-2">
              {currentGenre && (
                <span className="px-3 py-1.5 bg-accent/20 border border-accent/30 rounded-lg text-[10px] font-black text-accent uppercase tracking-widest">
                  {genres.find(g => g.id.toString() === currentGenre)?.name || 'Genre'}
                </span>
              )}
              {currentSort !== 'views' && (
                <span className="px-3 py-1.5 bg-accent/20 border border-accent/30 rounded-lg text-[10px] font-black text-accent uppercase tracking-widest">
                  {sortOptions.find(s => s.value === currentSort)?.label || 'Sort'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">
            Urutkan
          </label>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateFilters(currentGenre, option.value)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border text-left flex items-center gap-3 ${
                  currentSort === option.value
                    ? 'bg-accent-gradient border-transparent text-white shadow-hd'
                    : 'bg-transparent border-black/10 dark:border-white/10 text-gray-400 hover:border-accent hover:text-white'
                }`}
              >
                <span className="text-base">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Filter */}
        {genres.length > 0 && (
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">
              Genre ({genres.length})
            </label>
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => updateFilters(genre.id.toString(), currentSort)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border text-left ${
                    currentGenre === genre.id.toString()
                      ? 'bg-accent border-transparent text-white shadow-hd'
                      : 'bg-transparent border-black/10 dark:border-white/10 text-gray-400 hover:border-accent hover:text-white'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

