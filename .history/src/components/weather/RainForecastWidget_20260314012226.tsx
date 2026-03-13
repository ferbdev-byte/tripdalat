'use client';

import { CloudRain } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase/client';

type PlacePoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type PlaceForecast = {
  placeId: string;
  placeName: string;
  rainProbability: number;
};

type IndoorCafe = {
  id: string;
  name: string;
};

type RainForecastWidgetProps = {
  tripId: string;
  highRainThreshold?: number;
  onRainStatusChange?: (isRaining: boolean) => void;
};

const getRainScoreFromOpenMeteo = async (latitude: number, longitude: number) => {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('hourly', 'precipitation_probability');
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Không thể lấy dữ liệu dự báo mưa');
  }

  const payload = await response.json();
  const probabilities: number[] = payload?.hourly?.precipitation_probability ?? [];
  const windowValues = probabilities.slice(0, 12);

  if (windowValues.length === 0) return 0;

  return Math.round(windowValues.reduce((sum, value) => sum + value, 0) / windowValues.length);
};

const toUniquePlaces = (rows: Array<{ place: PlacePoint | PlacePoint[] | null }>) => {
  const map = new Map<string, PlacePoint>();

  for (const row of rows) {
    const place = Array.isArray(row.place) ? row.place[0] : row.place;
    if (!place?.id) continue;
    if (!map.has(place.id)) {
      map.set(place.id, place);
    }
  }

  return Array.from(map.values());
};

export function RainForecastWidget({
  tripId,
  highRainThreshold = 60,
  onRainStatusChange,
}: RainForecastWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecasts, setForecasts] = useState<PlaceForecast[]>([]);
  const [indoorCafes, setIndoorCafes] = useState<IndoorCafe[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: itineraryRows, error: itineraryError } = await supabase
          .from('itinerary_items')
          .select(
            `
              place:places(
                id,
                name,
                latitude,
                longitude
              )
            `,
          )
          .eq('trip_id', tripId)
          .not('place_id', 'is', null);

        if (itineraryError) {
          throw itineraryError;
        }

        const places = toUniquePlaces((itineraryRows ?? []) as Array<{ place: PlacePoint | PlacePoint[] | null }>);

        const nextForecasts = await Promise.all(
          places.map(async (place) => {
            const rainProbability = await getRainScoreFromOpenMeteo(place.latitude, place.longitude);
            return {
              placeId: place.id,
              placeName: place.name,
              rainProbability,
            };
          }),
        );

        setForecasts(nextForecasts);

        const hasHighRain = nextForecasts.some(
          (item) => item.rainProbability >= highRainThreshold,
        );

        onRainStatusChange?.(hasHighRain);

        if (hasHighRain) {
          const { data: cafes, error: cafesError } = await supabase
            .from('places')
            .select('id, name')
            .eq('category', 'cafe')
            .eq('is_indoor', true)
            .limit(5);

          if (cafesError) {
            throw cafesError;
          }

          setIndoorCafes((cafes ?? []) as IndoorCafe[]);
        } else {
          setIndoorCafes([]);
        }
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Không thể tải widget dự báo mưa';
        setError(message);
        onRainStatusChange?.(false);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [tripId, highRainThreshold, onRainStatusChange]);

  const maxRain = useMemo(() => {
    if (forecasts.length === 0) return 0;
    return Math.max(...forecasts.map((item) => item.rainProbability));
  }, [forecasts]);

  if (loading) {
    return <section><p>Đang tải dữ liệu dự báo mưa...</p></section>;
  }

  if (error) {
    return <section><p>Lỗi widget mưa: {error}</p></section>;
  }

  return (
    <section>
      <div>
        <CloudRain size={18} />
        <h3>Dự báo mưa theo POI</h3>
      </div>

      <p>Mức rủi ro mưa cao nhất: <strong>{maxRain}%</strong></p>

      {forecasts.length === 0 ? (
        <p>Chưa có POI trong itinerary để phân tích dự báo mưa.</p>
      ) : (
        <ul>
          {forecasts
            .sort((a, b) => b.rainProbability - a.rainProbability)
            .map((item) => (
              <li key={item.placeId}>
                {item.placeName}: {item.rainProbability}%
              </li>
            ))}
        </ul>
      )}

      {maxRain >= highRainThreshold && (
        <div>
          <p>Tỉ lệ mưa đang cao, nên ưu tiên địa điểm indoor.</p>
          {indoorCafes.length > 0 ? (
            <ul>
              {indoorCafes.map((cafe) => (
                <li key={cafe.id}>{cafe.name}</li>
              ))}
            </ul>
          ) : (
            <p>Chưa tìm thấy quán cafe indoor trong danh sách places.</p>
          )}
        </div>
      )}
    </section>
  );
}
