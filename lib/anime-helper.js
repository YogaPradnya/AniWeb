
// lib/anime-helper.js
// Helper untuk route handlers Next.js — memanggil production API
// Semua endpoint sesuai dokumentasi API v1.2.0

const PRODUCTION_API = 'https://anime-api-three-jade.vercel.app/api/v1';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

function wrapImageProxy(obj) {
  if (typeof obj === 'string') {
    // Jika ia adalah URL gambar dari animein.net (biasanya api.animein.net atau xyz-api.animein.net)
    if (obj.match(/^https?:\/\/.*\.animein\.net\/.*\.(jpg|jpeg|png|webp|gif)/i)) {
      if (obj.includes('wsrv.nl')) return obj; // jangan double proxy
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

async function apiFetch(path) {
  const url = `${PRODUCTION_API}${path}`;
  console.log(`[Helper] Fetching: ${url}`);
  const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  const data = await res.json();
  
  // Warp secara otomatis semua link gambar menjadi proxy wsrv.nl
  return wrapImageProxy(data);
}

// ─── 1. Latest Episodes ───────────────────────────────────────────────────────
// GET /api/v1/latest
// Response: { success, data: [{title, episode, link, thumbnail}], total }
export async function getLatestAnime() {
  try {
    const data = await apiFetch('/latest');
    return (data.success && Array.isArray(data.data)) ? data.data : [];
  } catch (err) {
    console.error('[Helper] getLatestAnime failed:', err.message);
    return [];
  }
}

// ─── 2. Trending ──────────────────────────────────────────────────────────────
// GET /api/v1/trending  (alias dari /animeinweb/trending)
// Response: { success, data: [{id, title, views, rank}], total }
export async function getTrendingAnime() {
  try {
    const data = await apiFetch('/trending');
    return (data.success && Array.isArray(data.data)) ? data.data : [];
  } catch (err) {
    console.error('[Helper] getTrendingAnime failed:', err.message);
    return [];
  }
}

// ─── 3. Anime Baru ────────────────────────────────────────────────────────────
// GET /api/v1/new  (alias dari /animeinweb/new)
// Response: { success, data: [{id, title, isNew, thumbnail}], total }
export async function getNewAnime() {
  try {
    const data = await apiFetch('/new');
    return (data.success && Array.isArray(data.data)) ? data.data : [];
  } catch (err) {
    console.error('[Helper] getNewAnime failed:', err.message);
    return [];
  }
}

// ─── 4. Anime Hari Ini ────────────────────────────────────────────────────────
// GET /api/v1/today  (alias dari /animeinweb/today)
// Response: { success, data: { day, date, anime: [{title, episode, thumbnail}] } }
export async function getTodayAnime() {
  try {
    const data = await apiFetch('/today');
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data : (data.data.anime || []);
    }
    return [];
  } catch (err) {
    console.error('[Helper] getTodayAnime failed:', err.message);
    return [];
  }
}

// ─── 5. Schedule ──────────────────────────────────────────────────────────────
// GET /api/v1/schedule?day={hari}
// day: senin | selasa | rabu | kamis | jumat | sabtu | minggu | random
// Response: { success, data: { currentDay: "SEN", schedule: [{animeId, title, genre, views, releaseTime, thumbnail, isNew, status}] } }
export async function getSchedule(day = 'senin') {
  try {
    const data = await apiFetch(`/schedule?day=${encodeURIComponent(day)}`);
    if (data.success && data.data) return data.data;
    return { schedule: [], currentDay: day };
  } catch (err) {
    console.error(`[Helper] getSchedule(${day}) failed:`, err.message);
    return { schedule: [], currentDay: day };
  }
}

// ─── 6. Search ────────────────────────────────────────────────────────────────
// GET /api/v1/search?q={keyword}&genre={id}&sort={sort}&page={page}
// sort: views | title | favorites | newest   (default: views)
// page: mulai dari 0
// Response: { success, data: [...], total, pagination: { currentPage, hasNextPage, totalResults }, filters }
export async function searchAnime(keyword = '', opts = {}) {
  try {
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (opts.genre) params.set('genre', opts.genre);
    if (opts.sort) params.set('sort', opts.sort);
    if (opts.page !== undefined) params.set('page', opts.page);
    const query = params.toString();
    const data = await apiFetch(`/search${query ? `?${query}` : ''}`);
    return data; // return full response  
  } catch (err) {
    console.error('[Helper] searchAnime failed:', err.message);
    return { success: false, data: [], total: 0, pagination: { currentPage: 0, hasNextPage: false, totalResults: 0 } };
  }
}

// ─── 7. Genres ────────────────────────────────────────────────────────────────
// GET /api/v1/genres
// Response: { success, data: [{id, name}], total }
export async function getGenres() {
  try {
    const data = await apiFetch('/genres');
    return (data.success && Array.isArray(data.data)) ? data.data : [];
  } catch (err) {
    console.error('[Helper] getGenres failed:', err.message);
    return [];
  }
}

// ─── 8. Detail Anime ─────────────────────────────────────────────────────────
// GET /api/v1/detail?slug={slug}  atau  ?url={url}
// Response: { success, data: { title, alternativeTitle, synopsis, status, genres, episodes, cover, poster, views, favorites } }
export async function getAnimeDetail(slugOrId) {
  try {
    const data = await apiFetch(`/detail?slug=${encodeURIComponent(slugOrId)}`);
    if (data.success && data.data) return data.data;
    throw new Error('No data in detail response');
  } catch (err) {
    console.error(`[Helper] getAnimeDetail(${slugOrId}) failed:`, err.message);
    throw err;
  }
}

// ─── 9. List Anime ───────────────────────────────────────────────────────────
// GET /api/v1/list?page={page}  (page mulai dari 1)
// Response: { success, data: [{title, link}], total, page }
export async function getListAnime(page = 1) {
  try {
    const data = await apiFetch(`/list?page=${page}`);
    return data; // return full response
  } catch (err) {
    console.error('[Helper] getListAnime failed:', err.message);
    return { success: false, data: [], total: 0, page };
  }
}

// ─── 10. Video Episode ───────────────────────────────────────────────────────
// GET /api/v1/animeinweb/episode?animeId={id}&episodeNumber={ep}
// Response: { success, data: { animeId, episodeNumber, title, videoSources: [{url, resolution, quality, type, server}], resolutions, thumbnail } }
export async function getAnimeEpisode(animeId, episodeNumber) {
  try {
    const data = await apiFetch(`/animeinweb/episode?animeId=${encodeURIComponent(animeId)}&episodeNumber=${encodeURIComponent(episodeNumber)}`);
    if (data.success && data.data) return data.data;
    throw new Error('No episode data');
  } catch (err) {
    console.error(`[Helper] getAnimeEpisode(${animeId}, ep${episodeNumber}) failed:`, err.message);
    throw err;
  }
}

// ─── 11. Info AnimeInWeb ─────────────────────────────────────────────────────
// GET /api/v1/animeinweb?id={animeId}
// Response: { success, data: { title, alternativeTitle, synopsis, status, episodes, views, cover, poster } }
export async function getAnimeInWebInfo(animeId) {
  try {
    const data = await apiFetch(`/animeinweb?id=${encodeURIComponent(animeId)}`);
    if (data.success && data.data) return data.data;
    return null;
  } catch (err) {
    console.error(`[Helper] getAnimeInWebInfo(${animeId}) failed:`, err.message);
    return null;
  }
}
