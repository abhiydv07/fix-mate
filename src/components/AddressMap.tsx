"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface AddressMapProps {
  lat: number;
  lng: number;
  onPositionChange: (lat: number, lng: number) => void;
}

export default function AddressMap({ lat, lng, onPositionChange }: AddressMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerInstanceRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix standard Leaflet default icon paths in Next.js
    const customIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        onPositionChange(position.lat, position.lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([lat, lng]);
      }
    }
  }, [lat, lng, onPositionChange]);

  return (
    <div className="space-y-1.5">
      <div
        ref={mapContainerRef}
        className="w-full h-48 rounded-xl border border-slate-800 overflow-hidden z-10"
      />
      <p className="text-[10px] text-slate-400 text-center font-medium">
        📍 Drag pin on OpenStreetMap to confirm exact service location
      </p>
    </div>
  );
}
