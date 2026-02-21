"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      // Redirect to search page
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setQuery(""); // Clear after search
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      <button 
        type="submit"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-[#9933FF] transition-colors"
      >
        <Search className="w-4 h-4" />
      </button>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search anime..." 
        autoComplete="off"
        className="w-full bg-[#262626] text-[13px] text-white rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-[#9933FF] border border-white/5 placeholder:text-gray-500 transition-all font-medium"
      />
    </form>
  );
}
