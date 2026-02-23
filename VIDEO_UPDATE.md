# Pembaruan Sistem Video Proxy (Frontend)

Pembaruan ini menyelesaikan masalah di mana pemutar video _(video player)_ melakukan _full download_ (loading lambat dan mengunduh seluruh file video, yang mencapai ratusan MB) sebelum video bisa diputar. Pembaruan ini mengoptimalkan penanganan _HTTP Range Requests_ (chunking/streaming potongan) sehingga proses _buffering_ jauh lebih instan dan lebih hemat bandwidth.

## Daftar Perubahan Teknis:

### 1. Menghapus API Route Lama (Proxy)

- **File yang dihapus:** `app/api/proxy/media/route.js`
- **Alasan:** Menggunakan API Route Next.js tradisional dengan pengembalian objek `Response` berisi body dari _fetch_, otomatis memicu server untuk menggunakan `Transfer-Encoding: chunked` dan yang paling parah, **menghilangkan header `Content-Length` dan `Accept-Ranges`**. Hal ini membuat browser komputer tidak mengetahui ukuran video sebenarnya, sehingga fitur _seek_ asinkron tidak berfungsi. Akhirnya, browser terpaksa mengunduh _keseluruhan_ video agar bisa membacanya dari akhir file ke awal.

### 2. Menggunakan Edge Middleware Rewrite (Proxy Baru)

- **File baru ditambahkan:** `middleware.js` (Di folder _root_)
- **Alasan:** Masalah di atas bisa diatasi dengan menggunakan **Vercel Edge Middleware**. Saat kita memakai `NextResponse.rewrite()`, Next.js/Vercel mengatur routing tersebut menjembatani klien dengan server sumber _video murni (layaknya reverse proxy CDN standar)_ tanpa merusak integritas Header. Request dari _Browser_ (termasuk `Range bytes=...`) dan kembalian `206 Partial Content` (termasuk `Content-Length` dan durasi file bytes) tersalurkan dengan sempurna.
- **Dampak:** Video kini akan meload secara sepotong-sepotong _(chunking stream)_ per beberapa Megabyte ketika pengguna sedang asik memutar, persis seperti skema YouTube.

### 3. Modifikasi Pengaturan Komponen Video Player

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
