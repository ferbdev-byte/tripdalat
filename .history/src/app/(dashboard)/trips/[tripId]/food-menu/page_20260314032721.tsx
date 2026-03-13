'use client';

import Link from 'next/link';
import { Coffee, Dices, MapPin, Sunrise } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { getTripById } from '../../../../../data/mockData';

type PageProps = {
  params: Promise<{ tripId: string }>;
};

type FoodSpot = {
  name: string;
  specialty: string;
  address: string;
  priceRange: string;
};

const breakfastSpots: FoodSpot[] = [
  {
    name: 'Bánh căn Nhà Chung',
    specialty: 'Bánh căn trứng + xíu mại nóng',
    address: '13 Nhà Chung, Phường 3',
    priceRange: '35k - 65k',
  },
  {
    name: 'Bánh mì xíu mại Hoàng Diệu',
    specialty: 'Xíu mại sốt cà, bánh mì giòn',
    address: '26 Hoàng Diệu, Phường 5',
    priceRange: '20k - 40k',
  },
  {
    name: 'Phở thố Chu Gia',
    specialty: 'Phở bò thố đá nóng',
    address: '1 Nguyễn Thị Minh Khai',
    priceRange: '50k - 85k',
  },
];

const cafeSpots: FoodSpot[] = [
  {
    name: 'Tú Mơ To',
    specialty: 'Cold brew, không gian xanh',
    address: 'Hẻm 31 Sào Nam, Phường 11',
    priceRange: '45k - 80k',
  },
  {
    name: 'Lululola',
    specialty: 'Cafe view đồi + acoustic',
    address: 'Đường 3/4, Phường 3',
    priceRange: '60k - 120k',
  },
  {
    name: 'Still Cafe',
    specialty: 'Trà trái cây, góc vintage',
    address: '59 Nguyễn Trãi, Phường 9',
    priceRange: '40k - 75k',
  },
];

const randomSpots: FoodSpot[] = [
  {
    name: 'Lẩu gà lá é Tao Ngộ',
    specialty: 'Lẩu gà lá é đậm vị',
    address: '5 Đường 3/4, Phường 3',
    priceRange: '180k - 320k',
  },
  {
    name: 'Kem bơ Thanh Thảo',
    specialty: 'Kem bơ đặc trưng Đà Lạt',
    address: '76 Nguyễn Văn Trỗi, Phường 2',
    priceRange: '25k - 45k',
  },
  {
    name: 'Ốc nhồi thịt 33',
    specialty: 'Ốc bươu nhồi thịt hấp gừng',
    address: '33 Hai Bà Trưng, Phường 6',
    priceRange: '70k - 150k',
  },
];

function MenuColumn({
  title,
  description,
  icon,
  spots,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  spots: FoodSpot[];
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
          <article key={spot.name} className="rounded-2xl border border-white/35 bg-white/65 p-4">
            <h3 className="text-base text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              {spot.name}
            </h3>
            <p className="mt-1 text-sm text-[#4A4A4A]/80">{spot.specialty}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-pine">
              <MapPin className="h-3.5 w-3.5" />
              {spot.address}
            </p>
            <p className="mt-1 text-xs text-[#4A4A4A]/65">Mức giá: {spot.priceRange}</p>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}

export default function FoodMenuPage({ params }: PageProps) {
  const [tripId, setTripId] = useState('');

  useEffect(() => {
    params.then((value) => {
      setTripId(value.tripId);
    });
  }, [params]);

  const trip = getTripById(tripId || 'dalat-2024').trip;

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
            description="Nhẹ bụng, nóng hổi, hợp thời tiết sương lạnh Đà Lạt."
            icon={<Sunrise className="h-5 w-5 text-pine" />}
            spots={breakfastSpots}
          />
          <MenuColumn
            title="Cafe"
            description="Ưu tiên quán đẹp, chill, phù hợp check-in và ngồi lâu."
            icon={<Coffee className="h-5 w-5 text-pine" />}
            spots={cafeSpots}
          />
          <MenuColumn
            title="Quán random"
            description="Gợi ý ngẫu hứng để đổi mood theo hành trình."
            icon={<Dices className="h-5 w-5 text-pine" />}
            spots={randomSpots}
          />
        </div>
      </section>
    </main>
  );
}
