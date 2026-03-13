'use client';

import dynamic from 'next/dynamic';
import { Backpack, BrainCircuit, CheckCircle2, Circle, CloudDrizzle, Coffee, Compass, Dice6, MapPin, MapPinned, PlusCircle, Sparkles, Umbrella } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { RainForecastWidget } from '../../../../components/weather/RainForecastWidget';
import { getTripById, type ItineraryItem, type Place } from '../../../../data/mockData';
import { useTrip } from '../../../../hooks/useTrip';

const DalatMap = dynamic(
  () => import('../../../../components/map/DalatMap').then((module) => module.DalatMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[260px] sm:h-[340px] items-center justify-center rounded-dalat border border-white/20 bg-white/35 text-sm text-[#4A4A4A]/70 backdrop-blur-md transition-all duration-700">
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
  category: Place['category'];
  latitude: number;
  longitude: number;
  is_indoor: boolean;
};

type NewStopForm = {
  placeName: string;
  latitude: string;
  longitude: string;
  isIndoor: boolean;
  title: string;
  startTime: string;
  endTime: string;
  description: string;
  travelMinutes: string;
};

type FocusMode = 'all' | 'risky' | 'indoor';
type TripMood = 'lãng mạn' | 'phiêu lưu' | 'chill';

const DALAT_CHECKLIST = [
  { id: 'cl-1', label: 'Cà phê sáng trong sương mù' },
  { id: 'cl-2', label: 'Săn mây bình minh Cầu Đất' },
  { id: 'cl-3', label: 'Ăn bánh tráng nướng chợ đêm' },
  { id: 'cl-4', label: 'Ngắm hoa dã quỳ / hoa Đà Lạt' },
  { id: 'cl-5', label: 'Thưởng thức cơm gà Đà Lạt' },
  { id: 'cl-6', label: 'Chụp ảnh Nhà thờ Con Gà' },
  { id: 'cl-7', label: 'Đạp xe quanh hồ Xuân Hương' },
  { id: 'cl-8', label: 'Mua mứt / trà atiso làm quà' },
] as const;

const MOOD_CONFIG: Record<TripMood, { emoji: string; desc: string; categories: Place['category'][] }> = {
  'lãng mạn': { emoji: '🌸', desc: 'Cafe, góc nhỏ, hoa và sương chiều', categories: ['cafe', 'sightseeing'] },
  'phiêu lưu': { emoji: '⛰️', desc: 'Đồi núi, track, bình minh săn mây', categories: ['sightseeing'] },
  'chill': { emoji: '☕', desc: 'Đọc sách, cà phê, không có kế hoạch', categories: ['cafe', 'food'] },
};

const toHourKey = (timeValue: string | null) => {
  if (!timeValue) return null;
  return timeValue.slice(0, 2);
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
  const [focusMode, setFocusMode] = useState<FocusMode>('all');
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [travelMinutesByItemId, setTravelMinutesByItemId] = useState<Record<string, number>>({});
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<Poi | null>(null);
  const [spinDisplayName, setSpinDisplayName] = useState('');
  const [selectedMood, setSelectedMood] = useState<TripMood | null>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [newStop, setNewStop] = useState<NewStopForm>({
    placeName: '',
    latitude: '',
    longitude: '',
    isIndoor: false,
    title: '',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    travelMinutes: '20',
  });

  useEffect(() => {
    params.then((value) => {
      setTripId(value.tripId);
    });
  }, [params]);

  const loadTripData = useCallback(async () => {
    if (!tripId) return;

    setLoading(true);
    const tripData = getTripById(tripId);

    const placesById = new Map<string, Place>(tripData.places.map((place) => [place.id, place]));
    const mappedItems: ItineraryRow[] = tripData.itinerary.map((item: ItineraryItem) => {
      const place = placesById.get(item.place_id);
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        start_time: item.start_time,
        end_time: item.end_time,
        place_id: item.place_id,
        place: place
          ? {
              id: place.id,
              name: place.name,
              latitude: place.latitude,
              longitude: place.longitude,
              is_indoor: place.is_indoor,
            }
          : null,
      };
    });

    setItinerary(mappedItems);
    setPois(
      tripData.places.map((place) => ({
        id: place.id,
        name: place.name,
        category: place.category,
        latitude: place.latitude,
        longitude: place.longitude,
        is_indoor: place.is_indoor,
      })),
    );

    setTravelMinutesByItemId(
      mappedItems.reduce<Record<string, number>>((accumulator, item, index) => {
        accumulator[item.id] = index === 0 ? 0 : 20;
        return accumulator;
      }, {}),
    );
    setSelectedPoiId(mappedItems[0]?.place?.id ?? null);
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

  const weatherInsight = useMemo(() => {
    const hourlyValues = Object.values(hourlyRain);
    const avgRain = hourlyValues.length > 0
      ? Math.round(hourlyValues.reduce((sum, value) => sum + value, 0) / hourlyValues.length)
      : 0;

    const riskyCount = itinerary.filter((item) => {
      const isIndoor = item.place?.is_indoor ?? false;
      const hourKey = toHourKey(item.start_time);
      const rainAtHour = hourKey ? (hourlyRain[hourKey] ?? 0) : 0;
      return !isIndoor && rainAtHour > 70;
    }).length;

    const indoorCount = itinerary.filter((item) => item.place?.is_indoor).length;
    const indoorRatio = itinerary.length > 0 ? Math.round((indoorCount / itinerary.length) * 100) : 0;
    const comfortScore = Math.max(5, Math.min(98, Math.round((100 - avgRain) * 0.7 + indoorRatio * 0.3)));

    return {
      avgRain,
      riskyCount,
      indoorRatio,
      comfortScore,
    };
  }, [hourlyRain, itinerary]);

  const filteredItinerary = useMemo(() => {
    if (focusMode === 'all') return itinerary;

    if (focusMode === 'indoor') {
      return itinerary.filter((item) => item.place?.is_indoor);
    }

    return itinerary.filter((item) => {
      if (item.place?.is_indoor) return false;
      const hourKey = toHourKey(item.start_time);
      const rainAtHour = hourKey ? (hourlyRain[hourKey] ?? 0) : 0;
      return rainAtHour > 70;
    });
  }, [focusMode, hourlyRain, itinerary]);

  const aiRecommendations = useMemo(() => {
    const itineraryById = new Map(itinerary.map((item) => [item.id, item]));

    return swapSuggestions.slice(0, 3).map((suggestion) => {
      const relatedItem = itineraryById.get(suggestion.itineraryItemId);

      return {
        ...suggestion,
        time: relatedItem?.start_time ?? '--:--',
        activity: relatedItem?.title ?? 'Hoạt động ngoài trời',
      };
    });
  }, [itinerary, swapSuggestions]);

  const firstIndoorSuggestion = useMemo(() => {
    return swapSuggestions[0] ?? null;
  }, [swapSuggestions]);

  const handleSuggestIndoorCafe = useCallback(() => {
    const element = document.getElementById('weather-hub');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleScrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleFocusPlaceOnMap = useCallback((placeId: string) => {
    setSelectedPoiId(placeId);

    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 1280) return;

    window.setTimeout(() => {
      const mapCard = document.getElementById('map-preview-card');
      mapCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
  }, []);

  const handleConfirmSwap = useCallback(() => {
    if (!firstIndoorSuggestion) return;

    startSwapTransition(async () => {
      const toPlace = pois.find((place) => place.id === firstIndoorSuggestion.toPlaceId);
      const fromPlace = pois.find((place) => place.id === firstIndoorSuggestion.fromPlaceId);

      if (!toPlace || !fromPlace) {
        toast.error('Không tìm thấy dữ liệu địa điểm để hoán đổi.');
        return;
      }

      const note = `Đã tự động đổi từ điểm ${fromPlace.name} sang điểm ${toPlace.name} do dự báo mưa (${firstIndoorSuggestion.rainProbability}%)`;

      setItinerary((previous) =>
        previous.map((item) => {
          if (item.id !== firstIndoorSuggestion.itineraryItemId) return item;
          return {
            ...item,
            place_id: toPlace.id,
            place: toPlace,
            description: item.description ? `${item.description}\n${note}` : note,
          };
        }),
      );

      setSwapMessage(note);
      toast.success('Đã đổi lịch để né mưa thành công! 🌧️✅');
    });
  }, [firstIndoorSuggestion, pois]);

  const handleApplyAllSmartRecommendations = useCallback(() => {
    if (swapSuggestions.length === 0) {
      toast.info('Hiện chưa có đề xuất nào cần áp dụng.');
      return;
    }

    startSwapTransition(async () => {
      const suggestionByItineraryId = new Map(swapSuggestions.map((item) => [item.itineraryItemId, item]));

      let appliedCount = 0;

      setItinerary((previous) =>
        previous.map((item) => {
          const suggestion = suggestionByItineraryId.get(item.id);
          if (!suggestion) return item;

          const toPlace = pois.find((place) => place.id === suggestion.toPlaceId);
          const fromPlace = pois.find((place) => place.id === suggestion.fromPlaceId);
          if (!toPlace || !fromPlace) return item;

          appliedCount += 1;
          const note = `AI đề xuất đổi ${fromPlace.name} → ${toPlace.name} do mưa ${suggestion.rainProbability}%`;

          return {
            ...item,
            place_id: toPlace.id,
            place: toPlace,
            description: item.description ? `${item.description}\n${note}` : note,
          };
        }),
      );

      setSwapMessage(`AI đã áp dụng ${appliedCount} đề xuất né mưa cho timeline.`);
      toast.success(`Đã áp dụng ${appliedCount} đề xuất thời tiết.`);
    });
  }, [pois, swapSuggestions]);

  const handleSpin = useCallback(() => {
    if (isSpinning || pois.length === 0) return;
    setIsSpinning(true);
    setSpinResult(null);
    const preferredPois = isRaining ? pois.filter((p) => p.is_indoor) : pois.filter((p) => !p.is_indoor);
    const pool = preferredPois.length > 0 ? preferredPois : pois;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    let count = 0;
    spinIntervalRef.current = setInterval(() => {
      const random = pois[Math.floor(Math.random() * pois.length)];
      setSpinDisplayName(random.name);
      count += 1;
      if (count > 18) {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
        setSpinDisplayName(chosen.name);
        setSpinResult(chosen);
        setIsSpinning(false);
      }
    }, 80);
  }, [isSpinning, isRaining, pois]);

  const handleToggleChecklist = useCallback((id: string) => {
    setCheckedItems((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSetTravelMinutes = useCallback((itemId: string, minutesValue: string) => {
    const minutes = Number(minutesValue);
    if (Number.isNaN(minutes)) return;

    setTravelMinutesByItemId((previous) => ({
      ...previous,
      [itemId]: Math.max(0, minutes),
    }));
  }, []);

  const handleAddCustomStop = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!newStop.placeName.trim() || !newStop.title.trim() || !newStop.startTime || !newStop.endTime) {
        toast.error('Vui lòng nhập đủ tên địa điểm, hoạt động và khung giờ.');
        return;
      }

      const latitude = Number(newStop.latitude);
      const longitude = Number(newStop.longitude);
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        toast.error('Vui lòng nhập tọa độ hợp lệ (latitude/longitude).');
        return;
      }

      const placeId = `custom-place-${Date.now()}`;
      const itineraryId = `custom-itinerary-${Date.now()}`;
      const nextPlace: Poi = {
        id: placeId,
        name: newStop.placeName.trim(),
        category: 'other',
        latitude,
        longitude,
        is_indoor: newStop.isIndoor,
      };

      const nextItem: ItineraryRow = {
        id: itineraryId,
        title: newStop.title.trim(),
        description: newStop.description.trim() || 'Điểm đến tự thiết lập.',
        start_time: newStop.startTime,
        end_time: newStop.endTime,
        place_id: placeId,
        place: nextPlace,
      };

      setPois((previous) => [...previous, nextPlace]);
      setItinerary((previous) =>
        [...previous, nextItem].sort((itemA, itemB) => (itemA.start_time ?? '').localeCompare(itemB.start_time ?? '')),
      );
      setTravelMinutesByItemId((previous) => ({
        ...previous,
        [itineraryId]: Math.max(0, Number(newStop.travelMinutes) || 0),
      }));
      handleFocusPlaceOnMap(placeId);

      setNewStop({
        placeName: '',
        latitude: '',
        longitude: '',
        isIndoor: false,
        title: '',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        travelMinutes: '20',
      });
      setIsAddStopOpen(false);

      toast.success('Đã thêm điểm đến mới và đồng bộ map.');
    },
    [handleFocusPlaceOnMap, newStop],
  );

  const selectedPoi = useMemo(() => {
    if (!selectedPoiId) return null;
    return pois.find((place) => place.id === selectedPoiId) ?? null;
  }, [pois, selectedPoiId]);

  const packingItems = useMemo(() => {
    const avgRain = weatherInsight.avgRain;
    return [
      { id: 'pk-1', label: 'Áo khoác nhẹ / gió', show: true },
      { id: 'pk-2', label: 'Giày đế bằng, dễ đi bộ', show: true },
      { id: 'pk-3', label: 'Ô / áo mưa', show: avgRain >= 40 },
      { id: 'pk-4', label: 'Kem chống nắng', show: avgRain < 50 },
      { id: 'pk-5', label: 'Khăn quàng cổ / mũ len', show: true },
      { id: 'pk-6', label: 'Pin dự phòng + cáp sạc', show: true },
      { id: 'pk-7', label: 'Khẩu trang lọc phấn hoa', show: avgRain < 60 },
      { id: 'pk-8', label: 'Bình giữ nhiệt cho cà phê', show: true },
    ].filter((item) => item.show);
  }, [weatherInsight.avgRain]);

  const moodFilteredPois = useMemo(() => {
    if (!selectedMood) return [];
    const cats = MOOD_CONFIG[selectedMood].categories as string[];
    return pois.filter((p) => cats.includes(p.category));
  }, [selectedMood, pois]);

  return (
    <main className="relative min-h-screen space-y-6 overflow-hidden bg-[#FDFCFB] p-4 sm:space-y-8 sm:p-6 md:space-y-10 md:p-10">
      <div className="pointer-events-none absolute -left-20 top-4 h-48 w-48 animate-mist rounded-full bg-rose/20 blur-3xl sm:top-10 sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute right-0 top-16 h-52 w-52 animate-mist rounded-full bg-pine/15 blur-3xl [animation-delay:1s] sm:top-28 sm:h-80 sm:w-80" />

      <header className="relative space-y-3 transition-all duration-700">
        <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/25 bg-white/55 px-4 py-1.5 text-xs text-pine backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          Dalat Dream Dashboard
        </p>
        <h1 className="animate-fade-up text-3xl leading-tight text-[#4A4A4A] [animation-delay:120ms] sm:text-4xl md:text-6xl" style={{ fontFamily: 'var(--font-heading), serif' }}>
          Nhật ký chuyến đi mộng sương
        </h1>
        <p className="max-w-2xl animate-fade-up text-sm leading-6 text-[#4A4A4A]/75 [animation-delay:220ms] sm:leading-7">
          Theo dõi thời tiết, lịch trình và bản đồ trong một nhịp giao diện nhẹ như sương mai Đà Lạt.
        </p>
        {tripId && (
          <div className="animate-fade-up [animation-delay:260ms]">
            <Link
              href={`/trips/${tripId}/food-menu`}
              className="inline-flex rounded-full border border-pine/30 bg-white/70 px-4 py-2 text-xs text-pine transition hover:bg-white"
            >
              Mở layout menu đồ ăn
            </Link>
          </div>
        )}
      </header>

      <section className="relative grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        <div className="animate-fade-up rounded-dalat border border-white/30 bg-white/55 p-5 shadow-[0_12px_30px_rgba(74,74,74,0.08)] backdrop-blur-xl [animation-delay:140ms]">
          <p className="text-xs uppercase tracking-wide text-pine">Comfort Score</p>
          <p className="mt-2 text-3xl text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>{weatherInsight.comfortScore}/100</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist/80">
            <div className="h-full rounded-full bg-pine transition-all duration-700" style={{ width: `${weatherInsight.comfortScore}%` }} />
          </div>
        </div>

        <div className="animate-fade-up rounded-dalat border border-white/30 bg-white/55 p-5 shadow-[0_12px_30px_rgba(74,74,74,0.08)] backdrop-blur-xl [animation-delay:220ms]">
          <p className="text-xs uppercase tracking-wide text-pine">Rủi ro mưa trung bình</p>
          <p className="mt-2 inline-flex items-center gap-2 text-3xl text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
            <Umbrella className="h-5 w-5 text-rose" />
            {weatherInsight.avgRain}%
          </p>
          <p className="mt-2 text-xs text-[#4A4A4A]/70">{weatherInsight.riskyCount} hoạt động có nguy cơ mưa cao.</p>
        </div>

        <div className="animate-fade-up rounded-dalat border border-white/30 bg-white/55 p-5 shadow-[0_12px_30px_rgba(74,74,74,0.08)] backdrop-blur-xl [animation-delay:300ms]">
          <p className="text-xs uppercase tracking-wide text-pine">Độ sẵn sàng indoor</p>
          <p className="mt-2 text-3xl text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>{weatherInsight.indoorRatio}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist/80">
            <div className="h-full rounded-full bg-rose transition-all duration-700" style={{ width: `${weatherInsight.indoorRatio}%` }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Spin Wheel */}
        <Card className="rounded-dalat border border-white/25 bg-white/50 backdrop-blur-xl shadow-[0_14px_36px_rgba(74,74,74,0.08)]">
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2 text-sm text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <Dice6 className="h-4 w-4 text-pine" />
              Random điểm đến
            </CardTitle>
            <CardDescription className="text-xs">Quay ngẫu nhiên theo thời tiết hôm nay.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            <div className="flex h-12 items-center justify-center rounded-2xl border border-white/35 bg-white/55 px-3 font-medium text-[#4A4A4A]">
              {isSpinning ? (
                <span className="animate-pulse text-xs text-pine">{spinDisplayName || '...'}</span>
              ) : spinResult ? (
                <span className="text-sm">{spinResult.name}</span>
              ) : (
                <span className="text-[11px] text-[#4A4A4A]/50">Nhấn quay để chọn ngẫu nhiên</span>
              )}
            </div>
            {spinResult && !isSpinning && (
              <button
                type="button"
                onClick={() => handleFocusPlaceOnMap(spinResult.id)}
                className="w-full rounded-full border border-pine/30 bg-white/70 py-2 text-xs text-pine transition hover:bg-white"
              >
                Trỏ trên bản đồ
              </button>
            )}
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning || pois.length === 0}
              className="w-full rounded-full bg-pine py-3 text-xs font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isSpinning ? 'Đang quay...' : '🎲 Quay ngay'}
            </button>
            {isRaining && (
              <p className="text-center text-[10px] text-[#4A4A4A]/55">Ưu tiên indoor vì trời đang mưa.</p>
            )}
          </CardContent>
        </Card>

        {/* Checklist must-do */}
        <Card className="rounded-dalat border border-white/25 bg-white/50 backdrop-blur-xl shadow-[0_14px_36px_rgba(74,74,74,0.08)]">
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2 text-sm text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <CheckCircle2 className="h-4 w-4 text-pine" />
              Must-do Đà Lạt
            </CardTitle>
            <CardDescription className="text-xs">{checkedItems.size}/{DALAT_CHECKLIST.length} trải nghiệm đã đánh dấu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-5 pt-0">
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-mist/80">
              <div
                className="h-full rounded-full bg-pine transition-all duration-500"
                style={{ width: `${(checkedItems.size / DALAT_CHECKLIST.length) * 100}%` }}
              />
            </div>
            {DALAT_CHECKLIST.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleChecklist(item.id)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-xs text-[#4A4A4A]/85 transition hover:bg-white/60"
              >
                {checkedItems.has(item.id) ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-pine" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-[#4A4A4A]/30" />
                )}
                <span className={checkedItems.has(item.id) ? 'line-through opacity-50' : ''}>{item.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Packing gợi ý */}
        <Card className="rounded-dalat border border-white/25 bg-white/50 backdrop-blur-xl shadow-[0_14px_36px_rgba(74,74,74,0.08)]">
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2 text-sm text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <Backpack className="h-4 w-4 text-pine" />
              Gợi ý đồ mang
            </CardTitle>
            <CardDescription className="text-xs">Dựa trên dự báo thời tiết chuyến đi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-5 pt-0">
            {weatherInsight.avgRain >= 40 && (
              <div className="mb-2 rounded-xl bg-rose/20 px-3 py-2 text-[11px] text-[#4A4A4A]/80">
                ☔ Khả năng mưa {weatherInsight.avgRain}% — chuẩn bị đồ chống nước.
              </div>
            )}
            {packingItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5 rounded-xl border border-white/35 bg-white/55 px-3 py-2 text-xs text-[#4A4A4A]/85">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pine" />
                {item.label}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mood board */}
        <Card className="rounded-dalat border border-white/25 bg-white/50 backdrop-blur-xl shadow-[0_14px_36px_rgba(74,74,74,0.08)]">
          <CardHeader className="p-5">
            <CardTitle className="flex items-center gap-2 text-sm text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <Coffee className="h-4 w-4 text-pine" />
              Mood chuyến đi
            </CardTitle>
            <CardDescription className="text-xs">Chọn mood để lọc địa điểm phù hợp.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-5 pt-0">
            {(Object.entries(MOOD_CONFIG) as [TripMood, (typeof MOOD_CONFIG)[TripMood]][]).map(([mood, config]) => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMood((previous) => (previous === mood ? null : mood))}
                className={`w-full rounded-2xl border px-3 py-3 text-left text-xs transition ${
                  selectedMood === mood
                    ? 'border-pine/50 bg-pine/10 text-pine ring-1 ring-pine/30'
                    : 'border-white/35 bg-white/55 text-[#4A4A4A]/85 hover:bg-white/75'
                }`}
              >
                <span className="font-medium">{config.emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                <p className="mt-0.5 opacity-70">{config.desc}</p>
              </button>
            ))}
            {selectedMood && moodFilteredPois.length > 0 && (
              <p className="text-center text-[10px] text-pine">
                {moodFilteredPois.length} điểm phù hợp mood <strong>{selectedMood}</strong>.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <div className="relative grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-3 xl:gap-10">
        <Card id="weather-hub" className="weather-hub animate-fade-up bg-white/40 backdrop-blur-xl border border-white/20 rounded-dalat shadow-[0_16px_48px_rgba(74,74,74,0.08)] transition-all duration-700 [animation-delay:120ms] xl:col-span-1">
          <CardHeader className="p-5 sm:p-8">
            <CardTitle className="inline-flex items-center gap-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <CloudDrizzle className="h-5 w-5 text-pine" strokeWidth={1.5} />
              Weather Hub
            </CardTitle>
            <CardDescription>Dự báo mưa theo tọa độ POI, tối ưu lịch trình bằng nhịp thời tiết mềm mại.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-8 sm:pt-0">
            {tripId ? (
              <RainForecastWidget
                places={pois}
                hourlyWeather={getTripById(tripId).weather}
                onRainStatusChange={setIsRaining}
                onHourlyRainChange={setHourlyRain}
              />
            ) : (
              <p className="text-sm text-[#4A4A4A]/70">Đang tải thông tin chuyến đi...</p>
            )}
          </CardContent>
        </Card>

        <Card id="timeline-card" className="animate-fade-up bg-white/40 backdrop-blur-xl border border-white/20 rounded-dalat shadow-[0_16px_48px_rgba(74,74,74,0.08)] transition-all duration-700 [animation-delay:220ms] xl:col-span-1">
          <CardHeader className="p-5 sm:p-8">
            <CardTitle className="inline-flex items-center gap-2 text-pine" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <Compass className="h-5 w-5" strokeWidth={1.5} />
              Timeline
            </CardTitle>
            <CardDescription>Lộ trình theo giờ với nhịp chấm mờ và nét đứt nhẹ nhàng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-5 pt-0 sm:space-y-6 sm:p-8 sm:pt-0">
            <section id="add-stop-panel" className="animate-fade-up rounded-dalat border border-white/25 bg-white/55 p-4 sm:p-5 [animation-delay:140ms]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
                    Tự thêm địa điểm mới
                  </p>
                  <p className="mt-1 text-xs text-[#4A4A4A]/65">
                    Nhập địa điểm, giờ đi và thời gian di chuyển để đồng bộ ngay với timeline và bản đồ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddStopOpen((previous) => !previous)}
                  className="shrink-0 rounded-full border border-pine/25 bg-white/70 px-3 py-2 text-xs text-pine transition hover:bg-white"
                >
                  {isAddStopOpen ? 'Thu gọn' : 'Mở form'}
                </button>
              </div>

              {isAddStopOpen && (
                <form onSubmit={handleAddCustomStop} className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="md:col-span-2 space-y-1.5 text-xs text-[#4A4A4A]/75">
                      <span>Tên địa điểm</span>
                      <input
                        value={newStop.placeName}
                        onChange={(event) => setNewStop((previous) => ({ ...previous, placeName: event.target.value }))}
                        placeholder="Ví dụ: Đồi chè Cầu Đất"
                        className="w-full rounded-2xl border border-white/40 bg-white/75 px-3 py-3 text-sm outline-none"
                      />
                    </label>

                    <label className="space-y-1.5 text-xs text-[#4A4A4A]/75">
                      <span>Latitude</span>
                      <input
                        value={newStop.latitude}
                        onChange={(event) => setNewStop((previous) => ({ ...previous, latitude: event.target.value }))}
                        placeholder="11.9404"
                        className="w-full rounded-2xl border border-white/40 bg-white/75 px-3 py-3 text-sm outline-none"
                      />
                    </label>

                    <label className="space-y-1.5 text-xs text-[#4A4A4A]/75">
                      <span>Longitude</span>
                      <input
                        value={newStop.longitude}
                        onChange={(event) => setNewStop((previous) => ({ ...previous, longitude: event.target.value }))}
                        placeholder="108.4583"
                        className="w-full rounded-2xl border border-white/40 bg-white/75 px-3 py-3 text-sm outline-none"
                      />
                    </label>

                    <label className="md:col-span-2 space-y-1.5 text-xs text-[#4A4A4A]/75">
                      <span>Tên hoạt động</span>
                      <input
                        value={newStop.title}
                        onChange={(event) => setNewStop((previous) => ({ ...previous, title: event.target.value }))}
                        placeholder="Ví dụ: Ngắm bình minh, uống cà phê..."
                        className="w-full rounded-2xl border border-white/40 bg-white/75 px-3 py-3 text-sm outline-none"
                      />
                    </label>

                    <label className="space-y-1.5 text-xs text-[#4A4A4A]/75">
                      <span>Giờ bắt đầu</span>
                      <input
                        type="time"
                        value={newStop.startTime}
                        onChange={(event) => setNewStop((previous) => ({ ...previous, startTime: event.target.value }))}
                        className="w-full rounded-2xl border border-white/40 bg-white/75 px-3 py-3 text-sm outline-none"
                      />
                    </label>

                    <label className="space-y-1.5 text-xs text-[#4A4A4A]/75">
                      <span>Giờ kết thúc</span>
                      <input
                        type="time"
                        value={newStop.endTime}
                        onChange={(event) => setNewStop((previous) => ({ ...previous, endTime: event.target.value }))}
                        className="w-full rounded-2xl border border-white/40 bg-white/75 px-3 py-3 text-sm outline-none"
                      />
                    </label>

                    <label className="space-y-1.5 text-xs text-[#4A4A4A]/75">
                      <span>Thời gian di chuyển</span>
                      <input
                        value={newStop.travelMinutes}
                        onChange={(event) => setNewStop((previous) => ({ ...previous, travelMinutes: event.target.value }))}
                        placeholder="20 phút"
                        className="w-full rounded-2xl border border-white/40 bg-white/75 px-3 py-3 text-sm outline-none"
                      />
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/75 px-3 py-3 text-sm text-[#4A4A4A]/80">
                      <input
                        type="checkbox"
                        checked={newStop.isIndoor}
                        onChange={(event) => setNewStop((previous) => ({ ...previous, isIndoor: event.target.checked }))}
                        className="h-4 w-4"
                      />
                      <span>Địa điểm indoor</span>
                    </label>

                    <label className="md:col-span-2 space-y-1.5 text-xs text-[#4A4A4A]/75">
                      <span>Ghi chú mô tả</span>
                      <textarea
                        value={newStop.description}
                        onChange={(event) => setNewStop((previous) => ({ ...previous, description: event.target.value }))}
                        placeholder="Mô tả ngắn cho điểm đến hoặc lưu ý di chuyển"
                        className="h-24 w-full rounded-2xl border border-white/40 bg-white/75 px-3 py-3 text-sm outline-none"
                      />
                    </label>
                  </div>

                  <button type="submit" className="w-full rounded-2xl bg-pine px-4 py-3.5 text-sm font-medium text-white transition hover:opacity-90">
                    Thêm điểm đến + thời gian di chuyển
                  </button>
                </form>
              )}
            </section>

            <div className="animate-fade-up flex flex-wrap gap-2 [animation-delay:160ms]">
              <button
                type="button"
                onClick={() => setFocusMode('all')}
                className={`rounded-full px-3 py-2 text-xs transition ${focusMode === 'all' ? 'bg-pine text-white' : 'border border-white/30 bg-white/55 text-[#4A4A4A]/80'}`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFocusMode('risky')}
                className={`rounded-full px-3 py-2 text-xs transition ${focusMode === 'risky' ? 'bg-rose text-white' : 'border border-white/30 bg-white/55 text-[#4A4A4A]/80'}`}
              >
                Rủi ro mưa cao
              </button>
              <button
                type="button"
                onClick={() => setFocusMode('indoor')}
                className={`rounded-full px-3 py-2 text-xs transition ${focusMode === 'indoor' ? 'bg-pine text-white' : 'border border-white/30 bg-white/55 text-[#4A4A4A]/80'}`}
              >
                Chỉ indoor
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-[#4A4A4A]/70">Đang tải timeline...</p>
            ) : filteredItinerary.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-dalat border border-dashed border-pine/30 bg-white/35 p-8 text-center backdrop-blur-md transition-all duration-700">
                <div className="text-5xl">🐻💤</div>
                <p className="mt-3 text-sm font-medium text-[#4A4A4A]">Không có hoạt động phù hợp với bộ lọc hiện tại.</p>
                <p className="mt-1 text-xs text-[#4A4A4A]/70">Thử đổi sang “Tất cả” để xem toàn bộ timeline.</p>
              </div>
            ) : (
              <div className="space-y-5 sm:space-y-8">
                {filteredItinerary.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative pl-10 transition-all duration-700 hover:-translate-y-0.5"
                    onClick={() => {
                      if (item.place?.id) handleFocusPlaceOnMap(item.place.id);
                    }}
                  >
                    {index < filteredItinerary.length - 1 && (
                      <span className="absolute left-3 top-7 h-[calc(100%+1.5rem)] w-px border-l border-dashed border-[#869484]/35" />
                    )}
                    <span className="absolute left-0 top-1.5 h-6 w-6 rounded-full border border-[#869484]/30 bg-[#869484]/15 backdrop-blur-sm" />

                    <div className={`rounded-dalat border bg-white/55 p-4 sm:p-6 shadow-[0_10px_26px_rgba(74,74,74,0.09)] backdrop-blur-md ${selectedPoiId === item.place?.id ? 'border-pine/50 ring-1 ring-pine/40' : 'border-white/25'}`}>
                      <p className="text-xs tracking-wide text-[#869484]">
                        {item.start_time ?? '--:--'} {item.end_time ? `→ ${item.end_time}` : ''}
                      </p>
                      <h3 className="mt-2 text-xl text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
                        {item.place?.name ?? item.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#4A4A4A]/75">{item.title}</p>
                      {item.description && <p className="mt-2 text-sm leading-7 text-[#4A4A4A]/70">{item.description}</p>}

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#4A4A4A]/75">
                        <span>Di chuyển:</span>
                        <input
                          type="number"
                          min={0}
                          value={travelMinutesByItemId[item.id] ?? 0}
                          onChange={(event) => handleSetTravelMinutes(item.id, event.target.value)}
                          className="w-20 rounded-lg border border-white/40 bg-white/70 px-2 py-1.5 outline-none"
                        />
                        <span>phút</span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (item.place?.id) handleFocusPlaceOnMap(item.place.id);
                          }}
                          className="w-full sm:ml-auto sm:w-auto rounded-full border border-pine/30 bg-white/70 px-3 py-2 text-[11px] text-pine transition hover:bg-white"
                        >
                          Trỏ trên map
                        </button>
                      </div>

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

              <div className="animate-fade-up rounded-dalat border border-pine/25 bg-white/60 p-4 sm:p-5 text-sm text-[#4A4A4A] shadow-[0_10px_26px_rgba(74,74,74,0.07)] [animation-delay:280ms]">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-pine">
                    <BrainCircuit className="h-4 w-4" />
                    AI Gợi ý theo thời tiết
                  </p>
                  <p className="mt-2 text-xs text-[#4A4A4A]/70">Đề xuất tự động ưu tiên indoor khi xác suất mưa cao.</p>
                </div>
                <button
                  type="button"
                  onClick={handleApplyAllSmartRecommendations}
                  disabled={isPendingSwap || aiRecommendations.length === 0}
                  className="w-full sm:w-auto rounded-full bg-pine px-4 py-3 sm:py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPendingSwap ? 'Đang áp dụng...' : 'Áp dụng nhanh'}
                </button>
              </div>

              {aiRecommendations.length === 0 ? (
                <p className="mt-3 text-xs text-[#4A4A4A]/70">Thời tiết hiện ổn định, chưa cần đổi lịch trình.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {aiRecommendations.map((recommendation) => (
                    <li key={recommendation.itineraryItemId} className="rounded-2xl border border-white/35 bg-white/55 px-3 py-2">
                      <p className="text-xs text-[#4A4A4A]/80">
                        <strong>{recommendation.time}</strong> · {recommendation.activity}
                      </p>
                      <p className="mt-1 text-xs text-[#4A4A4A]/70">
                        Gợi ý: <strong>{recommendation.fromPlaceName}</strong> → <strong>{recommendation.toPlaceName}</strong> ({recommendation.rainProbability}% mưa)
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {hasSwapSuggestion && firstIndoorSuggestion && (
              <div className="rounded-dalat border border-rose/40 bg-rose/15 p-4 sm:p-6 text-sm text-[#4A4A4A] transition-all duration-700">
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
                    className="w-full sm:w-auto rounded-full bg-rose px-5 py-3 sm:py-2.5 text-xs font-medium text-white transition-all duration-700 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPendingSwap ? 'Đang cập nhật...' : 'Xác nhận đổi điểm vì trời mưa'}
                  </button>
                </div>
              </div>
            )}

            {swapMessage && (
              <div className="rounded-dalat border border-rose/35 bg-white/45 p-5 text-sm text-[#4A4A4A]/85 transition-all duration-700">
                {swapMessage}
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="map-preview-card" className="animate-fade-up bg-white/40 backdrop-blur-xl border border-white/20 rounded-dalat shadow-[0_16px_48px_rgba(74,74,74,0.08)] transition-all duration-700 [animation-delay:320ms] xl:col-span-1">
          <CardHeader className="p-5 sm:p-8">
            <CardTitle className="inline-flex items-center gap-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <MapPin className="h-5 w-5 text-[#869484]" strokeWidth={1.5} />
              Map Preview
            </CardTitle>
            <CardDescription>Bản đồ thu nhỏ hiển thị POI indoor (xanh) và outdoor (cam).</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-8 sm:pt-0">
            {selectedPoi && (
              <div className="mb-3 rounded-2xl border border-white/35 bg-white/60 p-3 text-xs text-[#4A4A4A]/80">
                <p>
                  Đang chọn: <strong>{selectedPoi.name}</strong>
                </p>
                <a
                  href={`https://www.google.com/maps?q=${selectedPoi.latitude},${selectedPoi.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-pine underline"
                >
                  Mở trên Google Maps
                </a>
              </div>
            )}
            {pois.length === 0 ? (
              <div className="flex h-[340px] items-center justify-center rounded-dalat border border-dashed border-[#869484]/30 text-sm text-[#4A4A4A]/70">
                Chưa có POI để hiển thị trên bản đồ.
              </div>
            ) : (
              <DalatMap points={pois} selectedPointId={selectedPoiId} onSelectPoint={setSelectedPoiId} />
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

      <div className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-2 rounded-full border border-white/25 bg-white/75 p-2 shadow-[0_14px_30px_rgba(74,74,74,0.14)] backdrop-blur-xl xl:hidden">
        <button
          type="button"
          onClick={() => handleScrollToSection('weather-hub')}
          className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] text-[#4A4A4A]/75"
        >
          <CloudDrizzle className="h-4 w-4 text-pine" />
          Thời tiết
        </button>
        <button
          type="button"
          onClick={() => handleScrollToSection('timeline-card')}
          className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] text-[#4A4A4A]/75"
        >
          <Compass className="h-4 w-4 text-pine" />
          Timeline
        </button>
        <button
          type="button"
          onClick={() => {
            setIsAddStopOpen(true);
            handleScrollToSection('add-stop-panel');
          }}
          className="flex flex-1 flex-col items-center gap-1 rounded-full bg-pine px-3 py-2 text-[11px] text-white"
        >
          <PlusCircle className="h-4 w-4" />
          Thêm điểm
        </button>
        <button
          type="button"
          onClick={() => handleScrollToSection('map-preview-card')}
          className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-[11px] text-[#4A4A4A]/75"
        >
          <MapPinned className="h-4 w-4 text-pine" />
          Bản đồ
        </button>
      </div>
      <Toaster position="top-right" richColors />
    </main>
  );
}
