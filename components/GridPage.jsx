import Link from "next/link";
import { Play } from "lucide-react";
import { capitalizeWords } from "@/components/HeroSlider";

export default function GridPage({ title, items = [], errorMsg = "No items found." }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-white">{title}</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-bold bg-[#1B1B1B] rounded-2xl">
          {errorMsg}
        </div>
      ) : (
        <div className="grid grid-cols-2 shadow-hd md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {items.map((anime, i) => (
            <Link 
              key={i} 
              href={`/anime/${anime.id || anime.slug || anime.animeId || 'new'}`}
              className="group flex flex-col gap-3 rounded-2xl p-2 bg-transparent hover:bg-[#1B1B1B] transition-colors border border-transparent hover:border-white/5"
            >
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-hd-light border border-white/5">
                <img 
                  src={anime.cover || anime.poster || anime.thumbnail || anime.image || "https://fakeimg.pl/400x600/1B1B1B/909090"} 
                  alt={anime.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="bg-[#9933FF] rounded-full p-3 shadow-lg">
                    <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
                  </div>
                </div>
              </div>
              <div className="px-1">
                <h3 className="text-[13px] font-bold text-white line-clamp-2 leading-snug" title={anime.title}>
                  {capitalizeWords(anime.title)}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
