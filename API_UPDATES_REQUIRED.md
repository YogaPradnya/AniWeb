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

## 3. Implementasi Sementara

Sementara ini, halaman-halaman tersebut telah dibuat di Frontend (`app/ongoing`, `app/completed`, `app/tv`, dsb).
Untuk mencegah halaman me-return 404 (Not Found), halaman tersebut sementara menggunakan metode:

- `app/ongoing` -> Memanggil `/api/v1/latest` (Episode Terakhir / Ongoing).
- `app/tv`, `app/movies`, dll -> Memanggil `/api/v1/search?q=movie` atau `/api/v1/list` sebagai fallback data sementara.

Jika API di masa depan telah merespons query param di atas, data grid anime tersebut akan secara otomatis menyesuaikan.
