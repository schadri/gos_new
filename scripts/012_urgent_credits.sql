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
