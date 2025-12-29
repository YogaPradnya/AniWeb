"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Moon, Sun, Bookmark, History, Menu, X } from "lucide-react";
import { store } from "@/lib/store";

export default function Navbar() {
  const [theme, setTheme] = useState("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = store.getTheme();
    setTheme(savedTheme);
    store.setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    store.setTheme(newTheme);
  };

  return (
    <nav className="sticky top-0 z-[1000] glass-nav">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tighter bg-accent-gradient bg-clip-text text-transparent italic">
            AnimeOut
          </h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8 flex-grow justify-center">
          <Link href="/" className="text-sm font-bold hover:text-accent transition-colors uppercase tracking-widest">
            Home
          </Link>
          <Link href="/schedule" className="text-sm font-bold hover:text-accent transition-colors uppercase tracking-widest">
            Schedule
          </Link>
          <Link href="/bookmarks" className="text-sm font-bold hover:text-accent transition-colors uppercase tracking-widest flex items-center gap-2">
            <Bookmark className="w-4 h-4" /> Bookmarks
          </Link>
          <Link href="/history" className="text-sm font-bold hover:text-accent transition-colors uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4" /> History
          </Link>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-grow lg:flex-grow-0 justify-end">
          <Link 
            href="/search"
            className="p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-accent hover:text-white transition-all"
            title="Search Anime"
          >
            <Search className="w-5 h-5" />
          </Link>

          <button 
            onClick={toggleTheme}
            className="p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-accent hover:text-white transition-all"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-3 bg-black/5 dark:bg-white/5 rounded-xl"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-white dark:bg-primary-dark border-b border-black/5 dark:border-white/5 p-6 space-y-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <Link 
            onClick={() => setIsMenuOpen(false)} 
            href="/search" 
            className="flex items-center justify-center gap-3 w-full p-4 bg-accent-gradient text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all"
          >
            <Search className="w-5 h-5" /> Search Anime
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Link onClick={() => setIsMenuOpen(false)} href="/" className="flex flex-col items-center p-4 bg-black/5 dark:bg-white/5 rounded-2xl font-bold uppercase tracking-widest text-xs">
              Home
            </Link>
            <Link onClick={() => setIsMenuOpen(false)} href="/schedule" className="flex flex-col items-center p-4 bg-black/5 dark:bg-white/5 rounded-2xl font-bold uppercase tracking-widest text-xs">
              Schedule
            </Link>
            <Link onClick={() => setIsMenuOpen(false)} href="/bookmarks" className="flex flex-col items-center p-4 bg-black/5 dark:bg-white/5 rounded-2xl font-bold uppercase tracking-widest text-xs gap-2">
              <Bookmark className="w-5 h-5" /> Bookmarks
            </Link>
            <Link onClick={() => setIsMenuOpen(false)} href="/history" className="flex flex-col items-center p-4 bg-black/5 dark:bg-white/5 rounded-2xl font-bold uppercase tracking-widest text-xs gap-2">
              <History className="w-5 h-5" /> History
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
