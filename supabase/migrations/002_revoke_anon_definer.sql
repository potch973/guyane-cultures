-- Revoke public/anon EXECUTE on SECURITY DEFINER helpers
revoke all on function public.handle_new_farm() from public, anon, authenticated;
revoke all on function public.is_farm_member(uuid) from public, anon;

-- Authenticated may call membership helper (used by RLS policies)
grant execute on function public.is_farm_member(uuid) to authenticated;

-- Trigger function: not callable via API; only owner/postgres + trigger
grant execute on function public.handle_new_farm() to postgres;
