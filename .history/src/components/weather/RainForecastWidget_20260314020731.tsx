'use client';

import { CloudRain } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MockPlace, MockWeatherHour } from '../../data/mock-trip';

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
  places: MockPlace[];
  hourlyWeather: MockWeatherHour[];
  highRainThreshold?: number;
  onRainStatusChange?: (isRaining: boolean) => void;
  onHourlyRainChange?: (hourlyRain: Record<string, number>) => void;
};

const randomOffset = (seed: number) => {
  const value = (seed * 17) % 9;
  return value - 4;
};

export function RainForecastWidget({
  places,
  hourlyWeather,
  highRainThreshold = 60,
  onRainStatusChange,
  onHourlyRainChange,
}: RainForecastWidgetProps) {
  const [refreshCount, setRefreshCount] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number | null>(null);

  const forecasts = useMemo(() => {
    const averageRain =
      hourlyWeather.length > 0
        ? Math.round(hourlyWeather.reduce((sum, point) => sum + point.rainProbability, 0) / hourlyWeather.length)
        : 0;

    return places.map((place, index) => ({
      placeId: place.id,
      placeName: place.name,
      rainProbability: Math.max(0, Math.min(100, averageRain + randomOffset(index + refreshCount + 1))),
    }));
  }, [hourlyWeather, places, refreshCount]);

  const indoorCafes = useMemo<IndoorCafe[]>(() => {
    return places
      .filter((place) => place.category === 'cafe' && place.is_indoor)
      .map((place) => ({ id: place.id, name: place.name }));
  }, [places]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (window.scrollY > 0) return;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const currentY = event.touches[0]?.clientY ?? 0;
    const delta = Math.max(0, currentY - touchStartY.current);
    setPullDistance(Math.min(delta, 120));
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80) {
      setRefreshCount((value) => value + 1);
    }
    setPullDistance(0);
    touchStartY.current = null;
  };

  const maxRain = useMemo(() => {
    if (forecasts.length === 0) return 0;
    return Math.max(...forecasts.map((item) => item.rainProbability));
  }, [forecasts]);

  const chartData = useMemo(() => {
    if (hourlyWeather.length === 0) {
      return [] as Array<{ hour: string; humidity: number; cloudCover: number; windSpeed: number }>;
    }

    return hourlyWeather
      .map((point) => ({
        hour: point.hour,
        humidity: point.humidity,
        cloudCover: point.cloudCover,
        windSpeed: point.windSpeed,
      }))
      .filter((point) => ['04', '05', '06'].includes(point.hour))
      .sort((a, b) => Number(a.hour) - Number(b.hour));
  }, [hourlyWeather]);

  const hourlyAverage = useMemo(() => {
    const nextValue: Record<string, number> = {};
    for (const point of hourlyWeather) {
      nextValue[point.hour] = point.rainProbability;
    }
    return nextValue;
  }, [hourlyWeather]);

  const hasHighRain = maxRain >= highRainThreshold;

  useEffect(() => {
    onRainStatusChange?.(hasHighRain);
    onHourlyRainChange?.(hourlyAverage);
  }, [hasHighRain, hourlyAverage, onHourlyRainChange, onRainStatusChange]);

  const hasHighCloudHuntChance = useMemo(() => {
    return chartData.some((point) => point.humidity > 90 && point.windSpeed <= 10);
  }, [chartData]);

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="space-y-3"
    >
      <p className="text-xs text-slate-500">
        Vuốt xuống để cập nhật thời tiết mới nhất {pullDistance > 0 ? `(${Math.round((pullDistance / 80) * 100)}%)` : ''}
      </p>
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

      {hasHighRain && (
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
