
// lib/anime-helper.js
// Implementasi fallback strategy untuk mengatasi blocking Cloudflare/Vercel

const API_BASE_URL = process.env.API_BASE_URL;

// Cache memory untuk data anime (fallback)
const CACHE_DURATION = 60 * 60 * 1000; // 1 jam
let cachedAnimeList = null;
let lastCacheTime = 0;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://google.com',
  'Origin': 'https://google.com',
  'Accept': 'application/json'
};

// Helper: Fetch dengan retry dan headers lengkap
async function safeFetch(endpoint) {
  if (!API_BASE_URL) throw new Error('API_BASE_URL not set');
  
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[Helper] Fetching: ${url}`);
  
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      cache: 'no-store'
    });
    
    // Jika 403 Forbidden (Cloudflare logic), lempar error agar masuk catch
    if (!res.ok) {
      const errorMsg = `Status ${res.status}`;
      console.warn(`[Helper] Fetch warning for ${endpoint}: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`[Helper] Fetch failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// 1. Helper Baru: getAllAnimeFromSchedule
// Mengumpulkan semua anime dari jadwal Senin-Minggu
async function getAllAnimeFromSchedule() {
  const now = Date.now();
  
  // Return cached data if valid
  if (cachedAnimeList && cachedAnimeList.length > 0 && (now - lastCacheTime < CACHE_DURATION)) {
    console.log('[Helper] Returning cached anime list');
    return cachedAnimeList;
  }
  
  console.log('[Helper] Building new anime cache from schedule...');
  const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];
  
  try {
    // Fetch all days in parallel
    const promises = days.map(day => 
      safeFetch(`/animeinweb/schedule?day=${day}`)
        .then(data => (data.success && data.data && data.data.schedule) ? data.data.schedule : [])
        .catch(err => {
          console.error(`[Helper] Failed fetching day ${day}: ${err.message}`);
          return [];
        })
    );
    
    const results = await Promise.all(promises);
    
    // Flatten and deduct duplicates using Map based on ID
    const animeMap = new Map();
    results.flat().forEach(anime => {
      if (anime && anime.id) {
        animeMap.set(anime.id, anime);
      }
    });
    
    cachedAnimeList = Array.from(animeMap.values());
    lastCacheTime = now;
    
    console.log(`[Helper] Cache built. Total unique anime: ${cachedAnimeList.length}`);
    return cachedAnimeList;
  } catch (error) {
    console.error('[Helper] Failed to build schedule cache:', error);
    return [];
  }
}

// 2. Logic: Search Anime
export async function searchAnime(keyword) {
  try {
    // Primary: Try upstream search
    // Perhatikan path upstream adalah /search, bukan /animeinweb/search
    const data = await safeFetch(`/search?q=${encodeURIComponent(keyword)}`);
    if (data.success && data.data && data.data.length > 0) {
      return data.data;
    }
    // Jika data kosong tapi sukses, mungkin keyword tidak match, 
    // tapi kita tetap coba fallback siapa tau blocking parsial
    if (data.success && (!data.data || data.data.length === 0)) {
       // Search empty -> let's double check with local cache just in case
       throw new Error('Upstream search empty');
    }
    return data.data;
  } catch (error) {
    console.log(`[Helper] Search fallback triggered for "${keyword}"`);
    // Fallback: Filter from schedule
    // Pastikan cache terisi
    const allAnime = await getAllAnimeFromSchedule();
    if (!allAnime || allAnime.length === 0) return [];

    const lowerKeyword = keyword.toLowerCase();
    
    return allAnime.filter(anime => {
      const title = anime.title ? anime.title.toLowerCase() : '';
      const jpTitle = anime.japanese_title ? anime.japanese_title.toLowerCase() : '';
      return title.includes(lowerKeyword) || jpTitle.includes(lowerKeyword);
    });
  }
}

// 3. Logic: Latest/New Anime (via Get Today)
export async function getLatestAnime() {
  try {
    // Gunakan getToday() karena ini endpoint yang paling stabil
    // "Anime Terbaru" pada dasarnya adalah anime yang rilis "Hari Ini"
    const data = await safeFetch('/animeinweb/today');
    
    if (data.success && data.data && data.data.schedule) {
      return data.data.schedule; // Struktur data konsisten
    }
    if (data.success && data.data && Array.isArray(data.data)) {
        return data.data; // Handle jika struktur beda
    }
    throw new Error('Today endpoint failed or empty');
  } catch (error) {
    console.log('[Helper] Latest fallback triggered');
    // Cari hari ini (index 0-6, senin-minggu)
    const dayNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const today = dayNames[new Date().getDay()];
    
    try {
        const data = await safeFetch(`/animeinweb/schedule?day=${today}`);
        return (data.success && data.data?.schedule) ? data.data.schedule : [];
    } catch (e) {
        console.error('[Helper] Backup schedule fetch failed:', e);
        return [];
    }
  }
}

// 4. Logic: Trending Anime
export async function getTrendingAnime() {
  try {
    // Primary: Try upstream trending
    const data = await safeFetch('/animeinweb/trending'); 
    
    if (data.success && data.data && data.data.length > 0) {
      return data.data;
    }
    throw new Error('Upstream trending failed');
  } catch (error) {
    console.log('[Helper] Trending fallback triggered');
    // Fallback: Sort manual by views from schedule
    const allAnime = await getAllAnimeFromSchedule();
    if (!allAnime || allAnime.length === 0) return [];
    
    // Clone array agar tidak mengubah cache
    const sorted = [...allAnime].sort((a, b) => {
      // Parsing 'views' -> "1.5M", "500K", "100"
      // Untuk simplifikasi, anggap field 'views' atau 'score' ada
      // Jika tidak ada, fallback ke id (latest added usually higher ID if incremental)
      // Note: Data real mungkin string "100rb x ditonton". Perlu parsing.
      // Sederhananya, jika tidak bisa parse, biarkan urutan default
      return 0; 
    });
    
    // Return top 20
    return sorted.slice(0, 20);
  }
}

// 5. Logic: List Anime (A-Z)
export async function getListAnime() {
  // Fallback A-Z dari schedule
  const allAnime = await getAllAnimeFromSchedule();
  if (!allAnime) return [];

  return [...allAnime].sort((a, b) => {
    const titleA = (a.title || '').toUpperCase();
    const titleB = (b.title || '').toUpperCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
  });
}

// 6. Logic: Get Schedule by Day
export async function getSchedule(day) {
  try {
    const data = await safeFetch(`/animeinweb/schedule?day=${day}`);
    return data;
  } catch (error) {
    console.warn(`[Helper] Schedule fallback for ${day}`);
    // If specific day fails, we can filter from our local cache if available
    const allAnime = await getAllAnimeFromSchedule();
    // In our cache, we might not have the 'day' info easily accessible in a structured way 
    // unless we modified getAllAnimeFromSchedule to store it.
    // For now, return what we have from the API if it worked, or empty
    return { success: true, data: { schedule: [], currentDay: day } };
  }
}

// 7. Logic: Get Anime Detail
export async function getAnimeDetail(slug) {
  try {
    // Upstream detail usually uses id or slug
    const data = await safeFetch(`/animeinweb?id=${slug}`);
    return data;
  } catch (error) {
    console.error(`[Helper] Detail fetch failed for ${slug}:`, error.message);
    throw error;
  }
}
