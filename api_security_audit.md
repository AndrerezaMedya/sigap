# 🛡️ Dokumen Audit Keamanan API (SIGAP)

**Tanggal:** Mei 2026
**Status Saat Ini:** ⚠️ **WARNING (Technical Debt Aktif)**

Dokumen ini disusun sebagai catatan audit keamanan untuk arsitektur API SIGAP. Saat ini, aplikasi menggunakan beberapa *workaround* (solusi sementara) demi memenuhi tenggat waktu kompetisi dan memastikan kelancaran *deployment* di Google Cloud Run. Workaround ini menimbulkan risiko keamanan yang harus segera diselesaikan pasca-kompetisi.

---

## 1. Kondisi API Saat Ini

### A. Hardcoded API Key di Dockerfile
*   **Kondisi:** Kunci API Google Cloud (`NEXT_PUBLIC_GCP_API_KEY`) saat ini di-*hardcode* secara langsung di dalam file `Dockerfile`.
*   **Alasan:** Cloud Build Google tidak membaca *environment variables* (dari Cloud Run) pada saat fase kompilasi (`npm run build`). Karena Next.js memerlukan kunci dengan awalan `NEXT_PUBLIC_` saat proses *build* untuk di-*inject* ke *client-side bundle*, *hardcode* dilakukan sebagai perbaikan cepat (Quick Fix).
*   **Risiko:** Kunci API ini telah terdorong (*pushed*) ke repositori GitHub. Fitur *Secret Scanning* GitHub mendeteksi hal ini sebagai kebocoran rahasia. Siapa pun yang memiliki akses ke repositori dapat melihat kunci ini.

### B. Injeksi "Fake Referer" di Backend
*   **Kondisi:** Pada fungsi pemanggilan Google Routes API (`src/lib/traffic.ts`) dan Google Air Quality API (`src/lib/aqi.ts`), terdapat injeksi *header* buatan: `"Referer": "http://localhost:3000/"`.
*   **Alasan:** Kunci API di Google Cloud Console dibatasi oleh "Website Restrictions" (HTTP Referrers). Pemanggilan melalui backend Node.js (`fetch()`) secara bawaan tidak mengirimkan *header* asal, sehingga ditolak oleh Google (Error 403). Menyuntikkan *referer* palsu mengelabui Google agar mengira *request* berasal dari localhost yang masuk daftar putih (*whitelist*).
*   **Risiko:** Menggabungkan pembatasan *client-side* untuk *server-side* adalah anti-pattern. Jika kunci API jatuh ke pihak tak bertanggung jawab, mereka dapat dengan mudah meniru trik "Fake Referer" ini.

---

## 2. Rencana Remediasi (Perbaikan Pasca-Kompetisi)

Agar arsitektur kembali sesuai dengan standar keamanan industri (*Best Practices*), langkah-langkah berikut **wajib** dilakukan setelah fase penjurian selesai:

### Tahap 1: Rotasi Kunci (Key Rotation)
Karena kunci API saat ini sudah terekspos di riwayat Git, kunci tersebut **sudah terkompromi**.
1. Buka [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).
2. Buat kunci baru dan hapus kunci lama yang terekspos.
3. Hapus *hardcoded key* dari `Dockerfile` dan lakukan komit ulang.

### Tahap 2: Pemisahan Kunci API (Split Keys)
Jangan pernah mencampur fungsi kunci *client-side* dengan *server-side*. Buat **dua API Key berbeda**:

| Jenis Kunci | Penggunaan | Pembatasan (Restrictions) |
| :--- | :--- | :--- |
| **Key A (Client-Side)** | Google Maps JavaScript API (di browser). Nama env: `NEXT_PUBLIC_GCP_API_KEY`. | **Website Restrictions** (Hanya izinkan domain `https://*.a.run.app` dan `http://localhost:3000`). |
| **Key B (Server-Side)** | Routes API & Air Quality API (di backend). Nama env: `GCP_API_KEY`. | **IP Restrictions** (Hanya izinkan IP dari layanan Cloud Run) atau **API Restrictions** (Hanya izinkan rute spesifik). |

### Tahap 3: Implementasi Secret Manager
1. Implementasikan integrasi **Cloud Build Substitution Variables** dengan aman menggunakan `cloudbuild.yaml` (jangan lewat argumen teks biasa tanpa enkripsi jika memungkinkan).
2. Atau, gunakan layanan **Google Secret Manager** untuk menyuntikkan variabel saat siklus *build* dan *runtime* tanpa perlu menyentuh struktur kode secara langsung.

---

**Kesimpulan:**
Kondisi aplikasi saat ini aman untuk keperluan **demo kompetisi terisolasi** karena adanya proteksi limitasi billing dari Google Cloud. Namun, infrastruktur saat ini **tidak layak rilis ke publik (Production-Ready)** sebelum *Tahap 1* dan *Tahap 2* dari rencana remediasi diselesaikan.
