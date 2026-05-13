# **Rencana Implementasi: Melengkapi Dokumentasi SIGAP di** `DocModal.tsx`

Setelah melakukan *code-review* menyeluruh terhadap `src/lib/`, saya memahami bahwa SIGAP bukanlah sekadar aplikasi cuaca, melainkan sebuah **Sistem Pemandu Keputusan (*Decision Engine*)** multi-lapisan yang sangat canggih untuk tahap *production*. Oleh karena itu, bagian "Informasi Umum" pada dokumentasi akan saya rombak total untuk mencerminkan kecanggihan tersebut tanpa membawa-bawa narasi *fallback/simulasi* (karena asumsinya sistem ini *product-ready*).

## **Proposed Changes**

### **[MODIFY]** `src/components/DocModal.tsx`

Saya akan menambahkan `activeTab` baru untuk memisahkan "Pengantar" dan "Informasi Umum", lalu mendokumentasikan poin-poin krusial hasil penelaahan *codebase* SIGAP berikut ini:

#### **1. Konten** `activeTab === "intro"` **(Pengantar Platform)**

- **Misi SIGAP:** Mengubah data mentah spasial, cuaca, dan infrastruktur menjadi keputusan siap pakai. Berpedoman pada paradigma *"Decision-First Intelligence"*, SIGAP tidak menyuruh pengguna membaca metrik yang rumit, melainkan memberikan instruksi langsung (Kapan berangkat? Rute mana yang dihindari? Apakah aman secara kesehatan?).

#### **2. Konten** `activeTab === "general"` **(Mekanika Sistem & Arsitektur)**

Bagian ini akan menjadi pusat dokumentasi teknis yang menjelaskan *bagaimana* algoritma SIGAP bekerja di balik layar:

- **Personalisasi & *Context-Aware Engine*:** SIGAP tidak menghasilkan jawaban generik. Rekomendasi dihitung berdasarkan silang-data antara cuaca/polusi dengan **usia, moda transportasi, dan riwayat kesehatan** (contoh: kondisi asma akan memicu peringatan merah jika AQI Google sedang tinggi, meskipun lalu lintas lancar).
- **Hybrid Weather Intelligence (BMKG + VisualCrossing):** Menjelaskan arsitektur cuaca ganda. SIGAP menggunakan BMKG (via Kode Administrasi ADM4/Kemendagri) sebagai sumber otentik resmi untuk regulasi Indonesia, yang kemudian diperhalus (*interpolasi mikroklimat*) oleh VisualCrossing untuk mendapatkan prediksi presisi per-jam dan variabel *feels-like temperature*.
- **Pemantauan Bahaya Radius 5Km (PetaBencana):** Menjelaskan bahwa sistem memetakan kordinat awal dan tujuan, kemudian menarik data *crowdsourcing* laporan banjir dalam radius 5 kilometer secara *real-time*.
- **Analisis Kepadatan Rute (Google Traffic API):** Menjelaskan bagaimana SIGAP mendeteksi kemacetan. Sistem tidak hanya mengukur jarak, tetapi membandingkan `duration` (dengan macet) dan `staticDuration` (kondisi lancar). Selisih waktu tersebut digunakan AI untuk menyarankan penundaan perjalanan.
- **Smart Timeline (Proyeksi Horison Waktu):** SIGAP memproses array prakiraan lalu lintas dan cuaca untuk merakit *timeline* 4 jam ke depan, memberitahu pengguna jendela waktu (*best window*) yang paling optimal untuk beraktivitas.
- **Keyakinan AI (*AI Confidence Metric*):** Metrik `0.0 - 1.0` yang diproduksi oleh LLM Gemini. Menjelaskan bahwa ini mengukur tingkat kepastian *Engine* ketika dihadapkan pada data yang bertentangan (misal: cuaca cerah namun AQI sangat beracun). Semakin konvergen datanya, semakin tinggi skor `confidence`-nya.

## **User Review Required**

**IMPORTANT**

Konsep di atas murni diambil dari arsitektur *codebase* yang telah saya koding sebelumnya (tanpa membahas mode simulasi/fallback, murni *production capability*). Apakah uraian teknis *Informasi Umum* ini sudah sesuai dengan apa yang ingin Anda pamerkan di presentasi/dokumentasi, atau ada bagian lain yang terlewat?