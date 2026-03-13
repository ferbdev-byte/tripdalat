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
    name: 'Bún Loan',
    specialty: 'Bún nóng buổi sáng',
    address: '4/4 Hoàng Văn Thụ',
    openHours: '06:30 - 14:00',
    latitude: 11.9319,
    longitude: 108.4372,
    isIndoor: true,
  },
  {
    name: 'Bánh cuốn cô Hóa',
    specialty: 'Bánh cuốn nóng',
    address: 'KQH 180 Phan Đình Phùng',
    openHours: '06:30 - 14:00',
    latitude: 11.9528,
    longitude: 108.4462,
    isIndoor: true,
  },
  {
    id: 'bf-6',
    name: 'Nui cô Xuân',
    specialty: 'Nui nóng buổi sáng',
    address: '205 Phan Đình Phùng',
    openHours: '06:00 - 10:00',
    latitude: 11.9534,
    longitude: 108.4467,
    isIndoor: true,
  },
  {
    id: 'bf-7',
    name: 'Bún bò thố đá Song Hương',
    specialty: 'Bún bò thố đá, có hoa anh đào',
    address: 'Cầu Mạc Đĩnh Chi, Đà Lạt',
    openHours: '06:30 - 12:00',
    latitude: 11.9402,
    longitude: 108.4462,
    isIndoor: true,
  },
  {
    id: 'bf-8',
    name: 'Tiệm mì Yên',
    specialty: 'Mì nước và mì khô',
    address: '75 Nguyễn Thị Nghĩa, Đà Lạt',
    openHours: 'Sáng - tối',
    latitude: 11.9482,
    longitude: 108.4416,
    isIndoor: true,
  },
  {
    id: 'bf-9',
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
    name: 'Cafe Cái Cốc Mẻ',
    specialty: 'Cafe chill, không gian ấm',
    address: '15 Ngô Huy Diễn, Đà Lạt',
    openHours: '07:00 - 22:00',
    latitude: 11.9521,
    longitude: 108.4479,
    isIndoor: true,
  },
  {
    id: 'cf-2',
    name: 'W.A.I Coffee',
    specialty: 'Cafe hiện đại, ngồi làm việc',
    address: '70 Trần Thái Tông, Đà Lạt',
    openHours: '07:00 - 22:00',
    latitude: 11.9694,
    longitude: 108.4554,
    isIndoor: true,
  },
  {
    id: 'cf-3',
    name: 'Croisse Bakehouse',
    specialty: 'Bánh ngọt & cafe',
    address: '07 Ngô Huy Diễn, Đà Lạt',
    openHours: '07:00 - 21:00',
    latitude: 11.9524,
    longitude: 108.4482,
    isIndoor: true,
  },
];

const randomSpots: FoodSpot[] = [
  {
    id: 'rd-1',
    name: 'Mì vịt tiềm Thảo Mộc',
    specialty: 'Mì bò ngưu dương cố, mì nấm Shiitake, mì sườn Yersin, mì vịt tiềm',
    address: '26 Đào Duy Từ',
    openHours: '11:00 - 20:00',
    latitude: 11.9308,
    longitude: 108.4505,
    isIndoor: true,
  },
  {
    id: 'rd-2',
    name: 'Bánh tráng nướng 4A Hồ Xuân Hương',
    specialty: 'Bánh tráng nướng giòn thơm',
    address: '4A Hồ Xuân Hương, Đà Lạt',
    openHours: 'Chiều - tối',
    latitude: 11.9398,
    longitude: 108.4419,
    isIndoor: true,
  },
  {
    id: 'rd-3',
    name: 'Tiệm nướng Chiếc Rương',
    specialty: 'Đồ nướng buổi tối',
    address: 'Đà Lạt',
    openHours: 'Chiều - tối',
    latitude: 11.9418,
    longitude: 108.4413,
    isIndoor: true,
  },
  {
    id: 'rd-4',
    name: 'Bánh canh bà Hường',
    specialty: 'Bánh canh chiều',
    address: 'Khu chợ Đà Lạt',
    openHours: '13:30 - 18:00',
    latitude: 11.9407,
    longitude: 108.4384,
    isIndoor: true,
  },
  {
    id: 'rd-5',
    name: 'Kem bơ Phụng',
    specialty: 'Kem bơ chợ Đà Lạt',
    address: 'Chợ Đà Lạt',
    openHours: 'Buổi chiều - tối',
    latitude: 11.9408,
    longitude: 108.4381,
    isIndoor: true,
  },
  {
    id: 'rd-6',
    name: 'Kem hẻm 202 Phan Đình Phùng',
    specialty: 'Kem mát lạnh',
    address: 'Hẻm 202 Phan Đình Phùng',
    openHours: 'Buổi chiều - tối',
    latitude: 11.9531,
    longitude: 108.4468,
    isIndoor: true,
  },
  {
    id: 'rd-7',
    name: 'Bánh căn cô Chín',
    specialty: 'Bánh căn truyền thống',
    address: '2/35 Phạm Ngũ Lão',
    openHours: 'Sáng - tối',
    latitude: 11.9409,
    longitude: 108.4336,
    isIndoor: true,
  },
  {
    id: 'rd-8',
    name: 'Thảo Nguyên Quán',
    specialty: 'Món ăn địa phương',
    address: 'Ankroet, Đà Lạt',
    openHours: '10:00 - 18:00',
    latitude: 11.9988,
    longitude: 108.4177,
    isIndoor: true,
  },
  {
    id: 'rd-9',
    name: 'Chân gà nướng Nguyễn Công Trứ',
    specialty: 'Chân gà nướng',
    address: 'Nguyễn Công Trứ, Đà Lạt',
    openHours: 'Chiều - tối',
    latitude: 11.9514,
    longitude: 108.4462,
    isIndoor: false,
  },
  {
    id: 'rd-10',
    name: 'Gà nướng cơm lam',
    specialty: 'Gà nướng + cơm lam',
    address: '2 Trần Hưng Đạo, Phường 3, Đà Lạt',
    openHours: 'Trưa - tối',
    latitude: 11.9362,
    longitude: 108.4437,
    isIndoor: true,
  },
  {
    id: 'rd-11',
    name: 'Into The Wild (Pizza)',
    specialty: 'Pizza',
    address: '18 Yết Kiêu, Đà Lạt',
    openHours: '10:00 - 22:00',
    latitude: 11.9315,
    longitude: 108.4459,
    isIndoor: true,
  },
  {
    id: 'rd-12',
    name: 'Bánh tráng nướng dì Đinh',
    specialty: 'Bánh tráng nướng',
    address: '26 Hoàng Diệu, Đà Lạt',
    openHours: 'Chiều - tối',
    latitude: 11.9324,
    longitude: 108.4368,
    isIndoor: false,
  },
  {
    id: 'rd-13',
    name: 'Khoai lang nướng',
    specialty: 'Khoai lang nướng nóng',
    address: '70 Pasteur, Đà Lạt',
    openHours: 'Chiều - tối',
    latitude: 11.9396,
    longitude: 108.4343,
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
