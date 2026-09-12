-- Guyane Cultures — multi-tenant schema (farm isolation + RLS)
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

-- ——— Farms & membership ———
create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.farm_members (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (farm_id, user_id)
);

create index if not exists farm_members_user_idx on public.farm_members(user_id);
create index if not exists farm_members_farm_idx on public.farm_members(farm_id);

-- Auto-add creator as owner
create or replace function public.handle_new_farm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.farm_members (farm_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (farm_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_farm_created on public.farms;
create trigger on_farm_created
  after insert on public.farms
  for each row execute function public.handle_new_farm();

-- Membership helper (security definer to avoid RLS recursion)
create or replace function public.is_farm_member(p_farm_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.farm_members
    where farm_id = p_farm_id and user_id = auth.uid()
  );
$$;

grant execute on function public.is_farm_member(uuid) to authenticated;

-- ——— Domain tables (all farm_id scoped) ———
create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  surface numeric not null default 0,
  soil_type text not null default 'Mixte',
  status text not null default 'libre',
  created_at timestamptz not null default now()
);

create table if not exists public.crop_types (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  nursery_days int not null default 0,
  growth_days int not null default 0,
  harvest_days int not null default 0,
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.preparations (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  parcel_id uuid references public.parcels(id) on delete set null,
  type text not null,
  method text not null default 'Manuel',
  status text not null default 'planifié',
  start_date date,
  end_date date,
  notes text default '',
  created_at timestamptz not null default now()
);

-- Nursery / semis stage (progression thread)
create table if not exists public.nurseries (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  parcel_id uuid references public.parcels(id) on delete set null,
  crop_type_id uuid references public.crop_types(id) on delete set null,
  start_date date,
  end_date date,
  plants_count int default 0,
  status text not null default 'actif',
  notes text default '',
  created_at timestamptz not null default now()
);

-- Planting → harvest (links optional nursery for continuous history)
create table if not exists public.cultures (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  parcel_id uuid references public.parcels(id) on delete set null,
  crop_type_id uuid references public.crop_types(id) on delete set null,
  nursery_id uuid references public.nurseries(id) on delete set null,
  phase text not null default 'nursery',
  plants_count int default 0,
  surface_used numeric,
  nursery_start date,
  plant_date date,
  harvest_start date,
  harvest_end date,
  status text not null default 'actif',
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.product_stock (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  category text not null default 'engrais',
  unit text not null default 'kg',
  stock numeric not null default 0,
  stock_max numeric not null default 0,
  notes text default '',
  created_at timestamptz not null default now()
);

-- Treatment applications (history for Gantt)
create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  product_stock_id uuid references public.product_stock(id) on delete set null,
  parcel_id uuid references public.parcels(id) on delete set null,
  culture_id uuid references public.cultures(id) on delete set null,
  date date,
  quantity numeric not null default 0,
  notes text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.failures (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  culture_id uuid references public.cultures(id) on delete set null,
  parcel_id uuid references public.parcels(id) on delete set null,
  crop_type_id uuid references public.crop_types(id) on delete set null,
  reason text not null,
  date date,
  plants_lost int default 0,
  surface_lost numeric default 0,
  loss_euro numeric default 0,
  description text default '',
  corrective text default '',
  created_at timestamptz not null default now()
);

create index if not exists parcels_farm_idx on public.parcels(farm_id);
create index if not exists crop_types_farm_idx on public.crop_types(farm_id);
create index if not exists preparations_farm_idx on public.preparations(farm_id);
create index if not exists nurseries_farm_idx on public.nurseries(farm_id);
create index if not exists cultures_farm_idx on public.cultures(farm_id);
create index if not exists cultures_dates_idx on public.cultures(farm_id, nursery_start, plant_date, harvest_start);
create index if not exists product_stock_farm_idx on public.product_stock(farm_id);
create index if not exists treatments_farm_idx on public.treatments(farm_id);
create index if not exists failures_farm_idx on public.failures(farm_id);

-- ——— RLS ———
alter table public.farms enable row level security;
alter table public.farm_members enable row level security;
alter table public.parcels enable row level security;
alter table public.crop_types enable row level security;
alter table public.preparations enable row level security;
alter table public.nurseries enable row level security;
alter table public.cultures enable row level security;
alter table public.product_stock enable row level security;
alter table public.treatments enable row level security;
alter table public.failures enable row level security;

-- Farms
drop policy if exists farms_select on public.farms;
create policy farms_select on public.farms for select to authenticated
  using (public.is_farm_member(id));

drop policy if exists farms_insert on public.farms;
create policy farms_insert on public.farms for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists farms_update on public.farms;
create policy farms_update on public.farms for update to authenticated
  using (public.is_farm_member(id))
  with check (public.is_farm_member(id));

drop policy if exists farms_delete on public.farms;
create policy farms_delete on public.farms for delete to authenticated
  using (created_by = auth.uid());

-- Farm members
drop policy if exists farm_members_select on public.farm_members;
create policy farm_members_select on public.farm_members for select to authenticated
  using (public.is_farm_member(farm_id) or user_id = auth.uid());

drop policy if exists farm_members_insert on public.farm_members;
create policy farm_members_insert on public.farm_members for insert to authenticated
  with check (
    user_id = auth.uid()
    or public.is_farm_member(farm_id)
  );

drop policy if exists farm_members_delete on public.farm_members;
create policy farm_members_delete on public.farm_members for delete to authenticated
  using (public.is_farm_member(farm_id));

-- Generic farm-scoped CRUD macro via repeated policies
do $$
declare
  t text;
begin
  foreach t in array array[
    'parcels', 'crop_types', 'preparations', 'nurseries',
    'cultures', 'product_stock', 'treatments', 'failures'
  ]
  loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format(
      'create policy %I_select on public.%I for select to authenticated using (public.is_farm_member(farm_id))',
      t, t
    );
    execute format('drop policy if exists %I_insert on public.%I', t, t);
    execute format(
      'create policy %I_insert on public.%I for insert to authenticated with check (public.is_farm_member(farm_id))',
      t, t
    );
    execute format('drop policy if exists %I_update on public.%I', t, t);
    execute format(
      'create policy %I_update on public.%I for update to authenticated using (public.is_farm_member(farm_id)) with check (public.is_farm_member(farm_id))',
      t, t
    );
    execute format('drop policy if exists %I_delete on public.%I', t, t);
    execute format(
      'create policy %I_delete on public.%I for delete to authenticated using (public.is_farm_member(farm_id))',
      t, t
    );
  end loop;
end $$;
