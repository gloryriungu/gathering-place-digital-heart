-- Create private storage bucket for digital products
INSERT INTO storage.buckets (id, name, public)
VALUES ('digital-products', 'digital-products', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for digital-products bucket
CREATE POLICY "Authenticated users can upload digital products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'digital-products' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('media', 'admin', 'it')
  )
);

CREATE POLICY "Admin can manage digital products"
ON storage.objects FOR ALL
USING (
  bucket_id = 'digital-products' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('media', 'admin', 'it')
  )
);

-- Create digital_purchases table to track user access to digital products
CREATE TABLE public.digital_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES media_content(id) ON DELETE CASCADE,
  order_id UUID REFERENCES shop_orders(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 5,
  download_expires_at TIMESTAMP WITH TIME ZONE,
  access_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digital_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for digital_purchases
CREATE POLICY "Users can view their own digital purchases"
ON public.digital_purchases FOR SELECT
USING (
  user_id = auth.uid() 
  OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "System can insert digital purchases"
ON public.digital_purchases FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admin can manage all digital purchases"
ON public.digital_purchases FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'it', 'accounts')
  )
);

-- Index for faster lookups
CREATE INDEX idx_digital_purchases_user_id ON public.digital_purchases(user_id);
CREATE INDEX idx_digital_purchases_customer_email ON public.digital_purchases(customer_email);
CREATE INDEX idx_digital_purchases_access_token ON public.digital_purchases(access_token);
CREATE INDEX idx_digital_purchases_order_id ON public.digital_purchases(order_id);

-- Trigger for updated_at
CREATE TRIGGER update_digital_purchases_updated_at
BEFORE UPDATE ON public.digital_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();