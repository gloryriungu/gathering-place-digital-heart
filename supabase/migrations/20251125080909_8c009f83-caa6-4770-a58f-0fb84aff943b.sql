-- Create shop_orders table to track product purchases
CREATE TABLE IF NOT EXISTS public.shop_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL, -- Array of {product_id, product_name, quantity, price}
  subtotal DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_channel TEXT,
  transaction_status TEXT DEFAULT 'pending',
  transaction_reference TEXT,
  paystack_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON public.shop_orders
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Anyone can create orders (for guest checkout)
CREATE POLICY "Anyone can create orders"
ON public.shop_orders
FOR INSERT
WITH CHECK (true);

-- System can update order status
CREATE POLICY "System can update orders"
ON public.shop_orders
FOR UPDATE
USING (true);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  number_exists BOOLEAN;
BEGIN
  LOOP
    new_number := 'ORD-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    
    SELECT EXISTS(SELECT 1 FROM shop_orders WHERE order_number = new_number) INTO number_exists;
    
    EXIT WHEN NOT number_exists;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create index for faster lookups
CREATE INDEX idx_shop_orders_user_id ON public.shop_orders(user_id);
CREATE INDEX idx_shop_orders_transaction_ref ON public.shop_orders(transaction_reference);
CREATE INDEX idx_shop_orders_paystack_ref ON public.shop_orders(paystack_reference);