import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import SearchBar from "@/components/SearchBar";
import SearchSidebar from "@/components/SearchSidebar";
import Pagination from "@/components/Pagination";
import { Search } from "lucide-react";

export default async function SearchPage({ searchParams }) {
  const q = searchParams.q || "";
  const genre = searchParams.genre || '';
  const sort = searchParams.sort || 'views';
  const page = parseInt(searchParams.page || '0');
  
  let results = [];
  let total = 0;
  let genres = [];
  let pagination = { currentPage: 0, hasNextPage: false, totalResults: 0 };
  
  try {
    // Ambil list genre untuk filter
    const [searchData, genresData] = await Promise.all([
      animeApi.search(q, { genre, sort, page }).catch(() => ({ data: [], total: 0 })),
      animeApi.getGenres().catch(() => [])
    ]);
    
    // Response format sesuai dokumentasi: { success: true, data: [...], total: ..., pagination: {...}, filters: {...} }
    results = Array.isArray(searchData) ? searchData : (searchData?.data || []);
    total = searchData?.total || searchData?.pagination?.totalResults || results.length;
    genres = Array.isArray(genresData) ? genresData : (genresData?.data || []);
    
    // Handle pagination
    if (searchData?.pagination) {
      pagination = {
        currentPage: searchData.pagination.currentPage || page,
        hasNextPage: searchData.pagination.hasNextPage || false,
        totalResults: searchData.pagination.totalResults || total
      };
    } else {
      pagination = {
        currentPage: page,
        hasNextPage: results.length >= 20, // Assume 20 per page if not specified
        totalResults: total
      };
    }
  } catch (e) {
    console.error('[Search] Error:', e);
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-accent/10 rounded-2xl">
            <Search className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic mb-2">
              {q ? (
                <>Search: <span className="text-accent">"{q}"</span></>
              ) : (
                "Cari Anime"
              )}
            </h1>
            {total > 0 && (
              <p className="text-sm font-bold text-gray-400">
                Menemukan <span className="text-accent">{total}</span> hasil
              </p>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar initialQuery={q} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filter */}
        <SearchSidebar genres={genres} />

        {/* Results */}
        <div className="flex-grow">
          {results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
                {results.map((anime, idx) => (
                  <AnimeCard key={anime.animeId || anime.id || idx} anime={anime} />
                ))}
              </div>
              
              {/* Pagination */}
              <Pagination 
                currentPage={pagination.currentPage}
                hasNextPage={pagination.hasNextPage}
                totalResults={pagination.totalResults}
              />
            </>
          ) : (
            <div className="py-32 text-center">
              <div className="inline-block p-8 bg-card border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-black uppercase tracking-widest mb-2 text-gray-400">
                  {q || genre ? "Tidak Ada Hasil" : "Mulai Pencarian"}
                </h3>
                <p className="text-sm font-bold text-gray-500 max-w-md">
                  {q || genre 
                    ? `Tidak menemukan anime${q ? ` untuk "${q}"` : ''}${genre ? ` dengan filter yang dipilih` : ''}. Coba kata kunci atau filter yang berbeda.`
                    : "Masukkan kata kunci di search bar atau gunakan filter untuk menemukan anime favorit kamu."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

