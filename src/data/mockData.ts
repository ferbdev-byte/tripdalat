export type Place = {
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

export type ItineraryItem = {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  place_id: string;
  estimated_cost: number;
};

export type ExpenseItem = {
  id: string;
  category: 'food' | 'transport' | 'ticket' | 'hotel' | 'shopping' | 'other';
  amount: number;
  note: string;
  spent_at: string;
};

export type WeatherPoint = {
  hour: string;
  temperature: number;
  rainProbability: number;
  humidity: number;
  cloudCover: number;
  windSpeed: number;
};

export const mockData = {
  trip: {
    id: 'dalat-2026',
    name: 'Đà Lạt Dream Escape 2026',
    subtitle: 'Một lịch trình thơ giữa rừng thông, mây sớm và những quán nhỏ đầy ấm áp.',
    budgetTotal: 9000000,
  },
  places: [
    {
      id: 'p-1',
      name: 'Tú Mơ To',
      category: 'cafe',
      latitude: 11.9666,
      longitude: 108.4552,
      is_indoor: true,
      opening_hours: { open: '07:00', close: '22:00' },
      outfit_concept: 'Sage Green + Kem',
      temp_advice: 'Không gian ấm, nhưng sáng sớm vẫn có gió lạnh nhẹ.',
      photo_spot_tips: ['Chụp từ góc thấp để lấy ánh đèn vàng.', 'Đặt ly cà phê ở tiền cảnh để khung hình có chiều sâu.'],
    },
    {
      id: 'p-2',
      name: 'Lululola',
      category: 'cafe',
      latitude: 11.9309,
      longitude: 108.4275,
      is_indoor: true,
      opening_hours: { open: '07:30', close: '22:30' },
      outfit_concept: 'Dusty Rose + Trắng',
      temp_advice: 'Nên mang áo khoác mỏng vì gió chiều trên đồi khá rõ.',
      photo_spot_tips: ['Canh khung lúc hoàng hôn để da lên màu ấm.', 'Đứng chếch 45 độ để lấy sân khấu và đồi phía sau.'],
    },
    {
      id: 'p-3',
      name: 'Cây thông cô đơn',
      category: 'sightseeing',
      latitude: 12.0724,
      longitude: 108.4431,
      is_indoor: false,
      opening_hours: { open: '05:30', close: '18:00' },
      outfit_concept: 'Nâu Gỗ + Rêu',
      temp_advice: 'Địa hình thoáng gió, nên chuẩn bị khăn choàng cổ.',
      photo_spot_tips: ['Chụp toàn cảnh từ xa để thấy độ cô độc của cây.', 'Để chủ thể ở 1/3 khung hình tạo cảm giác thơ hơn.'],
    },
    {
      id: 'p-4',
      name: 'Săn mây Cầu Đất',
      category: 'sightseeing',
      latitude: 11.8664,
      longitude: 108.5684,
      is_indoor: false,
      opening_hours: { open: '04:30', close: '17:30' },
      outfit_concept: 'Trắng Sữa + Xám Khói',
      temp_advice: 'Sáng sớm nhiệt thấp, ưu tiên áo giữ nhiệt và giày kín.',
      photo_spot_tips: ['Đến sớm 15 phút để chọn vị trí cao thoáng.', 'Canh ngược sáng nhẹ để tạo viền tóc nổi bật trong mây.'],
    },
    {
      id: 'p-5',
      name: 'Hồ Tuyền Lâm',
      category: 'sightseeing',
      latitude: 11.9057,
      longitude: 108.4449,
      is_indoor: false,
      opening_hours: { open: '06:00', close: '18:30' },
      outfit_concept: 'Xanh Lam Nhạt + Be',
      temp_advice: 'Chiều muộn có sương mỏng, nên có áo khoác nhẹ.',
      photo_spot_tips: ['Chụp reflection mặt hồ ở góc thấp sát bờ.', 'Lấy hàng thông hai bên làm đường dẫn khung hình.'],
    },
    {
      id: 'p-6',
      name: 'Chợ Đà Lạt',
      category: 'shopping',
      latitude: 11.9407,
      longitude: 108.4384,
      is_indoor: true,
      opening_hours: { open: '07:00', close: '23:00' },
      outfit_concept: 'Nâu Ấm + Đỏ Gạch',
      temp_advice: 'Buổi tối đông và lạnh, nên có áo khoác gọn dễ di chuyển.',
      photo_spot_tips: ['Chụp góc cầu thang chợ để lấy ánh đèn phố.', 'Dùng chế độ chân dung để làm nổi món ăn nóng.'],
    },
  ] as Place[],
  itinerary: [
    {
      id: 'i-1',
      title: 'Bình minh săn mây',
      description: 'Đón ánh hửng sáng trên đồi cao và ghi lại khoảnh khắc mây vờn.',
      start_time: '05:00',
      end_time: '06:30',
      place_id: 'p-4',
      estimated_cost: 280000,
    },
    {
      id: 'i-2',
      title: 'Cà phê sáng nhẹ nhàng',
      description: 'Thư thả đọc sách và nghe nhạc acoustic trong không gian ấm áp.',
      start_time: '09:00',
      end_time: '10:30',
      place_id: 'p-1',
      estimated_cost: 190000,
    },
    {
      id: 'i-3',
      title: 'Dạo ven hồ',
      description: 'Tản bộ để cảm nhận mùi thông và gió lạnh dịu.',
      start_time: '15:00',
      end_time: '16:30',
      place_id: 'p-5',
      estimated_cost: 120000,
    },
    {
      id: 'i-4',
      title: 'Đêm chợ Đà Lạt',
      description: 'Khám phá quà lưu niệm và món nóng giữa tiết trời se lạnh.',
      start_time: '19:00',
      end_time: '20:30',
      place_id: 'p-6',
      estimated_cost: 450000,
    },
  ] as ItineraryItem[],
  expenses: [
    { id: 'e-1', category: 'transport', amount: 520000, note: 'Di chuyển sân bay và nội thành', spent_at: '2024-06-18T09:00:00+07:00' },
    { id: 'e-2', category: 'food', amount: 340000, note: 'Bữa sáng và cà phê', spent_at: '2024-06-18T10:45:00+07:00' },
    { id: 'e-3', category: 'ticket', amount: 210000, note: 'Vé tham quan đồi săn mây', spent_at: '2024-06-19T06:10:00+07:00' },
    { id: 'e-4', category: 'hotel', amount: 2500000, note: 'Homestay 2 đêm', spent_at: '2024-06-18T14:00:00+07:00' },
    { id: 'e-5', category: 'shopping', amount: 790000, note: 'Đồ len và quà lưu niệm', spent_at: '2024-06-19T20:20:00+07:00' },
  ] as ExpenseItem[],
  weather: [
    { hour: '04', temperature: 16, rainProbability: 44, humidity: 95, cloudCover: 86, windSpeed: 7 },
    { hour: '05', temperature: 15, rainProbability: 49, humidity: 94, cloudCover: 91, windSpeed: 6 },
    { hour: '06', temperature: 16, rainProbability: 53, humidity: 92, cloudCover: 89, windSpeed: 8 },
    { hour: '09', temperature: 20, rainProbability: 34, humidity: 82, cloudCover: 66, windSpeed: 11 },
    { hour: '12', temperature: 23, rainProbability: 57, humidity: 77, cloudCover: 68, windSpeed: 13 },
    { hour: '15', temperature: 22, rainProbability: 76, humidity: 85, cloudCover: 88, windSpeed: 10 },
    { hour: '18', temperature: 19, rainProbability: 71, humidity: 88, cloudCover: 92, windSpeed: 9 },
    { hour: '20', temperature: 18, rainProbability: 64, humidity: 90, cloudCover: 95, windSpeed: 8 },
  ] as WeatherPoint[],
};

export const getTripById = (tripId: string) => {
  if (tripId === mockData.trip.id) return mockData;
  return mockData;
};
