"use client";
import Link from "next/link";
import { Eye, Heart, Star, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

export default function AnimeCard({ anime, isEpisode = false }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsBookmarked(store.isBookmarked(anime.animeId || anime.id));
  }, [anime.animeId, anime.id]);

  if (!anime) return null;
  
  const id = anime.animeId || anime.id;
  const imageUrl = anime.poster || anime.cover || anime.thumbnail;
  const title = anime.title || 'Untitled';
  
  return (
    <div className="group relative">
      <Link href={isEpisode ? `/watch/${id}/${anime.episodeNumber || 1}` : `/anime/${id}`} className="block">
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 border border-black/5 dark:border-white/5 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-hd">
          {/* Main Image */}
          <img
            src={imageUrl || "/no-image.jpg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%231a0d1a' width='200' height='300'/%3E%3Ctext fill='%238b4d8b' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {anime.isNew && (
              <div className="bg-accent-gradient text-[10px] font-black px-2.5 py-1 rounded-lg text-white shadow-lg">
                NEW EPISODE
              </div>
            )}
            {anime.rating && (
              <div className="bg-black/60 backdrop-blur-md text-[10px] font-black px-2.5 py-1 rounded-lg text-yellow-400 flex items-center gap-1 border border-white/10">
                <Star className="w-2.5 h-2.5 fill-yellow-400" /> {anime.rating}
              </div>
            )}
          </div>

          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-0 group-hover:scale-100 transition-transform duration-500">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </div>
          </div>

          {/* Bottom Info Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-0 left-0 w-full p-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest truncate">
                {anime.genre || anime.type || 'Action'}
              </span>
              <h3 className="text-sm font-black text-white leading-tight line-clamp-2 transition-colors">
                {title}
              </h3>
            </div>
          </div>
        </div>
      </Link>

      {/* Meta Info Below Card (Matching Screenshot) */}
      <div className="px-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400">
              <Eye className="w-3 h-3" /> {anime.views || '0'} <span className="ml-0.5">views</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400">
              <Heart className={`w-3 h-3 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`} /> {anime.favorites || '0'} <span className="ml-0.5">favorites</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
