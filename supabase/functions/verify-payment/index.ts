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
    const { reference } = await req.json();

    console.log('Verify payment request:', reference);

    if (!reference) {
      return new Response(
        JSON.stringify({ error: 'Reference is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify transaction with Paystack
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

    // Get contribution record
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

    // Determine transaction status
    const isSuccessful = transactionData.status === 'success';
    const transactionStatus = isSuccessful ? 'completed' : 
                             transactionData.status === 'failed' ? 'failed' :
                             transactionData.status === 'abandoned' ? 'failed' : 'pending';

    // Update contribution record
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

    // Save payment method if requested and transaction was successful
    if (isSuccessful && contribution.save_details && contribution.member_id) {
      const { data: member } = await supabaseClient
        .from('members')
        .select('user_id')
        .eq('id', contribution.member_id)
        .single();

      if (member?.user_id) {
        // Check if payment method already exists
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

          // Check if user has any saved methods to set as default
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
          amount: transactionData.amount / 100, // Convert from kobo
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

  } catch (error) {
    console.error('Error in verify-payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});