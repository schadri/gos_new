-- 010_add_fcm_token.sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fcm_token text;
