"use client";

import { Map, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef } from "react";
import type { EnvironmentalContext, SourceMeta, SpeedReadingInterval } from "@/lib/types";
import RouteSummaryPill from "./RouteSummaryPill";

interface IntelligenceMapProps {
  lat: number;
  lng: number;
  destination?: string;
  trafficData?: EnvironmentalContext["traffic"];
  originName?: string;
  destinationName?: string;
}

// Color per speed category — matches traffic light convention
const SPEED_COLOR: Record<SpeedReadingInterval["speed"], string> = {
  NORMAL: "#22C55E", // green
  SLOW: "#F97316", // orange
  TRAFFIC_JAM: "#EF4444", // red
};

const FALLBACK_COLOR = "#3B82F6"; // blue (no traffic data)

// ── Route renderer: traffic-colored polylines or fallback blue ────────────────
function RouteLayer({
  lat,
  lng,
  destination,
  trafficData,
  originName,
  destinationName,
}: {
  lat: number;
  lng: number;
  destination?: string;
  trafficData?: EnvironmentalContext["traffic"];
  originName?: string;
  destinationName?: string;
}) {
  const map = useMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapsLibrary = useMapsLibrary("maps") as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geometryLibrary = useMapsLibrary("geometry") as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerLibrary = useMapsLibrary("marker") as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylinesRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  function clearAll() {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    // AdvancedMarkerElement: set map = null to remove
    markersRef.current.forEach((m) => { m.map = null; });
    markersRef.current = [];
  }

  // ── PRIORITY 1: Routes API polyline (traffic-colored or single fallback) ──
  useEffect(() => {
    if (!map || !mapsLibrary || !geometryLibrary) return;
    if (!destination) return;

    const encodedPolyline = trafficData?.encodedPolyline;
    const intervals = trafficData?.speedReadingIntervals;

    // Need at least the polyline — intervals are optional (colored vs single)
    if (!encodedPolyline) return;

    clearAll();

    // Decode Google's Encoded Polyline format → LatLng[]
    const path = geometryLibrary.encoding.decodePath(encodedPolyline);
    if (path.length < 2) return;

    if (intervals && intervals.length > 0) {
      // ── Case A: Draw per-segment colored polylines ───────────────────────
      for (const interval of intervals) {
        const start = interval.startPolylinePointIndex ?? 0;
        const end = interval.endPolylinePointIndex ?? (path.length - 1);
        const segment = path.slice(start, Math.min(end + 1, path.length));
        if (segment.length < 2) continue;

        const polyline = new mapsLibrary.Polyline({
          path: segment,
          strokeColor: SPEED_COLOR[interval.speed as SpeedReadingInterval["speed"]] ?? SPEED_COLOR.NORMAL,
          strokeWeight: 5,
          strokeOpacity: 0.9,
          zIndex: 10,
          map,
        });
        polylinesRef.current.push(polyline);
      }
    } else {
      // ── Case B: No interval data (e.g. motorcycle/walk/bike) — single line
      const polyline = new mapsLibrary.Polyline({
        path,
        strokeColor: FALLBACK_COLOR,
        strokeWeight: 5,
        strokeOpacity: 0.8,
        zIndex: 10,
        map,
      });
      polylinesRef.current.push(polyline);
    }

    // Fit map to show the full route — use LatLngBoundsLiteral (no constructor needed)
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    path.forEach((point: any) => {
      const lat = point.lat();
      const lng = point.lng();
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });
    // Asymmetric padding so the route always lands in the safe zone between the
    // top-left RouteSummaryPill (~220×100 incl. margin) and the bottom-right
    // MapLegend (~200×70 incl. margin). Without this, the auto-fit centers the
    // route under the pill and the origin marker gets occluded.
    map.fitBounds(
      { south: minLat, west: minLng, north: maxLat, east: maxLng },
      { top: 100, right: 110, bottom: 90, left: 240 },
    );

    // ── Place markers at route endpoints ─────────────────────────────────────
    if (markerLibrary?.AdvancedMarkerElement) {
      const makePill = (text: string, isOrigin: boolean): HTMLElement => {
        // 18 chars keeps the pill compact enough to coexist with the
        // RouteSummaryPill in the top-left without horizontal collisions.
        const label = text.length > 18 ? text.slice(0, 18) + "\u2026" : text;
        const wrap = document.createElement("div");
        wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;";
        const pill = document.createElement("div");
        pill.textContent = label;
        pill.style.cssText = [
          "background:white", "color:#111", "font-size:10.5px", "font-weight:600",
          "padding:3px 9px", "border-radius:100px",
          "box-shadow:0 2px 10px rgba(0,0,0,0.14)", "white-space:nowrap",
          "letter-spacing:-0.01em", "font-family:-apple-system,'Inter',sans-serif",
        ].join(";");
        const dot = document.createElement("div");
        dot.style.cssText = [
          "width:10px", "height:10px", "border-radius:50%",
          `background:${isOrigin ? "#3B82F6" : "#0F172A"}`,
          "border:2.5px solid white", "box-shadow:0 1px 5px rgba(0,0,0,0.28)",
        ].join(";");
        wrap.appendChild(pill);
        wrap.appendChild(dot);
        return wrap;
      };

      try {
        const originMarker = new markerLibrary.AdvancedMarkerElement({
          map,
          position: path[0],
          title: originName ?? "Titik Berangkat",
          content: makePill(originName ?? "Titik Berangkat", true),
        });
        const destMarker = new markerLibrary.AdvancedMarkerElement({
          map,
          position: path[path.length - 1],
          title: destinationName ?? "Tujuan",
          content: makePill(destinationName ?? "Tujuan", false),
        });
        markersRef.current.push(originMarker, destMarker);
      } catch (e) {
        // AdvancedMarkerElement may require Map ID — silently skip if unavailable
        console.warn("AdvancedMarkerElement skipped:", e);
      }
    }

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, mapsLibrary, geometryLibrary, markerLibrary, trafficData?.encodedPolyline, trafficData?.speedReadingIntervals, destination, originName, destinationName]);

  return null;
}

// ── Map styles ────────────────────────────────────────────────────────────────
const minimalistMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e0ebf3" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

// ── Map Legend ────────────────────────────────────────────────────────────────
// Dual-row chip:
//   Row 1 — traffic colour key (Lancar / Padat / Macet)
//   Row 2 — Google Routes attribution + breathing freshness pulse
// The attribution row was previously the "Google Routes" card in the Ground
// Truth Sheet. It now lives next to the polyline that proves it.
type FreshnessState = "fresh" | "aging" | "fallback";

function computeFreshness(
  source: "Google" | "Fallback" | "Planned",
  meta: SourceMeta | undefined,
): FreshnessState {
  if (source === "Fallback") return "fallback";
  if (!meta) return "fresh";
  const updatedAtMs = new Date(meta.updatedAt).getTime();
  if (Number.isNaN(updatedAtMs) || meta.ttlMs <= 0) return "fresh";
  const ageMs = Date.now() - updatedAtMs;
  return ageMs >= meta.ttlMs * 0.75 ? "aging" : "fresh";
}

function formatWibTime(iso: string | undefined): string {
  if (!iso) return "baru saja";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "baru saja";
  return `${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })} WIB`;
}

function MapLegend({
  hasTrafficData,
  trafficSource,
  trafficMeta,
}: {
  hasTrafficData: boolean;
  trafficSource?: "Google" | "Fallback" | "Planned";
  trafficMeta?: SourceMeta;
}) {
  // No destination yet — show the spatial-engine identifier only.
  if (!hasTrafficData && !trafficSource) {
    return (
      <div className="map-legend">
        <div className="map-legend-row">
          <span className="map-legend-key">
            <span
              className="map-legend-key-bar"
              style={{ backgroundColor: FALLBACK_COLOR, boxShadow: `0 0 6px ${FALLBACK_COLOR}40` }}
            />
            SIGAP Spatial Engine
          </span>
        </div>
      </div>
    );
  }

  const freshness = computeFreshness(trafficSource ?? "Fallback", trafficMeta);
  const updatedLabel = formatWibTime(trafficMeta?.updatedAt);

  return (
    <div className="map-legend" role="complementary" aria-label="Legenda lalu lintas dan sumber data">
      <div className="map-legend-row">
        {[
          { color: SPEED_COLOR.NORMAL, label: "Lancar" },
          { color: SPEED_COLOR.SLOW, label: "Padat" },
          { color: SPEED_COLOR.TRAFFIC_JAM, label: "Macet" },
        ].map(({ color, label }) => (
          <span key={label} className="map-legend-key">
            <span
              className="map-legend-key-bar"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}40` }}
            />
            {label}
          </span>
        ))}
      </div>
      <div className="map-legend-attribution">
        <span className={`map-legend-pulse ${freshness}`} aria-hidden />
        <span>Google Routes &middot; {updatedLabel}</span>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function IntelligenceMap({ lat, lng, destination, trafficData, originName, destinationName }: IntelligenceMapProps) {
  const hasTrafficPolyline = !!(trafficData?.encodedPolyline && trafficData?.speedReadingIntervals?.length);
  const hasDestination = !!destination;

  // Map grows when there's a destination so the RouteSummaryPill (≈70px tall)
  // doesn't visually compete with the polyline content. Stays compact otherwise.
  const mapHeight = hasDestination ? 320 : 260;

  return (
    <div style={{
      width: "100%", height: `${mapHeight}px`, borderRadius: "20px",
      overflow: "hidden", position: "relative",
      border: "1px solid rgba(226, 232, 240, 0.6)",
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)",
      transition: "height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <Map
        defaultCenter={{ lat, lng }}
        defaultZoom={destination ? 13 : 15}
        disableDefaultUI={true}
        mapId="cf780bdfb94e8e343878d212"
        gestureHandling="greedy"
      >
        {destination && (
          <RouteLayer
            lat={lat}
            lng={lng}
            destination={destination}
            trafficData={trafficData}
            originName={originName}
            destinationName={destinationName}
          />
        )}
      </Map>
      <RouteSummaryPill
        trafficData={trafficData}
        hasDestination={hasDestination}
      />
      <MapLegend
        hasTrafficData={hasTrafficPolyline}
        trafficSource={hasDestination ? trafficData?.source : undefined}
        trafficMeta={hasDestination ? trafficData?.sourceMeta : undefined}
      />
    </div>
  );
}
