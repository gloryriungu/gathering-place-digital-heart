ALTER FUNCTION public.generate_order_number() SET search_path = public;
ALTER FUNCTION public.generate_ticket_number() SET search_path = public;
ALTER FUNCTION public.get_dashboard_stats() SET search_path = public;
ALTER FUNCTION public.update_cookie_updated_at() SET search_path = public;

DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.get_pastor_activity_summary(uuid) TO authenticated;