"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, TrendingUp, Clock, List, Heart, 
  PlayCircle, CheckCircle, Tv, Film, MonitorPlay, 
  Calendar
} from "lucide-react";
import GlobalSearch from "./GlobalSearch";

export default function Sidebar({ className = "" }) {
  const pathname = usePathname();

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
    <aside className={`h-full flex flex-col py-6 overflow-y-auto scrollbar-hide ${className}`}>
      {/* Logo & Global Search */}
      <div className="px-6 mb-10 space-y-6">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white flex items-center">
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
  );
}
