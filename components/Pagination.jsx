"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage = 0, hasNextPage = false, totalResults = 0 }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (totalResults === 0) return null;

  return (
    <div className="flex items-center justify-between pt-8 border-t border-black/5 dark:border-white/5">
      <div className="text-sm font-bold text-gray-400">
        Page {currentPage + 1}
      </div>
      
      <div className="flex items-center gap-2">
        {currentPage > 0 && (
          <button
            onClick={() => updatePage(currentPage - 1)}
            className="flex items-center gap-2 px-6 py-3 bg-card border border-black/5 dark:border-white/5 rounded-xl text-xs font-black uppercase tracking-widest hover:border-accent transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
        )}
        
        {hasNextPage && (
          <button
            onClick={() => updatePage(currentPage + 1)}
            className="flex items-center gap-2 px-6 py-3 bg-accent-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-hd"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

