import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  'https://tot.co.ke',
  'https://stg.tot.co.ke',
  'http://localhost:5173',
  'https://id-preview--1002bdcc-1ba9-4425-9337-cf483dae12d9.lovable.app',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

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

    const { data: dueContributions, error: fetchError } = await supabaseClient
      .from('recurring_contributions')
      .select(`*, payment_method:saved_payment_methods(*)`)
      .eq('status', 'active')
      .lte('next_charge_date', today)
      .lt('failed_attempts', 3);

    if (fetchError) throw fetchError;

    console.log(`Found ${dueContributions?.length || 0} contributions to process`);

    const results = { processed: 0, successful: 0, failed: 0, errors: [] as string[] };

    for (const contribution of dueContributions || []) {
      results.processed++;
      try {
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

        const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
        const amountInKobo = Math.round(contribution.amount * 100);

        const paystackResponse = await fetch('https://api.paystack.co/transaction/charge_authorization', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
          }),
        });

        const paystackData = await paystackResponse.json();

        if (paystackResponse.ok && paystackData.status && paystackData.data.status === 'success') {
          await supabaseClient.from('contributions').update({
            transaction_status: 'completed',
            paystack_reference: paystackData.data.reference,
            transaction_reference: paystackData.data.reference
          }).eq('id', newContribution.id);

          const nextMonth = new Date(contribution.next_charge_date);
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          await supabaseClient.from('recurring_contributions').update({
            last_charge_date: today,
            last_charge_status: 'completed',
            next_charge_date: nextMonth.toISOString().split('T')[0],
            failed_attempts: 0
          }).eq('id', contribution.id);

          results.successful++;
        } else {
          const newFailedAttempts = contribution.failed_attempts + 1;
          await supabaseClient.from('contributions').update({ transaction_status: 'failed' }).eq('id', newContribution.id);
          await supabaseClient.from('recurring_contributions').update({
            last_charge_date: today,
            last_charge_status: 'failed',
            failed_attempts: newFailedAttempts,
            status: newFailedAttempts >= 3 ? 'paused' : 'active'
          }).eq('id', contribution.id);

          results.failed++;
          results.errors.push(`Contribution ${contribution.id}: ${paystackData.message || 'Payment failed'}`);
        }
      } catch (error: any) {
        console.error(`Error processing contribution ${contribution.id}:`, error);
        results.failed++;
        results.errors.push(`Contribution ${contribution.id}: ${error.message}`);
      }
    }

    console.log('Processing complete:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in process-recurring-payments:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});