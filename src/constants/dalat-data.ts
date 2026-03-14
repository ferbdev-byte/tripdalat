export type PoiCategory = 'cafe' | 'food' | 'sightseeing' | 'stay';

export type DalatMenuItem = {
  name: string;
  price: number;
  description: string;
  address?: string;
  opening_hours?: string;
};

export type DalatPoi = {
  id: string;
  name: string;
  category: PoiCategory;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  best_time: string;
  image_url: string;
  address?: string;
  opening_hours?: string;
  menu_items?: DalatMenuItem[];
};

export const DALAT_LOCAL_DISCOVERY: DalatPoi[] = [
  {
    id: 'p-1',
    name: 'Tú Mơ To',
    category: 'cafe',
    coordinates: { lat: 11.9666, lng: 108.4552 },
    description: 'Quan nho nhu mot trang tho, ca phe nong va mui go thong diu dang.',
    best_time: 'Sang som',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    address: '98 An Binh, Phuong 3, Da Lat',
    opening_hours: '07:00 - 22:00',
    menu_items: [
      {
        name: 'Pho sang Da Lat',
        price: 65000,
        description: 'Mon nong buoi som, nuoc dung thanh va de an.',
        address: '98 An Binh, Phuong 3, Da Lat',
        opening_hours: '07:00 - 10:30',
      },
      {
        name: 'Latte Oat Milk',
        price: 64000,
        description: 'Ca phe sua hat yen mach, vi mem va it beo.',
      },
      {
        name: 'Banh canh ca loc',
        price: 72000,
        description: 'To banh canh nong cho ngay lanh, topping day dan.',
        address: 'Chi nhanh Ho Tung Mau, Da Lat',
      },
    ],
  },
  {
    id: 'p-2',
    name: 'Lululola',
    category: 'cafe',
    coordinates: { lat: 11.9309, lng: 108.4275 },
    description: 'San khau giua doi thong, am nhac acoustic nhe nhu suong chieu.',
    best_time: 'Hoang hon',
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    address: '32 Duong Trinh Hoai Duc, Da Lat',
    opening_hours: '07:30 - 22:30',
    menu_items: [
      {
        name: 'Tra dao nhiet doi',
        price: 59000,
        description: 'Tra thanh mat, hop ngay doi gio chieu.',
      },
      {
        name: 'Chocolate nong',
        price: 65000,
        description: 'Vi dam, phu hop troi lanh va ngoi lau.',
      },
      {
        name: 'Banh mi bo toi',
        price: 47000,
        description: 'Snack nhe cho buoi hen toi.',
        address: 'Chi nhanh Tran Hung Dao, Da Lat',
      },
    ],
  },
  {
    id: 'p-3',
    name: 'Cay thong co don',
    category: 'sightseeing',
    coordinates: { lat: 12.0724, lng: 108.4431 },
    description: 'Diem hen co doc, noi gio va may ke cho nhau nghe cau chuyen cao nguyen.',
    best_time: 'Binh minh',
    image_url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p-4',
    name: 'San may Cau Dat',
    category: 'sightseeing',
    coordinates: { lat: 11.8664, lng: 108.5684 },
    description: 'Khoanh khac mat troi cham may, ca thanh pho nhu dang tho.',
    best_time: 'Sang som',
    image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p-5',
    name: 'Ho Tuyen Lam',
    category: 'sightseeing',
    coordinates: { lat: 11.9057, lng: 108.4449 },
    description: 'Mat ho lang, rung thong tham, thoi gian troi cham hon binh thuong.',
    best_time: 'Chieu muon',
    image_url: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p-6',
    name: 'Cho Da Lat',
    category: 'food',
    coordinates: { lat: 11.9407, lng: 108.4384 },
    description: 'Am ap mui banh trang nuong, sua dau nong va tieng cuoi dem cao nguyen.',
    best_time: 'Buoi toi',
    image_url: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
    address: 'Khu Hoa Binh, Cho Da Lat',
    opening_hours: '07:00 - 23:00',
    menu_items: [
      {
        name: 'Banh trang nuong Da Lat',
        price: 30000,
        description: 'Mon an vat quen thuoc, vo gion topping day.',
        opening_hours: '16:00 - 22:30',
      },
      {
        name: 'Sua dau nong',
        price: 18000,
        description: 'Thuc uong am bung, rat hop troi toi lanh.',
      },
      {
        name: 'Xiu mai chen',
        price: 42000,
        description: 'Nuoc sot dam da, an kem banh mi nong.',
        address: 'Hem Tang Bat Ho, Da Lat',
        opening_hours: '06:00 - 11:00',
      },
    ],
  },
  {
    id: 'p-7',
    name: 'Cozy Nook Homestay',
    category: 'stay',
    coordinates: { lat: 11.9446, lng: 108.4468 },
    description: 'Gac nho ngam den pho, tam vai chan va nghe mua go nhip mai.',
    best_time: 'Dem khuya',
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  },
];
