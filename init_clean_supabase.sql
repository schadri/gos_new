-- ==============================================================================
-- SCHEMA GOS: CREACIÓN COMPLETA PARA NUEVO ENTORNO SUPABASE
-- Ejecutar en el SQL Editor de tu nuevo proyecto Supabase.
-- ==============================================================================

-- 1. TIPOS DE DATOS PERSONALIZADOS
DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('purchase', 'usage', 'admin_promo', 'courtesy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. CREACIÓN DE TABLAS
-- ==============================================================================

-- PROFILES
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
  preferred_theme text default 'system',
  notification_settings jsonb default '{"job_match": true, "application_update": true, "profile_viewed": true, "updates": true}'::jsonb,
  fcm_token text,
  credits integer NOT NULL DEFAULT 0,
  urgent_credits integer NOT NULL DEFAULT 0,
  free_until timestamptz,
  is_active boolean default true,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount integer NOT NULL,
    reference_id text,
    description text,
    created_at timestamptz DEFAULT now()
);

-- JOBS
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
  is_urgent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- JOB APPLICATIONS
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

-- CHATS
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  employer_id uuid not null references auth.users(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  is_paused boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, employer_id, applicant_id)
);

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- NOTIFICATIONS
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

-- INTERVIEWS
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


-- ==============================================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.interviews enable row level security;


-- ==============================================================================
-- 4. POLÍTICAS DE SEGURIDAD (POLICIES)
-- ==============================================================================

-- PROFILES
create policy "Anyone can view profiles" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = id);

-- TRANSACTIONS
create policy "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);

-- JOBS
create policy "Anyone can view active jobs" on public.jobs for select using (status = 'active' or auth.uid() = created_by);
create policy "Authenticated users can insert jobs" on public.jobs for insert with check (auth.uid() = created_by);
create policy "Owners can update own jobs" on public.jobs for update using (auth.uid() = created_by);
create policy "Owners can delete own jobs" on public.jobs for delete using (auth.uid() = created_by);

-- JOB APPLICATIONS
create policy "Applicants can view own applications" on public.job_applications for select using (auth.uid() = applicant_id);
create policy "Job owners can view applications" on public.job_applications for select using (
  exists (select 1 from public.jobs where jobs.id = job_applications.job_id and jobs.created_by = auth.uid())
);
create policy "Applicants can insert applications" on public.job_applications for insert with check (auth.uid() = applicant_id);
create policy "Job owners can update application status" on public.job_applications for update using (
  exists (select 1 from public.jobs where jobs.id = job_applications.job_id and jobs.created_by = auth.uid())
);
create policy "Applicants can update own applications" on public.job_applications for update using (auth.uid() = applicant_id);

-- CHATS
create policy "Users can view their own chats" on public.chats for select using (auth.uid() = employer_id or auth.uid() = applicant_id);
create policy "Users can insert their own chats" on public.chats for insert with check (auth.uid() = employer_id or auth.uid() = applicant_id);

-- MESSAGES
create policy "Users can view messages of their chats" on public.messages for select using (
  exists (
    select 1 from public.chats
    where chats.id = messages.chat_id and (chats.employer_id = auth.uid() or chats.applicant_id = auth.uid())
  )
);
create policy "Users can insert messages to their chats" on public.messages for insert with check (
  auth.uid() = sender_id and
  exists (
    select 1 from public.chats
    where chats.id = messages.chat_id and (chats.employer_id = auth.uid() or chats.applicant_id = auth.uid())
  )
);

-- NOTIFICATIONS
create policy "Los usuarios solo ven sus notificaciones" on public.notifications for select using (auth.uid() = user_id);
create policy "Los usuarios pueden actualizar sus notificaciones" on public.notifications for update using (auth.uid() = user_id);
create policy "Los usuarios pueden borrar sus notificaciones" on public.notifications for delete using (auth.uid() = user_id);
create policy "Cualquiera puede insertar notificaciones" on public.notifications for insert with check (auth.role() = 'authenticated');

-- INTERVIEWS
create policy "Candidates can view own interviews" on public.interviews for select using (auth.uid() = candidate_id);
create policy "Employers can view own interviews" on public.interviews for select using (auth.uid() = employer_id);
create policy "Employers can create interviews" on public.interviews for insert with check (auth.uid() = employer_id);
create policy "Employers can update interviews" on public.interviews for update using (auth.uid() = employer_id);
create policy "Candidates can update interview status" on public.interviews for update using (auth.uid() = candidate_id);


-- ==============================================================================
-- 5. FUNCIONES Y TRIGGERS (RPCs y lógica automatizada)
-- ==============================================================================

-- Trigger: actualizador de 'updated_at'
create or replace function public.update_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at();
create trigger update_jobs_updated_at before update on public.jobs for each row execute function public.update_updated_at();
create trigger update_applications_updated_at before update on public.job_applications for each row execute function public.update_updated_at();
create trigger update_interviews_updated_at before update on public.interviews for each row execute function public.update_updated_at();
create trigger update_chats_updated_at before update on public.chats for each row execute function public.update_updated_at();


-- Trigger: creación automática de perfiles desde auth.users
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare
  is_employer boolean;
  final_user_type text;
begin
  is_employer := (
    coalesce(new.raw_user_meta_data ->> 'user_type', '') in ('BUSINESS', 'employer') or
    coalesce(new.raw_user_meta_data ->> 'role', '') in ('BUSINESS', 'employer')
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
    user_type = case when profiles.user_type is null or profiles.user_type = 'TALENT' then excluded.user_type else profiles.user_type end,
    full_name = coalesce(profiles.full_name, excluded.full_name),
    profile_photo = case when profiles.profile_photo is null then excluded.profile_photo else profiles.profile_photo end,
    company_logo = case when profiles.company_logo is null then excluded.company_logo else profiles.company_logo end,
    free_until = excluded.free_until;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();


-- Función (RPC): Descontar créditos para publicar trabajo
create or replace function deduct_credit_for_job_v2(p_user_id uuid, p_is_urgent boolean) returns boolean language plpgsql security definer as $$
declare
  v_credits int;
  v_urgent_credits int;
  v_free_until timestamptz;
  v_is_trial boolean;
begin
  select credits, urgent_credits, free_until into v_credits, v_urgent_credits, v_free_until
  from public.profiles where id = p_user_id for update; 
  
  v_is_trial := (v_free_until is not null and v_free_until > now());
  
  if (not v_is_trial and v_credits <= 0) then
    return false;
  end if;

  if (p_is_urgent and v_urgent_credits <= 0) then
    return false;
  end if;
  
  if (not v_is_trial) then
    update public.profiles set credits = credits - 1 where id = p_user_id;
  end if;

  if (p_is_urgent) then
    update public.profiles set urgent_credits = urgent_credits - 1 where id = p_user_id;
  end if;
  
  return true;
end;
$$;


-- Función (RPC): Haversine distance
create or replace function public.haversine_distance(
  lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision
) returns double precision language plpgsql immutable as $$
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


-- Función (RPC): Increment views
create or replace function public.increment_job_views(job_uuid uuid) returns void language plpgsql security definer as $$
begin
  update public.jobs set views_count = views_count + 1 where id = job_uuid;
end;
$$;


-- Función (RPC): Increment applications
create or replace function public.increment_job_applications(job_uuid uuid) returns void language plpgsql security definer as $$
begin
  update public.jobs set applications_count = applications_count + 1 where id = job_uuid;
end;
$$;


-- ==============================================================================
-- 6. REALTIME
-- ==============================================================================
-- Se puede habilitar supabase_realtime para las tablas requeridas. Por ejemplo:
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.chats;


-- ==============================================================================
-- 7. STORAGE BUCKETS Y SUS POLICIES
-- ==============================================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('documents', 'documents', true) on conflict (id) do nothing;

create policy "Anyone can view avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Authenticated users can upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Users can update own avatars" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view documents" on storage.objects for select using (bucket_id = 'documents');
create policy "Authenticated users can upload documents" on storage.objects for insert with check (bucket_id = 'documents' and auth.role() = 'authenticated');
create policy "Users can update own documents" on storage.objects for update using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- ==============================================================================
-- =============================== FIN DEL SCRIPT ===============================
-- ==============================================================================
