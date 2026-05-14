import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIGAP — Panduan Cerdas Perencanaan Aktivitas",
  description:
    "SIGAP membantu kamu membuat keputusan harian yang lebih aman dan nyaman berdasarkan kondisi cuaca, lalu lintas, dan lingkungan kota secara real-time menggunakan AI.",
  keywords: [
    "SIGAP",
    "cuaca",
    "rekomendasi AI",
    "perencanaan aktivitas",
    "keputusan kota",
    "smart city",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f8fc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div className="mobile-block">
          {/* SIGAP wordmark */}
          <div className="mobile-block-brand">
            <div className="mobile-block-brand-dot" />
            SIGAP
          </div>

          {/* Main card */}
          <div className="mobile-block-card">
            <div className="mobile-block-icon">🖥️</div>
            <h1 className="mobile-block-title">Mode Mobile Belum Tersedia</h1>
            <p className="mobile-block-body">
              SIGAP saat ini hanya tersedia di browser desktop. Mohon buka halaman ini melalui browser desktop, atau aktifkan Mode Desktop di browser mobile Anda.
            </p>
            <p className="mobile-block-tip">
              Chrome/Safari → Menu → &quot;Request Desktop Site&quot;
            </p>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
