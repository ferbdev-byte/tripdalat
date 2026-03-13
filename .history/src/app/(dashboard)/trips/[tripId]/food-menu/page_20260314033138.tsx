'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Coffee, Dices, MapPin, MapPinned, Sunrise } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { getTripById } from '../../../../../data/mockData';

const DalatMap = dynamic(
  () => import('../../../../../components/map/DalatMap').then((module) => module.DalatMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[260px] items-center justify-center rounded-dalat border border-white/20 bg-white/35 text-sm text-[#4A4A4A]/70 backdrop-blur-md transition-all duration-700 sm:h-[320px]">
        Đang tải bản đồ quán ăn...
      </div>
    ),
  },
);

type PageProps = {
  params: Promise<{ tripId: string }>;
};

type FoodSpot = {
  id: string;
  name: string;
  specialty: string;
  address: string;
  openHours: string;
  latitude: number;
  longitude: number;
  isIndoor: boolean;
};

const breakfastSpots: FoodSpot[] = [
  {
    id: 'bf-1',
    name: 'Bánh canh cá lóc cô Hạ',
    specialty: 'Bánh canh cá lóc',
    address: '17/30 Bà Triệu',
    openHours: 'Mở cả ngày',
    latitude: 11.9445,
    longitude: 108.4379,
    isIndoor: true,
  },
  {
    id: 'bf-2',
    name: 'Bánh bèo & bột lọc đối diện cô Hạ',
    specialty: 'Bánh bèo, bột lọc',
    address: 'Đối diện 17/30 Bà Triệu',
    openHours: 'Theo quán trong ngày',
    latitude: 11.9447,
    longitude: 108.4381,
    isIndoor: true,
  },
  {
    id: 'bf-3',
    name: 'Phở Cường',
    specialty: 'Phở sáng',
    address: '12 Thi Sách',
    openHours: '07:00 - 11:00',
    latitude: 11.9475,
    longitude: 108.4328,
    isIndoor: true,
  },
  {
    id: 'bf-4',
    name: 'Mì Vịt tiềm Thảo mộc',
    specialty: 'Mì bò ngưu dương cố, mì nấm Shiitake, mì sườn Yersin, mì vịt tiềm',
    address: '26 Đào Duy Từ',
    openHours: '11:00 - 20:00',
    latitude: 11.9308,
    longitude: 108.4505,
    isIndoor: true,
  },
  {
    id: 'bf-5',
    name: 'Bún Loan',
    specialty: 'Bún nóng buổi sáng',
    address: '4/4 Hoàng Văn Thụ',
    openHours: '06:30 - 14:00',
    latitude: 11.9319,
    longitude: 108.4372,
    isIndoor: true,
  },
  {
    id: 'bf-6',
    name: 'Bánh canh bà Hường',
    specialty: 'Bánh canh chiều',
    address: 'Khu chợ Đà Lạt',
    openHours: '13:30 - 18:00',
    latitude: 11.9407,
    longitude: 108.4384,
    isIndoor: true,
  },
  {
    id: 'bf-7',
    name: 'Kem bơ Phụng',
    specialty: 'Kem bơ chợ Đà Lạt',
    address: 'Chợ Đà Lạt',
    openHours: 'Buổi chiều - tối',
    latitude: 11.9408,
    longitude: 108.4381,
    isIndoor: true,
  },
  {
    id: 'bf-8',
    name: 'Kem hẻm 202 Phan Đình Phùng',
    specialty: 'Kem mát lạnh',
    address: 'Hẻm 202 Phan Đình Phùng',
    openHours: 'Buổi chiều - tối',
    latitude: 11.9531,
    longitude: 108.4468,
    isIndoor: true,
  },
  {
    id: 'bf-9',
    name: 'Bánh căn cô Chín',
    specialty: 'Bánh căn truyền thống',
    address: '2/35 Phạm Ngũ Lão',
    openHours: 'Sáng - tối',
    latitude: 11.9409,
    longitude: 108.4336,
    isIndoor: true,
  },
  {
    id: 'bf-10',
    name: 'Thảo Nguyên Quán',
    specialty: 'Món ăn địa phương',
    address: 'Ankroet, Đà Lạt',
    openHours: '10:00 - 18:00',
    latitude: 11.9988,
    longitude: 108.4177,
    isIndoor: true,
  },
  {
    id: 'bf-11',
    name: 'Bánh cuốn cô Hóa',
    specialty: 'Bánh cuốn nóng',
    address: 'KQH 180 Phan Đình Phùng',
    openHours: '06:30 - 14:00',
    latitude: 11.9528,
    longitude: 108.4462,
    isIndoor: true,
  },
  {
    id: 'bf-12',
    name: 'Bánh cam mini',
    specialty: 'Bánh cam ăn vặt',
    address: '126 Hai Bà Trưng',
    openHours: 'Trong ngày',
    latitude: 11.9498,
    longitude: 108.4443,
    isIndoor: false,
  },
];

const cafeSpots: FoodSpot[] = [
  {
    id: 'cf-1',
    name: 'Tú Mơ To',
    specialty: 'Cold brew, không gian xanh',
    address: 'Hẻm 31 Sào Nam, Phường 11',
    openHours: '07:00 - 22:00',
    latitude: 11.9666,
    longitude: 108.4552,
    isIndoor: true,
  },
  {
    id: 'cf-2',
    name: 'Lululola',
    specialty: 'Cafe view đồi + acoustic',
    address: 'Đường 3/4, Phường 3',
    openHours: '08:00 - 22:00',
    latitude: 11.9309,
    longitude: 108.4275,
    isIndoor: true,
  },
  {
    id: 'cf-3',
    name: 'Still Cafe',
    specialty: 'Trà trái cây, góc vintage',
    address: '59 Nguyễn Trãi, Phường 9',
    openHours: '07:30 - 22:00',
    latitude: 11.9432,
    longitude: 108.4501,
    isIndoor: true,
  },
];

const randomSpots: FoodSpot[] = [
  {
    id: 'rd-1',
    name: 'Lẩu gà lá é Tao Ngộ',
    specialty: 'Lẩu gà lá é đậm vị',
    address: '5 Đường 3/4, Phường 3',
    openHours: '10:00 - 22:00',
    latitude: 11.9314,
    longitude: 108.4301,
    isIndoor: true,
  },
  {
    id: 'rd-2',
    name: 'Kem bơ Thanh Thảo',
    specialty: 'Kem bơ đặc trưng Đà Lạt',
    address: '76 Nguyễn Văn Trỗi, Phường 2',
    openHours: '09:00 - 22:00',
    latitude: 11.9436,
    longitude: 108.4395,
    isIndoor: true,
  },
  {
    id: 'rd-3',
    name: 'Ốc nhồi thịt 33',
    specialty: 'Ốc bươu nhồi thịt hấp gừng',
    address: '33 Hai Bà Trưng, Phường 6',
    openHours: '16:00 - 22:00',
    latitude: 11.9491,
    longitude: 108.4445,
    isIndoor: true,
  },
];

function MenuColumn({
  title,
  description,
  icon,
  spots,
  selectedSpotId,
  onSelectSpot,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  spots: FoodSpot[];
  selectedSpotId: string | null;
  onSelectSpot: (spotId: string) => void;
}) {
  return (
    <Card className="h-full rounded-dalat border border-white/25 bg-white/50 backdrop-blur-xl shadow-[0_14px_36px_rgba(74,74,74,0.08)]">
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="inline-flex items-center gap-2 text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
        {spots.map((spot) => (
          <article
            key={spot.id}
            onClick={() => onSelectSpot(spot.id)}
            className={`cursor-pointer rounded-2xl border bg-white/65 p-4 transition ${selectedSpotId === spot.id ? 'border-pine/60 ring-1 ring-pine/40' : 'border-white/35 hover:border-pine/35'}`}
          >
            <h3 className="text-base text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              {spot.name}
            </h3>
            <p className="mt-1 text-sm text-[#4A4A4A]/80">{spot.specialty}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-pine">
              <MapPin className="h-3.5 w-3.5" />
              {spot.address}
            </p>
            <p className="mt-1 text-xs text-[#4A4A4A]/65">Giờ mở cửa: {spot.openHours}</p>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}

export default function FoodMenuPage({ params }: PageProps) {
  const [tripId, setTripId] = useState('');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(breakfastSpots[0]?.id ?? null);

  useEffect(() => {
    params.then((value) => {
      setTripId(value.tripId);
    });
  }, [params]);

  const trip = getTripById(tripId || 'dalat-2024').trip;

  const allSpots = useMemo(() => {
    return [...breakfastSpots, ...cafeSpots, ...randomSpots];
  }, []);

  const mapPoints = useMemo(() => {
    return allSpots.map((spot) => ({
      id: spot.id,
      name: spot.name,
      latitude: spot.latitude,
      longitude: spot.longitude,
      is_indoor: spot.isIndoor,
    }));
  }, [allSpots]);

  const selectedSpot = useMemo(() => {
    if (!selectedSpotId) return null;
    return allSpots.find((spot) => spot.id === selectedSpotId) ?? null;
  }, [allSpots, selectedSpotId]);

  const handleSelectSpot = (spotId: string) => {
    setSelectedSpotId(spotId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.setTimeout(() => {
        const mapSection = document.getElementById('food-map-section');
        mapSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] px-4 py-6 sm:px-6 md:px-10 md:py-10">
      <section className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-dalat border border-white/25 bg-white/50 p-5 backdrop-blur-xl sm:p-6">
          <p className="inline-flex rounded-full border border-pine/25 bg-white/70 px-3 py-1 text-xs text-pine">Dalat Dream · Food Menu</p>
          <h1 className="mt-3 text-3xl text-[#4A4A4A] sm:text-4xl" style={{ fontFamily: 'var(--font-heading), serif' }}>
            Layout menu đồ ăn cho {trip.name}
          </h1>
          <p className="mt-2 text-sm text-[#4A4A4A]/75">3 cột theo đúng style web: đồ ăn sáng, cafe và quán random để bạn chọn nhanh.</p>
          <div className="mt-4">
            <Link href={`/trips/${trip.id}`} className="inline-flex rounded-full border border-pine/30 bg-white/70 px-4 py-2 text-xs text-pine transition hover:bg-white">
              Quay lại dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <MenuColumn
            title="Đồ ăn sáng"
            description="Danh sách bạn gửi: đồ ăn sáng + quán ăn vặt theo lịch mở cửa."
            icon={<Sunrise className="h-5 w-5 text-pine" />}
            spots={breakfastSpots}
            selectedSpotId={selectedSpotId}
            onSelectSpot={handleSelectSpot}
          />
          <MenuColumn
            title="Cafe"
            description="Ưu tiên quán đẹp, chill, phù hợp check-in và ngồi lâu."
            icon={<Coffee className="h-5 w-5 text-pine" />}
            spots={cafeSpots}
            selectedSpotId={selectedSpotId}
            onSelectSpot={handleSelectSpot}
          />
          <MenuColumn
            title="Quán random"
            description="Gợi ý ngẫu hứng để đổi mood theo hành trình."
            icon={<Dices className="h-5 w-5 text-pine" />}
            spots={randomSpots}
            selectedSpotId={selectedSpotId}
            onSelectSpot={handleSelectSpot}
          />
        </div>

        <Card id="food-map-section" className="rounded-dalat border border-white/25 bg-white/50 backdrop-blur-xl shadow-[0_14px_36px_rgba(74,74,74,0.08)]">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="inline-flex items-center gap-2 text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <MapPinned className="h-5 w-5 text-pine" />
              Map quán ăn
            </CardTitle>
            <CardDescription>Bấm vào một quán ở danh sách bên trên, map sẽ tự trỏ đến vị trí quán đó.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            {selectedSpot && (
              <div className="mb-3 rounded-2xl border border-white/35 bg-white/65 p-3 text-xs text-[#4A4A4A]/80">
                <p>
                  Đang chọn: <strong>{selectedSpot.name}</strong>
                </p>
                <p className="mt-1">{selectedSpot.address}</p>
              </div>
            )}

            <DalatMap points={mapPoints} selectedPointId={selectedSpotId} onSelectPoint={setSelectedSpotId} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
