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
    // Handle both 'animeId' and 'id' field names (sesuai dokumentasi API)
    const animeId = anime.animeId || anime.id;
    const isBookmarked = bookmarks.some(b => (b.animeId || b.id) === animeId);
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => (b.animeId || b.id) !== animeId);
    } else {
      // Ensure we save with both fields for compatibility
      const animeToSave = { ...anime, animeId: animeId, id: animeId };
      newBookmarks = [animeToSave, ...bookmarks];
    }
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
    return !isBookmarked;
  },

  isBookmarked: (animeId) => {
    return store.getBookmarks().some(b => (b.animeId || b.id) === animeId);
  },

  // History Logic
  getHistory: () => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("history") || "[]");
  },

  addHistory: (anime, episode) => {
    const history = store.getHistory();
    // Handle both 'animeId' and 'id' field names
    const animeId = anime.animeId || anime.id;
    const newEntry = { 
      ...anime, 
      animeId: animeId,
      id: animeId,
      lastEpisode: episode, 
      viewedAt: new Date().toISOString() 
    };
    const filteredHistory = history.filter(h => (h.animeId || h.id) !== animeId);
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

