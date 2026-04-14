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
    const { reference } = await req.json();

    console.log('Verify payment request:', reference);

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    console.log('Verifying with Paystack:', reference);

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack verification error:', paystackData);
      return new Response(
        JSON.stringify({ error: paystackData.message || 'Verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const transactionData = paystackData.data;
    console.log('Paystack transaction data:', transactionData);

    const { data: contribution, error: fetchError } = await supabaseClient
      .from('contributions')
      .select('*')
      .eq('id', transactionData.reference)
      .single();

    if (fetchError || !contribution) {
      console.error('Contribution not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Contribution record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isSuccessful = transactionData.status === 'success';
    const transactionStatus = isSuccessful ? 'completed' : 
                             transactionData.status === 'failed' ? 'failed' :
                             transactionData.status === 'abandoned' ? 'failed' : 'pending';

    const { error: updateError } = await supabaseClient
      .from('contributions')
      .update({
        transaction_status: transactionStatus,
        paystack_reference: transactionData.reference,
        transaction_reference: transactionData.reference,
        notes: transactionData.gateway_response || null
      })
      .eq('id', contribution.id);

    if (updateError) {
      console.error('Error updating contribution:', updateError);
    }

    if (isSuccessful && contribution.save_details && contribution.member_id) {
      const { data: member } = await supabaseClient
        .from('members')
        .select('user_id')
        .eq('id', contribution.member_id)
        .single();

      if (member?.user_id) {
        const existingQuery = contribution.payment_channel === 'mobile_money'
          ? { phone_number: contribution.donor_phone }
          : { authorization_code: transactionData.authorization?.authorization_code };

        const { data: existing } = await supabaseClient
          .from('saved_payment_methods')
          .select('id')
          .eq('user_id', member.user_id)
          .match(existingQuery)
          .maybeSingle();

        if (!existing) {
          const paymentMethodData: any = {
            user_id: member.user_id,
            email: contribution.donor_email
          };

          if (contribution.payment_channel === 'mobile_money') {
            paymentMethodData.phone_number = contribution.donor_phone;
          } else if (transactionData.authorization) {
            paymentMethodData.card_last4 = transactionData.authorization.last4;
            paymentMethodData.card_type = transactionData.authorization.card_type;
            paymentMethodData.authorization_code = transactionData.authorization.authorization_code;
          }

          const { count } = await supabaseClient
            .from('saved_payment_methods')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', member.user_id);

          paymentMethodData.is_default = (count === 0);

          await supabaseClient
            .from('saved_payment_methods')
            .insert(paymentMethodData);

          console.log('Payment method saved for user:', member.user_id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: transactionStatus,
          amount: transactionData.amount / 100,
          currency: transactionData.currency,
          reference: transactionData.reference,
          paid_at: transactionData.paid_at,
          channel: transactionData.channel,
          contribution: {
            id: contribution.id,
            type: contribution.contribution_type,
            amount: contribution.amount
          }
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in verify-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});