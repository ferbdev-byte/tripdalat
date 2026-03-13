'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

type PoiMarker = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  is_indoor: boolean;
};

type DalatMapProps = {
  points: PoiMarker[];
  height?: number;
  selectedPointId?: string | null;
  onSelectPoint?: (pointId: string) => void;
};

const DALAT_CENTER: [number, number] = [11.9404, 108.4583];

function FocusOnPoint({ point }: { point: PoiMarker | null }) {
  const map = useMap();

  useEffect(() => {
    if (!point) return;
    map.flyTo([point.latitude, point.longitude], 14, { duration: 0.8 });
  }, [map, point]);

  return null;
}

export function DalatMap({ points, height = 260, selectedPointId = null, onSelectPoint }: DalatMapProps) {
  const selectedPoint = points.find((point) => point.id === selectedPointId) ?? null;

  return (
    <div className="overflow-hidden rounded-dalat border border-white/25 bg-white/55 shadow-[0_14px_32px_rgba(74,74,74,0.10)] backdrop-blur-md">
      <MapContainer
        center={DALAT_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: `${height}px`, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FocusOnPoint point={selectedPoint} />

        {points.map((point) => {
          const isIndoor = point.is_indoor;
          const isSelected = point.id === selectedPointId;

          return (
            <CircleMarker
              key={point.id}
              center={[point.latitude, point.longitude]}
              radius={isSelected ? 11 : 9}
              pathOptions={{
                color: isIndoor ? '#869484' : '#D4A5A5',
                fillColor: isIndoor ? '#869484' : '#D4A5A5',
                fillOpacity: isSelected ? 1 : 0.85,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => {
                  onSelectPoint?.(point.id);
                },
              }}
            >
              <Popup>
                <div className="text-sm text-[#4b5a53]">
                  <p className="font-semibold">{point.name}</p>
                  <p>{isIndoor ? 'Indoor (ổn định khi mưa)' : 'Outdoor (cần theo dõi mưa)'}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
