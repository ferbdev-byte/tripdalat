create table if not exists public.itinerary_swap_logs (
  id uuid primary key default gen_random_uuid(),
  itinerary_item_id uuid not null references public.itinerary_items(id) on delete cascade,
  old_place_id uuid not null references public.places(id) on delete restrict,
  new_place_id uuid not null references public.places(id) on delete restrict,
  reason text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_itinerary_swap_logs_item_id
on public.itinerary_swap_logs (itinerary_item_id);

create index if not exists idx_itinerary_swap_logs_created_at
on public.itinerary_swap_logs (created_at desc);

alter table public.itinerary_swap_logs enable row level security;

create policy "swap_logs_select_member"
on public.itinerary_swap_logs
for select
using (
  exists (
    select 1
    from public.itinerary_items ii
    join public.trips t on t.id = ii.trip_id
    where ii.id = itinerary_swap_logs.itinerary_item_id
      and (
        t.owner_id = auth.uid()
        or exists (
          select 1
          from public.trip_members tm
          where tm.trip_id = t.id
            and tm.user_id = auth.uid()
        )
      )
  )
);
