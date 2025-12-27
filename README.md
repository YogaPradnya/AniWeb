# 🎌 Website Anime

Website untuk nonton anime dengan integrasi API dari NontonAnimeID.

## 🚀 Fitur

- ✅ Home page dengan episode terbaru
- ✅ Pencarian anime
- ✅ Daftar semua anime dengan pagination
- ✅ Detail anime lengkap dengan daftar episode
- ✅ Video player dengan pilihan resolusi
- ✅ Dark mode yang sangat gelap (hitam/dark purple)
- ✅ Responsive design

## 📁 Struktur File

```
Website anime/
├── index.html          # Halaman home
├── list.html          # Halaman daftar anime
├── detail.html        # Halaman detail anime
├── episode.html       # Halaman video player
├── css/
│   └── style.css      # Styling utama
├── js/
│   ├── api.js         # API client
│   ├── utils.js       # Utility functions
│   ├── home.js        # Logic halaman home
│   ├── list.js        # Logic halaman list
│   ├── detail.js      # Logic halaman detail
│   └── episode.js     # Logic video player
└── README.md
```

## ⚙️ Setup

1. **Edit API Base URL**

   Buka file `js/api.js` dan ganti `API_BASE_URL` dengan URL API kamu:
   
   ```javascript
   const API_BASE_URL = 'https://your-project.vercel.app';
   ```

2. **Buka di Browser**

   Buka file `index.html` di browser atau serve dengan local server:
   
   ```bash
   # Menggunakan Python
   python -m http.server 8000
   
   # Menggunakan Node.js (http-server)
   npx http-server
   ```

3. **Deploy (Optional)**

   Kamu bisa deploy ke:
   - GitHub Pages
   - Netlify
   - Vercel
   - atau hosting lainnya

## 🎨 Customization

### Warna Dark Mode

Edit file `css/style.css` untuk mengubah warna:

```css
:root {
    --bg-primary: #0a0a0a;      /* Background utama */
    --bg-secondary: #1a0d1a;    /* Background sekunder */
    --accent: #8b4d8b;          /* Warna accent */
    /* ... */
}
```

## 📝 Catatan

- Pastikan API endpoint sudah berjalan dan bisa diakses
- Semua data text sudah dikonversi ke lowercase sesuai API
- Website ini menggunakan vanilla JavaScript (tidak perlu framework)

## 🐛 Troubleshooting

### Video tidak bisa diputar
- Pastikan URL video dari API valid
- Cek CORS policy jika API di domain berbeda
- Beberapa browser mungkin memblokir autoplay

### API tidak merespon
- Cek koneksi internet
- Pastikan API_BASE_URL sudah benar
- Cek console browser untuk error detail

---

**Happy Watching! 🎬**

