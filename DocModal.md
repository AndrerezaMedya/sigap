# Dokumentasi SIGAP

---

## Pengantar

### Apa itu SIGAP?

SIGAP adalah asisten keputusan aktivitas. Tujuannya bukan menampilkan semua data cuaca, peta, dan angka teknis sekaligus, tetapi membantu pengguna menjawab pertanyaan sederhana: apakah aktivitas ini aman, kapan waktu terbaik, dan risiko apa yang perlu diperhatikan.

> **Prinsip utama:** SIGAP memakai pola decision-first: keputusan muncul dulu, alasan dan data pendukung muncul setelahnya.

| Untuk siapa | Keterangan |
|---|---|
| Pengguna | Gunakan SIGAP untuk mengecek rencana berangkat, jogging, naik motor, event outdoor, atau perjalanan keluarga. |
| Demo | Aplikasi menunjukkan bagaimana Gemini, data cuaca, konteks mobilitas, dan risiko lingkungan disatukan menjadi rekomendasi yang mudah dipahami. |
| Developer | Bagian Open API menjelaskan sumber data dan batas client-server agar integrasi tidak membocorkan API key. |

---

## Panduan Pengguna

### Alur Utama: Activity Decision Flow

SIGAP memiliki dua jalur input yang setara — keduanya menggunakan pipeline Gemini yang sama, tetapi dengan konteks yang berbeda.

1. Buka SIGAP dan lengkapi personalisasi singkat — hasilnya langsung dipakai Gemini untuk menyesuaikan rekomendasi.
2. Lihat **Hero Decision Panel**: keputusan utama, risk badge, kondisi cuaca, dan best window sudah ditampilkan sejak awal.
3. Gunakan tab **"Tanya SIGAP"** untuk pertanyaan bebas — ketik seperti *"Aman jogging sore ini?"*, lalu tekan Enter. Quick prompt tersedia sebagai shortcut — klik untuk mengisi field, bukan langsung submit.
4. Atau gunakan tab **"Rencanakan Perjalanan"** untuk rencana rute spesifik — isi tujuan, pilih moda transportasi dan waktu, lalu klik **"Analisis Rute"**.
5. Baca hasil di hero card, Smart Timeline, dan peta rute. Jika rute tersedia, peta menampilkan polyline berwarna sesuai kepadatan lalu lintas.

> **Perbedaan konteks Gemini:** Tab "Tanya SIGAP" mengirim pertanyaan bebas + data lingkungan. Tab "Rencanakan Perjalanan" menambahkan blok *Konteks Rencana Perjalanan* eksplisit (asal → tujuan, moda, waktu) sehingga headline dan rekomendasi Gemini spesifik pada rute tersebut.

---

### Personalisasi

#### Kenapa SIGAP meminta personalisasi?

Personalisasi membantu Gemini memahami konteks dasar pengguna seperti aktivitas utama, usia, moda transportasi, dan catatan kesehatan. Ini membuat rekomendasi berbeda untuk pejalan kaki, pengendara motor, pekerja lapangan, atau pengguna yang sensitif terhadap kualitas udara.

> **Penting untuk dipahami user:** Data persona disimpan di browser melalui localStorage. Ini membantu pengalaman demo terasa personal tanpa membuat akun.

---

### Memahami Keputusan

#### Cara membaca keputusan SIGAP

Hero Decision Panel adalah pusat pengalaman. Panel ini sengaja menampilkan keputusan sebelum data mentah agar user tidak perlu menafsirkan banyak angka sendiri.

| Status | Makna |
|---|---|
| Aman / Nyaman | Aktivitas masih disarankan. Tetap pantau perubahan kondisi jika aktivitas berlangsung lama. |
| Waspada / Kurang Disarankan | Ada faktor risiko seperti hujan, AQI, banjir, atau trafik. Pertimbangkan menunda atau mengganti moda. |
| Risiko Tinggi | SIGAP melihat kombinasi risiko yang cukup kuat. Pilih alternatif yang lebih aman. |
| Confidence | Angka keyakinan AI. Semakin lengkap dan selaras data yang masuk, semakin tinggi confidence. |

---

### Smart Timeline

#### Smart Timeline: kapan waktu terbaik?

Smart Timeline menjelaskan perubahan kondisi beberapa jam ke depan. Inilah bagian yang menjawab "sebaiknya berangkat sekarang, nanti, atau ganti rencana?".

| Jam | Makna untuk user |
|---|---|
| 07:00 | Kepadatan mulai naik, masih bisa berangkat tetapi perlu siap delay. |
| 07:15 | Window paling optimal karena risiko belum meningkat. |
| 08:00 | Hujan atau trafik bisa membuat aktivitas kurang nyaman. |

---

### Map Sekunder

#### Mengapa map bukan pusat UI?

Map tetap penting, tetapi SIGAP tidak memulai pengalaman dari peta. Peta adalah *secondary intelligence* — ia muncul setelah rekomendasi dibuat dan memberikan konteks spasial seperti route risk dan traffic overlay.

> **Traffic-colored polylines:** Saat rute tersedia dari Google Routes API, polyline digambar per-segmen sesuai kepadatan lalu lintas real-time: 🟢 **Hijau** = Lancar (NORMAL) · 🟠 **Oranye** = Padat (SLOW) · 🔴 **Merah** = Macet (TRAFFIC_JAM). Peta otomatis menyesuaikan zoom untuk menampilkan seluruh rute.

| Moda | Tampilan Peta |
|---|---|
| Moda Mobil | Mendapatkan polyline berwarna per-segmen berdasarkan speedReadingIntervals dari Routes API. |
| Motor / Jalan Kaki / Sepeda | Mendapatkan polyline biru tunggal dari encoded polyline Routes API — interval traffic tidak tersedia untuk moda ini. |
| Tanpa rute | Peta tetap muncul sebagai konteks lokasi. SIGAP tetap memberi rekomendasi berbasis cuaca dan input user. |

---

## Cara Kerja SIGAP

### Data Fusion: data apa saja yang digabung?

SIGAP mengumpulkan konteks user dan data lingkungan, lalu mengubahnya menjadi satu *environmental context object*. Objek ini dikirim ke Gemini agar AI tidak menebak dari teks bebas saja.

| Sumber | Fungsi |
|---|---|
| Profil user | Pekerjaan, umur, moda transportasi, dan catatan kesehatan dari PersonaModal. |
| BMKG | Prakiraan cuaca Indonesia berdasarkan kode wilayah ADM4. |
| VisualCrossing | Tambahan microclimate seperti feels-like temperature jika API key tersedia. |
| Google AQI | Kualitas udara, saat ini disiapkan dengan fallback jika belum terkonfigurasi. |
| Google Routes API | Estimasi rute, trafik, encoded polyline, dan speedReadingIntervals ketika lokasi dan tujuan tersedia. |
| Google Places API (New) | Autocomplete nama tempat dengan field masking dan location bias 25km dari koordinat user — hemat kuota dan relevan secara geografis. |
| PetaBencana | Konteks laporan banjir di sekitar lokasi saat data tersedia. |
| Stormglass | Data angin (windSpeed) dan visibilitas per jam. Opsional, memakai fallback jika API key belum tersedia. |

---

### Gemini sebagai reasoning engine

Gemini tidak dipakai sebagai chatbot biasa. Di SIGAP, Gemini menerima data terstruktur lalu mengembalikan JSON rekomendasi: risk level, headline, rekomendasi, reasoning, confidence, best window, timeline, dan data notes.

```
riskLevel, headline, recommendation, reasoning, confidence, bestWindow, timeline, activityComparison
```

Format ini membuat UI bisa menampilkan keputusan secara konsisten tanpa mencampur hasil AI ke tampilan bebas yang sulit dikontrol.

> **Strategi prompt berdasarkan tab:**
>
> **Tanya SIGAP**: Gemini menerima data lingkungan + pertanyaan bebas user → rekomendasi berbasis kondisi saat ini dan pertanyaan tersebut.
>
> **Rencanakan Perjalanan**: Gemini menerima blok tambahan *KONTEKS RENCANA PERJALANAN* yang eksplisit menyebutkan titik asal, tujuan, moda transportasi, dan waktu berangkat. Ini memastikan headline dan rekomendasi spesifik pada rute — bukan sekadar kondisi cuaca umum.

---

### Fallback dan Confidence

Beberapa API membutuhkan key, billing, atau data koordinat. Agar demo tetap stabil, SIGAP memiliki fallback. Fallback bukan berarti data diklaim real-time; aplikasi harus menjelaskan bahwa data tersebut adalah simulasi atau belum terhubung.

> **Aturan komunikasi:** Jika data berasal dari fallback, tampilkan sebagai konteks demo atau data tidak tersedia. Jangan mengklaimnya sebagai kondisi live.

---

### Glossary Istilah Penting

| Istilah | Definisi |
|---|---|
| ADM4 | Kode wilayah administrasi desa/kelurahan yang dipakai BMKG untuk prakiraan cuaca lokal. |
| AQI | Air Quality Index, indikator kualitas udara dan risiko kesehatan. |
| Confidence | Tingkat keyakinan rekomendasi berdasarkan kelengkapan dan konsistensi data. |
| Fallback | Data pengganti agar aplikasi tetap bisa demo ketika API eksternal belum tersedia. |
| Smart Timeline | Ringkasan perubahan risiko dari waktu ke waktu. |
| Decision Engine | Sistem yang fokus menghasilkan keputusan praktis, bukan sekadar menampilkan data mentah. |

---

## Keamanan & Privasi

### Apa yang terjadi pada data pengguna?

SIGAP dirancang agar user memahami data apa yang dipakai. Data profil persona digunakan untuk membuat rekomendasi lebih relevan, sementara API key sensitif hanya boleh berada di server.

| Data | Perlakuan |
|---|---|
| Persona | Disimpan di localStorage browser untuk demo. User dapat mengubahnya lewat tombol Ubah Profil. |
| Gemini API Key | Dipanggil server-side melalui API route, bukan dari browser user. |
| Google Maps public key | Key untuk map dapat berada di client jika sudah dibatasi domain dan API-nya di Google Cloud Console. |

---

## Open API

### Ringkasan Endpoint dan Integrasi

Bagian ini untuk pembaca yang ingin tahu sumber data dan kontrak teknis. Penjelasan user-facing ada di Panduan Pengguna dan Cara Kerja SIGAP.

| Integrasi / Endpoint | Dipakai untuk | Metode | Akses |
|---|---|---|---|
| POST /api/recommendation | Rekomendasi internal SIGAP | POST | Server app |
| BMKG Forecast | Prakiraan cuaca per 3 jam berbasis ADM4 | GET | Publik |
| VisualCrossing Timeline | Microclimate dan feels-like hourly | GET | API key |
| PetaBencana Reports | Laporan banjir berbasis lokasi | GET | Publik |
| Google Air Quality | Kualitas udara real-time | POST | API key |
| Google Routes/Maps | Rute, trafik, dan visualisasi map | GET/POST | API key |
| Gemini API | Reasoning engine dan rekomendasi | POST | Server key |

---

### Endpoint Internal SIGAP

UI memanggil endpoint ini untuk menghasilkan rekomendasi. Endpoint ini menggabungkan user context, data lingkungan, dan Gemini reasoning.

```
POST /api/recommendation
```

| Field | Keterangan |
|---|---|
| Input | locationName, adm4Code, destination, activity, transportMode, plannedTime, userQuestion, profile. |
| Output | environmentalContext, recommendation, dan generatedBy. |
| Catatan | Endpoint ini server-side sehingga aman untuk memanggil Gemini dengan API key. |

---

### BMKG Weather

BMKG menjadi sumber cuaca publik utama karena relevan untuk Indonesia. SIGAP memakai ADM4 untuk mengambil prakiraan per desa/kelurahan.

```
GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_wilayah}
```

| Field | Keterangan |
|---|---|
| Status | Terintegrasi dengan cache dan fallback. |
| Rate limit referensi | 60 request per menit per IP sesuai dokumentasi BMKG. |
| Dipakai untuk | Weather summary dan timeline cuaca awal. |

---

### VisualCrossing Timeline

VisualCrossing disiapkan untuk microclimate dan resolusi per jam. Jika key tidak tersedia, SIGAP menggunakan fallback agar demo tetap berjalan.

```
GET https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/[location]
```

| Field | Keterangan |
|---|---|
| Status | Opsional, memakai fallback jika API key belum tersedia. |
| Auth | API key. |
| Dipakai untuk | Feels-like temperature, presipitasi, dan stabilitas cuaca beberapa jam ke depan. |

---

### PetaBencana

PetaBencana dipakai untuk konteks banjir dan hazard awareness. Data ini lebih relevan ketika koordinat lokasi tersedia.

```
GET https://data.petabencana.id/reports?lat=...&lng=...&distance=5000&disaster=flood
```

| Field | Keterangan |
|---|---|
| Status | Terhubung sebagai service dengan fallback. |
| Auth | Endpoint publik. |
| Dipakai untuk | Peringatan banjir atau laporan genangan sekitar lokasi. |

---

### Google AQI, Routes, Places, dan Maps

Layanan Google dipakai sebagai nilai tambah ekosistem GCP. AQI dan Routes dipanggil server-side; Places (New) dipanggil client-side dengan pembatasan field; Maps visual memakai public key yang sudah dibatasi domain.

| Layanan | Keterangan |
|---|---|
| Google Air Quality | Kualitas udara real-time untuk konteks kesehatan dan kenyamanan. Dipanggil server-side. |
| Google Routes API (New) | Estimasi durasi, trafik, encoded polyline, dan speedReadingIntervals per-segmen jalan. Aktif dengan extraComputations: TRAFFIC_ON_POLYLINE. |
| Google Places API (New) | Autocomplete input tujuan dengan field masking — hanya meminta displayName, formattedAddress, dan location. Location bias radius 25km dari koordinat user memastikan hasil relevan secara geografis. Lebih hemat biaya dan siap menggantikan Places API lama yang akan deprecated. |
| Google Maps JS API | Visualisasi peta sekunder dengan gaya calm intelligence. Polyline digambar manual per-segmen (bukan DirectionsRenderer) untuk mendukung pewarnaan traffic. |
