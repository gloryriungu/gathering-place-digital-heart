-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can create orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Anyone can view order by transaction reference" ON public.shop_orders;
DROP POLICY IF EXISTS "Staff can view all orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Staff can update orders" ON public.shop_orders;

DROP POLICY IF EXISTS "Authenticated users can view pastor availability" ON public.pastor_availability;
DROP POLICY IF EXISTS "Pastors can insert their own availability" ON public.pastor_availability;
DROP POLICY IF EXISTS "Pastors can update their own availability" ON public.pastor_availability;
DROP POLICY IF EXISTS "Pastors can delete their own availability" ON public.pastor_availability;

-- Fix RLS for shop_orders table
-- Users can view their own orders (by user_id or email match)
CREATE POLICY "Users can view their own orders"
ON public.shop_orders
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow viewing by transaction reference for order verification (guest checkout)
CREATE POLICY "Anyone can view order by transaction reference"
ON public.shop_orders
FOR SELECT
USING (
  paystack_reference IS NOT NULL 
  AND paystack_reference != ''
);

-- Staff can view all orders
CREATE POLICY "Staff can view all orders"
ON public.shop_orders
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'accounts')
  OR public.has_role(auth.uid(), 'founder')
  OR public.has_role(auth.uid(), 'senior_pastor')
);

-- Allow inserting orders (for checkout process)
CREATE POLICY "Anyone can create orders"
ON public.shop_orders
FOR INSERT
WITH CHECK (true);

-- Staff can update orders
CREATE POLICY "Staff can update orders"
ON public.shop_orders
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'accounts')
);

-- Fix RLS for pastor_availability table
-- Authenticated members can view availability for booking
CREATE POLICY "Authenticated users can view pastor availability"
ON public.pastor_availability
FOR SELECT
TO authenticated
USING (true);

-- Pastors can manage their own availability
CREATE POLICY "Pastors can insert their own availability"
ON public.pastor_availability
FOR INSERT
TO authenticated
WITH CHECK (
  pastor_id = auth.uid()
  OR public.has_role(auth.uid(), 'pastor')
  OR public.has_role(auth.uid(), 'senior_pastor')
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Pastors can update their own availability"
ON public.pastor_availability
FOR UPDATE
TO authenticated
USING (
  pastor_id = auth.uid()
  OR public.has_role(auth.uid(), 'pastor')
  OR public.has_role(auth.uid(), 'senior_pastor')
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Pastors can delete their own availability"
ON public.pastor_availability
FOR DELETE
TO authenticated
USING (
  pastor_id = auth.uid()
  OR public.has_role(auth.uid(), 'pastor')
  OR public.has_role(auth.uid(), 'senior_pastor')
  OR public.has_role(auth.uid(), 'admin')
);