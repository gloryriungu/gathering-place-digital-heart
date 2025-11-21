import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting recurring payments processing...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const today = new Date().toISOString().split('T')[0];

    // Get all active recurring contributions due for charging today
    const { data: dueContributions, error: fetchError } = await supabaseClient
      .from('recurring_contributions')
      .select(`
        *,
        payment_method:saved_payment_methods(*)
      `)
      .eq('status', 'active')
      .lte('next_charge_date', today)
      .lt('failed_attempts', 3); // Skip if failed 3+ times

    if (fetchError) {
      console.error('Error fetching due contributions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${dueContributions?.length || 0} contributions to process`);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const contribution of dueContributions || []) {
      results.processed++;
      
      try {
        console.log(`Processing contribution ${contribution.id}`);

        // Create contribution record
        const { data: newContribution, error: contributionError } = await supabaseClient
          .from('contributions')
          .insert({
            amount: contribution.amount,
            contribution_type: contribution.contribution_type,
            member_id: contribution.member_id,
            payment_method: contribution.payment_method.phone_number ? 'mpesa' : 'card',
            payment_channel: contribution.payment_method.phone_number ? 'mobile_money' : 'card',
            transaction_status: 'pending',
            contribution_date: today
          })
          .select()
          .single();

        if (contributionError) throw contributionError;

        // Initialize Paystack charge with saved authorization
        const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
        const amountInKobo = Math.round(contribution.amount * 100);

        const paystackPayload = {
          email: contribution.payment_method.email,
          amount: amountInKobo,
          currency: 'KES',
          reference: newContribution.id,
          authorization_code: contribution.payment_method.authorization_code,
          metadata: {
            contribution_id: newContribution.id,
            contribution_type: contribution.contribution_type,
            recurring_contribution_id: contribution.id
          }
        };

        const paystackResponse = await fetch('https://api.paystack.co/transaction/charge_authorization', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paystackPayload),
        });

        const paystackData = await paystackResponse.json();

        if (paystackResponse.ok && paystackData.status && paystackData.data.status === 'success') {
          // Payment successful
          console.log(`Payment successful for contribution ${contribution.id}`);

          // Update contribution record
          await supabaseClient
            .from('contributions')
            .update({
              transaction_status: 'completed',
              paystack_reference: paystackData.data.reference,
              transaction_reference: paystackData.data.reference
            })
            .eq('id', newContribution.id);

          // Calculate next charge date (first day of next month)
          const nextMonth = new Date(contribution.next_charge_date);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          // Update recurring contribution
          await supabaseClient
            .from('recurring_contributions')
            .update({
              last_charge_date: today,
              last_charge_status: 'completed',
              next_charge_date: nextMonth.toISOString().split('T')[0],
              failed_attempts: 0
            })
            .eq('id', contribution.id);

          results.successful++;
        } else {
          // Payment failed
          console.error(`Payment failed for contribution ${contribution.id}:`, paystackData);
          
          const newFailedAttempts = contribution.failed_attempts + 1;

          // Update contribution record
          await supabaseClient
            .from('contributions')
            .update({
              transaction_status: 'failed'
            })
            .eq('id', newContribution.id);

          // Update recurring contribution
          await supabaseClient
            .from('recurring_contributions')
            .update({
              last_charge_date: today,
              last_charge_status: 'failed',
              failed_attempts: newFailedAttempts,
              status: newFailedAttempts >= 3 ? 'paused' : 'active'
            })
            .eq('id', contribution.id);

          results.failed++;
          results.errors.push(`Contribution ${contribution.id}: ${paystackData.message || 'Payment failed'}`);

          // TODO: Send notification email to user about failed payment
        }
      } catch (error: any) {
        console.error(`Error processing contribution ${contribution.id}:`, error);
        results.failed++;
        results.errors.push(`Contribution ${contribution.id}: ${error.message}`);
      }
    }

    console.log('Processing complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in process-recurring-payments:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
