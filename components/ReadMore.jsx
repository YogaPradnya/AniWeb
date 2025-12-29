"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ReadMore({ text, maxLength = 200 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text || text.length <= maxLength) {
    return <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xl font-medium italic">"{text || "No synopsis available."}"</p>;
  }

  const truncated = text.slice(0, maxLength);
  const displayText = isExpanded ? text : truncated + "...";

  return (
    <div className="space-y-3">
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xl font-medium italic">
        "{displayText}"
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-accent hover:text-white text-sm font-black uppercase tracking-widest transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" /> Read Less
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" /> Read More
          </>
        )}
      </button>
    </div>
  );
}

