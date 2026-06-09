import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useInView } from "react-intersection-observer";
import { STUDIO } from "../../constants/theme";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const studioIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapResize({ active }) {
  const map = useMap();

  useEffect(() => {
    const refresh = () => map.invalidateSize();
    refresh();
    const timer = window.setTimeout(refresh, active ? 50 : 250);
    return () => window.clearTimeout(timer);
  }, [active, map]);

  return null;
}

export default function StudioMap({ openLabel }) {
  const [ref, inView] = useInView({ triggerOnce: true, rootMargin: "-5% 0px" });
  const position = [STUDIO.lat, STUDIO.lng];

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-graphite"
    >
      <MapContainer
        center={position}
        zoom={16}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="studio-map z-0 h-[320px] w-full sm:h-[360px]"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Marker position={position} icon={studioIcon} />
        <MapResize active={inView} />
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] h-16 bg-gradient-to-t from-void/80 to-transparent" />

      <a
        href={STUDIO.mapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 z-[500] rounded-full border border-white/15 bg-void/90 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-milk backdrop-blur-sm transition hover:border-gold/30 hover:text-champagne"
      >
        {openLabel}
      </a>
    </div>
  );
}
