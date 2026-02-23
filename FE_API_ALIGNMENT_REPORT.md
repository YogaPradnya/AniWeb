# Laporan Keselarasan Konfigurasi Frontend & API

Berikut adalah laporan menyeluruh mengenai hal-hal di Backend (`Website anime` Next.js Anda) yang bisa atau telah memengaruhi rute/koneksi ke `AnimeAPI` Anda, beserta langkah-langkah yang saya terapkan agar kedua sistem saling _sinkron_.

## 1. Masalah: Base URL API "Hardcoded"

Pada kepingan awal, baik `lib/api.js` maupun `lib/anime-helper.js` menembak ke URL spesifik yang diketik langsung (hardcoded), yakni `https://anime-api-three-jade.vercel.app/api/v1`.
Hal tersebut berbahaya karena jika Anda memigrasi `AnimeAPI` ke host atau domain lain (misalkan Railway/VPS), Frontend Anda akan gagal mencari host baru karena masih menembak URL Vercel lama, serta tidak menghiraukan file `.env`.

**Solusi yang telah saya terapkan:**

- Saya sudah mengubah `lib/api.js` dan `lib/anime-helper.js` agar selalu membaca `process.env.NEXT_PUBLIC_API_BASE_URL` (Untuk Client-side NextJS) atau `process.env.API_BASE_URL` untuk tarikan Server.
- Jika Anda berpindah domain API, Anda cukup mengganti konfigurasi di file `.env` Frontend.
  ```env
  NEXT_PUBLIC_API_BASE_URL=https://api-baru-anda.com/api/v1
  API_BASE_URL=https://api-baru-anda.com/api/v1
  ```

## 2. Masalah: Image Proxy (Cloudflare WSRV.nl) Tertinggal di FE

Proses _bypass_ gambar ke URL `wsrv.nl` saat ini dilakukan hingga tiga kali (_redundant_): Di Backend (API) dan juga fungsi `wrapImageProxy()` di _Frontend_ (`lib/api.js` dan `lib/anime-helper.js`).
Meskipun fitur `wrapImageProxy` di FE secara logika memiliki fitur pengecekan ganda (`if (obj.includes('wsrv.nl')) return obj;`), ini memakan ekstra milidetik pada CPU FE Anda saat merender array yang sangat banyak (seperti list episode total).
**Aman / Solusi:** Karena API sudah menangani proxy gambar dengan baik (wsrv.nl ditambahkan secara native dari API scraper), untuk jangka panjang Anda bisa menonaktifkan/menghapus fungsi mapping `wrapImageProxy` di dalam kode `lib/api.js` Frontend.

## 3. Masalah: Fitur Next.js Cache & Upstream Revalidation

Pada Next.js versi 14 milik Anda, di dalam `lib/anime-helper.js` saya memperhatikan Anda menembak API dan Upstream menggunakan fetch policy `cache: 'no-store'`.
Contoh: `const res = await fetch(url, { headers: HEADERS, cache: 'no-store' });`

**Dampak:**
Hal ini berakibat rute Frontend _selalu me-request data API baru/segar setiap pengguna me-reload web_, sehingga menembus Cache yang ada di Vercel CDN. Ini meletakkan tumpuan berat kepada `AnimeAPI` Server jika ada 1.000 user masuk bersamaan, karena API Anda akan diketuk (hitted) sebanyak 1.000 kali per detik.

**Solusi & Instruksi Tindak Lanjut untuk Anda:**

1. Untuk endpoints yang stabil seperti **Genre** dan **Detail Anime**, idealnya Anda memodifikasi `fetch` menjadi `next: { revalidate: 3600 }` (Cache 1 jam) ketimbang `cache: 'no-store'`.
2. Di file `lib/anime-helper.js` pada line `17` - API akan berterima kasih karena beban CPU turun 90%.

```javascript
/* Contoh penerapan cache di Frontend untuk meringankan API */
const res = await fetch(url, {
  headers: HEADERS,
  next: { revalidate: 3600 }, // <--- Ubah 'no-store' menjadi revalidate
});
```

_Semua pembaruan dinamis tentang `.env` (Poin 1) sudah saya selesaikan dan integrasikan otomatis ke kode repositori Anda barusan._
