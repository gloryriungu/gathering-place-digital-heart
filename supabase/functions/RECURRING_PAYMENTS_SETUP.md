# Recurring Payments Setup Guide

## Overview
The recurring payments system automatically processes monthly contributions using saved payment methods. Payments are charged on the 1st of each month.

## Prerequisites
- Paystack live API keys configured in Supabase secrets
- `pg_cron` and `pg_net` extensions enabled in Supabase

## Setting Up the Cron Job

### Step 1: Enable Required Extensions
Run this SQL in your Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Step 2: Create the Cron Job
Run this SQL to schedule the recurring payment processing:

```sql
SELECT cron.schedule(
  'process-recurring-payments',
  '0 2 1 * *', -- Run at 2 AM on the 1st of every month
  $$
  SELECT
    net.http_post(
      url:='https://zkbeoqskfeyqtyjtpufj.supabase.co/functions/v1/process-recurring-payments',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprYmVvcXNrZmV5cXR5anRwdWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODMyMjAsImV4cCI6MjA2OTQ1OTIyMH0.T__h5xs4QS2s5TAlQLc2i-ZNTUzJN7kwyOIgtuNTsV4"}'::jsonb
    ) as request_id;
  $$
);
```

### Step 3: Verify the Cron Job
Check that the cron job was created:

```sql
SELECT * FROM cron.job;
```

## How It Works

1. **User Setup**: Users set up recurring giving from the Give page by:
   - Checking "Make this a recurring monthly contribution"
   - Selecting a saved payment method
   - Submitting the form

2. **Storage**: Recurring contributions are stored in the `recurring_contributions` table with:
   - Amount and contribution type
   - Payment method reference (must be saved)
   - Next charge date (first day of each month)
   - Status (active, paused, cancelled)

3. **Processing**: On the 1st of each month at 2 AM:
   - Edge function finds all active contributions due
   - Charges each using Paystack's authorization code
   - Creates contribution records
   - Updates next charge dates
   - Tracks failed attempts

4. **Failure Handling**:
   - Failed attempts are tracked
   - After 3 failed attempts, the recurring giving is automatically paused
   - Users are notified (via UI) to update their payment method

## User Management

Users can manage their recurring giving from the Dashboard:
- **View**: See all active, paused, and cancelled recurring contributions
- **Pause/Resume**: Temporarily stop and restart recurring giving
- **Cancel**: Permanently stop recurring contributions
- **Monitor**: See next charge dates and failed payment alerts

## Manual Testing

To manually trigger the payment processing (for testing):

```bash
curl -X POST \
  'https://zkbeoqskfeyqtyjtpufj.supabase.co/functions/v1/process-recurring-payments' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprYmVvcXNrZmV5cXR5anRwdWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODMyMjAsImV4cCI6MjA2OTQ1OTIyMH0.T__h5xs4QS2s5TAlQLc2i-ZNTUzJN7kwyOIgtuNTsV4' \
  -H 'Content-Type: application/json'
```

## Monitoring

Check the edge function logs:
https://supabase.com/dashboard/project/zkbeoqskfeyqtyjtpufj/functions/process-recurring-payments/logs

## Important Notes

1. **Saved Payment Methods Required**: Users must have saved payment methods to use recurring giving
2. **Paystack Authorization**: The system uses Paystack's `charge_authorization` endpoint to charge saved cards/M-Pesa
3. **Monthly Schedule**: Currently only supports monthly frequency (on the 1st)
4. **Timezone**: Cron runs in UTC, scheduled for 2 AM UTC = 5 AM EAT (Kenya time)
5. **Retry Logic**: After 3 failed attempts, recurring giving is paused automatically

## Database Tables

### recurring_contributions
- Stores recurring giving schedules
- Links to saved_payment_methods
- Tracks status, next charge date, failed attempts

### saved_payment_methods
- Stores Paystack authorization codes
- Required for recurring payments
- Users manage via Dashboard

## Future Enhancements

- Email notifications for successful/failed payments
- Support for other frequencies (weekly, quarterly, yearly)
- Custom charge dates (e.g., 15th of month)
- Grace period for failed payments
- Automatic retry logic with exponential backoff
