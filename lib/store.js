"use client";

// Logic for Bookmark & History using LocalStorage
export const store = {
  // Bookmark Logic
  getBookmarks: () => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("bookmarks") || "[]");
  },
  
  toggleBookmark: (anime) => {
    const bookmarks = store.getBookmarks();
    const isBookmarked = bookmarks.some(b => b.animeId === anime.animeId);
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b.animeId !== anime.animeId);
    } else {
      newBookmarks = [anime, ...bookmarks];
    }
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
    return !isBookmarked;
  },

  isBookmarked: (animeId) => {
    return store.getBookmarks().some(b => b.animeId === animeId);
  },

  // History Logic
  getHistory: () => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("history") || "[]");
  },

  addHistory: (anime, episode) => {
    const history = store.getHistory();
    const newEntry = { 
      ...anime, 
      lastEpisode: episode, 
      viewedAt: new Date().toISOString() 
    };
    const filteredHistory = history.filter(h => h.animeId !== anime.animeId);
    const newHistory = [newEntry, ...filteredHistory].slice(0, 50); // Keep last 50
    localStorage.setItem("history", JSON.stringify(newHistory));
  },

  // Theme Logic
  getTheme: () => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("theme") || "dark";
  },

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};

