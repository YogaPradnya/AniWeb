import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";

export default async function SearchPage({ searchParams }) {
  const q = searchParams.q || "";
  let results = [];
  let total = 0;
  
  try {
    const data = await animeApi.search(q);
    // Response format: { success: true, data: [...], total: ..., query: ... }
    results = Array.isArray(data) ? data : (data?.data || []);
    total = data?.total || results.length;
  } catch (e) {
    console.error('[Search] Error:', e);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <div className="w-2 h-10 bg-accent-gradient rounded-full" />
          Search results for: <span className="text-accent">"{q}"</span>
        </h1>
        {total > 0 && (
          <div className="px-6 py-2 bg-accent/10 border border-accent/20 rounded-full">
            <span className="text-xs font-black text-accent uppercase tracking-widest">
              {total} Results
            </span>
          </div>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((anime, idx) => (
            <AnimeCard key={anime.animeId || anime.id || idx} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500 font-semibold border border-dashed border-white/10 rounded-[2rem]">
          {q ? `No results found for "${q}". Try different keywords.` : "Enter a keyword to search for anime."}
        </div>
      )}
    </div>
  );
}

