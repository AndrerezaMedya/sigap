import type { ActivityType, TransportMode } from "@/lib/types";

export const ACTIVITY_OPTIONS: Array<{
  value: ActivityType;
  label: string;
  description: string;
}> = [
  {
    value: "walking",
    label: "🚶 Jalan kaki",
    description: "Sensitif ke hujan, panas, AQI, dan jarak tempuh.",
  },
  {
    value: "motorcycle",
    label: "🏍 Naik motor",
    description: "Prioritaskan hujan, banjir, angin, dan visibilitas.",
  },
  {
    value: "commute",
    label: "🚗 Berkendara",
    description: "Fokus ke trafik, rute, dan waktu tempuh terbaik.",
  },
  {
    value: "jogging",
    label: "🏃 Jogging",
    description: "Perhatikan AQI, suhu terasa, kelembapan, dan hujan.",
  },
  {
    value: "outdoor_event",
    label: "🎪 Event outdoor",
    description: "Cek risiko cuaca berubah selama durasi acara.",
  },
  {
    value: "family_trip",
    label: "👨‍👩‍👧 Family trip",
    description: "Lebih konservatif untuk kenyamanan dan keamanan keluarga.",
  },
];

export const TRANSPORT_OPTIONS: Array<{ value: TransportMode; label: string }> =
  [
    { value: "motorcycle", label: "Motor" },
    { value: "car", label: "Mobil" },
    { value: "walking", label: "Jalan kaki" },
    { value: "cycling", label: "Sepeda" },
    { value: "public_transport", label: "Transportasi umum" },
  ];

export const DEFAULT_DEMO_LOCATION = {
  label: "Bandung - Gedung Sate",
  lat: -6.9025,
  lng: 107.6188,
  adm4Code: "32.73.14.1002", // Bandung Wetan - Citarum
};
