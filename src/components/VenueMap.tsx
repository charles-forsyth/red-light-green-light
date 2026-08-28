"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Venue } from "@/types";

// Custom Marker Icon for Leaflet
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface VenueMapProps {
  venues: Venue[];
  selectedVenueId: string;
  onSelectVenue: (id: string) => void;
}

export default function VenueMap({ venues, selectedVenueId, onSelectVenue }: VenueMapProps) {
  const defaultCenter: [number, number] = [42.1000, -76.9000]; // Finger Lakes / Southern Tier NY/PA Region

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative z-10">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => onSelectVenue(venue.id),
            }}
          >
            <Popup className="text-slate-950 font-sans">
              <div className="p-1">
                <h4 className="font-bold text-sm text-slate-900">{venue.name}</h4>
                <p className="text-xs text-slate-600">{venue.address}</p>
                <div className="mt-2 text-xs font-bold text-emerald-700">
                  {venue.boothCount} Video Booths Available
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
