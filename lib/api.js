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

  getTrending: () => animeApi.fetch('/animeinweb/trending'),
  getNew: () => animeApi.fetch('/animeinweb/new'),
  getToday: () => animeApi.fetch('/animeinweb/today'),
  getSchedule: (day) => {
    // PASTIKAN selalu kirim parameter day ke API
    // JANGAN pernah kirim tanpa parameter karena akan return semua hari
    if (!day) {
      console.warn('[API] getSchedule called without day parameter! This will return all days.');
    }
    
    const dayParam = day ? encodeURIComponent(day.toLowerCase()) : '';
    const endpoint = `/animeinweb/schedule${dayParam ? `?day=${dayParam}` : ''}`;
    console.log(`[API] Fetching schedule from: ${endpoint}`);
    console.log(`[API] Day parameter sent: "${dayParam || '(MISSING - API will return ALL days!)'}"`);
    
    // Cache sudah di-disable di page level dan proxy route, jadi tidak perlu cache-busting di sini
    return animeApi.fetch(endpoint);
  },
  getDetail: (id) => animeApi.fetch(`/animeinweb?id=${id}`),
  getEpisode: (id, ep) => animeApi.fetch(`/animeinweb/episode?animeId=${id}&episodeNumber=${ep}`),
  // Search dengan support filter genre, sort, dan pagination (sesuai dokumentasi)
  search: (q, options = {}) => {
    const { genre, sort = 'views', page = 0 } = options;
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (genre) params.append('genre', genre);
    if (sort) params.append('sort', sort);
    if (page !== undefined) params.append('page', page);
    return animeApi.fetch(`/search?${params.toString()}`);
  },
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
