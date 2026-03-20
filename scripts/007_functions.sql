-- Haversine distance function (returns km)
create or replace function public.haversine_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
)
returns double precision
language plpgsql
immutable
as $$
declare
  r constant double precision := 6371;
  dlat double precision;
  dlon double precision;
  a double precision;
begin
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat / 2) ^ 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ^ 2;
  return r * 2 * asin(sqrt(a));
end;
$$;

-- Increment job views function
create or replace function public.increment_job_views(job_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.jobs
  set views_count = views_count + 1
  where id = job_uuid;
end;
$$;

-- Increment job applications count function
create or replace function public.increment_job_applications(job_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.jobs
  set applications_count = applications_count + 1
  where id = job_uuid;
end;
$$;

-- Updated at trigger function
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger to relevant tables
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists update_jobs_updated_at on public.jobs;
create trigger update_jobs_updated_at
  before update on public.jobs
  for each row execute function public.update_updated_at();

drop trigger if exists update_applications_updated_at on public.job_applications;
create trigger update_applications_updated_at
  before update on public.job_applications
  for each row execute function public.update_updated_at();

drop trigger if exists update_interviews_updated_at on public.interviews;
create trigger update_interviews_updated_at
  before update on public.interviews
  for each row execute function public.update_updated_at();

-- Create storage buckets (if not exists)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can view avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update own avatars" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view documents" on storage.objects
  for select using (bucket_id = 'documents');

create policy "Authenticated users can upload documents" on storage.objects
  for insert with check (bucket_id = 'documents' and auth.role() = 'authenticated');

create policy "Users can update own documents" on storage.objects
  for update using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
