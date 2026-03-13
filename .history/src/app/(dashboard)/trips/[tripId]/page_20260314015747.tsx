'use client';

import dynamic from 'next/dynamic';
import { CloudDrizzle, Compass, MapPin, Sparkles, WandSparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { Toaster, toast } from 'sonner';
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
      <div className="flex h-[340px] items-center justify-center rounded-[2rem] border border-white/20 bg-white/35 text-sm text-text/70 backdrop-blur-md transition-all duration-700">
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
        reason: `Xác suất mưa ${firstIndoorSuggestion.rainProbability}%`,
      });

      setSwapMessage(result.message);

      if (result.ok) {
        toast.success('Đã đổi lịch để né mưa thành công! 🌧️✅');
        await loadTripData();
      } else {
        toast.error(result.message);
      }
    });
  }, [firstIndoorSuggestion, loadTripData]);

  return (
    <main className="min-h-screen space-y-10 bg-[#FDFCFB] p-8 md:p-10">
      <header className="space-y-3 transition-all duration-700">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/45 px-4 py-1.5 text-xs text-[#869484] backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          Dalat Dream Dashboard
        </p>
        <h1 className="text-4xl text-text md:text-5xl" style={{ fontFamily: 'var(--font-heading), serif' }}>
          Nhật ký chuyến đi mộng sương
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-text/75">
          Theo dõi thời tiết, lịch trình và bản đồ trong một nhịp giao diện nhẹ như sương mai Đà Lạt.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-3">
        <Card id="weather-hub" className="weather-hub rounded-[2rem] border-white/20 bg-white/40 backdrop-blur-md transition-all duration-700 xl:col-span-1">
          <CardHeader className="p-8">
            <CardTitle className="inline-flex items-center gap-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <CloudDrizzle className="h-5 w-5 text-secondary" strokeWidth={1.5} />
              Weather Hub
            </CardTitle>
            <CardDescription>Dự báo mưa theo tọa độ POI, tối ưu lịch trình bằng nhịp thời tiết mềm mại.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {tripId ? (
              <RainForecastWidget
                tripId={tripId}
                onRainStatusChange={setIsRaining}
                onHourlyRainChange={setHourlyRain}
              />
            ) : (
              <p className="text-sm text-text/70">Đang tải thông tin chuyến đi...</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/20 bg-white/40 backdrop-blur-md transition-all duration-700 xl:col-span-1">
          <CardHeader className="p-8">
            <CardTitle className="inline-flex items-center gap-2 text-[#869484]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <Compass className="h-5 w-5" strokeWidth={1.5} />
              Timeline
            </CardTitle>
            <CardDescription>Lộ trình theo giờ với nhịp chấm mờ và nét đứt nhẹ nhàng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8 pt-0">
            {loading ? (
              <p className="text-sm text-text/70">Đang tải timeline...</p>
            ) : itinerary.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#869484]/30 bg-white/35 p-8 text-center backdrop-blur-md transition-all duration-700">
                <div className="text-5xl">🐻💤</div>
                <p className="mt-3 text-sm font-medium text-text">Hôm nay chú gấu ngủ nướng vì bạn chưa có lịch trình nào.</p>
                <p className="mt-1 text-xs text-text/70">Thêm điểm đến để timeline bắt đầu sống động hơn.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {itinerary.map((item, index) => (
                  <div key={item.id} className="relative pl-10 transition-all duration-700">
                    {index < itinerary.length - 1 && (
                      <span className="absolute left-3 top-7 h-[calc(100%+1.5rem)] w-px border-l border-dashed border-[#869484]/35" />
                    )}
                    <span className="absolute left-0 top-1.5 h-6 w-6 rounded-full border border-[#869484]/30 bg-[#869484]/15 backdrop-blur-sm" />

                    <div className="rounded-[2rem] border border-white/20 bg-white/45 p-6 shadow-soft backdrop-blur-md">
                      <p className="text-xs tracking-wide text-[#869484]">
                        {item.start_time ?? '--:--'} {item.end_time ? `→ ${item.end_time}` : ''}
                      </p>
                      <h3 className="mt-2 text-xl text-text" style={{ fontFamily: 'var(--font-heading), serif' }}>
                        {item.place?.name ?? item.title}
                      </h3>
                      <p className="mt-1 text-sm text-text/75">{item.title}</p>
                      {item.description && <p className="mt-2 text-sm leading-7 text-text/70">{item.description}</p>}

                      {isRaining && (
                        <button
                          type="button"
                          onClick={handleSuggestIndoorCafe}
                          className="mt-4 rounded-full border border-[#869484]/30 bg-white/55 px-4 py-2 text-xs text-[#869484] transition-all duration-700 hover:bg-white/75"
                        >
                          Xem quán cafe gần đây có mái che
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasSwapSuggestion && firstIndoorSuggestion && (
              <div className="rounded-[2rem] border border-[#D4A5A5]/40 bg-[#D4A5A5]/18 p-6 text-sm text-text transition-all duration-700">
                <p>
                  Gợi ý hoán đổi: <strong>{firstIndoorSuggestion.fromPlaceName}</strong> →{' '}
                  <strong>{firstIndoorSuggestion.toPlaceName}</strong> ({firstIndoorSuggestion.distanceKm} km),
                do xác suất mưa {firstIndoorSuggestion.rainProbability}%.
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleConfirmSwap}
                    disabled={isPendingSwap}
                    className="rounded-full bg-[#D4A5A5] px-5 py-2.5 text-xs font-medium text-white transition-all duration-700 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPendingSwap ? 'Đang cập nhật...' : 'Xác nhận đổi điểm vì trời mưa'}
                  </button>
                </div>
              </div>
            )}

            {swapMessage && (
              <div className="rounded-[2rem] border border-[#D4A5A5]/35 bg-white/45 p-5 text-sm text-text/85 transition-all duration-700">
                {swapMessage}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/20 bg-white/40 backdrop-blur-md transition-all duration-700 xl:col-span-1">
          <CardHeader className="p-8">
            <CardTitle className="inline-flex items-center gap-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <MapPin className="h-5 w-5 text-[#869484]" strokeWidth={1.5} />
              Map Preview
            </CardTitle>
            <CardDescription>Bản đồ thu nhỏ hiển thị POI indoor (xanh) và outdoor (cam).</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {pois.length === 0 ? (
              <div className="flex h-[340px] items-center justify-center rounded-[2rem] border border-dashed border-[#869484]/30 text-sm text-text/70">
                Chưa có POI để hiển thị trên bản đồ.
              </div>
            ) : (
              <DalatMap points={pois} />
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .weather-hub .recharts-line-curve {
          stroke-width: 1 !important;
          stroke: url(#dalatDreamGradient) !important;
        }
        .weather-hub .recharts-cartesian-axis-tick-value {
          fill: #6f6f6f !important;
        }
      `}</style>
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="dalatDreamGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D8BFD8" />
            <stop offset="100%" stopColor="#A8D5E5" />
          </linearGradient>
        </defs>
      </svg>
      <Toaster position="top-right" richColors />
    </main>
  );
}
