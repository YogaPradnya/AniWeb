import { animeApi } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";

export default async function SearchPage({ searchParams }) {
  const q = searchParams.q || "";
  let results = [];
  
  try {
    const data = await animeApi.search(q);
    results = data.data || [];
  } catch (e) {}

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-12 flex items-center gap-3">
        <div className="w-2 h-10 bg-accent-gradient rounded-full" />
        Search results for: <span className="text-accent">"{q}"</span>
      </h1>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((anime, idx) => (
            <AnimeCard key={idx} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500 font-semibold border border-dashed border-white/10 rounded-[2rem]">
          No results found for "{q}". Try different keywords.
        </div>
      )}
    </div>
  );
}

