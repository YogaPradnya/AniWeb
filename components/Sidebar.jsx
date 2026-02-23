"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Home, TrendingUp, Clock, List, Heart, 
  PlayCircle, CheckCircle, Tv, Film, MonitorPlay, 
  Calendar, Menu, X
} from "lucide-react";
import GlobalSearch from "./GlobalSearch";

export default function Sidebar({ className = "" }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Trending", href: "/trending", icon: TrendingUp },
    { label: "Schedule", href: "/schedule", icon: Calendar },
  ];

  const generalItems = [
    { label: "Recents", href: "/recents", icon: Clock },
    { label: "Your List", href: "/list", icon: List },
    { label: "Favorited", href: "/favorited", icon: Heart },
  ];

  const categories = [
    { label: "Ongoing", href: "/ongoing", icon: PlayCircle },
    { label: "Completed", href: "/completed", icon: CheckCircle },
    { label: "TV Series", href: "/tv", icon: Tv },
    { label: "Movies", href: "/movies", icon: Film },
    { label: "Live Action", href: "/live-action", icon: MonitorPlay },
  ];

  const renderLinks = (items) => {
    return items.map((item, idx) => {
      const isActive = pathname === item.href;
      return (
        <Link 
          key={idx} 
          href={item.href}
          className={`relative flex items-center gap-4 px-6 py-3 text-sm font-medium transition-colors ${
            isActive ? "text-[#9933FF]" : "text-gray-400 hover:text-white"
          }`}
        >
          <item.icon className={`w-5 h-5 ${isActive ? "text-[#9933FF]" : ""}`} />
          {item.label}
          
          {/* Active border indicator on the right edge */}
          {isActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#9933FF] rounded-l-md" />
          )}
        </Link>
      );
    });
  };

  return (
    <>
      {/* Mobile Hamburger Button (Tampil saat tertutup) */}
      {!isOpen && (
        <button 
          className="md:hidden fixed top-5 left-5 z-[60] p-2.5 bg-[#1B1B1B]/90 backdrop-blur-md border border-white/10 rounded-xl text-white shadow-[0_5px_15px_rgba(0,0,0,0.5)] hover:bg-[#9933FF] transition-colors"
          onClick={() => setIsOpen(true)}
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`
          fixed md:relative top-0 left-0 z-50 md:z-auto h-full flex flex-col py-6 overflow-y-auto scrollbar-hide bg-[#262626]
          transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${className}
        `}
      >
        {/* Close Button Inside Sidebar (Mobile) */}
        <button 
          className="md:hidden absolute top-5 right-5 p-2 bg-black/20 hover:bg-[#9933FF] rounded-full text-white transition-colors"
          onClick={() => setIsOpen(false)}
          aria-label="Close Menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Global Search */}
        <div className="px-6 mt-1 md:mt-0 mb-10 space-y-6 flex-shrink-0">
          <Link href="/" className="text-2xl font-black tracking-tighter text-white flex items-center pt-2 md:pt-0">
            stream<span className="text-[#9933FF]">nime</span>
          </Link>
          <GlobalSearch />
        </div>

        <nav className="flex-1 space-y-6">
          <div>
            <div className="px-6 mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">Menu</div>
            <div className="space-y-1">
              {renderLinks(menuItems)}
            </div>
          </div>

          <div>
            <div className="px-6 mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">General</div>
            <div className="space-y-1">
              {renderLinks(generalItems)}
              <div className="my-4 border-t border-white/5 mx-6"></div>
              {renderLinks(categories)}
            </div>
          </div>
        </nav>

      </aside>
    </>
  );
}
