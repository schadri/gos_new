-- Agregar la política de borrado que faltaba para la tabla notifications
create policy "Los usuarios pueden borrar sus notificaciones" on public.notifications
  for delete using (auth.uid() = user_id);
