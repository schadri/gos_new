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
