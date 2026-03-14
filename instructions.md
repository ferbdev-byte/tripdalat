# Kiến trúc ứng dụng quản lý du lịch Đà Lạt

## 1) Folder Structure đề xuất (Next.js App Router + Supabase)

```txt
dalat-travel-app/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ register/page.tsx
│  │  │  └─ callback/route.ts
│  │  ├─ (dashboard)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ trips/page.tsx
│  │  │  ├─ trips/[tripId]/page.tsx
│  │  │  ├─ trips/[tripId]/itinerary/page.tsx
│  │  │  ├─ trips/[tripId]/map/page.tsx
│  │  │  ├─ trips/[tripId]/budget/page.tsx
│  │  │  └─ places/page.tsx
│  │  ├─ api/
│  │  │  ├─ weather/route.ts
│  │  │  ├─ distance/route.ts
│  │  │  └─ recommendations/route.ts
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  │
│  ├─ components/
│  │  ├─ common/
│  │  │  ├─ Header.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  └─ EmptyState.tsx
│  │  ├─ trip/
│  │  │  ├─ TripCard.tsx
│  │  │  ├─ TripForm.tsx
│  │  │  ├─ ItineraryTimeline.tsx
│  │  │  └─ ItineraryItemForm.tsx
│  │  ├─ place/
│  │  │  ├─ PlaceCard.tsx
│  │  │  ├─ PlaceFilter.tsx
│  │  │  └─ PlaceDetailDrawer.tsx
│  │  ├─ map/
│  │  │  ├─ DalatMap.tsx
│  │  │  ├─ PlaceMarker.tsx
│  │  │  └─ RoutePolyline.tsx
│  │  ├─ weather/
│  │  │  ├─ WeatherWidget.tsx
│  │  │  └─ RainAlert.tsx
│  │  └─ budget/
│  │     ├─ ExpenseTable.tsx
│  │     └─ BudgetSummary.tsx
│  │
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts
│  │  │  ├─ server.ts
│  │  │  └─ middleware.ts
│  │  ├─ utils/
│  │  │  ├─ date.ts
│  │  │  ├─ currency.ts
│  │  │  └─ distance.ts
│  │  └─ validators/
│  │     ├─ trip.schema.ts
│  │     ├─ place.schema.ts
│  │     └─ expense.schema.ts
│  │
│  ├─ services/
│  │  ├─ trip.service.ts
│  │  ├─ place.service.ts
│  │  ├─ itinerary.service.ts
│  │  ├─ budget.service.ts
│  │  └─ weather.service.ts
│  │
│  ├─ hooks/
│  │  ├─ useTrip.ts
│  │  ├─ useItinerary.ts
│  │  ├─ useWeather.ts
│  │  └─ useRealtimeTrip.ts
│  │
│  ├─ types/
│  │  ├─ database.types.ts
│  │  ├─ trip.types.ts
│  │  └─ place.types.ts
│  │
│  └─ constants/
│     ├─ categories.ts
│     ├─ weather.ts
│     └─ app.ts
│
├─ supabase/
│  ├─ migrations/
│  │  ├─ 0001_init_extensions.sql
│  │  ├─ 0002_core_tables.sql
│  │  ├─ 0003_rls_policies.sql
│  │  └─ 0004_seed_poi.sql
│  ├─ seed.sql
│  └─ config.toml
│
├─ public/
│  ├─ images/
│  └─ icons/
├─ .env.local
├─ next.config.ts
├─ tailwind.config.ts
├─ tsconfig.json
└─ package.json
```

### Nguyên tắc tổ chức
- `app/`: route + layout theo App Router.
- `components/`: UI thuần, không chứa logic gọi DB trực tiếp.
- `services/`: business logic và truy vấn Supabase.
- `lib/supabase/`: tách client/server để đúng ngữ cảnh SSR/CSR.
- `supabase/migrations/`: version hóa schema, dễ rollback và CI/CD.

---

## 2) Database Schema đề xuất (Supabase/PostgreSQL)

### 2.1 Thực thể chính
- `profiles`: hồ sơ người dùng.
- `trips`: chuyến đi Đà Lạt.
- `trip_members`: thành viên tham gia chuyến.
- `trip_days`: từng ngày trong lịch trình.
- `places`: danh mục địa điểm (POI).
- `itinerary_items`: mục lịch trình theo ngày/giờ.
- `expenses`: quản lý chi phí.
- `weather_snapshots`: cache thời tiết phục vụ cảnh báo mưa.

### 2.2 ERD quan hệ (mô tả)
- Một `profile` có nhiều `trips` (owner).
- Một `trip` có nhiều `trip_days`, `trip_members`, `itinerary_items`, `expenses`.
- Một `itinerary_item` có thể gắn 1 `place`.
- Một `trip_day` thuộc về 1 `trip`.

---

## 3) SQL Schema mẫu (có thể dùng trực tiếp cho migration)

```sql
-- 0001_init_extensions.sql
create extension if not exists "pgcrypto";

-- 0002_core_tables.sql
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	full_name text,
	avatar_url text,
	phone text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists public.trips (
	id uuid primary key default gen_random_uuid(),
	owner_id uuid not null references public.profiles(id) on delete cascade,
	name text not null,
	description text,
	start_date date not null,
	end_date date not null,
	status text not null default 'planning' check (status in ('planning','ongoing','completed','cancelled')),
	budget_total numeric(14,2) not null default 0,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint trips_date_check check (end_date >= start_date)
);

create table if not exists public.trip_members (
	id uuid primary key default gen_random_uuid(),
	trip_id uuid not null references public.trips(id) on delete cascade,
	user_id uuid not null references public.profiles(id) on delete cascade,
	role text not null default 'member' check (role in ('owner','editor','viewer','member')),
	joined_at timestamptz not null default now(),
	unique (trip_id, user_id)
);

create table if not exists public.trip_days (
	id uuid primary key default gen_random_uuid(),
	trip_id uuid not null references public.trips(id) on delete cascade,
	day_index int not null check (day_index > 0),
	date date not null,
	note text,
	unique (trip_id, day_index),
	unique (trip_id, date)
);

create table if not exists public.places (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	slug text unique,
	category text not null check (category in ('cafe','food','sightseeing','hotel','shopping','other')),
	address text,
	ward text,
	latitude double precision not null,
	longitude double precision not null,
	opening_hours text,
	price_range_min numeric(12,2),
	price_range_max numeric(12,2),
	best_time text,
	is_featured boolean not null default false,
	created_by uuid references public.profiles(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint places_price_check check (
		price_range_min is null or price_range_max is null or price_range_max >= price_range_min
	)
);

create table if not exists public.itinerary_items (
	id uuid primary key default gen_random_uuid(),
	trip_id uuid not null references public.trips(id) on delete cascade,
	trip_day_id uuid not null references public.trip_days(id) on delete cascade,
	place_id uuid references public.places(id) on delete set null,
	title text not null,
	description text,
	start_time time,
	end_time time,
	transport text,
	estimated_cost numeric(14,2) not null default 0,
	sort_order int not null default 0,
	status text not null default 'planned' check (status in ('planned','visited','skipped')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint itinerary_time_check check (end_time is null or start_time is null or end_time >= start_time)
);

create table if not exists public.expenses (
	id uuid primary key default gen_random_uuid(),
	trip_id uuid not null references public.trips(id) on delete cascade,
	paid_by uuid references public.profiles(id) on delete set null,
	category text not null check (category in ('transport','hotel','food','ticket','shopping','other')),
	amount numeric(14,2) not null check (amount >= 0),
	note text,
	spent_at timestamptz not null default now(),
	created_at timestamptz not null default now()
);

create table if not exists public.weather_snapshots (
	id uuid primary key default gen_random_uuid(),
	trip_id uuid references public.trips(id) on delete cascade,
	snapshot_date date not null,
	location_name text not null default 'Da Lat',
	temp_c numeric(5,2),
	humidity int,
	rain_probability int,
	weather_main text,
	source text not null default 'openweathermap',
	fetched_at timestamptz not null default now()
);

create index if not exists idx_trips_owner_id on public.trips(owner_id);
create index if not exists idx_trip_days_trip_id on public.trip_days(trip_id);
create index if not exists idx_itinerary_trip_id on public.itinerary_items(trip_id);
create index if not exists idx_itinerary_trip_day_id on public.itinerary_items(trip_day_id);
create index if not exists idx_expenses_trip_id on public.expenses(trip_id);
create index if not exists idx_places_category on public.places(category);
create index if not exists idx_places_location on public.places(latitude, longitude);

-- 0003_rls_policies.sql
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_days enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.expenses enable row level security;
alter table public.weather_snapshots enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

create policy "trips_select_member"
on public.trips for select
using (
	owner_id = auth.uid() or exists (
		select 1 from public.trip_members tm
		where tm.trip_id = trips.id and tm.user_id = auth.uid()
	)
);

create policy "trips_insert_owner"
on public.trips for insert
with check (owner_id = auth.uid());

create policy "trips_update_owner_or_editor"
on public.trips for update
using (
	owner_id = auth.uid() or exists (
		select 1 from public.trip_members tm
		where tm.trip_id = trips.id
			and tm.user_id = auth.uid()
			and tm.role in ('owner','editor')
	)
);

create policy "trip_members_select_member"
on public.trip_members for select
using (
	exists (
		select 1 from public.trip_members tm
		where tm.trip_id = trip_members.trip_id and tm.user_id = auth.uid()
	) or exists (
		select 1 from public.trips t
		where t.id = trip_members.trip_id and t.owner_id = auth.uid()
	)
);

-- Tương tự cho trip_days, itinerary_items, expenses, weather_snapshots
-- theo cùng điều kiện "người dùng là owner/member của trip".
```

---

## 4) Chuẩn dữ liệu POI (theo yêu cầu của bạn)

```ts
type POI = {
	id: string;
	name: string;                // Ví dụ: Chợ Đà Lạt
	category: 'cafe' | 'food' | 'sightseeing' | 'hotel' | 'shopping' | 'other';
	coordinate: {
		lat: number;
		lng: number;
	};
	best_time: string;
	status: 'planned' | 'visited' | 'not_visited';
};
```

---

## 5) Gợi ý mapping tính năng ↔ bảng
- Real-time Weather → `weather_snapshots` + cron job gọi API theo `trip_date`.
- Interactive Map → `places` + `itinerary_items` (vẽ marker và route).
- Distance Calculator → dùng `latitude/longitude` từ `places`, tính bằng Haversine trong `lib/utils/distance.ts`.

---

## 6) MVP ưu tiên triển khai
1. Auth + `profiles`.
2. CRUD `trips`, `trip_days`, `itinerary_items`.
3. Danh mục `places` + bản đồ.
4. `expenses` + tổng ngân sách.
5. Weather cảnh báo mưa theo ngày.

1. Cấu trúc và Tính năng (Web Architecture)
Nếu bạn đang nghĩ về cách vận hành của web:

CMS (Content Management System): Hệ quản trị nội dung (để bạn đăng bài viết, hình ảnh về Đà Lạt dễ dàng).

UI/UX Design: Giao diện (User Interface) và Trải nghiệm người dùng (User Experience).

Responsive Design: Thiết kế tương thích (để xem trên điện thoại khi đang vi vu Hồ Tuyền Lâm vẫn mượt).

API Integration: Tích hợp API (ví dụ: lấy dữ liệu thời tiết Đà Lạt thực tế hoặc Google Maps).

2. Thông số dữ liệu du lịch (Metadata & Logistics)
Nếu bạn đang muốn quản lý các "thông số" cụ thể của chuyến đi:

Itinerary: Lịch trình chi tiết theo từng mốc thời gian.

POI (Point of Interest): Các điểm tham quan đáng chú ý (Tiệm cà phê, thác nước, homestay).

Check-in/Check-out: Thời gian nhận/trả phòng.

Budget Tracking: Theo dõi ngân sách và chi phí dự kiến.

Geolocation/Coordinates: Tọa độ địa lý (Kinh độ/Vĩ độ) của các địa điểm.

3. Tối ưu hóa và Kỹ thuật (Technical Specs)
Có thể bạn đang muốn nói đến:

SEO (Search Engine Optimization): Để trang web của bạn dễ tìm thấy trên Google.

Load Speed / Performance: Tốc độ tải trang.

Sitemap: Sơ đồ trang web.

# TripDalat Project - Development Plan (Non-Supabase)

## 1. Project Overview
- **Core:** Ứng dụng quản lý lịch trình du lịch Đà Lạt (Trip Planner).
- **Tech Stack:** Next.js (App Router), Tailwind CSS, Framer Motion, Lucide Icons.
- **Data Handling:** Fetching via REST API / Local Storage (Tùy giai đoạn).
- **Style:** Minimalism, Aesthetic, "Chill" Đà Lạt vibe.

## 2. Updated Folder Structure
(Giữ nguyên cấu trúc App Router nhưng loại bỏ phần Supabase)
- `src/services/`: Dùng để viết các hàm fetch API (Weather, POI, Places).
- `src/store/`: (Nếu dùng Zustand/Redux) Để quản lý trạng thái chuyến đi toàn cục.
- `src/hooks/`: Chứa các custom hooks như `useWeather`, `useItinerary`.

## 3. Key Feature Specifications (For AI Follow)

### A. Itinerary & Timeline
- Hiển thị lịch trình theo dạng "Trục thời gian" (Vertical Timeline).
- Mỗi mục (ItineraryItem) cần có: Thời gian, Địa điểm, Ghi chú, Icon loại hình (Cafe, Ăn uống, Tham quan).
- Tính năng: Thêm/Xóa/Sửa các điểm đến trong list.

### B. POI (Points of Interest) Data
- Dữ liệu địa điểm cần có: `name`, `category`, `coordinates`, `best_time`.
- Phân loại: Cafe, Food, Sightseeing, Hotel.

### C. Weather & Logistics
- Tích hợp OpenWeatherMap API để lấy thời tiết Đà Lạt.
- Tự động gợi ý: "Nên mang theo áo mưa" nếu dự báo có mưa.

## 4. Coding Principles
- **Component-Driven:** Tách nhỏ các UI components (Button, Card, Input).
- **Aesthetic UI:** - Sử dụng Soft Shadows (`shadow-sm`).
  - Bo góc lớn (`rounded-2xl` hoặc `rounded-3xl`).
  - Màu sắc: Sage Green (#7A9D8C), Warm Wood (#A67B5B), Sand (#F4F1EA).
- **Client-side Logic:** Ưu tiên xử lý mượt mà các tương tác người dùng (animations).

## 5. Current Priority
1. Hoàn thiện Layout Dashboard (Sidebar + Header).
2. Code Component `ItineraryTimeline.tsx` với dữ liệu mẫu (Mock data).
3. Code `WeatherWidget.tsx` hiển thị nhiệt độ thực tế tại Đà Lạt.