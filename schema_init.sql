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

-- Permitimos que cualquier usuario autenticado pueda insertar notificaciones
-- (Esencial para que un empleador le inserte una notif a un candidato, o viceversa)
create policy "Cualquiera puede insertar notificaciones" on public.notifications
  for insert with check (auth.role() = 'authenticated');

-- Indexar para optimizar cargas rápidas y ordenación
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_created_at on public.notifications(created_at desc);
create index idx_notifications_unread on public.notifications(user_id) where is_read = false;
-- 010_add_fcm_token.sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fcm_token text;
-- 1. Agregamos las columnas a los perfiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_until timestamptz;

-- Si ya existen perfiles viejos, les damos 30 días de gracia a partir de hoy (opcional)
-- UPDATE public.profiles SET free_until = now() + interval '30 days' WHERE free_until IS NULL;

-- 2. Creamos la tabla de transacciones de créditos
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('purchase', 'usage', 'admin_promo', 'courtesy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount integer NOT NULL,
    reference_id text,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Habilitamos RLS en transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can view their own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Modificamos el trigger de nuevos usuarios para dar 30 días gratis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_employer boolean;
  final_user_type text;
BEGIN
  -- Check multiple possible metadata fields and values
  is_employer := (
    coalesce(new.raw_user_meta_data ->> 'user_type', '') IN ('BUSINESS', 'employer') OR
    coalesce(new.raw_user_meta_data ->> 'role', '') IN ('BUSINESS', 'employer')
  );

  final_user_type := case when is_employer then 'BUSINESS' else 'TALENT' end;

  insert into public.profiles (id, user_type, full_name, profile_photo, company_logo, free_until)
  values (
    new.id,
    final_user_type,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    case when not is_employer then new.raw_user_meta_data ->> 'avatar_url' else null end,
    case when is_employer then new.raw_user_meta_data ->> 'avatar_url' else null end,
    now() + interval '30 days' -- 30 días de prueba gratuita para cuentas nuevas
  )
  on conflict (id) do update set
    user_type = case 
      when profiles.user_type is null or profiles.user_type = 'TALENT' 
      then excluded.user_type 
      else profiles.user_type 
    end,
    full_name = coalesce(profiles.full_name, excluded.full_name),
    profile_photo = case when profiles.profile_photo is null then excluded.profile_photo else profiles.profile_photo end,
    company_logo = case when profiles.company_logo is null then excluded.company_logo else profiles.company_logo end,
    free_until = excluded.free_until;
  return new;
END;
$$;

-- 4. RPC para descontar créditos atómicamente al publicar un trabajo
CREATE OR REPLACE FUNCTION deduct_credit_for_job(user_uid uuid, job_uid uuid, amount int default 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits int;
    is_free boolean;
BEGIN
    -- Verificar si está en periodo de prueba
    SELECT (free_until IS NOT NULL AND free_until > now()) INTO is_free
    FROM profiles
    WHERE id = user_uid;

    IF is_free THEN
        RETURN true; -- Es gratis, no descontar
    END IF;

    -- Verificar los créditos actuales y bloquear la fila para evitar race conditions
    SELECT credits INTO current_credits
    FROM profiles
    WHERE id = user_uid
    FOR UPDATE;

    IF current_credits >= amount THEN
        -- Descontar el crédito
        UPDATE profiles
        SET credits = credits - amount
        WHERE id = user_uid;

        -- Registrar la transacción
        INSERT INTO transactions (user_id, type, amount, reference_id, description)
        VALUES (user_uid, 'usage', -amount, job_uid::text, 'Publicación de aviso (' || job_uid::text || ')');

        RETURN true;
    ELSE
        RETURN false; -- Saldo insuficiente
    END IF;
END;
$$;
-- scripts/012_urgent_credits.sql

-- 1. Añadir la columna para rastrear los créditos de búsquedas urgentes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS urgent_credits INTEGER DEFAULT 0;

-- 2. Eliminar la versión anterior si existía para crear la nueva con 2 parámetros
DROP FUNCTION IF EXISTS deduct_credit_for_job(uuid);

-- 3. Crear la nueva función RPC segura
CREATE OR REPLACE FUNCTION deduct_credit_for_job_v2(p_user_id UUID, p_is_urgent BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits INT;
  v_urgent_credits INT;
  v_free_until TIMESTAMPTZ;
  v_is_trial BOOLEAN;
BEGIN
  -- Obtener saldos y periodo de prueba
  SELECT credits, urgent_credits, free_until
  INTO v_credits, v_urgent_credits, v_free_until
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE; -- Bloqueo preventivo de concurrencia
  
  v_is_trial := (v_free_until IS NOT NULL AND v_free_until > NOW());
  
  -- Regla 1: Si no es trial, debe tener créditos normales.
  IF (NOT v_is_trial AND v_credits <= 0) THEN
    RETURN FALSE;
  END IF;

  -- Regla 2: Si quiere publicar urgente, DEDICA un crédito urgente (incluso en Trial)
  IF (p_is_urgent AND v_urgent_credits <= 0) THEN
    RETURN FALSE;
  END IF;
  
  -- Ejecutar deducciones
  IF (NOT v_is_trial) THEN
    UPDATE public.profiles
    SET credits = credits - 1
    WHERE id = p_user_id;
  END IF;

  IF (p_is_urgent) THEN
    UPDATE public.profiles
    SET urgent_credits = urgent_credits - 1
    WHERE id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$;
-- Agregar la política de borrado que faltaba para la tabla notifications
create policy "Los usuarios pueden borrar sus notificaciones" on public.notifications
  for delete using (auth.uid() = user_id);
