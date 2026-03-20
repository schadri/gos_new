-- Create chats table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  employer_id uuid not null references auth.users(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, employer_id, applicant_id)
);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Policies for chats
create policy "Users can view their own chats" on public.chats
  for select using (auth.uid() = employer_id or auth.uid() = applicant_id);

create policy "Users can insert their own chats" on public.chats
  for insert with check (auth.uid() = employer_id or auth.uid() = applicant_id);

-- Policies for messages
create policy "Users can view messages of their chats" on public.messages
  for select using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and (chats.employer_id = auth.uid() or chats.applicant_id = auth.uid())
    )
  );

create policy "Users can insert messages to their chats" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and (chats.employer_id = auth.uid() or chats.applicant_id = auth.uid())
    )
  );

-- Indexes
create index if not exists idx_chats_employer on public.chats(employer_id);
create index if not exists idx_chats_applicant on public.chats(applicant_id);
create index if not exists idx_messages_chat on public.messages(chat_id);
create index if not exists idx_messages_created_at on public.messages(created_at);
