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
      <body>{children}</body>
    </html>
  );
}
