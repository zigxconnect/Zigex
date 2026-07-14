"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Minus, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GeolocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange: (radius: number) => void;
}

export function GeolocationPicker({
  latitude,
  longitude,
  radius,
  onLocationChange,
  onRadiusChange,
}: GeolocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Initialize the map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix default marker icon issue with webpack/next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const defaultLat = latitude || 5.9631;
      const defaultLng = longitude || 10.1591;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([defaultLat, defaultLng], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom zoom control position
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Add marker if we have coordinates
      if (latitude && longitude) {
        const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
        const circle = L.circle([latitude, longitude], {
          radius: radius,
          color: "#155DFC",
          fillColor: "#155DFC",
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(map);

        marker.on("dragend", (e: any) => {
          const pos = e.target.getLatLng();
          if (isMounted) {
            onLocationChange(pos.lat, pos.lng);
            circle.setLatLng(pos);
          }
        });

        markerRef.current = marker;
        circleRef.current = circle;
      }

      // Click to place marker
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        if (isMounted) {
          onLocationChange(lat, lng);

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            circleRef.current?.setLatLng([lat, lng]);
          } else {
            const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            const circle = L.circle([lat, lng], {
              radius: radius,
              color: "#155DFC",
              fillColor: "#155DFC",
              fillOpacity: 0.15,
              weight: 2,
            }).addTo(map);

            marker.on("dragend", (ev: any) => {
              const pos = ev.target.getLatLng();
              if (isMounted) {
                onLocationChange(pos.lat, pos.lng);
                circle.setLatLng(pos);
              }
            });

            markerRef.current = marker;
            circleRef.current = circle;
          }
        }
      });

      mapRef.current = map;
      if (isMounted) setMapReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update circle radius when radius changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  // Use current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onLocationChange(lat, lng);
        setIsLocating(false);

        if (mapRef.current) {
          const L = require("leaflet");
          mapRef.current.setView([lat, lng], 17);

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            circleRef.current?.setLatLng([lat, lng]);
          } else {
            const marker = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
            const circle = L.circle([lat, lng], {
              radius: radius,
              color: "#155DFC",
              fillColor: "#155DFC",
              fillOpacity: 0.15,
              weight: 2,
            }).addTo(mapRef.current);

            marker.on("dragend", (e: any) => {
              const pos = e.target.getLatLng();
              onLocationChange(pos.lat, pos.lng);
              circle.setLatLng(pos);
            });

            markerRef.current = marker;
            circleRef.current = circle;
          }
        }
      },
      (error) => {
        setIsLocating(false);
        alert("Could not get your location. Please enable location services or click on the map to set the pin.");
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const radiusOptions = [50, 100, 200, 500, 1000];

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>How to set your office location:</strong> Click &quot;Use My Current Location&quot; while at your office,
          or click anywhere on the map to drop a pin. You can also drag the pin to adjust.
        </div>
      </div>

      {/* Use my location button */}
      <Button
        type="button"
        onClick={handleUseMyLocation}
        disabled={isLocating}
        className="bg-[#155DFC] hover:bg-[#1A3CB9] text-white rounded-xl gap-2 font-semibold"
      >
        <Navigation size={16} className={isLocating ? "animate-pulse" : ""} />
        {isLocating ? "Getting Location..." : "Use My Current Location"}
      </Button>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
        <div
          ref={mapContainerRef}
          className="w-full h-[300px] md:h-[400px] z-0"
        />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="animate-pulse text-slate-500 text-sm font-medium">Loading map...</div>
          </div>
        )}
      </div>

      {/* Coordinates display */}
      {latitude && longitude && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Latitude</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <MapPin size={14} className="text-blue-600" />
              <span className="text-sm font-mono font-medium text-slate-800">{latitude.toFixed(6)}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Longitude</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <MapPin size={14} className="text-blue-600" />
              <span className="text-sm font-mono font-medium text-slate-800">{longitude.toFixed(6)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Radius selector */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Allowed Check-in Radius
        </label>
        <div className="flex flex-wrap gap-2">
          {radiusOptions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRadiusChange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                radius === r
                  ? "bg-[#155DFC] text-white border-[#155DFC] shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {r >= 1000 ? `${r / 1000}km` : `${r}m`}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Students must be within this distance from the pin to check in. 100m is recommended for most buildings.
        </p>
      </div>
    </div>
  );
}
