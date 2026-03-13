insert into public.places (
  name,
  slug,
  category,
  address,
  ward,
  latitude,
  longitude,
  best_time,
  is_featured,
  is_indoor
)
values
  (
    'Tú Mơ To',
    'tu-mo-to',
    'cafe',
    'Hẻm 31 Sào Nam, Phường 11, Đà Lạt',
    'Phường 11',
    11.9666,
    108.4552,
    'Sáng - Chiều',
    true,
    true
  ),
  (
    'Lululola',
    'lululola',
    'cafe',
    'Đường 3/4, Phường 3, Đà Lạt',
    'Phường 3',
    11.9309,
    108.4275,
    'Chiều - Tối',
    true,
    true
  ),
  (
    'Nhà hàng Memory Đà Lạt',
    'nha-hang-memory-da-lat',
    'food',
    '24/7 Hùng Vương, Phường 10, Đà Lạt',
    'Phường 10',
    11.9492,
    108.4664,
    'Trưa - Tối',
    false,
    true
  ),
  (
    'Cây thông cô đơn',
    'cay-thong-co-don',
    'sightseeing',
    'Suối Vàng, Lạc Dương, Lâm Đồng',
    'Lạc Dương',
    12.0724,
    108.4431,
    'Sáng sớm',
    true,
    false
  ),
  (
    'Săn mây Cầu Đất',
    'san-may-cau-dat',
    'sightseeing',
    'Xuân Trường, Đà Lạt, Lâm Đồng',
    'Xuân Trường',
    11.8664,
    108.5684,
    'Sáng sớm',
    true,
    false
  )
on conflict (slug)
do update set
  name = excluded.name,
  category = excluded.category,
  address = excluded.address,
  ward = excluded.ward,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  best_time = excluded.best_time,
  is_featured = excluded.is_featured,
  is_indoor = excluded.is_indoor;

update public.places set is_indoor = true where name in ('Tú Mơ To', 'Lululola');
update public.places set is_indoor = false where name in ('Cây thông cô đơn', 'Săn mây Cầu Đất');
