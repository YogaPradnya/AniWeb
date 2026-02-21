
// test-api-local.js
// Test semua endpoint API v1.3.0 di localhost
// Menghasilkan laporan lengkap dengan penjelasan error & data 0
// Usage: node test-api-local.js

const BASE_URL = 'http://localhost:3000/api/v1';
const UPSTREAM  = 'https://anime-api-three-jade.vercel.app/api/v1';
const ANIME_ID  = '426';   // One Piece
const EP_NUM    = '1';
const SLUG      = 'one-piece';

// Penjelasan penyebab umum untuk setiap endpoint
const EXPLANATIONS = {
  'Latest Episodes': 'Scraping homepage animeinweb.com. Jika data=[]: upstream API tidak mengembalikan episode terbaru — bisa karena rate-limit, Cloudflare, atau website sedang down.',
  'Trending': 'Scraping halaman trending animeinweb.com. Data=[] berarti upstream API gagal scrape halaman tersebut.',
  'New Anime': 'Scraping halaman anime baru. Data=[] berarti upstream API gagal memuat daftar anime baru.',
  'Today': 'Bergantung pada /schedule hari ini. Data=[] berarti schedule hari ini kosong atau upstream timeout.',
  'Genres': 'Cache 24 jam. Jika error: upstream API tidak merespons endpoint /genres.',
  'Schedule senin': 'Scraping halaman jadwal. Data=[] normal jika upstream API belum memuat data hari itu, atau ada perbedaan timezone.',
  'Search naruto': 'Scraping halaman search. Data=[] berarti query "naruto" tidak mengembalikan hasil dari upstream — kemungkinan Cloudflare blocking.',
  'Search genre action': 'Filter berdasarkan genre ID=14 (Action). Data=[] = upstream tidak merespons filter genre.',
  'AnimeInWeb Info': 'Scraping halaman anime by ID langsung. Error 404/500 umum terjadi jika ID tidak valid atau upstream timeout.',
  'AnimeInWeb Episode': 'Scraping halaman video episode. Error umum karena perlu mencari dengan maxSearchPages=50 — butuh waktu lama (>30 detik bisa timeout).',
  'AnimeInWeb/Schedule alias': 'Alias dari /schedule. Harus identik dengan hasil /schedule.',
  'AnimeInWeb/Trending alias': 'Alias dari /trending. Harus identik dengan hasil /trending.',
  'AnimeInWeb/New alias': 'Alias dari /new. Harus identik dengan hasil /new.',
  'AnimeInWeb/Today alias': 'Alias dari /today. Harus identik dengan hasil /today.',
  'Detail by slug': 'Cari anime via slug "one-piece". Pertama search keyword, lalu fetch detail. Double-fetch = lebih rentan timeout upstream.',
  'Detail by ID': 'Cari anime via ID numerik. Serupa dengan slug — rentan timeout jika upstream lambat.',
  'List page 1': 'Scraping daftar semua anime. Data=[] berarti upstream tidak merespons endpoint list.',
};

async function testEndpoint(label, url) {
  const start = Date.now();
  let result = { label, url, status: 0, success: false, items: 0, error: null, raw: null, ms: 0 };

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(35000) });
    result.status = res.status;
    result.ms = Date.now() - start;

    let data;
    try { 
      data = await res.json(); 
    } catch { 
      // Bila response beripa binary file (seperti /image) atau text
      data = { success: res.ok, isBinary: !res.headers.get('content-type')?.includes('json') }; 
    }
    result.raw = data;

    result.success = data.success === true;
    result.error = data.error || null;

    // Hitung item count
    if (Array.isArray(data.data))               result.items = data.data.length;
    else if (Array.isArray(data.data?.schedule)) result.items = data.data.schedule.length;
    else if (Array.isArray(data.data?.anime))    result.items = data.data.anime.length;
    else if (data.data && typeof data.data === 'object') result.items = 1;
    else if (data.isBinary)                      result.items = 1; // image returned

    if (!result.success && !result.error && data.error) result.error = data.error;

  } catch (err) {
    result.ms = Date.now() - start;
    result.error = err.name === 'TimeoutError' ? 'Request timeout >35 detik' : err.message;
  }

  const icon  = result.success && result.items > 0 ? '✅' : result.success ? '⚠️' : '❌';
  const label_ = label.padEnd(28);
  console.log(`${icon} ${label_} | HTTP ${result.status} | items: ${String(result.items).padStart(3)} | ${result.ms}ms${result.error ? ` | ERR: ${result.error}` : ''}`);

  return result;
}

// ─── Jalankan Semua Test ──────────────────────────────────────────────────────
async function runTests() {
  console.log('='.repeat(75));
  console.log(' AnimeAPI Local Test Report — v1.3.0');
  console.log(` Waktu  : ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA`);
  console.log(` Base URL: ${BASE_URL}`);
  console.log('='.repeat(75));
  console.log(`${'Endpoint'.padEnd(29)} | Status | Items | ms    | Error`);
  console.log('-'.repeat(75));

  const tests = [
    ['Latest Episodes',           `${BASE_URL}/latest`],
    ['Trending',                  `${BASE_URL}/trending`],
    ['New Anime',                 `${BASE_URL}/new`],
    ['Today',                     `${BASE_URL}/today`],
    ['Genres',                    `${BASE_URL}/genres`],
    ['Schedule senin',            `${BASE_URL}/schedule?day=senin`],
    ['Search naruto',             `${BASE_URL}/search?q=naruto`],
    ['Search genre action',       `${BASE_URL}/search?genre=14&sort=views`],
    ['AnimeInWeb Info',           `${BASE_URL}/animeinweb?id=${ANIME_ID}`],
    ['AnimeInWeb Episode',        `${BASE_URL}/animeinweb/episode?animeId=${ANIME_ID}&episodeNumber=${EP_NUM}`],
    ['AnimeInWeb/Schedule alias', `${BASE_URL}/animeinweb/schedule?day=senin`],
    ['AnimeInWeb/Trending alias', `${BASE_URL}/animeinweb/trending`],
    ['AnimeInWeb/New alias',      `${BASE_URL}/animeinweb/new`],
    ['AnimeInWeb/Today alias',    `${BASE_URL}/animeinweb/today`],
    ['Detail by slug',            `${BASE_URL}/detail?slug=${SLUG}`],
    ['Detail by ID',              `${BASE_URL}/detail?slug=${ANIME_ID}`],
    ['List page 1',               `${BASE_URL}/list?page=1`],
  ];

  const results = [];
  for (const [label, url] of tests) {
    results.push(await testEndpoint(label, url));
  }

  // ─── Summary ──────────────────────────────────────────────────────────────
  const passed   = results.filter(r => r.success && r.items > 0).length;
  const warnings = results.filter(r => r.success && r.items === 0).length;
  const failed   = results.filter(r => !r.success).length;

  console.log('='.repeat(75));
  console.log(`SUMMARY: ✅ ${passed} OK  |  ⚠️  ${warnings} data=0  |  ❌ ${failed} error  |  Total: ${results.length}`);
  console.log('='.repeat(75));

  // ─── Generate Markdown Report ─────────────────────────────────────────────
  const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' });
  const lines = [];

  lines.push(`# 📊 AnimeAPI Test Report — v1.3.0`);
  lines.push(`\n> **Waktu Test:** ${now} WITA  `);
  lines.push(`> **Base URL:** \`${BASE_URL}\`  `);
  lines.push(`> **Upstream API:** \`${UPSTREAM}\`\n`);

  // Tabel semua hasil
  lines.push(`## ☑️ Semua Hasil Test\n`);
  lines.push(`| # | Endpoint | Status | Items | ms | Ket |`);
  lines.push(`|---|-----------|--------|-------|----|-----|`);
  results.forEach((r, i) => {
    const icon = r.success && r.items > 0 ? '✅' : r.success ? '⚠️' : '❌';
    const ket  = r.error ? `\`${r.error.slice(0, 60)}\`` : r.items === 0 ? 'Data kosong' : 'OK';
    lines.push(`| ${i+1} | ${icon} \`${r.label}\` | ${r.status} | ${r.items} | ${r.ms}ms | ${ket} |`);
  });

  // ─── Seksi Error ──────────────────────────────────────────────────────────
  const errors = results.filter(r => !r.success);
  if (errors.length > 0) {
    lines.push(`\n---\n\n## ❌ Endpoint Error (${errors.length})\n`);
    errors.forEach(r => {
      lines.push(`### \`${r.label}\``);
      lines.push(`- **URL:** \`${r.url}\``);
      lines.push(`- **HTTP Status:** \`${r.status}\``);
      lines.push(`- **Error:** \`${r.error || 'Unknown'}\``);
      lines.push(`- **Response Time:** ${r.ms}ms`);
      lines.push(`\n**🔍 Kemungkinan Penyebab:**`);
      const exp = EXPLANATIONS[r.label] || 'Periksa log server Next.js untuk detail lebih lanjut.';
      lines.push(`> ${exp}`);
      lines.push(`\n**🛠️ Cara Debug:**`);
      lines.push(`\`\`\`bash`);
      lines.push(`# Test langsung ke upstream API:`);
      lines.push(`curl "${r.url.replace(BASE_URL, UPSTREAM)}"`);
      lines.push(`\`\`\``);
      lines.push('');
    });
  }

  // ─── Seksi Data Kosong ────────────────────────────────────────────────────
  const empties = results.filter(r => r.success && r.items === 0);
  if (empties.length > 0) {
    lines.push(`\n---\n\n## ⚠️ Endpoint dengan Data Kosong (${empties.length})\n`);
    lines.push(`Endpoint ini berhasil merespons (\`success: true\`) namun **tidak mengembalikan data**.\n`);
    empties.forEach(r => {
      lines.push(`### \`${r.label}\``);
      lines.push(`- **URL:** \`${r.url}\``);
      lines.push(`- **HTTP Status:** \`${r.status}\` — Route aktif ✅`);
      lines.push(`- **Items:** 0`);
      lines.push(`- **Response Time:** ${r.ms}ms`);
      lines.push(`\n**🔍 Kemungkinan Penyebab:**`);
      const exp = EXPLANATIONS[r.label] || 'Data mungkin belum tersedia atau upstream sedang tidak merespons dengan data.';
      lines.push(`> ${exp}`);
      lines.push(`\n**💡 Cara Verifikasi:**`);
      lines.push(`\`\`\`bash`);
      lines.push(`# Coba langsung ke production API:`);
      lines.push(`curl "${r.url.replace(BASE_URL, UPSTREAM)}"`);
      lines.push(`\`\`\``);
      lines.push('');
    });
  }

  // ─── Seksi OK ─────────────────────────────────────────────────────────────
  const oks = results.filter(r => r.success && r.items > 0);
  if (oks.length > 0) {
    lines.push(`\n---\n\n## ✅ Endpoint Berhasil (${oks.length})\n`);
    oks.forEach(r => {
      lines.push(`- **\`${r.label}\`** → ${r.items} item(s) dalam ${r.ms}ms`);
    });
  }

  // ─── Analisis Keseluruhan ─────────────────────────────────────────────────
  lines.push(`\n---\n\n## 📝 Analisis & Rekomendasi\n`);

  if (failed === 0 && warnings === 0) {
    lines.push(`> ✅ Semua endpoint berjalan sempurna dengan data yang ada.\n`);
  } else {
    lines.push(`### Kemungkinan Penyebab Utama (Data Kosong / Error)\n`);
    lines.push(`1. **Upstream API (animeinweb.com) lambat atau down**`);
    lines.push(`   - Cek status: \`curl "${UPSTREAM}/trending"\``);
    lines.push(`   - Jika timeout, tunggu beberapa menit dan coba lagi\n`);
    lines.push(`2. **Cloudflare / Rate Limiting**`);
    lines.push(`   - animeinweb.com menggunakan Cloudflare`);
    lines.push(`   - Terlalu banyak request dalam waktu singkat bisa menyebabkan 403/blocking\n`);
    lines.push(`3. **Scraping Webpage Lambat**`);
    lines.push(`   - Endpoint animeinweb/episode dan detail memerlukan multi-page scraping`);
    lines.push(`   - Default timeout 30 detik bisa terlewati untuk episode besar\n`);
    lines.push(`4. **Cache Lokal**`);
    lines.push(`   - Beberapa endpoint memiliki revalidate cache (genres=24jam, detail=30mnt)`);
    lines.push(`   - Coba hard reload: tambahkan \`?_=(timestamp)\` ke URL\n`);
    lines.push(`### Rekomendasi\n`);
    lines.push(`\`\`\`bash`);
    lines.push(`# 1. Periksa apakah upstream API berjalan:`);
    lines.push(`curl "${UPSTREAM}/latest"`);
    lines.push(``);
    lines.push(`# 2. Test dengan timeout lebih longgar dari CLI:`);
    lines.push(`curl --max-time 60 "${UPSTREAM}/animeinweb/episode?animeId=426&episodeNumber=1"`);
    lines.push(``);
    lines.push(`# 3. Cek log server Next.js untuk error detail:`);
    lines.push(`# (lihat terminal yang menjalankan npm run dev)`);
    lines.push(`\`\`\``);
  }

  lines.push(`\n---`);
  lines.push(`\n*Generated by \`test-api-local.js\` pada ${now} WITA*`);

  // ─── Tulis ke File ────────────────────────────────────────────────────────
  const fs = require('fs');
  const reportMd  = lines.join('\n');
  const reportJson = JSON.stringify(results.map(r => ({
    label: r.label, url: r.url, status: r.status,
    success: r.success, items: r.items, ms: r.ms,
    error: r.error
  })), null, 2);

  fs.writeFileSync('api_test_report.md', reportMd);
  fs.writeFileSync('api_local_test_results.json', reportJson);

  console.log(`\n📄 Laporan tersimpan di: api_test_report.md`);
  console.log(`📄 Data JSON tersimpan : api_local_test_results.json`);
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
