'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { ItineraryItem } from '../../../../components/trip/ItineraryItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { RainForecastWidget } from '../../../../components/weather/RainForecastWidget';
import { useTrip } from '../../../../hooks/useTrip';
import { supabase } from '../../../../lib/supabase/client';
import { confirmRainSwapAction } from './actions';

const DalatMap = dynamic(
  () => import('../../../../components/map/DalatMap').then((module) => module.DalatMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
        Đang tải bản đồ...
      </div>
    ),
  },
);

type PageProps = {
  params: Promise<{ tripId: string }>;
};

type ItineraryRow = {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  place_id: string | null;
  place: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    is_indoor: boolean;
  } | null;
};

type Poi = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  is_indoor: boolean;
};

export default function TripDashboardPage({ params }: PageProps) {
  const [tripId, setTripId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isPendingSwap, startSwapTransition] = useTransition();
  const [isRaining, setIsRaining] = useState(false);
  const [hourlyRain, setHourlyRain] = useState<Record<string, number>>({});
  const [swapMessage, setSwapMessage] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryRow[]>([]);
  const [pois, setPois] = useState<Poi[]>([]);

  useEffect(() => {
    params.then((value) => {
      setTripId(value.tripId);
    });
  }, [params]);

  const loadTripData = useCallback(async () => {
    if (!tripId) return;

    setLoading(true);
    const { data: itineraryRows } = await supabase
      .from('itinerary_items')
      .select(
        `
          id,
          title,
          description,
          start_time,
          end_time,
          place_id,
          place:places(id, name, latitude, longitude, is_indoor)
        `,
      )
      .eq('trip_id', tripId)
      .order('start_time', { ascending: true });

    const typedRows = (itineraryRows ?? []) as ItineraryRow[];
    setItinerary(typedRows);

    const poiMap = new Map<string, Poi>();
    for (const item of typedRows) {
      if (!item.place?.id) continue;
      if (!poiMap.has(item.place.id)) {
        poiMap.set(item.place.id, {
          id: item.place.id,
          name: item.place.name,
          latitude: item.place.latitude,
          longitude: item.place.longitude,
          is_indoor: item.place.is_indoor,
        });
      }
    }

    setPois(Array.from(poiMap.values()));
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    void loadTripData();
  }, [loadTripData]);

  const itineraryForSwap = useMemo(() => {
    return itinerary.map((item) => ({
      id: item.id,
      placeId: item.place_id,
      startTime: item.start_time,
    }));
  }, [itinerary]);

  const { swapSuggestions, hasSwapSuggestion } = useTrip(itineraryForSwap, pois, hourlyRain);

  const firstIndoorSuggestion = useMemo(() => {
    return swapSuggestions[0] ?? null;
  }, [swapSuggestions]);

  const handleSuggestIndoorCafe = useCallback(() => {
    const element = document.getElementById('weather-hub');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleConfirmSwap = useCallback(() => {
    if (!firstIndoorSuggestion) return;

    startSwapTransition(async () => {
      const result = await confirmRainSwapAction({
        itineraryItemId: firstIndoorSuggestion.itineraryItemId,
        fromPlaceId: firstIndoorSuggestion.fromPlaceId,
        toPlaceId: firstIndoorSuggestion.toPlaceId,
      });

      setSwapMessage(result.message);

      if (result.ok) {
        await loadTripData();
      }
    });
  }, [firstIndoorSuggestion, loadTripData]);

  return (
    <main className="space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard chuyến đi</h1>
        <p className="text-sm text-slate-600">Theo dõi mưa, lịch trình và bản đồ POI trong cùng một màn hình.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card id="weather-hub" className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Weather Hub</CardTitle>
            <CardDescription>Dự báo mưa theo tọa độ các POI trong itinerary.</CardDescription>
          </CardHeader>
          <CardContent>
            {tripId ? (
              <RainForecastWidget
                tripId={tripId}
                onRainStatusChange={setIsRaining}
                onHourlyRainChange={setHourlyRain}
              />
            ) : (
              <p className="text-sm text-slate-500">Đang tải thông tin chuyến đi...</p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Danh sách điểm đến theo giờ và cảnh báo mưa theo ngữ cảnh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Đang tải timeline...</p>
            ) : itinerary.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có itinerary item nào trong chuyến đi.</p>
            ) : (
              itinerary.map((item) => (
                <ItineraryItem
                  key={item.id}
                  item={{
                    id: item.id,
                    title: item.title,
                    placeName: item.place?.name,
                    startTime: item.start_time,
                    endTime: item.end_time,
                    description: item.description,
                  }}
                  isRaining={isRaining}
                  onSuggestIndoorCafe={handleSuggestIndoorCafe}
                />
              ))
            )}

            {hasSwapSuggestion && firstIndoorSuggestion && (
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
                Gợi ý hoán đổi: <strong>{firstIndoorSuggestion.fromPlaceName}</strong> →{' '}
                <strong>{firstIndoorSuggestion.toPlaceName}</strong> ({firstIndoorSuggestion.distanceKm} km),
                do xác suất mưa {firstIndoorSuggestion.rainProbability}%.
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleConfirmSwap}
                    disabled={isPendingSwap}
                    className="rounded-md bg-pine-green px-3 py-2 text-xs font-medium text-white transition hover:bg-pine-green/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPendingSwap ? 'Đang cập nhật...' : 'Xác nhận đổi điểm vì trời mưa'}
                  </button>
                </div>
              </div>
            )}

            {swapMessage && (
              <div className="rounded-lg border border-hydrangea-blue/30 bg-hydrangea-blue/10 p-3 text-sm text-slate-700">
                {swapMessage}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Map Preview</CardTitle>
            <CardDescription>Bản đồ thu nhỏ hiển thị POI indoor (xanh) và outdoor (cam).</CardDescription>
          </CardHeader>
          <CardContent>
            {pois.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
                Chưa có POI để hiển thị trên bản đồ.
              </div>
            ) : (
              <DalatMap points={pois} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
