'use client';

import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';

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
};

const DALAT_CENTER: [number, number] = [11.9404, 108.4583];

export function DalatMap({ points, height = 280 }: DalatMapProps) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/25 bg-white/50 backdrop-blur-md">
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

        {points.map((point) => {
          const isIndoor = point.is_indoor;

          return (
            <CircleMarker
              key={point.id}
              center={[point.latitude, point.longitude]}
              radius={8}
              pathOptions={{
                color: isIndoor ? '#869484' : '#D4A5A5',
                fillColor: isIndoor ? '#869484' : '#D4A5A5',
                fillOpacity: 0.85,
                weight: 2,
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
