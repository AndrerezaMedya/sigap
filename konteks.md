# **PROJECT BRIEF: #JuaraVibeCoding Compliance & Context**

**"The Administrative & Technical Guardrails for SIGAP"**

## **1. Konteks Program: #JuaraVibeCoding**

**JuaraVibeCoding** adalah inisiatif resmi dari **Google for Developers** di Indonesia yang bertujuan mendemokrasikan pembuatan aplikasi melalui metode **"Vibe Coding"**. Program ini menantang peserta untuk membangun solusi nyata menggunakan bahasa alami (_natural language_) sebagai instruksi utama kepada AI, guna mempercepat siklus _prototyping_ hingga _deployment_.

- **Penyelenggara:** Google for Developers / Google Cloud.
- **Periode Submisi:** 6 Mei – 31 Mei 2026.
- **Target Utama:** Menciptakan aplikasi fungsional yang memberikan dampak bagi komunitas menggunakan ekosistem AI Google.

## **2. Mandatory Technical Constraints (Syarat Wajib)**

Untuk memenuhi kualifikasi **Top 100 (Elite Architect)**, Project SIGAP wajib mematuhi batasan teknis berikut tanpa pengecualian:

### **A. Jantung Kecerdasan: Model Gemini**

- Aplikasi **wajib** menggunakan model **Gemini**.
- Integrasi dilakukan melalui **Google AI Studio** menggunakan **API Key**.
- **Dilarang** menggunakan model AI dari penyedia lain (seperti OpenAI atau Anthropic) sebagai _backbone_ logika utama dalam produk akhir yang disubmit (tentu, ini selaras dengan poin pertama yakni wajib menggunakan model Gemini).

### **B. Infrastruktur: Google Cloud Run**

- Aplikasi **wajib** dideploy dan berjalan secara _live_ di **Google Cloud Run**.
- Infrastruktur ini dipilih untuk menunjukkan kemampuan aplikasi dalam skala _serverless_ dan penggunaan ekosistem Google Cloud Platform (GCP).
- Submisi yang hanya berjalan di platform lain (seperti Vercel, Netlify, atau Cloudflare) tanpa _endpoint_ aktif di Cloud Run akan didiskualifikasi dari kategori penghargaan utama.

### **C. Ekosistem Pendukung: Google Cloud Platform (GCP)**

- Pemanfaatan layanan GCP lainnya (seperti Google Maps Platform: Routes API, Air Quality API, dsb.) sangat disarankan dan menjadi nilai tambah yang signifikan dalam kriteria penilaian **Solution (40%)**.

## **3. Kriteria Penilaian (Judging Rubric)**

Setiap saran pengembangan dari AI harus selalu mengacu pada tiga pilar penilaian ini:

1. **Problem (30%):** Apakah SIGAP menyelesaikan masalah nyata dan mendesak di sektor publik/smart city? (Target Audiens: Definisikan dengan jelas siapa yang dibantu oleh aplikasi Anda dan mengapa hal itu penting saat ini. Dampak (Impact): Kami memprioritaskan solusi yang berpotensi untuk berkembang (scale) serta meningkatkan kualitas hidup atau kebiasaan industri.)
2. **Solution (40%):** Seberapa fungsional, profesional, intuitif, delightful, dan mudah digunakan (UX) aplikasi SIGAP? (Harus _live_ dan minim _bug_), serta ada nilai terukur atau "hasil" nyata yang diciptakan aplikasi Anda bagi pengguna.
3. **Uniqueness (30%):** Apakah ada "Spark" atau keunikan kreatif? (Orisinalitas: Hindari penggunaan templat standar; kami mencari ide-ide out-of-the-box dan perspektif yang segar. Faktor "Wow": Tunjukkan bagaimana Anda menggunakan alat AI secara elegan untuk menciptakan sesuatu yang tak terduga.).

## **4. Syarat Submisi Final**

- **Live App URL:** URL Cloud Run yang dapat diakses publik.
- **Demo Video (1-3 Menit):** Video yang diunggah di LinkedIn yang mendemonstrasikan alur kerja aplikasi dari masalah hingga solusi AI.
- **Hashtag:** Penggunaan tagar resmi #JuaraVibeCoding.
