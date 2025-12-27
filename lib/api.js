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
    const endpoint = `/animeinweb/schedule${day ? `?day=${day}` : ''}`;
    console.log(`[API] Fetching schedule from: ${endpoint}`);
    return animeApi.fetch(endpoint);
  },
  getDetail: (id) => animeApi.fetch(`/animeinweb?id=${id}`),
  getEpisode: (id, ep) => animeApi.fetch(`/animeinweb/episode?animeId=${id}&episodeNumber=${ep}`),
  search: (q) => animeApi.fetch(`/search?q=${encodeURIComponent(q)}`),
  getDownload: (id, ep, res) => animeApi.fetch(`/download/episode?animeId=${id}&episodeNumber=${ep}${res ? `&resolution=${res}` : ''}`),
};
