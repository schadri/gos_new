-- Create jobs table
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  title text,
  company text,
  category text,
  location text,
  latitude double precision,
  longitude double precision,
  search_radius integer default 50,
  keywords text[] default '{}',
  salary_range text,
  contract_type text,
  experience_required text,
  description text,
  status text default 'active' check (status in ('active', 'closed', 'draft')),
  views_count integer default 0,
  applications_count integer default 0,
  contacted_count integer default 0,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.jobs enable row level security;

-- Policies
create policy "Anyone can view active jobs" on public.jobs
  for select using (status = 'active' or auth.uid() = created_by);

create policy "Authenticated users can insert jobs" on public.jobs
  for insert with check (auth.uid() = created_by);

create policy "Owners can update own jobs" on public.jobs
  for update using (auth.uid() = created_by);

create policy "Owners can delete own jobs" on public.jobs
  for delete using (auth.uid() = created_by);

-- Index for faster queries
create index if not exists idx_jobs_status on public.jobs(status);
create index if not exists idx_jobs_created_by on public.jobs(created_by);
create index if not exists idx_jobs_category on public.jobs(category);
