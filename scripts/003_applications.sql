-- Create job applications table
create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'reviewed', 'interview', 'accepted', 'rejected')),
  cover_letter text,
  years_experience integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, applicant_id)
);

-- Enable RLS
alter table public.job_applications enable row level security;

-- Applicant can see their own applications
create policy "Applicants can view own applications" on public.job_applications
  for select using (auth.uid() = applicant_id);

-- Job owners can view applications for their jobs
create policy "Job owners can view applications" on public.job_applications
  for select using (
    exists (
      select 1 from public.jobs
      where jobs.id = job_applications.job_id
      and jobs.created_by = auth.uid()
    )
  );

-- Applicants can insert their own applications
create policy "Applicants can insert applications" on public.job_applications
  for insert with check (auth.uid() = applicant_id);

-- Job owners can update application status
create policy "Job owners can update application status" on public.job_applications
  for update using (
    exists (
      select 1 from public.jobs
      where jobs.id = job_applications.job_id
      and jobs.created_by = auth.uid()
    )
  );

-- Applicants can update their own applications
create policy "Applicants can update own applications" on public.job_applications
  for update using (auth.uid() = applicant_id);

-- Indexes
create index if not exists idx_applications_job on public.job_applications(job_id);
create index if not exists idx_applications_applicant on public.job_applications(applicant_id);
