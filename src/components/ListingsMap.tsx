"use client";

import { useEffect, useRef } from "react";
import type { ListingWithProfile } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/config";
import { formatPrice } from "@/lib/utils";

// Lithuanian city coordinates
const CITY_COORDS: Record<string, [number, number]> = {
  "Vilnius": [54.6872, 25.2797],
  "Kaunas": [54.8985, 23.9036],
  "Klaipėda": [55.7033, 21.1443],
  "Šiauliai": [55.9349, 23.3137],
  "Panevėžys": [55.7348, 24.3571],
  "Alytus": [54.3963, 24.0457],
  "Marijampolė": [54.5594, 23.3544],
  "Mažeikiai": [56.3095, 22.3415],
  "Jonava": [55.0724, 24.2794],
  "Utena": [55.4987, 25.6020],
};

function getCoords(city: string): [number, number] {
  return CITY_COORDS[city] ?? [55.1694, 23.8813]; // Lithuania center
}

interface Props {
  listings: ListingWithProfile[];
  lang: Locale;
  perDayLabel: string;
}

export function ListingsMap({ listings, lang, perDayLabel }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Fix default icon paths for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([55.1694, 23.8813], 7);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      listings.forEach((listing) => {
        const [lat, lng] = getCoords(listing.city);
        // Add slight jitter so overlapping markers are visible
        const jLat = lat + (Math.random() - 0.5) * 0.01;
        const jLng = lng + (Math.random() - 0.5) * 0.01;

        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#f97316;color:white;padding:4px 8px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.2)">
            €${listing.price_per_day}${perDayLabel}
          </div>`,
          iconAnchor: [30, 12],
        });

        const marker = L.marker([jLat, jLng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:160px">
            ${listing.images?.[0] ? `<img src="${listing.images[0]}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ""}
            <strong style="font-size:13px">${listing.title}</strong>
            <div style="color:#6b7280;font-size:12px;margin-top:2px">${listing.city}</div>
            <div style="font-weight:700;color:#f97316;margin-top:4px">€${listing.price_per_day}${perDayLabel}</div>
            <a href="/${lang}/listings/${listing.id}" style="display:block;margin-top:8px;background:#f97316;color:white;text-align:center;padding:4px 0;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">
              ${lang === "lt" ? "Peržiūrėti" : "View"}
            </a>
          </div>
        `);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [listings, lang, perDayLabel]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className="h-[500px] w-full rounded-2xl overflow-hidden border border-gray-100 z-0" />
    </>
  );
}
