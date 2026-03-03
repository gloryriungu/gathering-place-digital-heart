-- Remove the two dangerous public-facing policies
DROP POLICY IF EXISTS "Anyone can view order by transaction reference" ON public.shop_orders;
DROP POLICY IF EXISTS "Guest order lookup by reference" ON public.shop_orders;