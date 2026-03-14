'use client';

import 'leaflet/dist/leaflet.css';
import type { CircleMarker as LeafletCircleMarker } from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { DALAT_LOCAL_DISCOVERY } from '../../constants/dalat-data';

type PoiMarker = {
  id: string;
  name: string;
  category?: 'cafe' | 'food' | 'sightseeing' | 'stay' | 'hotel' | 'shopping' | 'other';
  latitude?: number;
  longitude?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  is_indoor?: boolean;
  description?: string;
  best_time?: string;
  image_url?: string;
};

type NormalizedPoi = {
  id: string;
  name: string;
  category: PoiMarker['category'];
  latitude: number;
  longitude: number;
  is_indoor: boolean;
  description?: string;
  best_time?: string;
  image_url?: string;
};

type DalatMapProps = {
  points?: PoiMarker[];
  height?: number;
  selectedPointId?: string | null;
  focusZoomLevel?: number;
  onSelectPoint?: (pointId: string) => void;
};

const DALAT_CENTER: [number, number] = [11.9404, 108.4583];

function FocusOnPoint({
  point,
  markerRefs,
  zoomLevel,
}: {
  point: NormalizedPoi | null;
  markerRefs: React.MutableRefObject<Map<string, LeafletCircleMarker>>;
  zoomLevel: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!point) return;
    // Keep map interaction smooth when selection changes from timeline clicks.
    map.flyTo([point.latitude, point.longitude], zoomLevel, { duration: 0.8 });

    const selectedMarker = markerRefs.current.get(point.id);
    selectedMarker?.openPopup();
  }, [map, markerRefs, point, zoomLevel]);

  return null;
}

export function DalatMap({ points, height = 260, selectedPointId = null, focusZoomLevel = 14, onSelectPoint }: DalatMapProps) {
  const markerRefs = useRef<Map<string, LeafletCircleMarker>>(new Map());

  const normalizedPoints = useMemo<NormalizedPoi[]>(() => {
    const source =
      points && points.length > 0
        ? points
        : DALAT_LOCAL_DISCOVERY.map((poi) => ({
            ...poi,
            is_indoor: poi.category === 'cafe' || poi.category === 'stay',
          }));

    return source
      .map((point) => {
        const latitude = point.latitude ?? point.coordinates?.lat;
        const longitude = point.longitude ?? point.coordinates?.lng;

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
          return null;
        }

        const category = point.category ?? 'other';
        const isIndoor =
          typeof point.is_indoor === 'boolean'
            ? point.is_indoor
            : category === 'cafe' || category === 'stay' || category === 'hotel';

        return {
          id: point.id,
          name: point.name,
          category,
          latitude,
          longitude,
          is_indoor: isIndoor,
          description: point.description,
          best_time: point.best_time,
          image_url: point.image_url,
        };
      })
      .filter((point): point is NormalizedPoi => point !== null);
  }, [points]);

  const selectedPoint = normalizedPoints.find((point) => point.id === selectedPointId) ?? null;

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
        <FocusOnPoint point={selectedPoint} markerRefs={markerRefs} zoomLevel={focusZoomLevel} />

        {normalizedPoints.map((point) => {
          const isIndoor = point.is_indoor;
          const isSelected = point.id === selectedPointId;

          return (
            <CircleMarker
              key={point.id}
              center={[point.latitude, point.longitude]}
              ref={(node) => {
                if (node) {
                  markerRefs.current.set(point.id, node);
                } else {
                  markerRefs.current.delete(point.id);
                }
              }}
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
                <div className="space-y-1 text-sm text-[#4b5a53]">
                  <p className="font-semibold">{point.name}</p>
                  <p>{isIndoor ? 'Indoor (ổn định khi mưa)' : 'Outdoor (cần theo dõi mưa)'}</p>
                  {point.best_time && <p>Khung giờ đẹp: {point.best_time}</p>}
                  {point.description && <p className="text-xs text-[#4b5a53]/80">{point.description}</p>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
