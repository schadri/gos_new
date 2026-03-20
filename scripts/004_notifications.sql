-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text,
  message text,
  link text,
  related_id uuid,
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

-- System and users can insert notifications (for matching engine)
create policy "Authenticated users can insert notifications" on public.notifications
  for insert with check (true);

-- Users can update own notifications (mark read)
create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Users can delete own notifications
create policy "Users can delete own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

-- Index
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(user_id, read);
