'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, ChevronDown, Coffee, Dices, ExternalLink, MapPin, MapPinned, Sunrise } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

const getMotorcycleMapsLink = (spot: FoodSpot) => {
  const destinationQuery = encodeURIComponent(`${spot.name}, ${spot.address}, Da Lat, Lam Dong, Vietnam`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}&travelmode=motorcycle`;
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
    name: 'Bún Loan',
    specialty: 'Bún nóng buổi sáng',
    address: '4/4 Hoàng Văn Thụ',
    openHours: '06:30 - 14:00',
    latitude: 11.9319,
    longitude: 108.4372,
    isIndoor: true,
  },
  {
    id: 'bf-5',
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

const fallbackCenter = {
  latitude: 11.9408,
  longitude: 108.4381,
};

const curatedCafeSpots: FoodSpot[] = [
  {
    id: 'cf-curated-1',
    name: 'OHMI cafe',
    specialty: 'Cafe view đẹp, chill',
    address: '35/6 Yersin',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'cf-curated-2',
    name: 'Tiệm Cà Phê Túi Mơ To',
    specialty: 'Cafe view đẹp, chill',
    address: 'Hẻm 31 Sào Nam',
    openHours: 'Theo quán',
    latitude: 11.9666,
    longitude: 108.4552,
    isIndoor: true,
  },
  {
    id: 'cf-curated-3',
    name: 'Gạch since 1988',
    specialty: 'Cafe view đẹp, chill',
    address: '41 Sương Nguyệt Ánh',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'cf-curated-4',
    name: '3PM',
    specialty: 'Cafe view đẹp, chill',
    address: '10 Nguyễn Hữu Cảnh',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'cf-curated-5',
    name: 'Air Dream Coffee',
    specialty: 'Cafe view đẹp, chill',
    address: 'Đống Đa',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'cf-curated-6',
    name: 'Đương cf',
    specialty: 'Cafe view đẹp, chill',
    address: '152/2 Phạm Ngọc Thạch',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'cf-curated-7',
    name: 'Nook Coffee',
    specialty: 'Cafe view đẹp, chill',
    address: 'Đồi Dã Chiến',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: false,
  },
  {
    id: 'cf-curated-8',
    name: 'Kong Coffee',
    specialty: 'Cafe view đẹp, chill',
    address: 'Đồi Dã Chiến',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: false,
  },
  {
    id: 'cf-curated-9',
    name: 'Cheo Veo',
    specialty: 'Cafe view đẹp, chill',
    address: 'Đồi Dã Chiến',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: false,
  },
  {
    id: 'cf-curated-10',
    name: 'Tiệm Cà Phê Bình Minh Ơi',
    specialty: 'Cafe ngắm bình minh',
    address: '89 Hoàng Hoa Thám',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'cf-curated-11',
    name: 'Wilder-nest',
    specialty: 'Cafe view rừng thông',
    address: 'Tà Nung',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: false,
  },
  {
    id: 'cf-curated-12',
    name: 'Tiệm Cf Hoàng Hôn Chiều',
    specialty: 'Cafe ngắm hoàng hôn',
    address: 'Dốc số 9 Trại Mát',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
];

const curatedDayMealSpots: FoodSpot[] = [
  {
    id: 'day-meal-1',
    name: 'Bánh căn Lệ',
    specialty: 'Bánh căn',
    address: '27/44 Yersin',
    openHours: '06:30 - 15:30',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'day-meal-2',
    name: 'Mì Quảng Hội An',
    specialty: 'Mì Quảng',
    address: '14 Yersin',
    openHours: '06:30 - 12:00',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'day-meal-3',
    name: 'Bánh mì xíu mại',
    specialty: 'Bánh mì xíu mại',
    address: '01 Thông Thiên Học',
    openHours: '06:30 - 10:00',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'day-meal-4',
    name: 'Phở Gà A Lữ',
    specialty: 'Phở gà',
    address: '08 Mạc Đĩnh Chi',
    openHours: '06:30 - 22:00',
    latitude: 11.9402,
    longitude: 108.4462,
    isIndoor: true,
  },
  {
    id: 'day-meal-5',
    name: 'Cơm Linh',
    specialty: 'Cơm niêu / món gia đình',
    address: '23 Sương Nguyệt Ánh',
    openHours: '10:30 - 20:00',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'day-meal-6',
    name: 'Cơm tấm Thu',
    specialty: 'Cơm tấm',
    address: '19 Nguyễn Trãi',
    openHours: '10:00 - 15:00',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
];

const curatedDinnerSpots: FoodSpot[] = [
  {
    id: 'dinner-1',
    name: 'Lẩu Gà Lá É',
    specialty: 'Lẩu gà lá é',
    address: '64 Phan Chu Trinh',
    openHours: '07:00 - 22:30',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'dinner-2',
    name: 'Lẩu Bò Hạnh',
    specialty: 'Lẩu bò',
    address: '167 Bùi Thị Xuân',
    openHours: '11:00 - 23:00',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'dinner-3',
    name: 'Fungi Chingu',
    specialty: 'Đồ nướng Hàn Quốc',
    address: '01 Nguyễn Thị Minh Khai',
    openHours: 'Theo quán',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
  {
    id: 'dinner-4',
    name: 'Tiệm Nướng Thương Nhớ',
    specialty: 'Nướng tối',
    address: '08 Mạc Đĩnh Chi',
    openHours: '11:00 - 21:30',
    latitude: 11.9402,
    longitude: 108.4462,
    isIndoor: true,
  },
  {
    id: 'dinner-5',
    name: 'Say Xưa',
    specialty: 'Ăn tối / khuya',
    address: '68 Phan Đình Phùng',
    openHours: '12:00 - 02:00',
    latitude: fallbackCenter.latitude,
    longitude: fallbackCenter.longitude,
    isIndoor: true,
  },
];

const travelNotes = [
  {
    id: 'note-1',
    title: 'Chợ đêm',
    points: ['BẮT BUỘC hỏi giá trước khi ăn.', 'Ăn dâu lắc nên chọn kỹ, tránh dâu dập.'],
  },
  {
    id: 'note-2',
    title: 'Quán ăn',
    points: [
      'Lên Google Maps đọc kỹ review rồi mới tới ăn, tránh bị hét giá.',
      'Fungi Chingu - 1 Nguyễn Thị Minh Khai.',
      'Hoa Bánh Căn - 12 Phan Đình Phùng.',
      'Lẩu gà lá é - 2C Bùi Thị Xuân.',
      'Cơm Linh - 23 Sương Nguyệt Anh.',
      'Mậu Dịch - 28B Trần Hưng Đạo.',
      'Túi Mơ To - hẻm 31 Sào Nam.',
    ],
  },
  {
    id: 'note-3',
    title: 'Dốc ở Đà Lạt',
    points: ['Bèo nào yếu nghề thì đừng cố đi dốc, đa phần dốc cao.', 'Đi đồi nên thuê xe số, tránh đi ngày mưa gió để an toàn.'],
  },
  {
    id: 'note-4',
    title: 'Thuê xe',
    points: [
      'Nhớ đem giấy tờ mới thuê xe được (Căn cước, bằng lái).',
      'Giá thuê tầm 80-100k/ngày, cao hơn thì nên khảo thêm chỗ khác.',
    ],
  },
  {
    id: 'note-5',
    title: 'Hồ Xuân Hương',
    points: ['KHÔNG ăn các quán gần bờ hồ vì thường giá cao.', 'KHÔNG đi sát mép hồ, nhất là tầm chập tối.'],
  },
  {
    id: 'note-6',
    title: 'Dâu tây',
    points: ['KHÔNG đi theo cò dâu.', 'Mua dâu nên ghé đường Nguyễn Công Trứ để được chọn từng trái.'],
  },
];

function MenuColumn({
  title,
  description,
  timeWindow,
  icon,
  spots,
  isExpanded,
  onToggle,
  selectedSpotId,
  onSelectSpot,
}: {
  title: string;
  description: string;
  timeWindow: string;
  icon: React.ReactNode;
  spots: FoodSpot[];
  isExpanded: boolean;
  onToggle: () => void;
  selectedSpotId: string | null;
  onSelectSpot: (spotId: string) => void;
}) {
  return (
    <Card className="h-full rounded-dalat border border-white/25 bg-white/50 backdrop-blur-xl shadow-[0_14px_36px_rgba(74,74,74,0.08)]">
      <CardHeader className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="inline-flex items-center gap-2 text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              {icon}
              {title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-pine/25 bg-pine/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-pine">
                {spots.length} quán
              </span>
              <span className="rounded-full border border-[#A67B5B]/25 bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#7C5A42]">
                {timeWindow}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center gap-1 rounded-full border border-pine/25 bg-white/70 px-3 py-1.5 text-[11px] text-pine transition hover:bg-white"
          >
            {isExpanded ? 'Ẩn' : 'Hiện'}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
          </button>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
          {spots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-pine/25 bg-white/50 p-4 text-xs text-[#4A4A4A]/70">
              Chưa có quán phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            spots.map((spot) => (
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

                <a
                  href={getMotorcycleMapsLink(spot)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-pine/30 bg-white px-3 py-1.5 text-[11px] text-pine transition hover:bg-white/80"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Dẫn đường xe máy
                </a>
              </article>
            ))
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function FoodMenuPage({ params }: PageProps) {
  const [tripId, setTripId] = useState('');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(breakfastSpots[0]?.id ?? null);
  const [isNotesExpanded, setIsNotesExpanded] = useState(true);
  const [expandedColumns, setExpandedColumns] = useState({
    dayMeal: true,
    cafe: true,
    dinner: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [indoorOnly, setIndoorOnly] = useState(false);

  useEffect(() => {
    params.then((value) => {
      setTripId(value.tripId);
    });
  }, [params]);

  const trip = getTripById(tripId || 'dalat-2026').trip;

  const allSpots = useMemo(() => {
    return [...breakfastSpots, ...curatedDayMealSpots, ...cafeSpots, ...curatedCafeSpots, ...randomSpots, ...curatedDinnerSpots];
  }, []);

  const dayMealSpots = useMemo(() => {
    return [...breakfastSpots, ...curatedDayMealSpots];
  }, []);

  const allCafeSpots = useMemo(() => {
    return [...cafeSpots, ...curatedCafeSpots];
  }, []);

  const dinnerSpots = useMemo(() => {
    return [...randomSpots, ...curatedDinnerSpots];
  }, []);

  const applyFilters = useCallback(
    (spots: FoodSpot[]) => {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      return spots.filter((spot) => {
        const matchesIndoor = indoorOnly ? spot.isIndoor : true;
        if (!matchesIndoor) return false;

        if (!normalizedQuery) return true;
        return [spot.name, spot.specialty, spot.address, spot.openHours].some((value) => value.toLowerCase().includes(normalizedQuery));
      });
    },
    [indoorOnly, searchQuery],
  );

  const filteredDayMealSpots = useMemo(() => applyFilters(dayMealSpots), [applyFilters, dayMealSpots]);
  const filteredCafeSpots = useMemo(() => applyFilters(allCafeSpots), [allCafeSpots, applyFilters]);
  const filteredDinnerSpots = useMemo(() => applyFilters(dinnerSpots), [applyFilters, dinnerSpots]);

  const visibleSpots = useMemo(() => {
    return [...filteredDayMealSpots, ...filteredCafeSpots, ...filteredDinnerSpots];
  }, [filteredCafeSpots, filteredDayMealSpots, filteredDinnerSpots]);

  const mapPoints = useMemo(() => {
    return visibleSpots.map((spot) => ({
      id: spot.id,
      name: spot.name,
      latitude: spot.latitude,
      longitude: spot.longitude,
      is_indoor: spot.isIndoor,
    }));
  }, [visibleSpots]);

  const selectedSpot = useMemo(() => {
    if (!selectedSpotId) return null;
    return visibleSpots.find((spot) => spot.id === selectedSpotId) ?? null;
  }, [selectedSpotId, visibleSpots]);

  useEffect(() => {
    if (visibleSpots.length === 0) {
      setSelectedSpotId(null);
      return;
    }

    const isSelectedVisible = selectedSpotId ? visibleSpots.some((spot) => spot.id === selectedSpotId) : false;
    if (!isSelectedVisible) {
      setSelectedSpotId(visibleSpots[0].id);
    }
  }, [selectedSpotId, visibleSpots]);

  const handleSelectSpot = (spotId: string) => {
    setSelectedSpotId(spotId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.setTimeout(() => {
        const mapSection = document.getElementById('food-map-section');
        mapSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  const hasActiveFilters = searchQuery.trim().length > 0 || indoorOnly;

  const toggleColumn = (column: 'dayMeal' | 'cafe' | 'dinner') => {
    setExpandedColumns((previous) => ({
      ...previous,
      [column]: !previous[column],
    }));
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] px-4 py-6 sm:px-6 md:px-10 md:py-10">
      <section className="mx-auto max-w-7xl space-y-5">
        <div className="rounded-dalat border border-white/25 bg-white/50 p-5 backdrop-blur-xl sm:p-6">
          <Link
            href={`/trips/${tripId || trip.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-pine/30 bg-white/80 px-3 py-1.5 text-xs text-pine transition hover:bg-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại Dashboard
          </Link>

          <p className="inline-flex rounded-full border border-pine/25 bg-white/70 px-3 py-1 text-xs text-pine">Dalat Dream · Food Menu</p>
          <h1 className="mt-3 text-3xl text-[#4A4A4A] sm:text-4xl" style={{ fontFamily: 'var(--font-heading), serif' }}>
            Layout menu đồ ăn cho {trip.name}
          </h1>
          <p className="mt-2 text-sm text-[#4A4A4A]/75">3 cột theo đúng style web: ăn sáng/trưa, cafe và ăn tối để bạn chọn nhanh.</p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm quán theo tên, món, địa chỉ..."
              className="w-full rounded-full border border-white/35 bg-white/75 px-4 py-2 text-sm text-[#4A4A4A] outline-none"
            />
            <button
              type="button"
              onClick={() => setIndoorOnly((previous) => !previous)}
              className={`rounded-full border px-4 py-2 text-xs transition ${indoorOnly ? 'border-pine/45 bg-pine text-white' : 'border-pine/25 bg-white/70 text-pine hover:bg-white'}`}
            >
              {indoorOnly ? 'Đang lọc indoor' : 'Chỉ indoor'}
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIndoorOnly(false);
                }}
                className="rounded-full border border-white/35 bg-white/70 px-4 py-2 text-xs text-[#4A4A4A]/75 transition hover:bg-white"
              >
                Xóa lọc
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-[#4A4A4A]/70">Đang hiển thị {visibleSpots.length} quán phù hợp.</p>
        </div>

        <Card className="relative rounded-dalat border-2 border-pine/45 bg-white/65 shadow-[0_14px_36px_rgba(74,74,74,0.08)] backdrop-blur-xl ring-2 ring-pine/25 transition-all duration-500">
          <CardHeader className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-pine/30 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-wide text-pine">
                  <span className="h-1.5 w-1.5 rounded-full bg-pine animate-pulse" />
                  Mục quan trọng
                </p>
                <CardTitle className="inline-flex items-center gap-2 text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
                  <AlertTriangle className="h-5 w-5 text-pine" />
                  Lưu ý · Kinh nghiệm du lịch Đà Lạt
                </CardTitle>
              </div>
              <button
                type="button"
                onClick={() => setIsNotesExpanded((previous) => !previous)}
                className="inline-flex items-center gap-1 rounded-full border border-pine/25 bg-white/70 px-3 py-1.5 text-[11px] text-pine transition hover:bg-white"
              >
                {isNotesExpanded ? 'Ẩn' : 'Hiện'}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isNotesExpanded ? '' : '-rotate-90'}`} />
              </button>
            </div>
            <CardDescription>Những điểm cần nhớ để đi ăn uống, thuê xe và di chuyển an toàn hơn trong chuyến đi.</CardDescription>
          </CardHeader>
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              isNotesExpanded ? 'max-h-[2400px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
              {travelNotes.map((note, index) => (
                <article key={note.id} className="rounded-2xl border border-white/35 bg-white/70 p-4 transition-all duration-300 hover:border-pine/30 hover:bg-white/80">
                  <h3 className="text-sm text-pine sm:text-base" style={{ fontFamily: 'var(--font-heading), serif' }}>
                    {index + 1}. {note.title}
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-[#4A4A4A]/85">
                    {note.points.map((point) => (
                      <li key={point}>• {point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </CardContent>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <MenuColumn
            title="Ăn sáng & ăn trưa"
            description="Tổng hợp món sáng và trưa bạn đã lọc để dễ chọn theo giờ mở cửa."
            timeWindow="06:00 - 15:30"
            icon={<Sunrise className="h-5 w-5 text-pine" />}
            spots={filteredDayMealSpots}
            isExpanded={expandedColumns.dayMeal}
            onToggle={() => toggleColumn('dayMeal')}
            selectedSpotId={selectedSpotId}
            onSelectSpot={handleSelectSpot}
          />
          <MenuColumn
            title="Cafe"
            description="Danh sách quán cà phê view đẹp, chill để check-in và nghỉ chân."
            timeWindow="07:00 - 22:30"
            icon={<Coffee className="h-5 w-5 text-pine" />}
            spots={filteredCafeSpots}
            isExpanded={expandedColumns.cafe}
            onToggle={() => toggleColumn('cafe')}
            selectedSpotId={selectedSpotId}
            onSelectSpot={handleSelectSpot}
          />
          <MenuColumn
            title="Ăn tối"
            description="Lẩu và đồ nướng buổi tối để chốt lịch ăn sau khi đi chơi."
            timeWindow="17:00 - 23:00"
            icon={<Dices className="h-5 w-5 text-pine" />}
            spots={filteredDinnerSpots}
            isExpanded={expandedColumns.dinner}
            onToggle={() => toggleColumn('dinner')}
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
            {selectedSpot ? (
              <div className="mb-3 rounded-2xl border border-white/35 bg-white/65 p-3 text-xs text-[#4A4A4A]/80">
                <p>
                  Đang chọn: <strong>{selectedSpot.name}</strong>
                </p>
                <p className="mt-1">{selectedSpot.address}</p>
              </div>
            ) : (
              <div className="mb-3 rounded-2xl border border-dashed border-pine/25 bg-white/55 p-3 text-xs text-[#4A4A4A]/75">
                Không có quán phù hợp để hiển thị trên bản đồ. Thử xóa bộ lọc để xem lại toàn bộ quán.
              </div>
            )}

            <DalatMap points={mapPoints} selectedPointId={selectedSpotId} onSelectPoint={setSelectedSpotId} />
          </CardContent>
        </Card>
      </section>

    </main>
  );
}
