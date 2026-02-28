-- Create chats table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  participant_1 uuid not null references auth.users(id) on delete cascade,
  participant_2 uuid not null references auth.users(id) on delete cascade,
  related_job_id uuid references public.jobs(id) on delete set null,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.chats enable row level security;

-- Participants can view their chats
create policy "Participants can view own chats" on public.chats
  for select using (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Authenticated users can create chats
create policy "Authenticated users can create chats" on public.chats
  for insert with check (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Participants can update their chats
create policy "Participants can update own chats" on public.chats
  for update using (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.messages enable row level security;

-- Participants can view messages in their chats
create policy "Participants can view chat messages" on public.messages
  for select using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and (chats.participant_1 = auth.uid() or chats.participant_2 = auth.uid())
    )
  );

-- Participants can insert messages in their chats
create policy "Participants can send messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and (chats.participant_1 = auth.uid() or chats.participant_2 = auth.uid())
    )
  );

-- Participants can update messages (mark read)
create policy "Participants can update messages" on public.messages
  for update using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and (chats.participant_1 = auth.uid() or chats.participant_2 = auth.uid())
    )
  );

-- Indexes
create index if not exists idx_chats_participant_1 on public.chats(participant_1);
create index if not exists idx_chats_participant_2 on public.chats(participant_2);
create index if not exists idx_messages_chat on public.messages(chat_id);

-- Enable realtime for messages
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;
