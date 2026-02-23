"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Play, ChevronLeft, ChevronRight } from "lucide-react";

import { capitalizeWords, fixImageUrl } from "@/lib/utils";

export default function HeroSlider({ trending }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Ambil 10 teratas
  const slides = trending?.slice(0, 10) || [];

  // Auto slide effect
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // ganti per 5 detik

    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const currentItem = slides[currentIndex];
  // Prioritas Cover untuk Hero/Landscape
  const bgImage = fixImageUrl(currentItem.image_cover || currentItem.cover || currentItem.image_poster || currentItem.poster || currentItem.thumbnail || currentItem.image || "https://fakeimg.pl/800x400/1B1B1B/909090");

  const nextSlide = () => setCurrentIndex(prev => prev === slides.length - 1 ? 0 : prev + 1);
  const prevSlide = () => setCurrentIndex(prev => prev === 0 ? slides.length - 1 : prev - 1);

  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[16/7] bg-[#1B1B1B] rounded-[2rem] overflow-hidden group shadow-hd-light border border-white/5">
      {/* Background Image full width - animate when sliding */}
      <div 
        key={currentItem.animeId || currentItem.id} // Forcing re-animation on change
        className="absolute inset-0 opacity-60 animate-in fade-in zoom-in duration-1000"
      >
        <Image 
          src={bgImage}
          alt={currentItem.title}
          fill
          className="object-cover object-top"
          priority
          unoptimized
        />
      </div>
      {/* Gradient Overlay left-to-right fade to black */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1B1B1B]/95 via-[#1B1B1B]/70 to-transparent" />
      
      {/* Navigation Arrows (Visible on hover) */}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-[#9933FF] rounded-full text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-[#9933FF] rounded-full text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="relative h-full flex items-center p-8 sm:p-12 z-10 w-[80%] md:w-[60%]">
        <div key={`info-${currentItem.animeId}`} className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-700">
          <p className="text-white/60 font-semibold uppercase tracking-widest text-xs">
            Trending #{currentIndex + 1} &bull; {currentItem.type || 'TV Series'}
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight break-words line-clamp-2">
            {capitalizeWords(currentItem.title)}
          </h1>
          
          {/* Rating Stars */}
          <div className="flex gap-1 items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-orange-400 text-orange-400" : "text-gray-600"}`} />
            ))}
            <span className="text-sm font-bold text-white/50 ml-2">4.8</span>
          </div>

          <p className="text-sm text-white/60 line-clamp-2 mt-2 leading-relaxed">
            Saksikan keseruan {capitalizeWords(currentItem.title)}. Saat ini berada di peringkat #{currentIndex + 1} dengan {currentItem.views || 'ribuan'} penonton!
          </p>

          <div className="pt-4 flex items-center gap-4">
            <Link 
              href={`/anime/${currentItem.id || currentItem.slug || currentItem.animeId}`}
              className="inline-flex items-center justify-center bg-white text-black px-8 py-3 rounded-full font-bold text-sm tracking-wide gap-2 hover:bg-[#9933FF] hover:text-white transition-all shadow-lg active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" /> Stream
            </Link>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-6 bg-[#9933FF]" : "w-1.5 bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
