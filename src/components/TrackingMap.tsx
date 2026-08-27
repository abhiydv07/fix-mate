"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TrackingMapProps {
  destLat: number;
  destLng: number;
  providerLat?: number | null;
  providerLng?: number | null;
}

export default function TrackingMap({
  destLat,
  destLng,
  providerLat,
  providerLng,
}: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const providerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Custom Icon for Customer Destination Address
    const homeIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // Custom Icon for Live Provider Vehicle / Pro
    const proIcon = L.divIcon({
      className: "custom-pro-pin",
      html: `<div style="background-color: #0c8de9; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 4px 12px rgba(12,141,233,0.5);">🚗</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    if (!mapInstanceRef.current) {        const map = L.map(mapContainerRef.current).setView([destLat || 28.5802, destLng || 77.3340], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Customer Destination Marker
      L.marker([destLat, destLng], { icon: homeIcon })
        .addTo(map)
        .bindPopup("<b>Delivery Spot</b><br>Customer Service Address")
        .openPopup();

      // Provider Live Marker
      if (providerLat && providerLng) {
        const pMarker = L.marker([providerLat, providerLng], { icon: proIcon }).addTo(map);
        pMarker.bindPopup("<b>Fix Mate Service Pro</b><br>Live GPS Location");
        providerMarkerRef.current = pMarker;

        const bounds = L.latLngBounds([
          [destLat, destLng],
          [providerLat, providerLng],
        ]);
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      mapInstanceRef.current = map;
    } else {
      // Update provider marker position dynamically when Realtime payload arrives
      if (providerLat && providerLng) {
        if (!providerMarkerRef.current) {
          const pMarker = L.marker([providerLat, providerLng], { icon: proIcon }).addTo(
            mapInstanceRef.current
          );
          providerMarkerRef.current = pMarker;
        } else {
          providerMarkerRef.current.setLatLng([providerLat, providerLng]);
        }
      }
    }
  }, [destLat, destLng, providerLat, providerLng]);

  return (
    <div className="space-y-1">
      <div
        ref={mapContainerRef}
        className="w-full h-56 rounded-2xl border border-slate-800 overflow-hidden z-10 shadow-lg"
      />
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
        <span>📍 Destination Pin: Customer Home</span>
        {providerLat ? (
          <span className="text-brand-400 font-bold flex items-center gap-1">
            🚗 Live Pro GPS Active
          </span>
        ) : (
          <span>Waiting for Pro GPS...</span>
        )}
      </div>
    </div>
  );
}
