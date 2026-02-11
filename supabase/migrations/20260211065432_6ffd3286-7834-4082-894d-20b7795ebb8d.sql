
-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Anyone can read shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Shop orders are publicly readable" ON public.shop_orders;
DROP POLICY IF EXISTS "Allow public read access to shop_orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Public can view shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Anyone can view shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Authenticated users can view their own orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Staff can view all shop orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Users can view their own orders or by transaction reference" ON public.shop_orders;

-- Authenticated users can view their own orders
CREATE POLICY "Users can view own shop orders"
ON public.shop_orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Guest checkout: allow lookup by transaction reference (no auth required)
CREATE POLICY "Guest order lookup by reference"
ON public.shop_orders
FOR SELECT
TO anon, authenticated
USING (
  transaction_reference IS NOT NULL
  AND transaction_reference = current_setting('request.headers', true)::json->>'x-transaction-reference'
);

-- Staff can view all orders
CREATE POLICY "Staff can view all shop orders"
ON public.shop_orders
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'accounts')
  OR public.has_role(auth.uid(), 'founder')
  OR public.has_role(auth.uid(), 'senior_pastor')
);
