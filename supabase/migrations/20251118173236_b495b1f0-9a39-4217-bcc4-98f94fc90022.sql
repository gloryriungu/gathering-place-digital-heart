-- Add updated_at column to contributions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contributions' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.contributions 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;