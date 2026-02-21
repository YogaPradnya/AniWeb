
// lib/api.js
// Base URL selalu production sesuai dokumentasi v1.2.0
const PRODUCTION_API = 'https://anime-api-three-jade.vercel.app/api/v1';

// Client-side: lewat proxy Next.js agar URL tidak terekspose
// Server-side: langsung ke production API
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return PRODUCTION_API;
  } else {
    return '/api/v1';
  }
};

function wrapImageProxy(obj) {
  if (typeof obj === 'string') {
    if (obj.match(/^https?:\/\/.*\.animein\.net\/.*\.(jpg|jpeg|png|webp|gif)/i)) {
      if (obj.includes('wsrv.nl')) return obj;
      return `https://wsrv.nl/?url=${encodeURIComponent(obj)}`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(wrapImageProxy);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = wrapImageProxy(obj[key]);
    }
    return newObj;
  }
  return obj;
}

export const animeApi = {
  // Internal fetch helper
  async _fetch(path, options = {}) {
    const base = getApiBaseUrl();
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      const data = await res.json();
      return wrapImageProxy(data);
    } catch (err) {
      console.error(`[API] Fetch error for ${url}:`, err.message);
      throw err;
    }
  },

  // === TRENDING ===
  // GET /api/v1/trending (alias dari /animeinweb/trending)
  // Response: { success: true, data: [{id, title, views, rank}], total }
  getTrending: async () => {
    try {
      const res = await animeApi._fetch('/trending');
      return (res.success && Array.isArray(res.data)) ? res.data : [];
    } catch {
      return [];
    }
  },

  // === ANIME BARU ===
  // GET /api/v1/new (alias dari /animeinweb/new)
  // Response: { success: true, data: [{id, title, isNew, thumbnail}], total }
  getNew: async () => {
    try {
      const res = await animeApi._fetch('/new');
      return (res.success && Array.isArray(res.data)) ? res.data : [];
    } catch {
      return [];
    }
  },

  // === ANIME HARI INI ===
  // GET /api/v1/today (alias dari /animeinweb/today)
  // Response: { success: true, data: { day, date, anime: [{title, episode, thumbnail}] } }
  getToday: async () => {
    try {
      const res = await animeApi._fetch('/today');
      if (res.success && res.data) {
        // Normalkan: return array anime
        return Array.isArray(res.data) ? res.data : (res.data.anime || []);
      }
      return [];
    } catch {
      return [];
    }
  },

  // === EPISODE TERBARU ===
  // GET /api/v1/latest
  // Response: { success: true, data: [{title, episode, link, thumbnail}], total }
  getLatest: async () => {
    try {
      const res = await animeApi._fetch('/latest');
      return (res.success && Array.isArray(res.data)) ? res.data : [];
    } catch {
      return [];
    }
  },

  // === JADWAL PER HARI ===
  // GET /api/v1/schedule?day={hari}
  // Response: { success: true, data: { currentDay: "SEN", schedule: [...] } }
  getSchedule: async (day = 'senin') => {
    try {
      const res = await animeApi._fetch(`/schedule?day=${day}`);
      if (res.success && res.data) return res.data;
      return { schedule: [], currentDay: day };
    } catch {
      return { schedule: [], currentDay: day };
    }
  },

  // === SEARCH ===
  // GET /api/v1/search?q={keyword}&genre={id}&sort={sort}&page={page}
  // Response: { success: true, data: [...], total, pagination: { currentPage, hasNextPage, totalResults }, filters: {...} }
  search: async (q = '', opts = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (opts.genre) params.set('genre', opts.genre);
    if (opts.sort) params.set('sort', opts.sort);
    if (opts.page !== undefined) params.set('page', opts.page);
    const query = params.toString();
    try {
      const res = await animeApi._fetch(`/search${query ? `?${query}` : ''}`);
      return res; // return full response agar pagination bisa diakses
    } catch {
      return { success: false, data: [], total: 0, pagination: { currentPage: 0, hasNextPage: false, totalResults: 0 } };
    }
  },

  // === LIST GENRE ===
  // GET /api/v1/genres
  // Response: { success: true, data: [{id, name}], total }
  getGenres: async () => {
    try {
      const res = await animeApi._fetch('/genres');
      return (res.success && Array.isArray(res.data)) ? res.data : [];
    } catch {
      return [];
    }
  },

  // === DETAIL ANIME ===
  // GET /api/v1/detail?slug={slug}  atau  ?url={url}
  // Response: { success: true, data: { title, alternativeTitle, synopsis, status, genres, episodes, cover, poster, views, favorites } }
  getDetail: async (slugOrId) => {
    try {
      const res = await animeApi._fetch(`/detail?slug=${encodeURIComponent(slugOrId)}`);
      if (res.success && res.data) return res.data;
      throw new Error('No data in response');
    } catch {
      return null;
    }
  },

  // === LIST ANIME ===
  // GET /api/v1/list?page={page}  (page mulai dari 1)
  // Response: { success: true, data: [{title, link}], total, page }
  getList: async (page = 1) => {
    try {
      const res = await animeApi._fetch(`/list?page=${page}`);
      return res; // return full response agar pagination bisa diakses
    } catch {
      return { success: false, data: [], total: 0, page };
    }
  },

  // === VIDEO EPISODE ===
  // GET /api/v1/animeinweb/episode?animeId={id}&episodeNumber={ep}
  // Response: { success: true, data: { animeId, episodeNumber, title, videoSources: [{url, resolution, quality, type, server}], resolutions, thumbnail } }
  getEpisode: async (animeId, episodeNumber) => {
    try {
      const res = await animeApi._fetch(
        `/animeinweb/episode?animeId=${encodeURIComponent(animeId)}&episodeNumber=${encodeURIComponent(episodeNumber)}`
      );
      if (res.success && res.data) return res.data;
      throw new Error('No episode data');
    } catch (err) {
      throw err;
    }
  },

  // === INFO ANIMEINWEB ===
  // GET /api/v1/animeinweb?id={animeId}
  // Response: { success: true, data: { title, alternativeTitle, synopsis, status, episodes, views, cover, poster } }
  getAnimeInfo: async (animeId) => {
    try {
      const res = await animeApi._fetch(`/animeinweb?id=${encodeURIComponent(animeId)}`);
      if (res.success && res.data) return res.data;
      return null;
    } catch {
      return null;
    }
  },
};
