
// Server-side: langsung ke API asli (bisa akses env)
// Client-side: lewat proxy Next.js (untuk sembunyikan API URL)
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: langsung ke API asli dari env variable
    const apiUrl = process.env.API_BASE_URL;
    if (!apiUrl) {
      throw new Error('API_BASE_URL environment variable is not set');
    }
    return apiUrl;
  } else {
    // Client-side: SELALU lewat proxy agar URL API tidak terexpose
    return '/api/anime';
  }
};

export const animeApi = {
  async fetch(endpoint, options = {}) {
    const apiBase = getApiBaseUrl();
    const url = `${apiBase}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        // Jangan expose URL di error message untuk client-side
        const errorMsg = typeof window !== 'undefined' 
          ? `API Error: ${response.status}` 
          : `API Error ${response.status}: ${url}`;
        console.error(errorMsg);
        throw new Error(`API Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.error(`API returned error:`, result.error);
        throw new Error(result.error || 'Request failed');
      }
      
      return result.data;
    } catch (error) {
      // Jangan expose URL di error message untuk client-side
      const errorMsg = typeof window !== 'undefined' 
        ? `Fetch error: ${error.message}` 
        : `Fetch error for ${url}: ${error.message}`;
      console.error(errorMsg);
      throw error;
    }
  },

  // === UPDATED METHODS (V1 Fallback Strategy) ===
  
  // Trending: Menggunakan logic fallback ke schedule views
  getTrending: async () => {
    if (typeof window === 'undefined') {
       const { getTrendingAnime } = await import('./anime-helper');
       return getTrendingAnime();
    }
    return fetch('/api/v1/trending').then(r => r.json()).then(r => r.data);
  },

  // New/Latest: Menggunakan logic getToday/schedule
  getNew: async () => {
    if (typeof window === 'undefined') {
       const { getLatestAnime } = await import('./anime-helper');
       return getLatestAnime();
    }
    return fetch('/api/v1/latest').then(r => r.json()).then(r => r.data);
  },

  // Today: Alias ke Latest
  getToday: async () => {
    if (typeof window === 'undefined') {
       const { getLatestAnime } = await import('./anime-helper');
       return getLatestAnime();
    }
    return fetch('/api/v1/latest').then(r => r.json()).then(r => r.data);
  },

  // Search: Fallback ke filter schedule jika upstream error
  search: async (q, options = {}) => {
    if (typeof window === 'undefined') {
       const { searchAnime } = await import('./anime-helper');
       return searchAnime(q);
    }
    return fetch(`/api/v1/search?q=${encodeURIComponent(q)}`).then(r => r.json()).then(r => r.data);
  },

  // List: Fallback sort A-Z dari schedule
  getList: async () => {
    if (typeof window === 'undefined') {
       const { getListAnime } = await import('./anime-helper');
       return getListAnime();
    }
    return fetch('/api/v1/list').then(r => r.json()).then(r => r.data);
  },

  // === EXISTING METHODS (Direct Proxy) ===

  getSchedule: (day) => {
    // PASTIKAN selalu kirim parameter day ke API
    // JANGAN pernah kirim tanpa parameter karena akan return semua hari
    if (!day) {
      console.warn('[API] getSchedule called without day parameter! This will return all days.');
    }
    
    const dayParam = day ? encodeURIComponent(day.toLowerCase()) : '';
    const endpoint = `/animeinweb/schedule${dayParam ? `?day=${dayParam}` : ''}`;
    
    // Cache sudah di-disable di page level dan proxy route, jadi tidak perlu cache-busting di sini
    return animeApi.fetch(endpoint);
  },
  
  getDetail: (id) => animeApi.fetch(`/animeinweb?id=${id}`),
  
  getEpisode: (id, ep) => animeApi.fetch(`/animeinweb/episode?animeId=${id}&episodeNumber=${ep}`),
  
  // Get list genre untuk filter (sesuai dokumentasi)
  getGenres: () => animeApi.fetch('/genres'),
  
  // Download episode - resolution WAJIB sesuai dokumentasi
  getDownload: (id, ep, resolution) => {
    if (!resolution) {
      throw new Error('Resolution is required for download');
    }
    return animeApi.fetch(`/download/episode?animeId=${id}&episodeNumber=${ep}&resolution=${resolution}`);
  },
  
  // Batch download info - untuk mendapatkan info pembagian pack per 25 episode
  getBatchDownloadInfo: (id) => animeApi.fetch(`/download/batch-info?animeId=${id}`),
  
  // Batch download - untuk download beberapa episode sekaligus
  getBatchDownload: (id, resolution, startEpisode, endEpisode) => {
    if (!resolution) {
      throw new Error('Resolution is required for batch download');
    }
    return animeApi.fetch(`/download/batch?animeId=${id}&resolution=${resolution}&startEpisode=${startEpisode}&endEpisode=${endEpisode}`);
  },
};
