export type HiddenGem = {
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  note: string;
};

export const HIDDEN_GEMS: HiddenGem[] = [
  {
    id: 'gem-1',
    name: 'Tiệm Bánh Cối Xay Gió',
    subtitle: 'Góc bánh nóng và cacao thơm giữa trời lạnh',
    latitude: 11.9397,
    longitude: 108.4389,
    note: 'Nên ghé sớm trước 19:00 để có chỗ ngồi yên tĩnh cho hai đứa.',
  },
  {
    id: 'gem-2',
    name: 'An Cafe Garden',
    subtitle: 'Khu vườn xanh mát, lên ảnh rất tình',
    latitude: 11.9433,
    longitude: 108.4334,
    note: 'Chỗ này ánh sáng đẹp nhất khoảng 4h chiều, chụp chân dung cực xinh.',
  },
  {
    id: 'gem-3',
    name: 'Lưng Chừng Cafe',
    subtitle: 'View đồi thông mờ sương, nhạc chill nhẹ',
    latitude: 11.9536,
    longitude: 108.4342,
    note: 'Mang áo khoác mỏng vì sau 17:30 gió lạnh rõ hơn.',
  },
  {
    id: 'gem-4',
    name: 'Nem Nướng Bà Hùng',
    subtitle: 'Món nóng cứu đói hoàn hảo cho tối se lạnh',
    latitude: 11.9477,
    longitude: 108.4402,
    note: 'Nếu đông, mình gọi trước một phần để không phải chờ lâu.',
  },
  {
    id: 'gem-5',
    name: 'Boho Corner',
    subtitle: 'Góc nhỏ lãng mạn cho buổi hẹn bí mật',
    latitude: 11.9499,
    longitude: 108.4319,
    note: 'Đến trước hoàng hôn 20 phút để bắt trọn khung cảnh đẹp nhất.',
  },
];
