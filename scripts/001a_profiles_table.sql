create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text not null default 'TALENT' check (user_type in ('TALENT', 'BUSINESS')),
  full_name text,
  profile_photo text,
  position text[] default '{}',
  keywords text[] default '{}',
  cv_url text,
  match_message text,
  company_name text,
  city text,
  company_description text,
  company_logo text,
  location text,
  latitude double precision,
  longitude double precision,
  search_radius integer default 50,
  has_alternative_location boolean default false,
  alternative_location text,
  alternative_latitude double precision,
  alternative_longitude double precision,
  alternative_search_radius integer default 50,
  status text default 'active',
  notification_settings jsonb default '{"job_match": true, "application_update": true, "profile_viewed": true, "updates": true}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Anyone can view profiles" on public.profiles;
create policy "Anyone can view profiles" on public.profiles
  for select using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile" on public.profiles
  for delete using (auth.uid() = id);
