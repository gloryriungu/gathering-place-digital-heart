import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  'https://tot.co.ke',
  'https://stg.tot.co.ke',
  'http://localhost:5173',
  'https://id-preview--1002bdcc-1ba9-4425-9337-cf483dae12d9.lovable.app',
  'https://1002bdcc-1ba9-4425-9337-cf483dae12d9.lovableproject.com',
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
    const { 
      payment_method, 
      amount, 
      email, 
      phone, 
      contribution_type,
      user_id,
      save_details,
      name
    } = await req.json();

    console.log('Initialize payment request:', { payment_method, amount, email, contribution_type });

    // Validate inputs
    if (!payment_method || !amount || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount < 10) {
      return new Response(
        JSON.stringify({ error: 'Minimum amount is KES 10' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount > 1000000) {
      return new Response(
        JSON.stringify({ error: 'Maximum amount is KES 1,000,000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment_method === 'mobile_money' && !phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number required for M-Pesa' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let member_id = null;
    if (user_id) {
      const { data: member } = await supabaseClient
        .from('members')
        .select('id')
        .eq('user_id', user_id)
        .maybeSingle();
      member_id = member?.id || null;
    }

    const { data: contribution, error: contributionError } = await supabaseClient
      .from('contributions')
      .insert({
        amount,
        contribution_type: contribution_type || 'offering',
        member_id,
        donor_email: email,
        donor_phone: phone,
        donor_name: name,
        payment_method: payment_method === 'mobile_money' ? 'mpesa' : 'card',
        payment_channel: payment_method,
        transaction_status: 'pending',
        save_details: save_details || false,
        contribution_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (contributionError) {
      console.error('Error creating contribution:', contributionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create contribution record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Contribution created:', contribution.id);

    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const amountInKobo = Math.round(amount * 100);

    const paystackPayload: any = {
      email,
      amount: amountInKobo,
      currency: 'KES',
      reference: contribution.id,
      callback_url: 'https://stg.tot.co.ke/give/verify',
      metadata: {
        contribution_id: contribution.id,
        contribution_type: contribution_type || 'offering',
        custom_fields: [
          {
            display_name: "Contribution Type",
            variable_name: "contribution_type",
            value: contribution_type || 'offering'
          }
        ]
      }
    };

    if (payment_method === 'mobile_money') {
      paystackPayload.channels = ['mobile_money'];
      if (phone) {
        paystackPayload.metadata.phone = phone;
      }
    } else {
      paystackPayload.channels = ['card'];
    }

    console.log('Initializing Paystack transaction:', paystackPayload.reference);

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error('Paystack error:', paystackData);
      await supabaseClient
        .from('contributions')
        .update({ transaction_status: 'failed' })
        .eq('id', contribution.id);

      return new Response(
        JSON.stringify({ error: paystackData.message || 'Payment initialization failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabaseClient
      .from('contributions')
      .update({
        paystack_reference: paystackData.data.reference,
        transaction_reference: paystackData.data.reference
      })
      .eq('id', contribution.id);

    console.log('Payment initialized successfully:', paystackData.data.reference);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference: paystackData.data.reference,
          contribution_id: contribution.id
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in initialize-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});