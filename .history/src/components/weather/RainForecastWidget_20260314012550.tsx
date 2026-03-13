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
  hourlyRain: number[];
};

type IndoorCafe = {
  id: string;
  name: string;
};

type RainForecastWidgetProps = {
  tripId: string;
  highRainThreshold?: number;
  onRainStatusChange?: (isRaining: boolean) => void;
  onHourlyRainChange?: (hourlyRain: Record<string, number>) => void;
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

  if (windowValues.length === 0) {
    return { averageRain: 0, hourlyRain: [] as number[] };
  }

  const averageRain = Math.round(windowValues.reduce((sum, value) => sum + value, 0) / windowValues.length);

  return { averageRain, hourlyRain: windowValues };
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
  onHourlyRainChange,
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
            const weather = await getRainScoreFromOpenMeteo(place.latitude, place.longitude);
            return {
              placeId: place.id,
              placeName: place.name,
              rainProbability: weather.averageRain,
              hourlyRain: weather.hourlyRain,
            };
          }),
        );

        setForecasts(nextForecasts);

        const hasHighRain = nextForecasts.some(
          (item) => item.rainProbability >= highRainThreshold,
        );

        const aggregateHours: Record<string, number[]> = {};

        for (const forecast of nextForecasts) {
          forecast.hourlyRain.forEach((value, index) => {
            const hour = String(index).padStart(2, '0');
            if (!aggregateHours[hour]) {
              aggregateHours[hour] = [];
            }
            aggregateHours[hour].push(value);
          });
        }

        const hourlyAverage: Record<string, number> = {};
        for (const [hour, values] of Object.entries(aggregateHours)) {
          const avg = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
          hourlyAverage[hour] = avg;
        }

        onHourlyRainChange?.(hourlyAverage);

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
        onHourlyRainChange?.({});
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [tripId, highRainThreshold, onRainStatusChange, onHourlyRainChange]);

  const maxRain = useMemo(() => {
    if (forecasts.length === 0) return 0;
    return Math.max(...forecasts.map((item) => item.rainProbability));
  }, [forecasts]);

  const chartData = useMemo(() => {
    if (forecasts.length === 0) return [] as Array<{ hour: string; value: number }>;

    const buckets: Record<string, number[]> = {};
    for (const forecast of forecasts) {
      forecast.hourlyRain.forEach((value, index) => {
        const hour = String(index).padStart(2, '0');
        if (!buckets[hour]) buckets[hour] = [];
        buckets[hour].push(value);
      });
    }

    return Object.entries(buckets)
      .map(([hour, values]) => ({
        hour,
        value: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length),
      }))
      .sort((a, b) => Number(a.hour) - Number(b.hour));
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

      {chartData.length > 0 && (
        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-medium text-slate-600">Biểu đồ xác suất mưa trong ngày</p>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
            {chartData.map((point) => (
              <div key={point.hour} className="flex flex-col items-center gap-1">
                <div className="flex h-24 w-full items-end rounded bg-white px-1">
                  <div
                    className="w-full rounded-t bg-sky-500"
                    style={{ height: `${Math.max(point.value, 4)}%` }}
                    title={`${point.hour}:00 - ${point.value}%`}
                  />
                </div>
                <span className="text-[10px] text-slate-500">{point.hour}h</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
