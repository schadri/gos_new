-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text not null check (user_type in ('TALENT', 'BUSINESS')),
  full_name text,
  profile_photo text,
  -- Talent fields
  position text[] default '{}',
  keywords text[] default '{}',
  cv_url text,
  match_message text,
  -- Business fields
  company_name text,
  city text,
  company_description text,
  company_logo text,
  -- Location
  location text,
  latitude double precision,
  longitude double precision,
  search_radius integer default 50,
  -- Alternative location
  has_alternative_location boolean default false,
  alternative_location text,
  alternative_latitude double precision,
  alternative_longitude double precision,
  alternative_search_radius integer default 50,
  -- Settings
  status text default 'active',
  notification_settings jsonb default '{"job_match": true, "application_update": true, "profile_viewed": true, "updates": true}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Anyone can view profiles" on public.profiles
  for select using (true);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can delete own profile" on public.profiles
  for delete using (auth.uid() = id);

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_employer boolean;
  final_user_type text;
begin
  -- Check multiple possible metadata fields and values
  is_employer := (
    coalesce(new.raw_user_meta_data ->> 'user_type', '') IN ('BUSINESS', 'employer') OR
    coalesce(new.raw_user_meta_data ->> 'role', '') IN ('BUSINESS', 'employer')
  );

  final_user_type := case when is_employer then 'BUSINESS' else 'TALENT' end;

  insert into public.profiles (id, user_type, full_name, profile_photo, company_logo)
  values (
    new.id,
    final_user_type,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    case when not is_employer then new.raw_user_meta_data ->> 'avatar_url' else null end,
    case when is_employer then new.raw_user_meta_data ->> 'avatar_url' else null end
  )
  on conflict (id) do update set
    user_type = case 
      when profiles.user_type is null or profiles.user_type = 'TALENT' 
      then excluded.user_type 
      else profiles.user_type 
    end,
    full_name = coalesce(profiles.full_name, excluded.full_name),
    profile_photo = case when profiles.profile_photo is null then excluded.profile_photo else profiles.profile_photo end,
    company_logo = case when profiles.company_logo is null then excluded.company_logo else profiles.company_logo end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
