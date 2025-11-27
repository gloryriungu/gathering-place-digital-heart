-- Create shop_categories table
CREATE TABLE public.shop_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shop_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active categories"
ON public.shop_categories
FOR SELECT
USING (is_active = true);

CREATE POLICY "Media and IT can view all categories"
ON public.shop_categories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('media', 'it', 'admin')
  )
);

CREATE POLICY "Media and IT can manage categories"
ON public.shop_categories
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('media', 'it')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_shop_categories_updated_at
BEFORE UPDATE ON public.shop_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Seed default categories
INSERT INTO public.shop_categories (name, slug, description, icon, display_order) VALUES
('Books & Devotionals', 'books-devotionals', 'Spiritual books, bibles, and devotional materials', 'Book', 1),
('Apparel', 'apparel', 'T-shirts, hoodies, and church branded clothing', 'Shirt', 2),
('Music & Media', 'music-media', 'CDs, DVDs, and digital media', 'Music', 3),
('Accessories', 'accessories', 'Bags, keychains, and other accessories', 'Watch', 4),
('Home & Decor', 'home-decor', 'Wall art, decor, and household items', 'Home', 5),
('Children''s Items', 'childrens-items', 'Items specifically for children', 'Baby', 6),
('Gifts', 'gifts', 'Gift items and special occasion products', 'Gift', 7);