alter table public.places
add column if not exists is_indoor boolean not null default false;

comment on column public.places.is_indoor is
'Đánh dấu địa điểm indoor (true) hoặc outdoor (false) để gợi ý phương án khi mưa.';

create index if not exists idx_places_is_indoor
on public.places (is_indoor);
