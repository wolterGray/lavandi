import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useInView } from "react-intersection-observer";
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

export default function StudioMap({ lat, lng, mapsLink, openLabel }) {
  const [ref, inView] = useInView({ triggerOnce: true, rootMargin: "-5% 0px" });
  const position = [lat, lng];

  return (
    <div ref={ref} className="relative overflow-hidden rounded-card border border-gold/40 shadow-spa ring-1 ring-gold/10">
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
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Marker position={position} icon={studioIcon} />
        <MapResize active={inView} />
      </MapContainer>
      <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 z-[500] rounded-pill bg-gold px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-gold-dark">
        {openLabel}
      </a>
    </div>
  );
}
