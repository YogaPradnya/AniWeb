# Kebutuhan Tambahan Backend API untuk Sidebar Links

Saat ini, desain streamnime yang baru memiliki tautan spesifik di sidebar seperti **Ongoing**, **Completed**, **TV Series**, **Movies**, dan **Live Action**. Namun, endpoint API `/api/v1/search` saat ini mungkin belum mendukung filter melalui parameter ini.

Untuk mendukung fitur-fitur tersebut sepenuhnya agar dinamis dan tepat sasaran, berikut adalah rekomendasi pembaruan pada Backend API Anda (baik kode Next.js `route.js` atau upstream AnimeInWeb scraper):

## 1. Filter Berdasarkan Status Rilis

Endpoint pencarian (`/api/v1/search`) sebaiknya mendukung parameter query `status`.

- **GET** `/api/v1/search?status=ongoing`
- **GET** `/api/v1/search?status=completed`

## 2. Filter Berdasarkan Tipe Tayangan (Type)

Sebaiknya mendukung parameter query `type`.

- **GET** `/api/v1/search?type=tv`
- **GET** `/api/v1/search?type=movie`
- **GET** `/api/v1/search?type=live-action`

## 3. Bug pada Jadwal (Schedule) Hari Sabtu

Saat parameter `day=sabtu` dikirimkan ke `/api/v1/schedule?day=sabtu`, API merespons dengan `currentDay: "SAB"` namun array `schedule` selalu **kosong** (`[]`).

Indikasi masalah pada _upstream (Backend Scraper)_:

- Mungkin struktur HTML untuk hari Sabtu (`#SABTU` atau `.SAB`) di tabel animeinweb.com berbeda dari hari lain.
- Terdapat _typo_ pada selector atau nama elemen target di file route Next.js API scraper backend Anda khusus untuk hari "Sabtu".

**Solusi untuk Developer Backend API:**
Silakan periksa kembali bagian di mana Anda melakukan Cheerio `$('...').each()` untuk DOM jadwal hari Sabtu pada core script scraper Anda.

---

## 4. Implementasi Sementara

Sementara ini, halaman-halaman tersebut telah dibuat di Frontend (`app/ongoing`, `app/completed`, `app/tv`, dsb).
Untuk mencegah halaman me-return 404 (Not Found), halaman tersebut sementara menggunakan metode:

- `app/ongoing` -> Memanggil `/api/v1/latest` (Episode Terakhir / Ongoing).
- `app/tv`, `app/movies`, dll -> Memanggil `/api/v1/search?q=movie` atau `/api/v1/list` sebagai fallback data sementara.

Jika API di masa depan telah merespons query param di atas, data grid anime tersebut akan secara otomatis menyesuaikan.

---

## 5. Sinkronisasi Langsung Upstream (Hotfix Pencarian & Video)

Frontend sekarang telah dikonfigurasi untuk melakukan **fallback** langsung ke upstream API `animeinweb.com` jika data dari Vercel API kosong atau tidak valid:

- **Search**: Mencoba memanggil endpoint asli `/api/proxy/3/2/explore/movie` menggunakan header `Referer` yang disamarkan.
- **Video**: Mengambil sumber video tambahan langsung dari API streaming asli `/api/proxy/3/2/episode/streamnew/{episode_id}` untuk memastikan pemutar video tidak memunculkan error "No supported format".
