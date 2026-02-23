# Panduan Penggunaan Cover & Poster Animasi di Frontend

Mengikuti pembaruan terbaru pada `AnimeAPI` di mana rute-rute pengambilan Detail Anime telah melampirkan resolusi penuh _Cover_ (Banner latar belakang) dan _Poster_ animasi secara langsung via `xyz-api.animein.net`, tata letak _Frontend_ Anda kini bisa dioptimalkan!

## 1. Pembaruan yang Tersedia di API

Setiap kali Anda menembak titik temu **Detail Anime** (via `/api/v1/detail?url=...` atau `/api/v1/animeinweb?id=...`), respons JSON dari backend kini akan membawa dua parameter vital baru:

```json
{
  "success": true,
  "data": {
    "title": "golden kamuy: saishuushou",
    // ⬇️ Parameter Baru:
    "cover": "https://xyz-api.animein.net//assets_xyz/images/movie/cover/...jpg",
    "poster": "https://xyz-api.animein.net//assets_xyz/images/movie/poster/...jpg",
    "thumbnail": "https://xyz-api.animein.net//assets_xyz/images/movie/cover/...jpg" // Fallback ke Cover/Poster
  }
}
```

- **`cover`**: Cocok digunakan sebagai **Background/Banner lebar** di header halaman Watch atau Detail, karena bentuk aslinya _landscape_ (memanjang ke samping).
- **`poster`**: Merupakan gambar sampul resmi animasi yang **Portrait** (berdiri tegak), lazimnya digunakan untuk katalog atau _thumbnail_ kotak daftar episode.

## 2. Cara Mengimplementasikan pada Framework Next.js (FE)

### A. Contoh Pemisahan di Halaman Detail/Menonton

Jika Anda mempunyai sebuah Komponen Halaman (seperti `app/watch/[id]/page.jsx`), silakan _extract_ (ambil) propertinya dan gunakan _cover_ untuk latar bergaya _blur_ (glassmorphism/overlay).

```jsx
import Image from "next/image";

export default function AnimeDetailView({ animeData }) {
  // Tersedia secara default dari lib/anime-helper.js > getAnimeDetail()
  const { title, cover, poster, synopsis } = animeData;

  return (
    <div className="relative w-full h-full min-h-screen align-middle text-white">
      {/* 1. LAYER BANNER BACKGROUND (Menggunakan 'cover' Landscape) */}
      <div className="absolute inset-0 -z-10 w-full h-[50vh] xl:h-[70vh]">
        <Image
          src={cover || poster} // Gunakan cover prioritas pertama
          alt={`${title} Cover`}
          fill
          className="object-cover opacity-40 blur-sm"
          priority
        />
        {/* Gradien pemisah antara Banner dan bawah halaman */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
      </div>

      {/* 2. LAYER CONTEN UTAMA */}
      <div className="container mx-auto px-4 pt-32 flex flex-col md:flex-row gap-8">
        {/* POSTER (Menggunakan 'poster' Portrait) di sebelah kiri */}
        <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <Image
              src={poster || cover}
              alt={`${title} Poster`}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Teks Deskripsi di Kanan Poster */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {title}
          </h1>
          <p className="text-gray-300 leading-relaxed max-w-3xl">{synopsis}</p>
        </div>
      </div>
    </div>
  );
}
```

### B. Konfigurasi Standar `next.config.mjs`

Karena Anda akan rutin memuat gambar yang diproyeksikan (hostname `xyz-api.animein.net`), pastikan Anda sudah menambahkan host target ini di konfigurasi domain citra NextJS agar modul otomatis `<Image>` tidak mengalami _Blocking Host Error_.

Buka **`next.config.mjs`** di repositori _Website anime_ dan tambahkan pola hostname `animein.net`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wsrv.nl",
      },
      {
        protocol: "https",
        hostname: "xyz-api.animein.net",
      },
      {
        protocol: "https",
        hostname: "**.animein.net",
      },
    ],
  },
};

export default nextConfig;
```

Dengan langkah tersebut, Frontend/Web Anime Anda kini siap meng-host antarmuka super elegan (Banner Lebar + Poster Tegak terpisah) tanpa khawatir ketiadaan aset!
