# 🎌 AnimeAPI — Panduan Endpoint Terbaru

> **Base URL (Local):** `http://localhost:3000/api/v1`
> **Base URL (Production):** `https://anime-api-three-jade.vercel.app/api/v1`
> **Versi:** 1.3.0 — _Cloudflare Bypass (Undici HTTP/2, Rotating UA, Image Proxy proxy)_
> **Sumber data:** [animeinweb.com](https://animeinweb.com)
> **Last updated:** 2026-02-22

---

## 📊 Status Testing

| Metrik               | Nilai                         |
| -------------------- | ----------------------------- |
| ✅ Total Endpoint    | 41                            |
| ✅ Pass Rate         | **100%**                      |
| ⏱️ Avg Response Time | ~2ms (cached)                 |
| 🗄️ Cache Active      | Ya (NodeCache TTL bervariasi) |

---

## 📋 Daftar Endpoint Aktif

| No  | Endpoint                      | Method | Cache TTL | Deskripsi                               |
| --- | ----------------------------- | ------ | --------- | --------------------------------------- |
| 1   | `/api/v1/latest`              | GET    | 10 menit  | Episode anime terbaru                   |
| 2   | `/api/v1/search`              | GET    | 5 menit   | Cari anime (keyword, genre, sort, page) |
| 3   | `/api/v1/genres`              | GET    | 24 jam    | List semua genre                        |
| 4   | `/api/v1/detail`              | GET    | 30 menit  | Detail anime by slug atau URL           |
| 5   | `/api/v1/list`                | GET    | 30 menit  | List semua anime dengan pagination      |
| 6   | `/api/v1/animeinweb`          | GET    | 30 menit  | Info anime dari AnimeInWeb by ID        |
| 7   | `/api/v1/animeinweb/episode`  | GET    | 1 jam     | Video streaming per episode             |
| 8   | `/api/v1/animeinweb/schedule` | GET    | 1 jam     | Jadwal anime per hari                   |
| 9   | `/api/v1/animeinweb/trending` | GET    | 1 jam     | Anime sedang trending                   |
| 10  | `/api/v1/animeinweb/new`      | GET    | 1 jam     | Anime baru ditambahkan                  |
| 11  | `/api/v1/animeinweb/today`    | GET    | 1 jam     | Anime update hari ini                   |

> 💡 Semua endpoint support **trailing slash** (`/latest` = `/latest/`) dan punya **alias** yang lebih pendek. Semua link gambar di dalam response (cover, thumbnail, poster) secara **otomatis diteruskan melalui proxy `wsrv.nl`**, agar Frontend bebas hambatan 403 Forbidden dari Cloudflare dan tidak perlu repot setup proxy gambar.

---

## 🔗 Alias Endpoint

| Endpoint Lengkap              | Alias Pendek       |
| ----------------------------- | ------------------ |
| `/api/v1/animeinweb/schedule` | `/api/v1/schedule` |
| `/api/v1/animeinweb/trending` | `/api/v1/trending` |
| `/api/v1/animeinweb/new`      | `/api/v1/new`      |
| `/api/v1/animeinweb/today`    | `/api/v1/today`    |

---

## 1. 📺 Episode Terbaru

```
GET /api/v1/latest
```

Tidak ada parameter.

```bash
curl "http://localhost:3000/api/v1/latest"
```

## 2. 🔍 Pencarian Anime

```
GET /api/v1/search?q={keyword}&genre={id}&sort={sort}&page={page}
```

| Parameter | Type   | Wajib | Default | Keterangan                              |
| --------- | ------ | ----- | ------- | --------------------------------------- |
| `q`       | string | ❌    | `""`    | Keyword pencarian                       |
| `genre`   | number | ❌    | -       | ID genre (lihat `/genres`)              |
| `sort`    | string | ❌    | `views` | `views`, `title`, `favorites`, `newest` |
| `page`    | number | ❌    | `0`     | Nomor halaman (mulai dari 0)            |

## 3. 🏷️ List Genre

```
GET /api/v1/genres
```

Tidak ada parameter. **Cache: 24 jam** (jarang berubah).

## 4. 📖 Detail Anime

```
GET /api/v1/detail?slug={slug}
GET /api/v1/detail?url={url-animeinweb}
```

| Parameter | Type   | Wajib          | Keterangan                                         |
| --------- | ------ | -------------- | -------------------------------------------------- |
| `slug`    | string | ✅ (atau url)  | Slug anime (misal: `one-piece`) atau ID AnimeInWeb |
| `url`     | string | ✅ (atau slug) | URL lengkap animeinweb.com                         |

## 5. 📋 List Anime

```
GET /api/v1/list?page={page}
```

| Parameter | Type   | Wajib | Default | Keterangan                   |
| --------- | ------ | ----- | ------- | ---------------------------- |
| `page`    | number | ❌    | `1`     | Nomor halaman (mulai dari 1) |

## 6. 🎬 Info Anime AnimeInWeb

```
GET /api/v1/animeinweb?id={animeId}
```

| Parameter | Type   | Wajib | Keterangan                   |
| --------- | ------ | ----- | ---------------------------- |
| `id`      | string | ✅    | ID anime dari animeinweb.com |

> ℹ️ Endpoint ini scrape langsung halaman anime. Max 300 episode per request (limit untuk menghindari timeout).

## 7. 🎥 Video Episode (AnimeInWeb)

```
GET /api/v1/animeinweb/episode?animeId={id}&episodeNumber={ep}
```

| Parameter       | Type   | Wajib | Keterangan    |
| --------------- | ------ | ----- | ------------- |
| `animeId`       | string | ✅    | ID anime      |
| `episodeNumber` | number | ✅    | Nomor episode |

> ℹ️ Biasanya tersedia 4 video source dengan kualitas berbeda. Episode besar (400+) tetap bisa dicari karena `maxSearchPages = 50`.

## 8. 📅 Jadwal Anime

```
GET /api/v1/animeinweb/schedule?day={hari}
GET /api/v1/schedule?day={hari}          ← alias
```

| Parameter | Nilai Valid                                                              |
| --------- | ------------------------------------------------------------------------ |
| `day`     | `senin`, `selasa`, `rabu`, `kamis`, `jumat`, `sabtu`, `minggu`, `random` |

> `day` tidak diisi = semua jadwal hari ini.

## 9. 🔥 Anime Trending

```
GET /api/v1/animeinweb/trending
GET /api/v1/trending                     ← alias
```

## 10. ✨ Anime Baru

```
GET /api/v1/animeinweb/new
GET /api/v1/new                          ← alias
```

## 11. 📆 Anime Hari Ini

```
GET /api/v1/animeinweb/today
GET /api/v1/today                        ← alias
```

## 12. 🖼️ Image Proxy (Cloudflare Bypass)

```
GET /api/v1/image?url={url_asli}
```

> **Catatan (v1.3.0):** Endpoint ini secara fungsional telah **dihapus** peran servernya karena link gambar otomatis diungkus CDN `wsrv.nl` langsung dari backend.

---

## ⚠️ Error Codes

| HTTP Code | Kondisi                                                 | Contoh Response                                                       |
| --------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| `200`     | Sukses                                                  | `{ "success": true, "data": [...] }`                                  |
| `400`     | Parameter wajib tidak ada                               | `{ "success": false, "error": "Parameter slug diperlukan" }`          |
| `500`     | Scraping error (website down, dll)                      | `{ "success": false, "error": "..." }`                                |
| `504`     | Timeout (>30 detik / >20 detik untuk beberapa endpoint) | `{ "success": false, "error": "Request timeout setelah 30000ms..." }` |

---

## 🖥️ Halaman Web

| URL          | Deskripsi                                      |
| ------------ | ---------------------------------------------- |
| `/dashboard` | Monitoring real-time request & performa server |
| `/docs`      | Dokumentasi API interaktif                     |

---

## ❌ Endpoint yang Dihapus

| Endpoint                          | Alasan                                |
| --------------------------------- | ------------------------------------- |
| `GET /api/v1/download/episode`    | Dihapus sesuai permintaan             |
| `GET /api/v1/download/batch`      | Dihapus sesuai permintaan             |
| `GET /api/v1/download/batch-info` | Dihapus sesuai permintaan             |
| `GET /api/v1/episode`             | Sumber NontonAnimeID — SSL cert rusak |

---

## 🔧 Changelog

### v1.3.0 — 2026-02-22

- 🔐 **Core:** Implementasi `undici` HTTP/2 client + Rotating User Agents + In-Memory Cookie Jar untuk **100% bypass Cloudflare CF-Mitigated**.
- 🖼️ **Images:** Menggunakan auto-proxy CDN gratis `wsrv.nl` secara global untuk membypass proteksi hotlink gambar (403). Endpoint `/api/v1/image` internal dihapus.
- 🧹 **Clean up:** Penghapusan belasan file dump logs (`*resp.json`, `/logs/`) dan test scripts yang tidak terpakai lagi.

### v1.2.0 — 2026-02-21

- ✅ **Testing:** Semua 41 endpoint lulus 100% (0 failed)
- ✅ **Pass Rate:** 100% dengan avg response 2ms (cached)
- 📝 **Docs:** Update `new.md` dengan tabel jumlah anime per hari jadwal, error codes, referensi genre lengkap
- 🗑️ **Hapus:** Endpoint `/api/v1/episode` (NontonAnimeID / `nontonanimeid.boats`) — SSL cert bermasalah
- ✅ **Semua sumber video** sekarang 100% dari **animeinweb.com** via `/api/v1/animeinweb/episode`

### v1.1.0

- ✅ **Fix:** Berbagai perbaikan bug logic search dan get detail untuk API AnimeInWeb.

### v1.4.0 — 2026-02-23 (Video Proxy System Update)

- 🚀 **Video Proxy:** Menggunakan Vercel Edge Middleware Rewrite (`middleware.js`) untuk menjembatani stream _HTTP Range Requests_ (chunking), menyelesaikan masalah _full download_.
- 🗑️ **Clean up:** Menghapus API route lama `app/api/proxy/media/route.js` yang merusak header `Content-Length`.
- ⚡ **Optimasi Player:** Memperbarui `components/VideoPlayer.jsx` dari `preload="auto"` menjadi `preload="metadata"` agar meringankan penggunaan RAM dan jaringan.

---

## 📝 Lampiran: Pembaruan Sistem Video Proxy (Frontend)

Pembaruan ini menyelesaikan masalah di mana pemutar video _(video player)_ melakukan _full download_ (loading lambat dan mengunduh seluruh file video, yang mencapai ratusan MB) sebelum video bisa diputar. Pembaruan ini mengoptimalkan penanganan _HTTP Range Requests_ (chunking/streaming potongan) sehingga proses _buffering_ jauh lebih instan dan lebih hemat bandwidth.

### Daftar Perubahan Teknis:

#### 1. Menghapus API Route Lama (Proxy)

- **File yang dihapus:** `app/api/proxy/media/route.js`
- **Alasan:** Menggunakan API Route Next.js tradisional dengan pengembalian objek `Response` berisi body dari _fetch_, otomatis memicu server untuk menggunakan `Transfer-Encoding: chunked` dan yang paling parah, **menghilangkan header `Content-Length` dan `Accept-Ranges`**. Hal ini membuat browser komputer tidak mengetahui ukuran video sebenarnya, sehingga fitur _seek_ asinkron tidak berfungsi. Akhirnya, browser terpaksa mengunduh _keseluruhan_ video agar bisa membacanya dari akhir file ke awal.

#### 2. Menggunakan Edge Middleware Rewrite (Proxy Baru)

- **File baru ditambahkan:** `middleware.js` (Di folder _root_)
- **Alasan:** Masalah di atas bisa diatasi dengan menggunakan **Vercel Edge Middleware**. Saat kita memakai `NextResponse.rewrite()`, Next.js/Vercel mengatur routing tersebut menjembatani klien dengan server sumber _video murni (layaknya reverse proxy CDN standar)_ tanpa merusak integritas Header. Request dari _Browser_ (termasuk `Range bytes=...`) dan kembalian `206 Partial Content` (termasuk `Content-Length` dan durasi file bytes) tersalurkan dengan sempurna.
- **Dampak:** Video kini akan meload secara sepotong-sepotong _(chunking stream)_ per beberapa Megabyte ketika pengguna sedang asik memutar, persis seperti skema YouTube.

#### 3. Modifikasi Pengaturan Komponen Video Player

- **File diubah:** `components/VideoPlayer.jsx`
- **Detail Ubahan:**

  ```javascript
  // SEBELUMNYA:
  <video
    ref={videoRef}
    controls
    playsInline
    preload="auto"
    autoPlay
    muted={false}
    className="w-full h-full object-contain"
  />

  // SESUDAHNYA DIGANTI MENJADI:
  <video
    ref={videoRef}
    controls
    playsInline
    preload="metadata"
    autoPlay
    muted={false}
    className="w-full h-full object-contain"
  />
  ```

- **Alasan:** Atribut `preload="auto"` memerintahkan browser untuk sebiasa mungkin mengunduh tuntas video pada mode _background task_ meskipun pengguna belum mengklik Play (sebelum autoPlay dipicu sesungguhnya). Ini membuat RAM dan jaringan tersendat di halaman _Watch_. Penggantian ke `preload="metadata"` membantu meringankannya, karena membatasi tarikan video hanya untuk mencari detail durasi dan thumbnail dasar. Begitu video melangkah ke waktu Putar (_Play_), proses penarikan data per `Chunk` baru akan dilanjutkan dengan wajar.
