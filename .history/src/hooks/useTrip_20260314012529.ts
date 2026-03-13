import { useMemo } from 'react';

type Poi = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  is_indoor: boolean;
};

type ItineraryEntry = {
  id: string;
  placeId: string | null;
  startTime: string | null;
};

type RainAtTime = Record<string, number>;

type SwapSuggestion = {
  itineraryItemId: string;
  fromPlaceId: string;
  fromPlaceName: string;
  toPlaceId: string;
  toPlaceName: string;
  rainProbability: number;
  distanceKm: number;
};

const toHourKey = (timeValue: string | null) => {
  if (!timeValue) return null;
  return timeValue.slice(0, 2);
};

const haversineDistanceKm = (
  pointA: { latitude: number; longitude: number },
  pointB: { latitude: number; longitude: number },
) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(pointB.latitude - pointA.latitude);
  const dLng = toRad(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pointA.latitude)) * Math.cos(toRad(pointB.latitude)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const suggestIndoorSwap = (
  itinerary: ItineraryEntry[],
  pois: Poi[],
  rainAtTime: RainAtTime,
): SwapSuggestion[] => {
  const byId = new Map(pois.map((poi) => [poi.id, poi]));
  const indoorPois = pois.filter((poi) => poi.is_indoor);

  if (indoorPois.length === 0) return [];

  const suggestions: SwapSuggestion[] = [];

  for (const item of itinerary) {
    if (!item.placeId) continue;

    const place = byId.get(item.placeId);
    if (!place) continue;
    if (place.is_indoor) continue;

    const hourKey = toHourKey(item.startTime);
    if (!hourKey) continue;

    const rainProbability = rainAtTime[hourKey] ?? 0;
    if (rainProbability <= 70) continue;

    let nearestIndoor: Poi | null = null;
    let nearestDistanceKm = Number.POSITIVE_INFINITY;

    for (const indoorPoi of indoorPois) {
      const distanceKm = haversineDistanceKm(place, indoorPoi);
      if (distanceKm < nearestDistanceKm) {
        nearestDistanceKm = distanceKm;
        nearestIndoor = indoorPoi;
      }
    }

    if (!nearestIndoor) continue;

    suggestions.push({
      itineraryItemId: item.id,
      fromPlaceId: place.id,
      fromPlaceName: place.name,
      toPlaceId: nearestIndoor.id,
      toPlaceName: nearestIndoor.name,
      rainProbability,
      distanceKm: Number(nearestDistanceKm.toFixed(2)),
    });
  }

  return suggestions;
};

export function useTrip(itinerary: ItineraryEntry[], pois: Poi[], rainAtTime: RainAtTime) {
  const swapSuggestions = useMemo(() => {
    return suggestIndoorSwap(itinerary, pois, rainAtTime);
  }, [itinerary, pois, rainAtTime]);

  return {
    swapSuggestions,
    hasSwapSuggestion: swapSuggestions.length > 0,
  };
}
