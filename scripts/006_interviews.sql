-- Create interviews table
create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references auth.users(id) on delete cascade,
  employer_id uuid not null references auth.users(id) on delete cascade,
  scheduled_at timestamptz,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.interviews enable row level security;

-- Candidates can see their interviews
create policy "Candidates can view own interviews" on public.interviews
  for select using (auth.uid() = candidate_id);

-- Employers can see their interviews
create policy "Employers can view own interviews" on public.interviews
  for select using (auth.uid() = employer_id);

-- Employers can create interviews
create policy "Employers can create interviews" on public.interviews
  for insert with check (auth.uid() = employer_id);

-- Employers can update interviews
create policy "Employers can update interviews" on public.interviews
  for update using (auth.uid() = employer_id);

-- Candidates can update interviews (confirm/cancel)
create policy "Candidates can update interview status" on public.interviews
  for update using (auth.uid() = candidate_id);

-- Indexes
create index if not exists idx_interviews_candidate on public.interviews(candidate_id);
create index if not exists idx_interviews_employer on public.interviews(employer_id);
create index if not exists idx_interviews_job on public.interviews(job_id);
