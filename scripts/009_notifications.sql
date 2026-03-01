-- Eliminar tabla antigua si existe
drop table if exists public.notifications cascade;

-- Crear tabla notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('match', 'message', 'application_update', 'system')),
  title text not null,
  description text not null,
  link_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Habilitar Row Level Security (RLS)
alter table public.notifications enable row level security;

-- Políticas de seguridad
create policy "Los usuarios solo ven sus notificaciones" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus notificaciones" on public.notifications
  for update using (auth.uid() = user_id);

-- Para que el servidor (Service Role) pueda insertar (bypass RLS local) o si se hace por RPC.
-- Permite inserts locales temporalmente si auth es dueño (aunque idealmente lo hace un Service Role)
create policy "Insert notifications" on public.notifications
  for insert with check (auth.uid() = user_id or true);

-- Indexar para optimizar cargas rápidas y ordenación
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_created_at on public.notifications(created_at desc);
create index idx_notifications_unread on public.notifications(user_id) where is_read = false;
