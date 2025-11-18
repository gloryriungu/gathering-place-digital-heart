-- Update contributions table to support Paystack transactions
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS transaction_reference TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS transaction_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
ADD COLUMN IF NOT EXISTS donor_email TEXT,
ADD COLUMN IF NOT EXISTS donor_phone TEXT,
ADD COLUMN IF NOT EXISTS donor_name TEXT,
ADD COLUMN IF NOT EXISTS save_details BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_channel TEXT;

-- Create saved_payment_methods table for authenticated users
CREATE TABLE IF NOT EXISTS saved_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT,
  email TEXT,
  card_last4 TEXT,
  card_type TEXT,
  authorization_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for saved_payment_methods
ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment methods"
  ON saved_payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
  ON saved_payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON saved_payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON saved_payment_methods FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Accounts can view all payment methods"
  ON saved_payment_methods FOR SELECT
  USING (has_role(auth.uid(), 'accounts'::app_role) OR has_role(auth.uid(), 'it'::app_role));

-- Update RLS policies for contributions table
DROP POLICY IF EXISTS "Anyone can create contributions" ON contributions;
CREATE POLICY "Anyone can create contributions"
  ON contributions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their contributions via email" ON contributions;
CREATE POLICY "Users can view their contributions via email"
  ON contributions FOR SELECT
  USING (
    member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
    OR donor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Create trigger for updated_at on saved_payment_methods
CREATE TRIGGER update_saved_payment_methods_updated_at
  BEFORE UPDATE ON saved_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();