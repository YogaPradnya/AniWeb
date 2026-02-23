# Dokumentasi Perbaikan Gambar di Frontend (FE)

Pembaruan ini dilakukan untuk mengatasi masalah gambar (Cover & Poster) yang tidak muncul akibat URL yang rusak (double hostname) dan pembatasan domain pada Next.js.

## 1. Konfigurasi Domain Gambar (`next.config.js`)

Kita perlu mendaftarkan domain **`wsrv.nl`** (Image Proxy) dan **`xyz-api.animein.net`** agar diizinkan oleh komponen `<Image />` Next.js.

**Perubahan:**

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wsrv.nl", // 👈 WAJIB: Proxy gambar baru
      },
      {
        protocol: "https",
        hostname: "xyz-api.animein.net", // 👈 Domain aset utama
      },
      {
        protocol: "https",
        hostname: "api.animein.net",
      },
      {
        protocol: "https",
        hostname: "**.animein.net",
      },
    ],
  },
};
```

## 2. Pembersihan URL Gambar (`lib/utils.js`)

Fungsi `fixImageUrl` telah diperkuat untuk membersihkan "sampah" URL yang sering muncul dari upstream API (seperti pengulangan `https://...`).

**Logika Baru:**

1.  **Preserve Proxy**: Jika URL sudah diproses oleh `wsrv.nl`, fungsi tidak akan menyentuhnya lagi.
2.  **Anti-Double Hostname**: Jika ada `http` yang muncul dua kali dalam satu string, fungsi akan mengambil yang paling belakang (yang benar).
3.  **Hostname Normalization**: Memastikan semua link mengarah ke `xyz-api` demi stabilitas.
4.  **Double Slash Fix**: Menghapus `//` yang tidak perlu setelah nama domain.

**Snippet Kode:**

```javascript
export function fixImageUrl(url) {
  if (!url) return "";

  if (url.includes("wsrv.nl/?url=")) return url;

  if (url.includes("http") && url.lastIndexOf("http") > 0) {
    url = url.substring(url.lastIndexOf("http"));
  }

  if (url.includes("api.animein.net") && !url.includes("xyz-api.animein.net")) {
    url = url.replace("api.animein.net", "xyz-api.animein.net");
  }

  url = url.replace(/net\/\/assets/g, "net/assets");
  return url;
}
```

## 3. Catatan Implementasi di Komponen

Pastikan setiap kali memanggil gambar dari API, gunakan helper `fixImageUrl`.

**Contoh di `AnimeCard.jsx` atau `DetailPage.jsx`:**

```jsx
import { fixImageUrl } from "@/lib/utils";

// ...
const imageUrl = fixImageUrl(anime.poster || anime.cover);
// ...
<Image src={imageUrl} ... />
```

---

**Status:** ✅ Terverifikasi Fix.
**Saran:** Jika gambar masih tidak muncul di mode produksi (Vercel), silakan lakukan redeploy untuk memperbarui konfigurasi `next.config.js`.
