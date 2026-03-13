'use client';

import { CloudRain } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
  hourlyWeather: HourlyWeatherPoint[];
};

type HourlyWeatherPoint = {
  hour: string;
  rainProbability: number;
  humidity: number;
  cloudCover: number;
  windSpeed: number;
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
  url.searchParams.set(
    'hourly',
    'precipitation_probability,relative_humidity_2m,cloud_cover,wind_speed_10m',
  );
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Không thể lấy dữ liệu dự báo mưa');
  }

  const payload = await response.json();
  const times: string[] = payload?.hourly?.time ?? [];
  const rainValues: number[] = payload?.hourly?.precipitation_probability ?? [];
  const humidityValues: number[] = payload?.hourly?.relative_humidity_2m ?? [];
  const cloudCoverValues: number[] = payload?.hourly?.cloud_cover ?? [];
  const windSpeedValues: number[] = payload?.hourly?.wind_speed_10m ?? [];

  const hourlyWeather: HourlyWeatherPoint[] = times.slice(0, 24).map((time, index) => {
    const hour = String(new Date(time).getHours()).padStart(2, '0');

    return {
      hour,
      rainProbability: Math.round(rainValues[index] ?? 0),
      humidity: Math.round(humidityValues[index] ?? 0),
      cloudCover: Math.round(cloudCoverValues[index] ?? 0),
      windSpeed: Math.round(windSpeedValues[index] ?? 0),
    };
  });

  if (hourlyWeather.length === 0) {
    return { averageRain: 0, hourlyWeather: [] as HourlyWeatherPoint[] };
  }

  const averageRain = Math.round(
    hourlyWeather.reduce((sum, point) => sum + point.rainProbability, 0) / hourlyWeather.length,
  );

  return { averageRain, hourlyWeather };
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
              hourlyWeather: weather.hourlyWeather,
            };
          }),
        );

        setForecasts(nextForecasts);

        const hasHighRain = nextForecasts.some(
          (item) => item.rainProbability >= highRainThreshold,
        );

        const aggregateHours: Record<string, number[]> = {};

        for (const forecast of nextForecasts) {
          forecast.hourlyWeather.forEach((point) => {
            const hour = point.hour;
            if (!aggregateHours[hour]) {
              aggregateHours[hour] = [];
            }
            aggregateHours[hour].push(point.rainProbability);
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
    if (forecasts.length === 0) {
      return [] as Array<{ hour: string; humidity: number; cloudCover: number; windSpeed: number }>;
    }

    const buckets: Record<string, { humidity: number[]; cloudCover: number[]; windSpeed: number[] }> = {};
    for (const forecast of forecasts) {
      forecast.hourlyWeather.forEach((point) => {
        const hour = point.hour;
        if (!buckets[hour]) {
          buckets[hour] = { humidity: [], cloudCover: [], windSpeed: [] };
        }
        buckets[hour].humidity.push(point.humidity);
        buckets[hour].cloudCover.push(point.cloudCover);
        buckets[hour].windSpeed.push(point.windSpeed);
      });
    }

    return Object.entries(buckets)
      .map(([hour, values]) => ({
        hour,
        humidity: Math.round(values.humidity.reduce((sum, val) => sum + val, 0) / values.humidity.length),
        cloudCover: Math.round(values.cloudCover.reduce((sum, val) => sum + val, 0) / values.cloudCover.length),
        windSpeed: Math.round(values.windSpeed.reduce((sum, val) => sum + val, 0) / values.windSpeed.length),
      }))
      .filter((point) => ['04', '05', '06'].includes(point.hour))
      .sort((a, b) => Number(a.hour) - Number(b.hour));
  }, [forecasts]);

  const hasHighCloudHuntChance = useMemo(() => {
    return chartData.some((point) => point.humidity > 90 && point.windSpeed <= 10);
  }, [chartData]);

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
        <div className="mb-4 rounded-md border border-hydrangea-blue/30 bg-white/70 p-3 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-600">Humidity & Cloud cover (4h - 5h - 6h)</p>
            {hasHighCloudHuntChance && (
              <span className="rounded-full bg-hydrangea-blue/20 px-2.5 py-1 text-xs font-medium text-pine-green">
                Cơ hội săn mây cao! ☁️
              </span>
            )}
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="hour" tickFormatter={(value) => `${value}h`} tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value}%`} labelFormatter={(label) => `${label}h`} />
                <Line type="monotone" dataKey="humidity" stroke="#1F5F4A" strokeWidth={2} dot />
                <Line type="monotone" dataKey="cloudCover" stroke="#6FA8DC" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
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
