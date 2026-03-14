export type MockPlace = {
  id: string;
  name: string;
  category: 'cafe' | 'food' | 'sightseeing' | 'hotel' | 'shopping' | 'other';
  latitude: number;
  longitude: number;
  is_indoor: boolean;
  opening_hours: {
    open: string;
    close: string;
  };
  outfit_concept: string;
  temp_advice: string;
  photo_spot_tips: string[];
};

export type MockItineraryItem = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  place_id: string;
  estimated_cost: number;
};

export type MockExpense = {
  id: string;
  category: 'food' | 'transport' | 'ticket' | 'hotel' | 'shopping' | 'other';
  amount: number;
  note: string;
  spent_at: string;
};

export type MockWeatherHour = {
  hour: string;
  rainProbability: number;
  humidity: number;
  cloudCover: number;
  windSpeed: number;
};

export const mockTrip = {
  id: 'dalat-2024',
  name: 'Đà Lạt Mộng Sương 2024',
  description: 'Một chuyến đi nhẹ như sương sớm, cà phê thơm, mây vờn đồi và những buổi chiều chậm rãi.',
  budgetTotal: 8500000,
  places: [
    {
      id: 'place-tu-mo-to',
      name: 'Tú Mơ To',
      category: 'cafe',
      latitude: 11.9666,
      longitude: 108.4552,
      is_indoor: true,
      opening_hours: { open: '07:00', close: '22:00' },
      outfit_concept: 'Sage Green + Kem',
      temp_advice: 'Sáng sớm nên có áo khoác mỏng.',
      photo_spot_tips: ['Chụp gần cửa kính để lấy ánh sáng mềm.', 'Đặt cốc cà phê vào tiền cảnh.'],
    },
    {
      id: 'place-lululola',
      name: 'Lululola',
      category: 'cafe',
      latitude: 11.9309,
      longitude: 108.4275,
      is_indoor: true,
      opening_hours: { open: '07:30', close: '22:30' },
      outfit_concept: 'Dusty Rose + Trắng',
      temp_advice: 'Chiều tối gió mạnh hơn, nên có áo khoác.',
      photo_spot_tips: ['Canh giờ vàng 16:30-17:15.', 'Đứng lệch khung để lấy đường chân trời.'],
    },
    {
      id: 'place-cho-da-lat',
      name: 'Chợ Đà Lạt',
      category: 'shopping',
      latitude: 11.9407,
      longitude: 108.4384,
      is_indoor: true,
      opening_hours: { open: '07:00', close: '23:00' },
      outfit_concept: 'Nâu Ấm + Đỏ Gạch',
      temp_advice: 'Buổi tối lạnh rõ, mang áo giữ ấm gọn nhẹ.',
      photo_spot_tips: ['Chụp biển hiệu đèn neon ở góc rộng.', 'Ưu tiên ảnh món ăn với nền bokeh.'],
    },
    {
      id: 'place-cay-thong-co-don',
      name: 'Cây thông cô đơn',
      category: 'sightseeing',
      latitude: 12.0724,
      longitude: 108.4431,
      is_indoor: false,
      opening_hours: { open: '05:30', close: '18:00' },
      outfit_concept: 'Nâu Gỗ + Rêu',
      temp_advice: 'Khu vực thoáng gió, ưu tiên giày kín và khăn choàng.',
      photo_spot_tips: ['Chụp xa để thấy cây nổi bật trên nền trời.', 'Giữ đường chân trời ở 1/3 khung hình.'],
    },
    {
      id: 'place-san-may-cau-dat',
      name: 'Săn mây Cầu Đất',
      category: 'sightseeing',
      latitude: 11.8664,
      longitude: 108.5684,
      is_indoor: false,
      opening_hours: { open: '04:30', close: '17:30' },
      outfit_concept: 'Trắng Sữa + Xám Khói',
      temp_advice: 'Nhiệt độ sáng rất thấp, nên mặc nhiều lớp giữ nhiệt.',
      photo_spot_tips: ['Đến sớm để có vị trí cao và thoáng.', 'Dùng chế độ HDR để giữ chi tiết mây.'],
    },
    {
      id: 'place-ho-tuyen-lam',
      name: 'Hồ Tuyền Lâm',
      category: 'sightseeing',
      latitude: 11.9057,
      longitude: 108.4449,
      is_indoor: false,
      opening_hours: { open: '06:00', close: '18:30' },
      outfit_concept: 'Xanh Lam Nhạt + Be',
      temp_advice: 'Chiều muộn dễ lạnh tay, mang áo khoác mỏng.',
      photo_spot_tips: ['Lấy reflection mặt hồ lúc gió nhẹ.', 'Đặt chủ thể gần hàng thông để tạo chiều sâu.'],
    },
  ] as MockPlace[],
  itinerary_items: [
    {
      id: 'itn-1',
      title: 'Đón bình minh và săn mây',
      description: 'Ngắm biển mây sớm trên cao nguyên Cầu Đất.',
      start_time: '05:00',
      end_time: '06:30',
      place_id: 'place-san-may-cau-dat',
      estimated_cost: 260000,
    },
    {
      id: 'itn-2',
      title: 'Cà phê sáng chậm rãi',
      description: 'Dừng chân trong không gian ấm áp, nghe nhạc acoustic nhẹ.',
      start_time: '09:00',
      end_time: '10:30',
      place_id: 'place-tu-mo-to',
      estimated_cost: 180000,
    },
    {
      id: 'itn-3',
      title: 'Đi dạo ven hồ',
      description: 'Thả chậm nhịp sống, ngắm mặt nước phản chiếu rừng thông.',
      start_time: '15:00',
      end_time: '16:30',
      place_id: 'place-ho-tuyen-lam',
      estimated_cost: 130000,
    },
    {
      id: 'itn-4',
      title: 'Chợ đêm và đồ len',
      description: 'Khám phá món nóng, dâu tươi và quà lưu niệm.',
      start_time: '19:00',
      end_time: '20:30',
      place_id: 'place-cho-da-lat',
      estimated_cost: 420000,
    },
  ] as MockItineraryItem[],
  expenses: [
    {
      id: 'exp-1',
      category: 'transport',
      amount: 450000,
      note: 'Taxi sân bay Liên Khương về trung tâm',
      spent_at: '2024-06-18T08:20:00+07:00',
    },
    {
      id: 'exp-2',
      category: 'food',
      amount: 320000,
      note: 'Bánh căn + sữa đậu nành đêm',
      spent_at: '2024-06-18T21:10:00+07:00',
    },
    {
      id: 'exp-3',
      category: 'ticket',
      amount: 180000,
      note: 'Vé tham quan điểm săn mây',
      spent_at: '2024-06-19T05:40:00+07:00',
    },
    {
      id: 'exp-4',
      category: 'shopping',
      amount: 760000,
      note: 'Đồ len và quà lưu niệm',
      spent_at: '2024-06-19T20:40:00+07:00',
    },
    {
      id: 'exp-5',
      category: 'hotel',
      amount: 2400000,
      note: 'Homestay 2 đêm view thung lũng',
      spent_at: '2024-06-18T14:00:00+07:00',
    },
  ] as MockExpense[],
  hourly_weather: [
    { hour: '04', rainProbability: 42, humidity: 95, cloudCover: 88, windSpeed: 7 },
    { hour: '05', rainProbability: 46, humidity: 93, cloudCover: 91, windSpeed: 6 },
    { hour: '06', rainProbability: 49, humidity: 92, cloudCover: 89, windSpeed: 8 },
    { hour: '09', rainProbability: 35, humidity: 82, cloudCover: 70, windSpeed: 11 },
    { hour: '12', rainProbability: 55, humidity: 76, cloudCover: 65, windSpeed: 14 },
    { hour: '15', rainProbability: 78, humidity: 84, cloudCover: 87, windSpeed: 10 },
    { hour: '18', rainProbability: 72, humidity: 88, cloudCover: 92, windSpeed: 9 },
    { hour: '20', rainProbability: 62, humidity: 90, cloudCover: 94, windSpeed: 8 },
  ] as MockWeatherHour[],
};

export const getMockTripById = (tripId: string) => {
  if (tripId === mockTrip.id) return mockTrip;
  return mockTrip;
};
