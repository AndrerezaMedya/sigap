import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  BrainCircuit,
  HelpCircle,
  Server,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

interface DocModalProps {
  onClose: () => void;
}

type DocChild = {
  id: string;
  label: string;
};

type DocSection = {
  id: string;
  label: string;
  icon?: ElementType;
  children?: DocChild[];
};

type DocContent = {
  title: string;
  eyebrow: string;
  body: ReactNode;
};

const DOC_SECTIONS: DocSection[] = [
  { id: "intro", label: "Pengantar", icon: BookOpen },
  {
    id: "guide",
    label: "Panduan Pengguna",
    icon: HelpCircle,
    children: [
      { id: "guide-flow", label: "Alur Utama" },
      { id: "guide-persona", label: "Personalisasi" },
      { id: "guide-decision", label: "Memahami Keputusan" },
      { id: "guide-timeline", label: "Smart Timeline" },
      { id: "guide-map", label: "Map Sekunder" },
    ],
  },
  {
    id: "system",
    label: "Cara Kerja SIGAP",
    icon: BrainCircuit,
    children: [
      { id: "system-data", label: "Data Fusion" },
      { id: "system-gemini", label: "Gemini Reasoning" },
      { id: "system-fallback", label: "Fallback & Confidence" },
      { id: "system-glossary", label: "Glossary" },
    ],
  },
  { id: "privacy", label: "Keamanan & Privasi", icon: ShieldCheck },
  {
    id: "api",
    label: "Integrasi API",
    icon: Server,
    children: [
      { id: "api-summary", label: "Ringkasan Endpoint" },
      { id: "api-internal", label: "SIGAP Recommendation" },
      { id: "api-bmkg", label: "BMKG Weather" },
      { id: "api-visualcrossing", label: "VisualCrossing" },
      { id: "api-flood", label: "PetaBencana" },
      { id: "api-google", label: "Google APIs" },
    ],
  },
];

function getDefaultTab(section: DocSection) {
  return section.children?.[0]?.id ?? section.id;
}

function isSectionActive(section: DocSection, activeTab: string) {
  return (
    section.id === activeTab ||
    Boolean(section.children?.some((child) => child.id === activeTab))
  );
}

function DocCallout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="doc-callout">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

function DocCodeBlock({ children }: { children: ReactNode }) {
  return <div className="doc-code">{children}</div>;
}

function DefinitionList({
  items,
}: {
  items: Array<{ term: string; description: string }>;
}) {
  return (
    <div className="doc-definitions">
      {items.map((item) => (
        <div key={item.term}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </div>
      ))}
    </div>
  );
}

function EndpointTable() {
  const rows = [
    ["POST /api/recommendation", "Rekomendasi internal SIGAP", "POST", "Server app"],
    ["BMKG Forecast", "Prakiraan cuaca per 3 jam berbasis ADM4", "GET", "Publik"],
    ["VisualCrossing Timeline", "Microclimate dan feels-like hourly", "GET", "API key"],
    ["PetaBencana Reports", "Laporan banjir berbasis lokasi", "GET", "Publik"],
    ["Google Air Quality", "Kualitas udara real-time", "POST", "API key"],
    ["Google Routes/Maps", "Rute, trafik, dan visualisasi map", "GET/POST", "API key"],
    ["Gemini API", "Reasoning engine dan rekomendasi", "POST", "Server key"],
  ];

  return (
    <table className="doc-table">
      <thead>
        <tr>
          <th>Integrasi / Endpoint</th>
          <th>Dipakai untuk</th>
          <th>Metode</th>
          <th>Akses</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, purpose, method, access]) => (
          <tr key={name}>
            <td>{name}</td>
            <td>{purpose}</td>
            <td>{method}</td>
            <td>{access}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const DOC_CONTENT: Record<string, DocContent> = {
  intro: {
    eyebrow: "Mulai dari sini",
    title: "Apa itu SIGAP?",
    body: (
      <>
        <p>
          SIGAP bantu kamu jawab satu pertanyaan: aman nggak kalau aku keluar sekarang?
          Bukan dashboard cuaca. Bukan peta penuh pin. Keputusan dulu, data pendukung menyusul.
        </p>
        <DocCallout title="Decision-first">
          Keputusan tampil lebih dulu. Alasan dan angka pendukung ada di bawahnya,
          buat yang mau baca lebih dalam.
        </DocCallout>
        <DefinitionList
          items={[
            {
              term: "Untuk pengguna",
              description:
                "Cek rencana berangkat, jogging, naik motor, event outdoor, atau perjalanan keluarga.",
            },
            {
              term: "Untuk demo",
              description:
                "Lihat bagaimana Gemini menggabungkan data cuaca, mobilitas, dan risiko lingkungan jadi satu rekomendasi.",
            },
            {
              term: "Untuk developer",
              description:
                "Buka bagian Integrasi API untuk detail sumber data dan batas client-server.",
            },
          ]}
        />
      </>
    ),
  },
  "guide-flow": {
    eyebrow: "Panduan Pengguna",
    title: "Alur utama: Activity Decision Flow",
    body: (
      <>
        <p>
          Ada dua cara pakai SIGAP. Keduanya memanggil pipeline Gemini yang sama,
          cuma konteks yang dikirim berbeda.
        </p>
        <ol className="doc-steps">
          <li>Buka SIGAP, isi personalisasi singkat. Gemini langsung pakai info ini buat menyesuaikan rekomendasi.</li>
          <li>Panel utama di atas langsung tampilkan keputusan, risk badge, kondisi cuaca, dan jendela waktu terbaik.</li>
          <li>
            Tab "Tanya SIGAP" buat pertanyaan bebas.
            Ketik seperti "Aman jogging sore ini?", tekan Enter.
            Quick prompt bisa diklik buat isi field, tapi belum otomatis submit.
          </li>
          <li>
            Tab "Rencanakan Perjalanan" buat rute spesifik.
            Isi tujuan, pilih moda dan waktu, lalu klik "Analisis Rute".
          </li>
          <li>Hasil muncul di panel atas, Smart Timeline, dan peta rute. Kalau rute tersedia, polyline diwarnai sesuai kepadatan lalu lintas.</li>
        </ol>
        <DocCallout title="Bedanya apa?">
          "Tanya SIGAP" kirim pertanyaan bebas + data lingkungan.
          "Rencanakan Perjalanan" tambahin blok konteks perjalanan
          (asal, tujuan, moda, waktu) supaya rekomendasi Gemini spesifik ke rute itu.
        </DocCallout>
      </>
    ),
  },
  "guide-persona": {
    eyebrow: "Panduan Pengguna",
    title: "Kenapa SIGAP meminta personalisasi?",
    body: (
      <>
        <p>
          SIGAP tanya soal aktivitas, usia, moda transportasi, dan catatan kesehatan
          supaya rekomendasi bisa disesuaikan. Pengendara motor dapat saran
          yang beda dari pejalan kaki atau orang yang sensitif polusi.
        </p>
        <DocCallout title="Soal penyimpanan">
          Data persona disimpan di localStorage browser. Nggak perlu bikin akun,
          dan kamu bisa ubah kapan saja lewat tombol "Ubah Profil".
        </DocCallout>
      </>
    ),
  },
  "guide-decision": {
    eyebrow: "Panduan Pengguna",
    title: "Cara membaca keputusan SIGAP",
    body: (
      <>
        <p>
          Panel di atas halaman sengaja langsung tampilkan keputusan, bukan angka mentah.
          Kamu nggak perlu baca sendiri data cuaca dan AQI lalu simpulkan.
        </p>
        <DefinitionList
          items={[
            {
              term: "Aman / Nyaman",
              description:
                "Aktivitas masih disarankan. Tetap pantau perubahan kondisi jika aktivitas berlangsung lama.",
            },
            {
              term: "Waspada / Kurang Disarankan",
              description:
                "Ada faktor risiko seperti hujan, AQI, banjir, atau trafik. Pertimbangkan menunda atau mengganti moda.",
            },
            {
              term: "Risiko Tinggi",
              description:
                "SIGAP melihat kombinasi risiko yang cukup kuat. Pilih alternatif yang lebih aman.",
            },
            {
              term: "Confidence",
              description:
                "Angka keyakinan AI. Semakin lengkap dan selaras data yang masuk, semakin tinggi confidence.",
            },
          ]}
        />
      </>
    ),
  },
  "guide-timeline": {
    eyebrow: "Panduan Pengguna",
    title: "Smart Timeline: kapan waktu terbaik?",
    body: (
      <>
        <p>
          Smart Timeline kasih gambaran kondisi beberapa jam ke depan.
          Ini yang jawab pertanyaan: berangkat sekarang, nanti, atau ganti rencana?
        </p>
        <table className="doc-table compact">
          <thead>
            <tr>
              <th>Jam</th>
              <th>Makna untuk user</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>07:00</td>
              <td>Kepadatan mulai naik, masih bisa berangkat tetapi perlu siap delay.</td>
            </tr>
            <tr>
              <td>07:15</td>
              <td>Window paling optimal karena risiko belum meningkat.</td>
            </tr>
            <tr>
              <td>08:00</td>
              <td>Hujan atau trafik bisa membuat aktivitas kurang nyaman.</td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  "guide-map": {
    eyebrow: "Panduan Pengguna",
    title: "Mengapa map bukan pusat UI?",
    body: (
      <>
        <p>
          Peta bukan halaman utama. SIGAP tampilkan keputusan dulu, baru peta
          muncul di bawah sebagai konteks tambahan: rute mana, macet di mana.
        </p>
        <DocCallout title="Warna polyline">
          Kalau rute tersedia dari Google Routes API, garis rute diwarnai per-segmen
          berdasarkan kepadatan lalu lintas:
          Hijau = Lancar (NORMAL),
          Oranye = Padat (SLOW),
          Merah = Macet (TRAFFIC_JAM).
          Zoom otomatis disesuaikan supaya seluruh rute terlihat.
        </DocCallout>
        <DefinitionList
          items={[
            {
              term: "Moda Mobil",
              description: "Polyline diwarnai per-segmen berdasarkan speedReadingIntervals dari Routes API.",
            },
            {
              term: "Motor / Jalan Kaki / Sepeda",
              description: "Polyline biru tunggal. Routes API tidak menyediakan interval traffic untuk moda ini.",
            },
            {
              term: "Tanpa rute",
              description: "Peta tetap muncul sebagai konteks lokasi. SIGAP tetap memberi rekomendasi berbasis cuaca dan input user.",
            },
          ]}
        />
      </>
    ),
  },
  "system-data": {
    eyebrow: "Cara Kerja SIGAP",
    title: "Data Fusion: data apa saja yang digabung?",
    body: (
      <>
        <p>
          Semua data dari berbagai sumber dikumpulkan jadi satu objek konteks.
          Objek ini yang dikirim ke Gemini, jadi AI kerja dari data terstruktur,
          bukan menebak dari teks bebas.
        </p>
        <DefinitionList
          items={[
            { term: "Profil user", description: "Pekerjaan, umur, moda transportasi, dan catatan kesehatan dari PersonaModal." },
            { term: "BMKG", description: "Prakiraan cuaca Indonesia berdasarkan kode wilayah ADM4." },
            { term: "VisualCrossing", description: "Tambahan microclimate seperti feels-like temperature jika API key tersedia." },
            { term: "Google AQI", description: "Kualitas udara, saat ini disiapkan dengan fallback jika belum terkonfigurasi." },
            { term: "Google Routes API", description: "Estimasi rute, trafik, encoded polyline, dan speedReadingIntervals ketika lokasi dan tujuan tersedia." },
            { term: "Google Places API (New)", description: "Autocomplete nama tempat dengan field masking dan location bias 25km dari koordinat user — hemat kuota dan relevan secara geografis." },
            { term: "PetaBencana", description: "Konteks laporan banjir di sekitar lokasi saat data tersedia." },
          ]}
        />
      </>
    ),
  },
  "system-gemini": {
    eyebrow: "Cara Kerja SIGAP",
    title: "Gemini sebagai reasoning engine",
    body: (
      <>
        <p>
          Gemini bukan chatbot di sini. Dia terima data terstruktur, lalu
          balikkan JSON dengan format yang sudah ditentukan.
        </p>
        <DocCodeBlock>
          riskLevel, headline, recommendation, reasoning, confidence, bestWindow, timeline, activityComparison
        </DocCodeBlock>
        <p>
          Dengan format tetap, UI bisa tampilkan keputusan secara konsisten.
          Nggak ada hasil AI yang bocor jadi teks bebas di layar.
        </p>
        <DocCallout title="Beda prompt per tab">
          "Tanya SIGAP": Gemini terima data lingkungan + pertanyaan user,
          lalu bikin rekomendasi berdasarkan kondisi saat itu.
          <br /><br />
          "Rencanakan Perjalanan": ditambah blok konteks perjalanan
          (asal, tujuan, moda, waktu berangkat) supaya rekomendasi
          spesifik ke rute, bukan cuma kondisi cuaca umum.
        </DocCallout>
      </>
    ),
  },
  "system-fallback": {
    eyebrow: "Cara Kerja SIGAP",
    title: "Fallback dan confidence",
    body: (
      <>
        <p>
          Beberapa API butuh key atau billing yang belum tentu aktif.
          Supaya demo tetap jalan, SIGAP punya data fallback.
          Yang penting: fallback bukan data live, dan nggak boleh diklaim begitu.
        </p>
        <DocCallout title="Jangan klaim data palsu">
          Kalau data dari fallback, tampilkan sebagai "konteks demo"
          atau "data belum tersedia". Jangan bilang ini kondisi real-time.
        </DocCallout>
      </>
    ),
  },
  "system-glossary": {
    eyebrow: "Cara Kerja SIGAP",
    title: "Glossary istilah penting",
    body: (
      <DefinitionList
        items={[
          { term: "ADM4", description: "Kode wilayah administrasi desa/kelurahan yang dipakai BMKG untuk prakiraan cuaca lokal." },
          { term: "AQI", description: "Air Quality Index, indikator kualitas udara dan risiko kesehatan." },
          { term: "Confidence", description: "Tingkat keyakinan rekomendasi berdasarkan kelengkapan dan konsistensi data." },
          { term: "Fallback", description: "Data pengganti agar aplikasi tetap bisa demo ketika API eksternal belum tersedia." },
          { term: "Smart Timeline", description: "Ringkasan perubahan risiko dari waktu ke waktu." },
          { term: "Decision Engine", description: "Sistem yang fokus menghasilkan keputusan praktis, bukan sekadar menampilkan data mentah." },
        ]}
      />
    ),
  },
  privacy: {
    eyebrow: "Keamanan & Privasi",
    title: "Apa yang terjadi pada data pengguna?",
    body: (
      <>
        <p>
          Data profil persona bikin rekomendasi lebih relevan.
          API key sensitif cuma ada di server, nggak pernah dikirim ke browser.
        </p>
        <DefinitionList
          items={[
            {
              term: "Persona",
              description:
                "Disimpan di localStorage browser untuk demo. User dapat mengubahnya lewat tombol Ubah Profil.",
            },
            {
              term: "Gemini API Key",
              description:
                "Dipanggil server-side melalui API route, bukan dari browser user.",
            },
            {
              term: "Google Maps public key",
              description:
                "Key untuk map dapat berada di client jika sudah dibatasi domain dan API-nya di Google Cloud Console.",
            },
          ]}
        />
      </>
    ),
  },
  "api-summary": {
    eyebrow: "Integrasi API",
    title: "Ringkasan endpoint dan integrasi",
    body: (
      <>
        <p>
          Daftar API dan endpoint yang dipakai SIGAP.
          Kalau cari penjelasan non-teknis, buka Panduan Pengguna atau Cara Kerja SIGAP.
        </p>
        <EndpointTable />
      </>
    ),
  },
  "api-internal": {
    eyebrow: "Integrasi API",
    title: "Endpoint internal SIGAP",
    body: (
      <>
        <p>
          Satu-satunya endpoint yang dipanggil UI. Gabungkan user context,
          data lingkungan, dan Gemini jadi satu respons rekomendasi.
        </p>
        <DocCodeBlock>POST /api/recommendation</DocCodeBlock>
        <DefinitionList
          items={[
            { term: "Input", description: "locationName, adm4Code, destination, activity, transportMode, plannedTime, userQuestion, profile." },
            { term: "Output", description: "environmentalContext, recommendation, dan generatedBy." },
            { term: "Catatan", description: "Endpoint ini server-side sehingga aman untuk memanggil Gemini dengan API key." },
          ]}
        />
      </>
    ),
  },
  "api-bmkg": {
    eyebrow: "Integrasi API",
    title: "BMKG Weather",
    body: (
      <>
        <p>
          Sumber cuaca utama karena datanya spesifik per desa/kelurahan di Indonesia.
          SIGAP pakai kode ADM4 untuk query prakiraan.
        </p>
        <DocCodeBlock>
          GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=&#123;kode_wilayah&#125;
        </DocCodeBlock>
        <DefinitionList
          items={[
            { term: "Status", description: "Terintegrasi dengan cache dan fallback." },
            { term: "Rate limit referensi", description: "60 request per menit per IP sesuai dokumentasi BMKG." },
            { term: "Dipakai untuk", description: "Weather summary dan timeline cuaca awal." },
          ]}
        />
      </>
    ),
  },
  "api-visualcrossing": {
    eyebrow: "Integrasi API",
    title: "VisualCrossing Timeline",
    body: (
      <>
        <p>
          Data microclimate dan resolusi per jam. Kalau API key belum ada,
          SIGAP pakai fallback supaya demo tetap jalan.
        </p>
        <DocCodeBlock>
          GET https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/[location]
        </DocCodeBlock>
        <DefinitionList
          items={[
            { term: "Status", description: "Opsional, memakai fallback jika API key belum tersedia." },
            { term: "Auth", description: "API key." },
            { term: "Dipakai untuk", description: "Feels-like temperature, presipitasi, dan stabilitas cuaca beberapa jam ke depan." },
          ]}
        />
      </>
    ),
  },
  "api-flood": {
    eyebrow: "Integrasi API",
    title: "PetaBencana",
    body: (
      <>
        <p>
          Sumber data banjir dan genangan. Lebih akurat kalau koordinat lokasi tersedia.
        </p>
        <DocCodeBlock>
          GET https://data.petabencana.id/reports?lat=...&lng=...&distance=5000&disaster=flood
        </DocCodeBlock>
        <DefinitionList
          items={[
            { term: "Status", description: "Terhubung sebagai service dengan fallback." },
            { term: "Auth", description: "Endpoint publik." },
            { term: "Dipakai untuk", description: "Peringatan banjir atau laporan genangan sekitar lokasi." },
          ]}
        />
      </>
    ),
  },
  "api-google": {
    eyebrow: "Integrasi API",
    title: "Google AQI, Routes, Places, dan Maps",
    body: (
      <>
        <p>
          AQI dan Routes dipanggil server-side. Places (New) dipanggil client-side
          dengan pembatasan field. Maps pakai public key yang dibatasi domain.
        </p>
        <DefinitionList
          items={[
            { term: "Google Air Quality", description: "Kualitas udara real-time. Dipanggil server-side." },
            {
              term: "Google Routes API (New)",
              description: "Estimasi durasi, trafik, encoded polyline, dan speedReadingIntervals per-segmen. Pakai extraComputations: TRAFFIC_ON_POLYLINE.",
            },
            {
              term: "Google Places API (New)",
              description: "Autocomplete tujuan dengan field masking (displayName, formattedAddress, location). Location bias 25km dari koordinat user. Versi baru yang gantiin Places API lama.",
            },
            { term: "Google Maps JS API", description: "Visualisasi peta. Polyline digambar manual per-segmen (bukan DirectionsRenderer) supaya bisa diwarnai sesuai traffic." },
          ]}
        />
      </>
    ),
  },
};

export default function DocModal({ onClose }: DocModalProps) {
  const [activeTab, setActiveTab] = useState("intro");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const activeContent = useMemo(() => DOC_CONTENT[activeTab], [activeTab]);

  return (
    <div
      aria-modal="true"
      className="doc-overlay"
      onClick={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
      role="dialog"
    >
      <style>{`
        .doc-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background-color: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .doc-shell {
          width: 100%;
          max-width: 1020px;
          height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }
        .doc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        .doc-title-group {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #374151;
        }
        .doc-title-icon {
          display: flex;
          color: #9ca3af;
        }
        .doc-header h2 {
          margin: 0;
          color: #111;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .doc-close {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 8px;
          padding: 6px;
          color: #9ca3af;
          background: transparent;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
        }
        .doc-close:hover {
          background: #f5f5f5;
          color: #111;
        }
        .doc-layout {
          display: flex;
          min-height: 0;
          flex: 1;
        }
        .doc-sidebar {
          width: 236px;
          flex-shrink: 0;
          overflow-y: auto;
          border-right: 1px solid #f0f0f0;
          padding: 16px 10px;
          background: #fff;
        }
        .doc-sidebar-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 0;
          border-radius: 7px;
          padding: 7px 10px;
          color: #6b7280;
          background: transparent;
          cursor: pointer;
          font-size: 0.855rem;
          font-weight: 500;
          text-align: left;
          transition: color 0.15s, background 0.15s;
          margin-bottom: 1px;
        }
        .doc-sidebar-item:hover {
          color: #111;
          background: #f5f5f5;
        }
        .doc-sidebar-item.active {
          color: #111;
          font-weight: 600;
          background: #f5f5f5;
        }
        .doc-sidebar-subgroup {
          display: grid;
          gap: 0;
          margin: 2px 0 6px 19px;
          border-left: 1px solid #e5e7eb;
          padding-left: 0;
        }
        .doc-sidebar-sub {
          border: 0;
          border-radius: 0 6px 6px 0;
          padding: 6px 10px 6px 14px;
          color: #9ca3af;
          background: transparent;
          cursor: pointer;
          font-size: 0.8125rem;
          text-align: left;
          width: 100%;
          transition: color 0.15s;
        }
        .doc-sidebar-sub:hover {
          color: #374151;
        }
        .doc-sidebar-sub.active {
          color: #111;
          font-weight: 600;
        }
        .doc-content {
          flex: 1;
          overflow-y: auto;
          padding: 52px 56px 52px 52px;
          background: #fff;
        }
        .doc-eyebrow {
          margin-bottom: 10px;
          color: #9ca3af;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }
        .doc-content h1 {
          margin: 0 0 24px;
          color: #111;
          font-size: clamp(1.5rem, 3vw, 1.875rem);
          line-height: 1.1;
          letter-spacing: -0.035em;
          font-weight: 700;
        }
        .doc-content p {
          margin: 0 0 16px;
          color: #4b5563;
          font-size: 0.9375rem;
          line-height: 1.8;
        }
        .doc-callout {
          margin: 24px 0;
          border-left: 3px solid #d1d5db;
          padding: 14px 18px;
          background: #fafafa;
          border-radius: 0 8px 8px 0;
        }
        .doc-callout strong {
          display: block;
          margin-bottom: 5px;
          color: #111;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .doc-callout p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.7;
        }
        .doc-steps {
          display: grid;
          gap: 10px;
          margin: 20px 0 0;
          padding-left: 20px;
          color: #4b5563;
          line-height: 1.75;
          font-size: 0.9375rem;
        }
        .doc-steps li::marker {
          color: #d1d5db;
          font-weight: 700;
        }
        .doc-definitions {
          display: grid;
          gap: 0;
          margin-top: 24px;
          border-top: 1px solid #f0f0f0;
        }
        .doc-definitions div {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 20px;
          align-items: start;
          border-bottom: 1px solid #f0f0f0;
          padding: 14px 0;
          background: transparent;
          border-radius: 0;
        }
        .doc-definitions dt {
          color: #111;
          font-weight: 600;
          font-size: 0.855rem;
          line-height: 1.5;
          padding-top: 1px;
        }
        .doc-definitions dd {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.7;
        }
        .doc-code {
          overflow-x: auto;
          margin: 18px 0;
          border-radius: 8px;
          padding: 14px 16px;
          color: #374151;
          background: #f9fafb;
          border: 1px solid #f0f0f0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.825rem;
          line-height: 1.7;
        }
        .doc-table {
          width: 100%;
          margin-top: 24px;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .doc-table th {
          padding: 8px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #9ca3af;
          font-weight: 600;
          font-size: 0.7rem;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .doc-table td {
          padding: 12px 12px;
          border-bottom: 1px solid #f5f5f5;
          color: #374151;
          vertical-align: top;
        }
        .doc-table tr:last-child td {
          border-bottom: none;
        }
        .doc-table.compact td:first-child {
          font-weight: 600;
          color: #111;
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .doc-shell { height: 94vh; border-radius: 12px; }
          .doc-layout { flex-direction: column; }
          .doc-sidebar { width: 100%; max-height: 200px; border-right: 0; border-bottom: 1px solid #f0f0f0; }
          .doc-content { padding: 28px 24px; }
          .doc-definitions div { grid-template-columns: 1fr; gap: 4px; }
        }
      `}</style>

      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="doc-shell"
        exit={{ opacity: 0, scale: 0.96, y: -16 }}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        onClick={(event) => event.stopPropagation()}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="doc-header">
          <div className="doc-title-group">
            <div className="doc-title-icon">
              <BookOpen size={20} strokeWidth={2} />
            </div>
            <h2>Dokumentasi SIGAP</h2>
          </div>
          <button
            aria-label="Tutup dokumentasi"
            className="doc-close"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="doc-layout">
          <nav aria-label="Navigasi dokumentasi" className="doc-sidebar">
            {DOC_SECTIONS.map((section) => {
              const Icon = section.icon;
              const active = isSectionActive(section, activeTab);

              return (
                <div key={section.id}>
                  <button
                    aria-expanded={section.children ? active : undefined}
                    className={`doc-sidebar-item ${active ? "active" : ""}`}
                    onClick={() => setActiveTab(getDefaultTab(section))}
                    type="button"
                  >
                    {Icon ? <Icon size={18} /> : null}
                    {section.label}
                  </button>
                  {section.children && active ? (
                    <div className="doc-sidebar-subgroup">
                      {section.children.map((child) => (
                        <button
                          className={`doc-sidebar-sub ${
                            activeTab === child.id ? "active" : ""
                          }`}
                          key={child.id}
                          onClick={() => setActiveTab(child.id)}
                          type="button"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <main className="doc-content">
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                key={activeTab}
                transition={{ duration: 0.18 }}
              >
                <div className="doc-eyebrow">{activeContent.eyebrow}</div>
                <h1>{activeContent.title}</h1>
                {activeContent.body}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </motion.div>
    </div>
  );
}
